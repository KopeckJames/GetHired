import AudioRecorder from "~/components/AudioRecorder";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { verifyToken } from "~/models/user.server";
import { getDocumentsByType } from "~/models/document.server";
import type { SerializedDocument, DocumentType } from "~/types/document";
import { serializeDocument } from "~/types/document";

interface LoaderData {
  error: string | null;
  resumes: SerializedDocument[];
  jobDescriptions: SerializedDocument[];
}

export async function loader({ request }: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader.split('; ').map(cookie => {
      const [name, value] = cookie.split('=');
      return [name, decodeURIComponent(value)];
    })
  );
  
  const token = cookies.auth_token;

  if (!token) {
    return json<LoaderData>({
      error: "Please log in to use this feature",
      resumes: [],
      jobDescriptions: [],
    });
  }

  try {
    const user = await verifyToken(token);
    if (!user) {
      return json<LoaderData>({
        error: "Invalid authentication",
        resumes: [],
        jobDescriptions: [],
      });
    }

    // Use the correct DocumentType values and parameter order
    const resumeType: DocumentType = "resume";
    const jobDescriptionType: DocumentType = "job_description";

    const [resumes, jobDescriptions] = await Promise.all([
      getDocumentsByType(resumeType, user.id),
      getDocumentsByType(jobDescriptionType, user.id),
    ]);

    return json<LoaderData>({
      error: null,
      resumes: resumes.map(serializeDocument),
      jobDescriptions: jobDescriptions.map(serializeDocument),
    });
  } catch (error) {
    console.error("Error loading documents:", error);
    return json<LoaderData>({
      error: "Failed to load documents",
      resumes: [],
      jobDescriptions: [],
    });
  }
}

export default function VoiceNotes() {
  const { error, resumes, jobDescriptions } = useLoaderData<typeof loader>();

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (resumes.length === 0 || jobDescriptions.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Interview Practice</h1>
          <p className="text-gray-600 mb-4">
            {resumes.length === 0
              ? "Please upload a resume to use this feature."
              : "Please upload a job description to use this feature."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Interview Practice</h1>
        <p className="text-gray-600">
          Practice your interview skills with AI-powered feedback. Select a resume and job description,
          then start speaking to receive real-time transcription and contextual responses.
        </p>
      </div>

      <AudioRecorder
        resumes={resumes}
        jobDescriptions={jobDescriptions}
      />

      <div className="mt-8 text-sm text-gray-500">
        <h3 className="font-medium mb-2">Tips:</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Speak clearly and at a normal pace</li>
          <li>Use a quiet environment for better transcription</li>
          <li>Wait for the AI response before asking your next question</li>
          <li>Try to ask specific, job-related questions</li>
        </ul>
      </div>
    </div>
  );
}
