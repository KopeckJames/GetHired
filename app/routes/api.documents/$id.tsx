import { json, type ActionFunctionArgs } from "@remix-run/node";
import { deleteDocument, getDocument } from "~/models/document.server";
import { verifyToken } from "~/models/user.server";

export async function action({ request, params }: ActionFunctionArgs) {
  if (request.method !== "DELETE") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const { id } = params;
  if (!id) {
    return json({ error: "Document ID is required" }, { status: 400 });
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

    // Verify document ownership
    const document = await getDocument(id, user.id);
    if (!document) {
      return json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    const success = await deleteDocument(id, user.id);
    if (!success) {
      return json(
        { error: "Failed to delete document" },
        { status: 500 }
      );
    }

    return json({ success: true });
  } catch (error) {
    console.error("Error deleting document:", error);
    return json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
