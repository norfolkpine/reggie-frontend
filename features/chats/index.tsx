"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CustomChat } from "./components/chatcn";
import { useAgentChat } from "@/hooks/use-agent-chat";
import AgentChatDock from "./components/agent-chat-dock";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { chatStorage } from "@/lib/utils/chat-storage";

// Default agent ID to use for new conversations
const DEFAULT_AGENT_ID = "o-9b9bdc247-reggie";

export default function ChatsComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const agentId = searchParams.get("agentId") ?? process.env.NEXT_PUBLIC_DEFAULT_AGENT_ID;
  const params = useParams();
  const sessionId = params.sessionId as string | null;
  
  // Initialize state with localStorage or URL params, following the same pattern as other components
  const [selectedChat, setSelectedChat] = useState<{ id: string; agentCode: string | null }>({ 
      id: sessionId || "", 
      agentCode: agentId || DEFAULT_AGENT_ID 
    });

  // Get chat title from useAgentChat if a session is selected
  const { currentChatTitle } = useAgentChat({
    agentId: selectedChat.agentCode || DEFAULT_AGENT_ID,
    sessionId: selectedChat.id || undefined
  });

  // Persist selectedChat in localStorage whenever it changes
  useEffect(() => {
    if (selectedChat.id || selectedChat.agentCode && selectedChat.id !== "" && selectedChat.agentCode !== DEFAULT_AGENT_ID) {
      chatStorage.setSelectedChat(selectedChat);
    }
  }, [selectedChat]);

  const handleSelectChat = (chatId: string, agentCode?: string | null) => {
    setSelectedChat({ id: chatId, agentCode: agentCode || DEFAULT_AGENT_ID });
  };

  const handleChangeAgent = () => {
    // Navigate to agent selection page
    router.push("/agent");
  };

  const handleNewChat = () => {
    router.push("/chat");
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 border-b flex items-center justify-between">
        <div className="text-lg font-semibold truncate" title={currentChatTitle || "Chat"}>
          {currentChatTitle || "Chat"}
        </div>
        <Button size="sm" variant="outline" onClick={handleChangeAgent}>
          Change Agent
        </Button>
      </div>
      {/* Content Row */}
      <div className="flex flex-1 overflow-hidden">
        <AgentChatDock onSelectChat={handleSelectChat} onNewChat={handleNewChat}  />
        <div className="flex-1 flex flex-col min-h-0">
          <CustomChat 
            agentId={selectedChat.agentCode || DEFAULT_AGENT_ID}
            sessionId={selectedChat.id || undefined}
          />
        </div>
      </div>
    </div>
  );
}
