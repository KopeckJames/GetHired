import { useState, useRef, useEffect } from "react";
import Card from "./Card";
import Button from "./Button";
import Input from "./Input";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import type { ChatMessage } from "~/utils/anthropic.server";

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    role: "assistant",
    content: "Hello! I'm your career advisor. I can help you with resume writing, job search strategies, interview preparation, and career development. What would you like assistance with?"
  }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      console.log("Sending chat request with messages:", [...messages, userMessage]);
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      const data = await response.json();
      console.log("Chat response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.response) {
        throw new Error("No response received from assistant");
      }

      setMessages(prev => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      setError(errorMessage);
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: `Error: ${errorMessage}. Please try again or refresh the page if the problem persists.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card variant="bordered" className="h-[calc(100vh-12rem)]">
      <div className="flex flex-col h-full">
        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : message.content.startsWith("Error:")
                    ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100"
                    : "bg-gray-100 dark:bg-gray-800"
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {error && (
          <div className="px-4 py-2 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100">
            {error}
          </div>
        )}

        <div className="p-4 border-t dark:border-gray-700">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isLoading ? "Please wait..." : "Type your message..."}
              inputClassName="flex-grow"
              containerClassName="flex-grow"
              fullWidth
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="min-w-[44px] h-[44px] p-2"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>
    </Card>
  );
}
