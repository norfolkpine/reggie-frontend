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
  addSession: (session: ChatSession) => void; // Add method to add sessions optimistically
  updateSessionTitle: (sessionId: string, title: string) => void; // Add method to update session titles
  updateSessionTitleWithTyping: (sessionId: string, title: string, speed?: number) => void; // Add typing animation method
}

const ChatSessionContext = createContext<ChatSessionContextType>({
  chatSessions: [],
  isLoading: false,
  refresh: () => {},
  page: 1,
  setPage: () => {},
  hasMore: false,
  addSession: () => {},
  updateSessionTitle: () => {},
  updateSessionTitleWithTyping: () => {},
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

  // Add session optimistically to the beginning of the list
  const addSession = useCallback((session: ChatSession) => {
    setChatSessions(prev => {
      // Check if session already exists
      if (prev.some(existing => existing.session_id === session.session_id)) {
        return prev;
      }
      // Add to the beginning of the list
      return [session, ...prev];
    });
  }, []);

  // Update session title in the list
  const updateSessionTitle = useCallback((sessionId: string, title: string) => {
    setChatSessions(prev => 
      prev.map(session => 
        session.session_id === sessionId 
          ? { ...session, title } 
          : session
      )
    );
  }, []);

  // Update session title with typing animation
  const updateSessionTitleWithTyping = useCallback((sessionId: string, title: string, speed: number = 50) => {
    let currentIndex = 0;
    const currentTitle = chatSessions.find(s => s.session_id === sessionId)?.title || "";
    
    // If the title is already the same, don't animate
    if (currentTitle === title) return;
    
    const typeNextChar = () => {
      if (currentIndex <= title.length) {
        const partialTitle = title.slice(0, currentIndex);
        setChatSessions(prev => 
          prev.map(session => 
            session.session_id === sessionId 
              ? { ...session, title: partialTitle } 
              : session
          )
        );
        currentIndex++;
        setTimeout(typeNextChar, speed);
      }
    };
    
    typeNextChar();
  }, [chatSessions]);

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
    <ChatSessionContext.Provider value={{ chatSessions, isLoading, refresh, setPage, page, hasMore, addSession, updateSessionTitle, updateSessionTitleWithTyping }}>
      {children}
    </ChatSessionContext.Provider>
  );
};

export const useChatSessionContext = () => useContext(ChatSessionContext);
