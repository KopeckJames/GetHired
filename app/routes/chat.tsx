import { type MetaFunction } from "@remix-run/node";
import ChatInterface from "~/components/ChatInterface";

export const meta: MetaFunction = () => {
  return [
    { title: "AI Career Assistant - GetHired" },
    { name: "description", content: "Chat with our AI career assistant for resume and job search help" },
  ];
};

export default function Chat() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">AI Career Assistant</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Chat with our AI assistant for help with:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Resume writing and optimization</li>
            <li>Job search strategies</li>
            <li>Interview preparation</li>
            <li>Career development advice</li>
            <li>Professional networking tips</li>
          </ul>
        </p>
        <ChatInterface />
      </div>
    </div>
  );
}
