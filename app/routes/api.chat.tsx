import { json, type ActionFunctionArgs } from "@remix-run/node";
import { chatWithClaude, type ChatMessage } from "~/utils/anthropic.server";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json(
      { error: "Method not allowed" },
      { status: 405 }
    );
  }

  try {
    const body = await request.json();
    console.log("Chat request body:", body);

    if (!body.messages || !Array.isArray(body.messages)) {
      console.error("Chat error: Invalid messages format", body);
      return json(
        { error: "Messages must be an array" },
        { status: 400 }
      );
    }

    // Validate message format
    const isValidMessage = (msg: any): msg is ChatMessage => {
      return (
        typeof msg === 'object' &&
        msg !== null &&
        (msg.role === 'user' || msg.role === 'assistant') &&
        typeof msg.content === 'string'
      );
    };

    if (!body.messages.every(isValidMessage)) {
      console.error("Chat error: Invalid message format in array", body.messages);
      return json(
        { error: "Invalid message format" },
        { status: 400 }
      );
    }

    console.log("Sending messages to Claude:", body.messages);
    const response = await chatWithClaude(body.messages);
    console.log("Claude response:", response);

    if (!response) {
      throw new Error("No response received from Claude");
    }

    return json({ response });
  } catch (error) {
    console.error("Error in chat:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to process chat";
    const errorDetails = error instanceof Error ? error.stack : undefined;
    console.error("Error details:", errorDetails);
    
    return json(
      { 
        error: errorMessage,
        details: errorDetails
      },
      { status: 500 }
    );
  }
}
