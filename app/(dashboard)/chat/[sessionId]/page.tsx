
"use client"; // Required for hooks like useSearchParams

import ChatInterface from "@/features/chats/chat-interface";
import { ChatSessionProvider } from "@/features/chats/ChatSessionContext";
import { useSearchParams, useParams } from "next/navigation"; // Import useParams as well if needed for other logic, or pass agentId as prop

export default function ChatDetailPage() {
  const searchParams = useSearchParams();
  // Ensure agentId is correctly determined, providing a default if necessary
  const agentId = searchParams.get("agentId") ?? process.env.NEXT_PUBLIC_DEFAULT_AGENT_ID;

  return (
    <ChatSessionProvider agentId={agentId}>
      <ChatInterface />
    </ChatSessionProvider>
  );
}