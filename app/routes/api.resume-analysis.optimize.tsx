import { json, type ActionFunctionArgs } from "@remix-run/node";
import { getDocument, createDocument } from "~/models/document.server";
import { verifyToken } from "~/models/user.server";
import { optimizeResumeWithClaude } from "~/utils/anthropic.server";

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

    // Use Claude to optimize the resume
    const optimization = await optimizeResumeWithClaude(resume.content, jobDescription.content);

    // Create a new document with the optimized content
    const optimizedDocument = await createDocument({
      name: `${resume.name} (Optimized)`,
      content: optimization.optimizedContent,
      type: 'resume',
      userId: user.id,
    });

    return json({
      optimization: {
        ...optimization,
        formattedDocumentId: optimizedDocument.id,
      },
    });
  } catch (error) {
    console.error("Error optimizing resume:", error);
    return json(
      { error: error instanceof Error ? error.message : "Failed to optimize resume" },
      { status: 500 }
    );
  }
}
