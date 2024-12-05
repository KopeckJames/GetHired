import { json, type ActionFunctionArgs } from "@remix-run/node";
import { verifyToken } from "~/models/user.server";
import { serializeUser } from "~/types/user";

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
    return json({ error: "No token provided" }, { status: 401 });
  }

  try {
    const user = await verifyToken(token);
    if (!user) {
      return json({ error: "Invalid token" }, { status: 401 });
    }

    return json({ 
      user: serializeUser(user),
      isAuthenticated: true 
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
  } catch (error) {
    console.error('Error verifying token:', error);
    return json(
      { error: "Failed to verify token" },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
}
