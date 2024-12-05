import { json, type ActionFunctionArgs } from "@remix-run/node";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  return json(
    { success: true },
    {
      headers: {
        "Set-Cookie": "auth_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;",
      },
    }
  );
}
