"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CustomChat } from "./components/chatcn";
import { useAgentChat } from "@/hooks/use-agent-chat";
import AgentChatDock from "./components/agent-chat-dock";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { chatStorage } from "@/lib/utils/chat-storage";
import { useChatSessionContext } from "./ChatSessionContext";
import { createChatSession, ChatSession } from "@/api/chat-sessions";
import { useHeader } from "@/contexts/header-context";

// Default agent ID to use for new conversations
const DEFAULT_AGENT_ID = "o-9b9bdc247-reggie";

export default function ChatsComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const agentId = searchParams.get("agentId") ?? process.env.NEXT_PUBLIC_DEFAULT_AGENT_ID;
  const params = useParams();
  const sessionId = params.sessionId as string | null; // This is the sessionId from the URL
  const { setHeaderActions, setHeaderCustomContent } = useHeader();
  
  // Get the refresh function from ChatSessionContext to update chat history
  const { refresh, addSession, updateSessionTitle, updateSessionTitleWithTyping } = useChatSessionContext();
  
  // Ref to track URL update timeout
  const urlUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
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

  // Set header actions and custom content
  useEffect(() => {
    setHeaderActions([
      {
        label: "Change Agent",
        onClick: handleChangeAgent,
        variant: "outline",
        size: "sm"
      },
      {
        label: "New Chat",
        onClick: handleNewChat,
        icon: <Plus className="h-4 w-4" />,
        variant: "default",
        size: "sm"
      }
    ]);

    // Set chat title as custom content next to the page title
    setHeaderCustomContent(
      <div className="text-lg font-semibold truncate" title={currentChatTitle || "Chat"}>
        {currentChatTitle || "Chat"}
      </div>
    );

    // Cleanup when component unmounts
    return () => {
      setHeaderActions([]);
      setHeaderCustomContent(null);
    };
  }, [setHeaderActions, setHeaderCustomContent, currentChatTitle]);

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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (urlUpdateTimeoutRef.current) {
        clearTimeout(urlUpdateTimeoutRef.current);
      }
    };
  }, []);

  const handleSelectChat = (chatId: string, agentCode?: string | null) => {
    // Update internal state
    setSelectedChat({ id: chatId, agentCode: agentCode || DEFAULT_AGENT_ID });
    
    // Navigate to the chat session URL
    const newPath = `/chat/${chatId}${agentCode ? `?agentId=${agentCode}` : ''}`;
    router.push(newPath);
  };

  const handleChangeAgent = () => {
    // Navigate to agent selection page
    router.push("/agent");
  };

  const handleNewChat = async () => {
    console.log("handleNewChat called");
    
    try {
      // Create a new session immediately
      const session = await createChatSession({ agent_id: agentId || DEFAULT_AGENT_ID });
      const newSessionId = session.session_id;
      
      // Update URL immediately with the new session ID
      const newPath = `/chat/${newSessionId}${agentId ? `?agentId=${agentId}` : ''}`;
      router.replace(newPath);
      
      // Update selectedChat state to reflect the new session ID
      setSelectedChat({ id: newSessionId, agentCode: agentId || DEFAULT_AGENT_ID });
      
      // Refresh the chat history to include the new session
      refresh();
    } catch (error) {
      console.error('Failed to create new chat session:', error);
      // Fallback to the old behavior if session creation fails
      setSelectedChat({ id: "", agentCode: agentId || DEFAULT_AGENT_ID });
      router.push("/chat");
    }
  };

  const handleNewSessionCreated = (newSessionId: string) => {
    // Only update URL if this is a different session than what we already have
    // This prevents double updates when handleNewChat already created the session
    if (newSessionId && newSessionId !== selectedChat.id) {
      // Update selectedChat state to reflect the new session ID immediately
      setSelectedChat({ id: newSessionId, agentCode: agentId || DEFAULT_AGENT_ID });
      
      // Optimistically add the new session to chat history instead of full refresh
      // This creates a smoother experience without UI jumping
      const newSession: ChatSession = {
        session_id: newSessionId,
        title: "New Chat",
        updated_at: new Date().toISOString(),
        agent_code: agentId || DEFAULT_AGENT_ID,
        agent_id: agentId || DEFAULT_AGENT_ID,
        created_at: new Date().toISOString(),
      };
      
      // Add to the beginning of the chat sessions list
      // Note: This assumes the ChatSessionContext has a method to add sessions
      // We'll need to add this functionality to the context
      addSession(newSession);
      
      // Update URL after a delay to ensure message processing is complete
      // This allows the session to appear in history while preventing message loss
      if (!sessionId) {
        // Clear any existing timeout
        if (urlUpdateTimeoutRef.current) {
          clearTimeout(urlUpdateTimeoutRef.current);
        }
        
        // Set new timeout for URL update
        urlUpdateTimeoutRef.current = setTimeout(() => {
          const newPath = `/chat/${newSessionId}${agentId ? `?agentId=${agentId}` : ''}`;
          router.replace(newPath);
          urlUpdateTimeoutRef.current = null;
        }, 3000); // 3 second delay to ensure message processing is complete
      }
    }
  };

  const handleTitleUpdate = (title: string | null) => {
    // Update session title with typing animation for a smooth effect
    // This creates a nice typing animation as the agent generates the title
    if (title && title !== "New Chat") {
      updateSessionTitleWithTyping(selectedChat.id || "", title, 80); // 80ms per character for slow typing
    }
  };

  const handleMessageComplete = () => {
    // No need to refresh here since we're using optimistic updates
    // The session is already added to history when created
    // and title updates are handled by handleTitleUpdate
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header removed - now handled by layout */}
      {/* Content Row */}
      <div className="flex flex-1 overflow-hidden">
        <AgentChatDock onSelectChat={handleSelectChat} onNewChat={handleNewChat}  />
        <div className="flex-1 flex flex-col min-h-0">
          <CustomChat
            agentId={selectedChat.agentCode || DEFAULT_AGENT_ID}
            sessionId={selectedChat.id || undefined}
            onNewSessionCreated={handleNewSessionCreated}
            onTitleUpdate={handleTitleUpdate}
            onMessageComplete={handleMessageComplete}
          />
        </div>
      </div>
    </div>
  );
}
