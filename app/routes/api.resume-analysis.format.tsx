import { json, type ActionFunctionArgs } from "@remix-run/node";
import { getDocument, createDocument } from "~/models/document.server";
import { verifyToken } from "~/models/user.server";
import fetch from "node-fetch";
import type { Document } from "~/types/document";

interface FormattingResult {
  formattedContent: string;
  formattedDocumentId: string;
}

interface AnthropicResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
  id: string;
  model: string;
  role: string;
  type: string;
}

async function formatWithAnthropic(content: string): Promise<string> {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) {
    throw new Error("Anthropic API key not configured");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "anthropic-version": "2023-06-01",
      "x-api-key": ANTHROPIC_API_KEY
    },
    body: JSON.stringify({
      model: "claude-3-haiku-20240307",
      max_tokens: 4096,
      messages: [{
        role: "user",
        content: `Format this resume to be highly presentable and professional for employers. 
        Follow these guidelines:
        1. Use clear section headers (EXPERIENCE, EDUCATION, SKILLS, etc.)
        2. Add proper spacing between sections
        3. Use bullet points for achievements and responsibilities
        4. Make achievements quantifiable where possible
        5. Ensure consistent formatting throughout
        6. Use professional language
        7. Maintain chronological order in experience and education
        8. Right-align dates
        9. Use clear, concise language
        
        Here's the resume to format:

        ${content}`
      }]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Anthropic API error:", errorText);
    throw new Error("Failed to format resume with Anthropic");
  }

  const data = await response.json() as AnthropicResponse;
  if (!data.content?.[0]?.text) {
    throw new Error("Invalid response from Anthropic");
  }

  return data.content[0].text;
}

function applyProfessionalFormatting(content: string): string {
  // Add consistent spacing between sections
  let formatted = content.replace(/\n{3,}/g, '\n\n');

  // Ensure section headers are properly formatted
  formatted = formatted.replace(
    /^(EDUCATION|EXPERIENCE|SKILLS|PROJECTS|ACHIEVEMENTS|CERTIFICATIONS):/gmi,
    '\n\n$1:\n'
  );

  // Format bullet points consistently
  formatted = formatted.replace(/^[•\-]\s*/gm, '• ');

  // Add proper indentation for bullet points
  formatted = formatted.replace(/^(• .+)$/gm, '    $1');

  // Ensure dates are right-aligned (if in a text context)
  formatted = formatted.replace(/^(.+?)(\d{4}\s*-\s*(?:\d{4}|present))$/gmi, 
    (_, text, date) => `${text.padEnd(60)}${date}`
  );

  // Remove any extra blank lines at the start
  formatted = formatted.replace(/^\s+/, '');

  // Ensure exactly one blank line between sections
  formatted = formatted.replace(/\n{3,}/g, '\n\n');

  return formatted.trim();
}

async function createFormattedDocument(originalDoc: Document, formattedContent: string): Promise<Document> {
  let formattedName = originalDoc.name.replace(/\.(\w+)$/, ' (Formatted).$1');
  if (formattedName === originalDoc.name) {
    // If no extension found, just append (Formatted)
    formattedName = `${originalDoc.name} (Formatted)`;
  }

  return await createDocument({
    name: formattedName,
    type: originalDoc.type,
    content: formattedContent,
    userId: originalDoc.userId
  });
}

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

    const { resumeId } = await request.json();

    if (!resumeId) {
      return json(
        { error: "Please select a resume" },
        { status: 400 }
      );
    }

    // Get document
    const resume = await getDocument(resumeId, user.id);

    if (!resume) {
      return json(
        { error: "Resume not found" },
        { status: 404 }
      );
    }

    // Format with Anthropic
    const anthropicFormatted = await formatWithAnthropic(resume.content);

    // Apply additional professional formatting
    const formattedContent = applyProfessionalFormatting(anthropicFormatted);

    // Create a new document for the formatted version
    const formattedDoc = await createFormattedDocument(resume, formattedContent);

    return json({ 
      formatting: {
        formattedContent,
        formattedDocumentId: formattedDoc.id
      }
    });
  } catch (error) {
    console.error("Error formatting resume:", error);
    return json(
      { error: error instanceof Error ? error.message : "Failed to format resume" },
      { status: 500 }
    );
  }
}
