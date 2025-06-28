import { useState, useCallback, useRef, useEffect } from 'react';
import { createChatSession, getChatSessionMessage, getChatSession } from '@/api/chat-sessions';
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
  currentDebugMessage: string | null;
  currentChatTitle: string | null;
}

export function useAgentChat({ agentId, sessionId: ssid = null }: UseAgentChatProps): UseAgentChatReturn {
  const isNewConversationRef = useRef<boolean>(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(!!ssid);
  const [sessionCreated, setSessionCreated] = useState(false);
  const [internalSessionId, setInternalSessionId] = useState<string | null>(ssid);
  const [error, setError] = useState<string | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [currentDebugMessage, setCurrentDebugMessage] = useState<string | null>(null);
  const debugMessageTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [currentChatTitle, setCurrentChatTitle] = useState<string | null>(null);

  useEffect(() => {
    if (!BASE_URL || BASE_URL === "undefined") {
      console.error("API Base URL is not defined. Check your environment variables.");
      setError("API configuration error. Please check your environment settings.");
    }
  }, []);

  useEffect(() => {
    const loadExistingSessionDetails = async () => {
      if (!ssid) {
        setIsInitializing(false);
        isNewConversationRef.current = true;
        setCurrentChatTitle("New Chat");
        setMessages([]);
        setInternalSessionId(null);
        setSessionCreated(false);
        return;
      }
      
      isNewConversationRef.current = false;
      setIsLoading(true);
      setIsInitializing(true);
      setError(null);
      
      try {
        const sessionDetails = await getChatSession(ssid);
        setCurrentChatTitle(sessionDetails.title);
        
        const messageResponse = await getChatSessionMessage(ssid);
        const formattedMessages = messageResponse.results.map(msg => ({
          id: msg.id || msg.timestamp?.toString() || crypto.randomUUID(),
          content: msg.content,
          role: msg.role as 'user' | 'assistant',
          feedback: msg.feedback
        }));
        
        setMessages(formattedMessages);
        setInternalSessionId(ssid);
        setSessionCreated(true);
      } catch (error) {
        console.error('Error loading session details or messages:', error);
        setError('Failed to load chat. Please try refreshing.');
        setCurrentChatTitle("Chat");
      } finally {
        setIsLoading(false);
        setIsInitializing(false);
      }
    };

    loadExistingSessionDetails();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        // abortControllerRef.current = null; // Not strictly necessary, new one created on submit
      }
      if (debugMessageTimeoutRef.current) {
        clearTimeout(debugMessageTimeoutRef.current);
      }
    };
  }, [ssid]);

  const handleSubmit = useCallback(async (value?: string) => {
    if (!value?.trim() || (isLoading && !isInitializing)) return;
    
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    
    setError(null);
    if (debugMessageTimeoutRef.current) clearTimeout(debugMessageTimeoutRef.current);
    setCurrentDebugMessage(null);

    let tempSessionId = internalSessionId;
    let isNewSessionManuallyCreated = false;

    if (!sessionCreated || !tempSessionId) {
      setIsLoading(true); 
      try {
        setCurrentChatTitle("New Chat"); 
        const session = await createChatSession({
          agent_id: agentId,
        });

        tempSessionId = session.session_id;
        setInternalSessionId(tempSessionId);
        setSessionCreated(true);
        isNewSessionManuallyCreated = true;
        isNewConversationRef.current = true; 
      } catch (error) {
        console.error('Failed to create chat session:', error);
        setError('Failed to create chat session. Please check your connection and try again.');
        setIsLoading(false);
        return;
      }
    }

    const userMessageContent = value ?? "";
    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: userMessageContent,
      role: 'user'
    };
    
    const isEffectivelyFirstUIMessage = messages.filter(m => m.role === 'user').length === 0;

    if (isNewConversationRef.current && messages.length === 0) {
      setMessages([userMessage]);
    } else {
      setMessages(prev => [...prev, userMessage]);
    }

    if (isNewConversationRef.current) {
        isNewConversationRef.current = false;
    }
    
    setIsLoading(true);

    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) throw new Error("Authentication token is missing");

      const payload = {
        agent_id: agentId,
        message: userMessageContent, // Use the sanitized userMessageContent
        session_id: tempSessionId,
      };

      const assistantMessageId = `assistant-${crypto.randomUUID()}`;
      setMessages(prev => [...prev, { id: assistantMessageId, content: '', role: 'assistant' }]);

      const response = await fetch(`${BASE_URL}/reggie/api/v1/chat/stream/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Failed to get reader from response");
      readerRef.current = reader;

      const decoder = new TextDecoder();
      let responseContent = '';
      let dataContentForDoneCheck = '';

      while (true) {
        if (abortControllerRef.current?.signal.aborted) break;
        
        const { value: chunkValue, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(chunkValue);
        const lines = chunk.split("\n").filter(line => line.trim() !== "");

        for (const line of lines) {
          if (line.startsWith("data:")) {
            dataContentForDoneCheck = line.slice(5).trim();
            if (dataContentForDoneCheck === "[DONE]") break;

            try {
              const parsedData = JSON.parse(dataContentForDoneCheck);
              
              if (parsedData.debug) {
                console.debug('Debug message:', parsedData.debug);
                setCurrentDebugMessage(JSON.stringify(parsedData.debug, null, 2)); 
                if (debugMessageTimeoutRef.current) clearTimeout(debugMessageTimeoutRef.current);
                debugMessageTimeoutRef.current = setTimeout(() => {
                  setCurrentDebugMessage(null);
                  debugMessageTimeoutRef.current = null;
                }, 5000); 
                continue; 
              }
              
              if (currentDebugMessage) { 
                 if (debugMessageTimeoutRef.current) clearTimeout(debugMessageTimeoutRef.current);
                 setCurrentDebugMessage(null);
              }

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
                      id: parsedData.run_id || newMessages[lastMessageIndex].id, 
                    };
                  }
                  return newMessages;
                });
              }
            } catch (e) {
              console.error("Failed to parse SSE data:", dataContentForDoneCheck, e);
            }
          }
        }
        if (dataContentForDoneCheck === "[DONE]") break; 
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.log('Request was aborted.');
      } else {
        console.error('Stream error:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
        setMessages(prev => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          if (lastIndex >= 0 && newMessages[lastMessageIndex].role === 'assistant' && newMessages[lastIndex].content === '') {
            newMessages[lastIndex].content = 'Sorry, there was an error processing your request.';
          } else if (lastIndex < 0 || newMessages[lastIndex].role === 'user' ) {
            newMessages.push({ id: crypto.randomUUID(), role: 'assistant', content: 'Sorry, there was an error processing your request.'});
          }
          return newMessages;
        });
      }
      if (debugMessageTimeoutRef.current) clearTimeout(debugMessageTimeoutRef.current);
      setCurrentDebugMessage(null);
    } finally {
      setIsLoading(false);
      if (readerRef.current) {
        try { readerRef.current.releaseLock(); } 
        catch (e) { console.error('Error releasing reader lock:', e); }
        readerRef.current = null;
      }
      if (debugMessageTimeoutRef.current) clearTimeout(debugMessageTimeoutRef.current);
    }
  }, [agentId, sessionCreated, internalSessionId, currentDebugMessage, messages, isLoading, isInitializing, currentChatTitle]);
  // Added currentChatTitle to dependencies of handleSubmit


  // Main unmount cleanup is implicitly handled by the return function in the useEffect([ssid])
  // for abortController and debugMessageTimeoutRef. ReaderRef is cleaned in finally.
  
  return {
    messages,
    handleSubmit,
    isLoading: isLoading || isInitializing,
    error,
    currentDebugMessage,
    currentChatTitle,
  };
}