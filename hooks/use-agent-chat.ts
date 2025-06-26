import { useState, useCallback, useRef, useEffect } from 'react';
import { createChatSession, getChatSessionMessage } from '@/api/chat-sessions';
import { TOKEN_KEY } from "@/contexts/auth-context";
import { BASE_URL } from '@/lib/api-client';
import { Feedback } from '@/api/chat-sessions';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  feedback?: Feedback[];
}

interface UseAgentChatProps {
  agentId: string;
  sessionId?: string | null;
}

interface UseAgentChatReturn {
  messages: Message[];
  handleSubmit: (value?: string) => void;
  isLoading: boolean;
  error: string | null;
}

export function useAgentChat({ agentId, sessionId: ssid = null }: UseAgentChatProps): UseAgentChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(!!ssid); // Track initial loading
  const [sessionCreated, setSessionCreated] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(ssid);
  const [error, setError] = useState<string | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Validate API base URL on component mount
  useEffect(() => {
    if (!BASE_URL || BASE_URL === "undefined") {
      console.error("API Base URL is not defined. Check your environment variables.");
      setError("API configuration error. Please check your environment settings.");
    }
  }, []);

  useEffect(() => {
    const loadExistingMessages = async () => {
      if (!ssid) {
        setIsInitializing(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setIsInitializing(true);
        setError(null);
        
        const response = await getChatSessionMessage(ssid);
        const formattedMessages = response.results.map(msg => ({
          id: msg.id || msg.timestamp?.toString() || crypto.randomUUID(),
          content: msg.content,
          role: msg.role as 'user' | 'assistant',
          feedback: msg.feedback
        }));
        
        setMessages(formattedMessages);
        setSessionCreated(true);
      } catch (error) {
        console.error('Error loading messages:', error);
        setError('Failed to load messages. Please try refreshing the page.');
      } finally {
        setIsLoading(false);
        setIsInitializing(false);
      }
    };

    loadExistingMessages();
    
    // Cleanup any existing requests when component unmounts or sessionId changes
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [ssid]);

  const handleSubmit = useCallback(async (value?: string) => {
    if (!value?.trim() || isLoading) return;
    
    // Abort any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create a new abort controller
    abortControllerRef.current = new AbortController();
    
    // Reset any previous errors
    setError(null);
    setIsLoading(true);

    let tempSessionId = sessionId;

    if (!sessionCreated) {
      try {
        const result = await createChatSession({
          title: "New Chat",
          agent_id: agentId,
        });

        tempSessionId = result.session_id;
        setSessionId(result.session_id);
        setSessionCreated(true);
      } catch (error) {
        console.error('Failed to create chat session:', error);
        setError('Failed to create chat session. Please check your connection and try again.');
        setIsLoading(false);
        return;
      }
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: value ?? "",
      role: 'user'
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        throw new Error("Authentication token is missing");
      }

      const payload = {
        agent_id: agentId,
        message: value ?? "",
        session_id: tempSessionId,
      };

      // Add empty assistant message to show typing indicator
      const assistantMessageId = `assistant-${crypto.randomUUID()}`;
      setMessages(prev => [...prev, { id: assistantMessageId, content: '', role: 'assistant' }]);

      const response = await fetch(`${BASE_URL}/reggie/api/v1/chat/stream/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Failed to get reader from response");
      readerRef.current = reader;

      const decoder = new TextDecoder();
      let responseContent = '';

      while (true) {
        // Check if request was aborted
        if (abortControllerRef.current?.signal.aborted) {
          break;
        }
        
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter(line => line.trim() !== "");

        for (const line of lines) {
          if (line.startsWith("data:")) {
            const dataContent = line.slice(5).trim();
            if (dataContent === "[DONE]") break;

            try {
              const parsedData = JSON.parse(dataContent);
              const tokenPart = parsedData.token ?? parsedData.content;
              if (typeof tokenPart === 'string' && tokenPart.length > 0) {
                responseContent += tokenPart;
                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastMessageIndex = newMessages.length - 1;
                  if (lastMessageIndex >= 0 && newMessages[lastMessageIndex].role === 'assistant') {
                    newMessages[lastMessageIndex] = {
                      ...newMessages[lastMessageIndex],
                      content: responseContent,
                    };
                  }
                  return newMessages;
                });
              }
            } catch (e) {
              console.error("Failed to parse SSE data:", dataContent);
            }
          }
        }
      }
    } catch (error) {
      // Don't set error if it was due to an abort
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.log('Request was aborted');
      } else {
        console.error('Stream error:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
        setMessages(prev => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          if (lastIndex >= 0 && newMessages[lastIndex].role === 'assistant' && newMessages[lastIndex].content === '') {
            newMessages[lastIndex] = {
              ...newMessages[lastIndex],
              content: 'Sorry, there was an error processing your request.',
            };
          }
          return newMessages;
        });
      }
    } finally {
      setIsLoading(false);
      if (readerRef.current) {
        try {
          readerRef.current.releaseLock();
        } catch (e) {
          console.error('Error releasing reader lock:', e);
        }
        readerRef.current = null;
      }
    }
  }, [agentId, sessionCreated, sessionId]); // Remove isLoading from dependencies to avoid re-render issues

  // Cleanup reader and abort controller on unmount
  useEffect(() => {
    return () => {
      if (readerRef.current) {
        try {
          readerRef.current.releaseLock();
        } catch (e) {
          console.error('Error releasing reader lock on unmount:', e);
        }
      }
      
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    messages,
    handleSubmit,
    isLoading: isLoading || isInitializing,
    error
  };
}