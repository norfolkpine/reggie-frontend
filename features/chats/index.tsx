"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Menu, RefreshCcw, Bot, History } from "lucide-react";
import { CustomChat } from "./components/chatcn";
import { useAgentChat } from "@/hooks/use-agent-chat";
import AgentChatDock from "./components/agent-chat-dock";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { chatStorage } from "@/lib/utils/chat-storage";
import { useChatSessionContext } from "./ChatSessionContext";
import { createChatSession, ChatSession } from "@/api/chat-sessions";
import { useHeader } from "@/contexts/header-context";
import { useChatStream } from "@/contexts/chat-stream-context";

// Default agent ID to use for new conversations
const DEFAULT_AGENT_ID = process.env.NEXT_PUBLIC_DEFAULT_AGENT_ID || "o-8e3621016-opie";

export default function ChatsComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const agentId = searchParams.get("agentId") ?? DEFAULT_AGENT_ID;
  const params = useParams();
  const sessionId = params.sessionId as string | null; // This is the sessionId from the URL
  const { setHeaderActions, setHeaderCustomContent } = useHeader();
  
  // Get the refresh function from ChatSessionContext to update chat history
  const { refresh, addSession, updateSessionTitle, updateSessionTitleWithTyping } = useChatSessionContext();
  
  // Get chat stream provider methods
  const chatStream = useChatStream();
  
  // Ref to track URL update timeout
  const urlUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Mobile dock state
  const [isMobileDockOpen, setIsMobileDockOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Initialize state with URL params - use useMemo to prevent unnecessary re-initialization
  const initialSelectedChat = useMemo(() => ({ 
    id: sessionId || "", 
    agentCode: agentId
  }), [sessionId, agentId]);
  
  const [selectedChat, setSelectedChat] = useState<{ id: string; agentCode: string | null }>(initialSelectedChat);

  // Get chat title from useAgentChat if a session is selected
  const { currentChatTitle } = useAgentChat({
    agentId: selectedChat.agentCode || DEFAULT_AGENT_ID,
    sessionId: selectedChat.id || undefined,
  });

  // Handle mobile detection and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Set header actions and custom content
  useEffect(() => {
    const actions = isMobile ? [
      {
        label: "History",
        onClick: () => {
          setIsMobileDockOpen(true);
          // Set the dock to show current agent history
          if (typeof window !== 'undefined') {
            localStorage.setItem('chat-dock-state', JSON.stringify({ activeTab: 'current' }));
          }
        },
        icon: <History className="h-4 w-4" />,
        variant: "outline" as const,
        size: "sm" as const
      },
      {
        label: "",
        onClick: handleChangeAgent,
        variant: "outline" as const,
        size: "sm" as const,
        icon: <Bot className="h-4 w-4" />,
      },
      {
        label: "",
        onClick: handleNewChat,
        icon: <Plus className="h-4 w-4" /> ,
        variant: "default" as const,
        size: "sm" as const
      }
    ] : [
      {
        label: "Change Agent",
        onClick: handleChangeAgent,
        variant: "outline" as const,
        size: "sm" as const
      },
      {
        label: "New Chat",
        onClick: handleNewChat,
        icon: <Plus className="h-4 w-4" />,
        variant: "default" as const,
        size: "sm" as const
      }
    ];
    
    setHeaderActions(actions);

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
  }, [setHeaderActions, setHeaderCustomContent, currentChatTitle, isMobile]);

  // Update selectedChat synchronously when URL params change for smooth transitions
  useEffect(() => {
    const newSelectedChat = { 
      id: sessionId || "", 
      agentCode: agentId
    };
    
    // Only update if actually changed to prevent unnecessary re-renders
    if (selectedChat.id !== newSelectedChat.id || selectedChat.agentCode !== newSelectedChat.agentCode) {
      // Switch session in provider immediately for instant transition
      if (sessionId) {
        chatStream.switchSession(sessionId, agentId);
      } else {
        chatStream.switchSession(null, agentId);
      }
      
      // Update state synchronously
      setSelectedChat(newSelectedChat);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, agentId]); // Only depend on URL params, not selectedChat to avoid loops

  // Persist selectedChat in localStorage whenever it changes (only for existing sessions)
  useEffect(() => {
    if (selectedChat.id && selectedChat.agentCode && selectedChat.id !== "" && selectedChat.agentCode !== DEFAULT_AGENT_ID) {
      chatStorage.setSelectedChat(selectedChat);
    }
  }, [selectedChat]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    // Handle escape key to close mobile dock
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileDockOpen) {
        setIsMobileDockOpen(false);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
      
      if (urlUpdateTimeoutRef.current) {
        clearTimeout(urlUpdateTimeoutRef.current);
      }
    };
  }, [isMobileDockOpen]);

  const handleSelectChat = (chatId: string, agentCode?: string | null) => {
    const finalAgentCode = agentCode || DEFAULT_AGENT_ID;
    
    // Update state immediately for instant UI update
    setSelectedChat({ id: chatId, agentCode: finalAgentCode });
    
    // Switch session in provider immediately (this will end current stream if different)
    chatStream.switchSession(chatId, finalAgentCode);
    
    // Close mobile dock when chat is selected
    setIsMobileDockOpen(false);
    
    // Use replace for smoother transition (no history entry, instant navigation)
    const newPath = `/chat/${chatId}${finalAgentCode ? `?agentId=${finalAgentCode}` : ''}`;
    router.replace(newPath);
  };

  const handleChangeAgent = () => {
    // Navigate to agent selection page
    router.push("/agent");
  };

  const handleNewChat = async () => {
    console.log("handleNewChat called");
    
    // Close mobile dock if open
    if (isMobile) {
      setIsMobileDockOpen(false);
    }
    
    // End current stream if any
    if (selectedChat.id) {
      chatStream.endStream(selectedChat.id);
    }
    
    try {
      // Create a new session immediately
      const session = await createChatSession({ agent_id: agentId });
      const newSessionId = session.session_id;
      
      // Switch to new session in provider
      chatStream.switchSession(newSessionId, agentId);
      
      // Update URL immediately with the new session ID (no agentId in path)
      const newPath = `/chat/${newSessionId}`;
      router.replace(newPath);
      
      // Update selectedChat state to reflect the new session ID
      setSelectedChat({ id: newSessionId, agentCode: agentId });
      
      // Refresh the chat history to include the new session
      refresh();
    } catch (error) {
      console.error('Failed to create new chat session:', error);
      // Fallback to the old behavior if session creation fails
      chatStream.switchSession(null, agentId);
      setSelectedChat({ id: "", agentCode: agentId });
      router.push("/chat");
    }
  };

  const handleNewSessionCreated = (newSessionId: string) => {
    // Only update URL if this is a different session than what we already have
    // This prevents double updates when handleNewChat already created the session
    if (newSessionId && newSessionId !== selectedChat.id) {
      // Update selectedChat state immediately for instant UI update
      setSelectedChat({ id: newSessionId, agentCode: agentId });
      
      // Optimistically add the new session to chat history instead of full refresh
      // This creates a smoother experience without UI jumping
      const newSession: ChatSession = {
        session_id: newSessionId,
        title: "New Chat",
        updated_at: new Date().toISOString(),
        agent_code: agentId,
        agent_id: agentId,
        created_at: new Date().toISOString(),
      };
      
      // Add to the beginning of the chat sessions list
      addSession(newSession);
      
      // Route immediately in parallel with stream - happens right after session creation
      // Clear any existing timeout
      if (urlUpdateTimeoutRef.current) {
        clearTimeout(urlUpdateTimeoutRef.current);
        urlUpdateTimeoutRef.current = null;
      }
      
      // Use replace for smooth transition without adding to history
      // This happens immediately after session ID is generated, while stream continues
      const newPath = `/chat/${newSessionId}`;
      router.replace(newPath);
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
    <div className="flex h-[calc(100vh-6rem)] overflow-hidden relative" style={{ height: 'calc(100vh - 6rem)' }}>
      {/* Mobile backdrop */}
      {isMobileDockOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileDockOpen(false)}
        />
      )}
      
      {/* Desktop dock - always visible on desktop */}
      <div className="hidden md:block">
        <AgentChatDock onSelectChat={handleSelectChat} onNewChat={handleNewChat} currentAgentId={agentId} />
      </div>
      
      {/* Mobile dock - overlay on mobile */}
      {isMobileDockOpen && (
        <div className="fixed inset-y-0 left-0 z-50 w-full max-w-sm sm:max-w-md bg-background border-r border-border md:hidden">
          <AgentChatDock 
            onSelectChat={handleSelectChat} 
            onNewChat={handleNewChat}
            isMobile={true}
            onClose={() => setIsMobileDockOpen(false)}
            currentAgentId={agentId}
          />
        </div>
      )}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <CustomChat
          agentId={selectedChat.agentCode || DEFAULT_AGENT_ID}
          sessionId={selectedChat.id || undefined}
          onNewSessionCreated={handleNewSessionCreated}
          onTitleUpdate={handleTitleUpdate}
          onMessageComplete={handleMessageComplete}
        />
      </div>
    </div>
  );
}
