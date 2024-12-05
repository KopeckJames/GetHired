import { json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { createDocument } from "~/models/document.server";
import { verifyToken } from "~/models/user.server";
import type { DocumentType } from "~/types/document";

export async function action({ request }: ActionFunctionArgs) {
  // Get token from cookie
  const cookieHeader = request.headers.get("Cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader.split('; ').map(cookie => {
      const [name, value] = cookie.split('=');
      return [name, decodeURIComponent(value)];
    })
  );
  
  const token = cookies.auth_token;

  if (!token) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await verifyToken(token);
    if (!user) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as DocumentType;

    if (!file) {
      return json({ error: "No file uploaded" }, { status: 400 });
    }

    // Read file content
    const content = await file.text();

    // Create document
    const document = await createDocument({
      name: file.name,
      type: type,
      content: content,
      userId: user.id
    });

    return json(document, { status: 201 });
  } catch (error) {
    console.error('Document upload error:', error);
    return json({ 
      error: error instanceof Error ? error.message : "Failed to upload document" 
    }, { status: 500 });
  }
}
