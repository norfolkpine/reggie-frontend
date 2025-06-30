"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getChatSessions, ChatSession } from "@/api/chat-sessions";
import { useAuth } from "@/contexts/auth-context";

interface ChatSessionContextType {
  chatSessions: ChatSession[];
  isLoading: boolean;
  page: number;
  refresh: () => void; // Keep refresh as is, agentId change will trigger full reload via useEffect
  setPage: (page: number) => void;
  hasMore: boolean;
}

const ChatSessionContext = createContext<ChatSessionContextType>({
  chatSessions: [],
  isLoading: false,
  refresh: () => {},
  page: 1,
  setPage: () => {},
  hasMore: false,
});

interface ChatSessionProviderProps {
  children: ReactNode;
  agentId?: string | null; // Add agentId as an optional prop
}

export const ChatSessionProvider = ({ children, agentId }: ChatSessionProviderProps) => {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true); // Initialize to true to attempt first load
  const { user } = useAuth();
  const [currentAgentId, setCurrentAgentId] = useState<string | null | undefined>(agentId);

  // Update currentAgentId if the prop changes
  useEffect(() => {
    setCurrentAgentId(agentId);
  }, [agentId]);

  const fetchChats = async (currentPage: number, forAgentId?: string | null) => {
    if (!user) {
      setChatSessions([]);
      setIsLoading(false);
      setHasMore(false);
      return;
    }

    setIsLoading(true);
    try {
      // Pass agentId to getChatSessions. Assume getChatSessions will be updated
      // to accept an object with page and agentId.
      // For now, we'll assume getChatSessions is modified to take agentId as a second param.
      // This part needs coordination with the API client update.
      const res = await getChatSessions(currentPage, forAgentId || undefined);
      setHasMore(res.next !== null);

      if (currentPage === 1) {
        setChatSessions(res.results); // Replace results if it's the first page (e.g., after agentId change or refresh)
      } else {
        setChatSessions(prev => [ // Append for infinite scroll
          ...prev,
          ...res.results.filter(
            newSession => !prev.some(existing => existing.session_id === newSession.session_id)
          )
        ]);
      }
    } catch (e) {
      console.error("Error fetching chat sessions", e);
      setChatSessions([]); // Clear sessions on error
      setHasMore(false);
    }
    setIsLoading(false);
  };

  // Effect for initial load and when user, page, or agentId changes
  useEffect(() => {
    if (user) {
      // If agentId has changed, reset page to 1 and clear sessions before fetching
      if (agentId !== currentAgentId || page === 1) {
         setChatSessions([]); // Clear previous sessions immediately
      }
      fetchChats(page, agentId);
    } else {
      setChatSessions([]);
      setIsLoading(false);
      setPage(1);
      setHasMore(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, page, agentId]); // Add agentId to dependency array

  // Refresh function: resets to page 1 for the current agentId
  const refresh = () => {
    setPage(1); // This will trigger the useEffect above because `page` changes.
                // The useEffect will then call fetchChats with page 1 and current agentId.
    // No need to call fetchChats directly here if page is in useEffect deps.
    // To ensure it fetches with new data if current data is stale for page 1:
    setChatSessions([]); // Clear current sessions to ensure fresh fetch for page 1
    fetchChats(1, agentId); // Explicitly call for page 1 with current agentId
  };

  return (
    <ChatSessionContext.Provider value={{ chatSessions, isLoading, refresh, setPage, page, hasMore }}>
      {children}
    </ChatSessionContext.Provider>
  );
};

export const useChatSessionContext = () => useContext(ChatSessionContext);
