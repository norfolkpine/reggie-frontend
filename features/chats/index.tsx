"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CustomChat } from "./components/chatcn";
import { useAgentChat } from "@/hooks/use-agent-chat";
import AgentChatDock from "./components/agent-chat-dock";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { chatStorage } from "@/lib/utils/chat-storage";
import { useChatSessionContext } from "./ChatSessionContext";

// Default agent ID to use for new conversations
const DEFAULT_AGENT_ID = "o-9b9bdc247-reggie";

export default function ChatsComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const agentId = searchParams.get("agentId") ?? process.env.NEXT_PUBLIC_DEFAULT_AGENT_ID;
  const params = useParams();
  const sessionId = params.sessionId as string | null; // This is the sessionId from the URL
  
  // Get the refresh function from ChatSessionContext to update chat history
  const { refresh } = useChatSessionContext();
  
  // Initialize state with URL params
  const [selectedChat, setSelectedChat] = useState<{ id: string; agentCode: string | null }>({ 
      id: sessionId || "", 
      agentCode: agentId || DEFAULT_AGENT_ID 
    });

  // Get chat title from useAgentChat if a session is selected
  const { currentChatTitle } = useAgentChat({
    agentId: selectedChat.agentCode || DEFAULT_AGENT_ID,
    sessionId: selectedChat.id || undefined,
  });

  // Update selectedChat when URL params change
  useEffect(() => {
    setSelectedChat({ 
      id: sessionId || "", 
      agentCode: agentId || DEFAULT_AGENT_ID 
    });
  }, [sessionId, agentId]);

  // Persist selectedChat in localStorage whenever it changes (only for existing sessions)
  useEffect(() => {
    if (selectedChat.id && selectedChat.agentCode && selectedChat.id !== "" && selectedChat.agentCode !== DEFAULT_AGENT_ID) {
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

  const handleNewSessionCreated = (newSessionId: string) => {
    // Update URL immediately when a new session is created
    // Since we now create the session before sending the message, we can update the URL right away
    if (newSessionId && newSessionId !== selectedChat.id) {
      const newPath = `/chat/${newSessionId}${agentId ? `?agentId=${agentId}` : ''}`;
      router.replace(newPath);
      
      // Update selectedChat state to reflect the new session ID
      setSelectedChat({ id: newSessionId, agentCode: agentId || DEFAULT_AGENT_ID });
      
      // Refresh the chat history to include the new session
      refresh();
    }
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
            onNewSessionCreated={handleNewSessionCreated}
          />
        </div>
      </div>
    </div>
  );
}
