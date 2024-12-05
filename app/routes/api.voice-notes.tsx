import { json, type ActionFunctionArgs } from "@remix-run/node";
import { processAudioChunk, generateInterviewResponse } from "~/utils/openai.server";
import { getDocument } from "~/models/document.server";
import { verifyToken } from "~/models/user.server";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const formData = await request.formData();
    const audioChunk = formData.get("audio") as File;
    const resumeId = formData.get("resumeId") as string;
    const jobDescriptionId = formData.get("jobDescriptionId") as string;
    const mode = formData.get("mode") as "transcribe" | "respond";

    if (!audioChunk) {
      return json({ error: "No audio data provided" }, { status: 400 });
    }

    // For interview response mode, we need both resume and job description
    if (mode === "respond" && (!resumeId || !jobDescriptionId)) {
      return json(
        { error: "Resume ID and Job Description ID are required for interview responses" },
        { status: 400 }
      );
    }

    // Convert audio chunk to buffer
    const arrayBuffer = await audioChunk.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Process the audio chunk with Whisper API
    const transcription = await processAudioChunk(buffer);

    // If we're just transcribing, return the result
    if (mode === "transcribe") {
      return json({ transcription });
    }

    // For interview response mode, get the resume and job description
    const cookieHeader = request.headers.get("Cookie") || "";
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map(cookie => {
        const [name, value] = cookie.split('=');
        return [name, decodeURIComponent(value)];
      })
    );
    
    const token = cookies.auth_token;
    if (!token) {
      return json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return json({ error: "Invalid authentication" }, { status: 401 });
    }

    // Get documents
    const [resume, jobDescription] = await Promise.all([
      getDocument(resumeId, user.id),
      getDocument(jobDescriptionId, user.id),
    ]);

    if (!resume || !jobDescription) {
      return json({ error: "Documents not found" }, { status: 404 });
    }

    // Generate interview response
    const response = await generateInterviewResponse(
      transcription,
      resume.content,
      jobDescription.content
    );

    return json({
      transcription,
      response,
    });

  } catch (error) {
    console.error("Error processing voice note:", error);
    return json(
      { error: error instanceof Error ? error.message : "Failed to process voice note" },
      { status: 500 }
    );
  }
}
