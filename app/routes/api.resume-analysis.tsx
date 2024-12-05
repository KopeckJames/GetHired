import { json, type ActionFunctionArgs } from "@remix-run/node";
import { getDocument } from "~/models/document.server";
import { verifyToken } from "~/models/user.server";
import { analyzeResumeWithClaude } from "~/utils/anthropic.server";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json(
      { error: "Method not allowed" },
      { status: 405 }
    );
  }

  const cookieHeader = request.headers.get("Cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader.split('; ').map(cookie => {
      const [name, value] = cookie.split('=');
      return [name, decodeURIComponent(value)];
    })
  );
  
  const token = cookies.auth_token;

  if (!token) {
    return json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  try {
    const user = await verifyToken(token);
    if (!user) {
      return json(
        { error: "Invalid authentication" },
        { status: 401 }
      );
    }

    const { resumeId, jobDescriptionId } = await request.json();

    if (!resumeId || !jobDescriptionId) {
      return json(
        { error: "Please select both a resume and job description" },
        { status: 400 }
      );
    }

    // Get documents
    const [resume, jobDescription] = await Promise.all([
      getDocument(resumeId, user.id),
      getDocument(jobDescriptionId, user.id),
    ]);

    if (!resume || !jobDescription) {
      return json(
        { error: "Documents not found" },
        { status: 404 }
      );
    }

    // Use Claude to analyze the resume
    const analysis = await analyzeResumeWithClaude(resume.content, jobDescription.content);

    return json({ analysis });
  } catch (error) {
    console.error("Error analyzing resume:", error);
    return json(
      { error: error instanceof Error ? error.message : "Failed to analyze resume" },
      { status: 500 }
    );
  }
}
