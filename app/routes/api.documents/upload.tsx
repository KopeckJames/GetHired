import { json, type ActionFunctionArgs } from "@remix-run/node";
import { createDocument } from "~/models/document.server";
import type { DocumentType } from "~/types/document";
import { verifyToken } from "~/models/user.server";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

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

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as DocumentType;

    if (!file || !type) {
      return json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Read file content
    const content = await file.text();

    const document = await createDocument({
      name: file.name,
      type,
      content,
      userId: user.id,
    });

    return json({ document });
  } catch (error) {
    console.error("Error uploading document:", error);
    return json(
      { error: "Failed to upload document" },
      { status: 500 }
    );
  }
}
