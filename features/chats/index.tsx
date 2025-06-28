"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AgentChatDock from "./components/agent-chat-dock";
import { CustomChat } from "./components/chatcn";
import { useAgentChat } from "@/hooks/use-agent-chat";

// Default agent ID to use for new conversations
const DEFAULT_AGENT_ID = "o-ea5b30abd-reggie";

export default function ChatsComponent() {
  const [selectedChat, setSelectedChat] = useState<{ id: string; agentCode: string | null }>({ 
    id: "", 
    agentCode: DEFAULT_AGENT_ID 
  });

  // Get chat title from useAgentChat if a session is selected
  const { currentChatTitle } = useAgentChat({
    agentId: selectedChat.agentCode || DEFAULT_AGENT_ID,
    sessionId: selectedChat.id || undefined
  });

  const handleSelectChat = (chatId: string, agentCode?: string | null) => {
    setSelectedChat({ id: chatId, agentCode: agentCode || DEFAULT_AGENT_ID });
  };

  const handleNewChat = () => {
    // Reset to default agent with no session ID for a new conversation
    setSelectedChat({ id: "", agentCode: DEFAULT_AGENT_ID });
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 border-b flex items-center justify-between">
        <div className="text-lg font-semibold truncate" title={currentChatTitle || "Chat"}>
          {currentChatTitle || "Chat"}
        </div>
        <Button size="icon" variant="outline" onClick={handleNewChat}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {/* Content Row */}
      <div className="flex flex-1 overflow-hidden">
        <AgentChatDock onSelectChat={handleSelectChat} onNewChat={handleNewChat} />
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
