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
  isDone?: boolean; // indicates if assistant stream finished
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
  debugMessage: string | null;
}

export function useAgentChat({ agentId, sessionId: ssid = null }: UseAgentChatProps): UseAgentChatReturn {
  // Flag to track if this is a brand new conversation
  const isNewConversationRef = useRef<boolean>(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [debugMessage, setDebugMessage] = useState<string | null>(null);
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
        // If no session ID, this is a new conversation
        isNewConversationRef.current = true;
        return;
      }
      // If we have a session ID, this is not a new conversation
      isNewConversationRef.current = false;
      
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
        // Create a new chat session
        const result = await createChatSession({
          title: "New Chat",
          agent_id: agentId,
        });

        tempSessionId = result.session_id;
        setSessionId(result.session_id);
        setSessionCreated(true);
        
        // For new sessions, mark that this is the first message
        isNewConversationRef.current = true;
      } catch (error) {
        console.error('Failed to create chat session:', error);
        setError('Failed to create chat session. Please check your connection and try again.');
        setIsLoading(false);
        return;
      }
    }

    // Create the user message object
    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: value ?? "",
      role: 'user'
    };
    
    // For first messages in a new conversation, we need to ensure the message is preserved
    if (isNewConversationRef.current) {
      setMessages([userMessage]);
      isNewConversationRef.current = false; // No longer a new conversation after first message
    } else {
      setMessages(prev => [...prev, userMessage]);
    }

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
      // Use UUID for more reliable ID generation
      const assistantMessageId = `assistant-${crypto.randomUUID()}`;
      setMessages(prev => [...prev, { id: assistantMessageId, content: '', role: 'assistant', isDone: false }]);

      const response = await fetch(`${BASE_URL}/reggie/api/v1/chat/stream/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
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

      let streamDone = false;
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
            if (dataContent === "[DONE]") { streamDone = true; break; }

            try {
              const parsedData = JSON.parse(dataContent);
              let textChunk: string | undefined;
              
              // Handle debug messages
              if (parsedData.debug) {
                console.debug('Debug message:', parsedData.debug);
                // Format debug messages in italics
                textChunk = `\n_${parsedData.debug}_\n\n`;
                // Update debug message state
                setDebugMessage(parsedData.debug);
              } else if (parsedData.tool) {
                // Format tool usage messages in italics
                textChunk = `\n_${parsedData.tool}_\n\n`;
                // Clear debug message when new content arrives
                setDebugMessage(null);
              } else {
                // Normal content
                textChunk = parsedData.token ?? parsedData.content;
                // Clear debug message when new content arrives
                setDebugMessage(null);
              }
              
              if (typeof textChunk === "string" && textChunk.length > 0) {
                responseContent += textChunk;
                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastMessageIndex = newMessages.length - 1;
                  
                  // Make sure we have an assistant message to update
                  if (lastMessageIndex >= 0 && newMessages[lastMessageIndex].role === 'assistant') {
                    newMessages[lastMessageIndex] = {
                      ...newMessages[lastMessageIndex],
                      content: responseContent,
                      id: parsedData.run_id || newMessages[lastMessageIndex].id, // Use run_id if available
                    };
                  } else if (parsedData.event === 'RunResponse' && parsedData.content_type === 'str') {
                    // Handle case where this is the first content message (not debug)
                    // We need to add an assistant message but preserve all existing messages
                    // Only add the assistant message if there isn't already one
                    const hasAssistantMessage = newMessages.some(msg => msg.role === 'assistant');
                    if (!hasAssistantMessage) {
                      // Add assistant message while preserving user message
                      newMessages.push({
                        id: parsedData.run_id || crypto.randomUUID(),
                        content: responseContent,
                        role: 'assistant'
                      });
                    }
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
      // mark assistant message done
      setMessages(prev => {
        const newMessages = [...prev];
        const lastIndex = newMessages.length - 1;
        if (lastIndex >= 0 && newMessages[lastIndex].role === 'assistant') {
          newMessages[lastIndex] = { ...newMessages[lastIndex], isDone: true };
        }
        return newMessages;
      });
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