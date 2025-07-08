"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { getChatSessions, ChatSession } from "@/api/chat-sessions";
import { useAuth } from "@/contexts/auth-context";

interface ChatSessionContextType {
  chatSessions: ChatSession[];
  isLoading: boolean;
  page: number;
  refresh: () => void;
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

export const ChatSessionProvider = ({ children }: { children: ReactNode }) => {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useAuth();

  const fetchChats = useCallback(async (currentPage: number = 1, append: boolean = false) => {
    setIsLoading(true);
    try {
      const res = await getChatSessions(currentPage);
      setHasMore(res.next !== null);
      
      if (append) {
        setChatSessions(prev => [
          ...prev,
          ...res.results.filter(
            newSession => !prev.some(existing => existing.session_id === newSession.session_id)
          )
        ]);
      } else {
        setChatSessions(res.results);
      }
    } catch (e) {
      console.error("Error fetching chat sessions", e);
    }
    setIsLoading(false);
  }, []);

  const refresh = useCallback(() => {
    setPage(1);
    fetchChats(1, false);
  }, [fetchChats]);

  useEffect(() => {
    if (!user) {
      setChatSessions([]);
      setIsLoading(false);
      setPage(1);
      setHasMore(false);
      return;
    }
    
    if (page === 1) {
      fetchChats(1, false);
    } else {
      fetchChats(page, true);
    }
  }, [user, page, fetchChats]);

  return (
    <ChatSessionContext.Provider value={{ chatSessions, isLoading, refresh, setPage, page, hasMore }}>
      {children}
    </ChatSessionContext.Provider>
  );
};

export const useChatSessionContext = () => useContext(ChatSessionContext);
