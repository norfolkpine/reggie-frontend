import { useState, useCallback, useRef, useEffect } from 'react';
import { getAgentStreamChat, parseStreamData, createStreamChatMessage } from '@/api/agents';
import { createChatSession } from '@/api/chat-sessions';
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
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e?: React.FormEvent) => void;
  isLoading: boolean;
}

export function useAgentChat({ agentId, sessionId: ssid = null }: UseAgentChatProps): UseAgentChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionCreated, setSessionCreated] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(ssid);
  const readerRef = useRef<ReadableStreamDefaultReader | null>(null);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  }, []);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

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
      content: input,
      role: 'user'
    };
    setMessages(prev => [...prev, userMessage]);

    setInput('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const payload = {
        agent_id: agentId,
        message: input,
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
  }, [input, isLoading, agentId, sessionCreated, sessionId]);

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
    input,
    handleInputChange,
    handleSubmit,
    isLoading
  };
}