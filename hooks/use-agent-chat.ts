import { useState, useCallback, useRef, useEffect } from 'react';
import { createChatSession, getChatSessionMessage } from '@/api/chat-sessions';
import { TOKEN_KEY } from "@/contexts/auth-context";
import { BASE_URL } from '@/lib/api-client';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
}

interface UseAgentChatProps {
  agentId: string;
  sessionId?: string | null;
}

interface UseAgentChatReturn {
  messages: Message[];
  handleSubmit: (value?: string) => void;
  isLoading: boolean;
}

export function useAgentChat({ agentId, sessionId: ssid = null }: UseAgentChatProps): UseAgentChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionCreated, setSessionCreated] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(ssid);
  const readerRef = useRef<ReadableStreamDefaultReader | null>(null);

  useEffect(() => {
    const loadExistingMessages = async () => {
      if (!ssid) return;
      try {
        setIsLoading(true);
        const response = await getChatSessionMessage(ssid);
        const formattedMessages = response.results.map(msg => ({
          id: msg.id || msg.timestamp?.toString() || crypto.randomUUID(),
          content: msg.content,
          role: msg.role as 'user' | 'assistant'
        }));
        setMessages(formattedMessages);
        setSessionCreated(true);
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingMessages();
  }, [ssid]);

  const handleSubmit = useCallback(async (value?: string) => {
    if (!value?.trim() || isLoading) return;

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
        return;
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: value ?? "",
      role: 'user'
    };
    setMessages(prev => [...prev, userMessage]);

    setIsLoading(true);

    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const payload = {
        agent_id: agentId,
        message: value ?? "",
        session_id: tempSessionId,
      };

      setMessages(prev => [...prev, { id: Date.now().toString(), content: '', role: 'assistant' }]);

      const response = await fetch(`${BASE_URL}/reggie/api/v1/agent/stream-chat/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      console.log("Response:", response);

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Failed to get reader from response");
      readerRef.current = reader;

      const decoder = new TextDecoder();
      let responseContent = '';

      while (true) {
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
              if (parsedData.token) {
                responseContent += parsedData.token;
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = {
                    id: newMessages[newMessages.length - 1].id,
                    role: 'assistant',
                    content: responseContent,
                  };
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
      console.error('Stream error:', error);
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage.role === 'assistant' && lastMessage.content === '') {
          newMessages[newMessages.length - 1] = {
            ...lastMessage,
            content: 'Sorry, there was an error processing your request.',
          };
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
      if (readerRef.current) {
        readerRef.current.releaseLock();
        readerRef.current = null;
      }
    }
  }, [isLoading, agentId, sessionCreated, sessionId]);

  // Cleanup reader on unmount
  useEffect(() => {
    return () => {
      if (readerRef.current) {
        readerRef.current.releaseLock();
      }
    };
  }, []);

  return {
    messages,
    handleSubmit,
    isLoading
  };
}