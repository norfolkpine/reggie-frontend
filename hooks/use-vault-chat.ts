import { useState, useCallback, useRef, useEffect } from 'react';
import { createChatSession, getChatSessionMessage, getChatSession } from '@/api/chat-sessions';
import { TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from "../lib/constants";
import { BASE_URL } from '@/lib/api-client';
import { Feedback } from '@/api/chat-sessions';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from "@/contexts/auth-context";
import { ToolCall } from '@/components/ui/chat-message';
import { captureChatError } from '@/lib/error-handler';
import { getCSRFToken } from '@/api';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  feedback?: Feedback[];
  toolCalls?: ToolCall[];
  reasoningSteps?: ReasoningStep[];
}

interface ReasoningStep {
  title: string;
  reasoning: string;
  action?: string;
  result?: string;
  nextAction?: string;
  confidence?: number;
}

interface UseVaultChatProps {
  projectId: string;
  folderId?: string | null;
  fileIds?: string[];
  sessionId?: string | null;
  onNewSessionCreated?: (newSessionId: string) => void;
  onTitleUpdate?: (title: string | null) => void;
  onMessageComplete?: () => void;
  reasoning?: boolean;
}

interface UseVaultChatReturn {
  messages: Message[];
  handleSubmit: (value?: string) => void;
  isLoading: boolean;
  error: string | null;
  currentDebugMessage: string | null;
  currentChatTitle: string | null;
  isAgentResponding: boolean;
  currentToolCalls: Map<string, ToolCall>;
  currentReasoningSteps: ReasoningStep[];
  isMemoryUpdating: boolean;
}

export function useVaultChat({
  projectId,
  folderId = null,
  fileIds = [],
  sessionId: ssid = null,
  onNewSessionCreated,
  onTitleUpdate,
  onMessageComplete,
  reasoning = false
}: UseVaultChatProps): UseVaultChatReturn {
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
  const [isAgentResponding, setIsAgentResponding] = useState<boolean>(false);
  const [currentToolCalls, setCurrentToolCalls] = useState<Map<string, ToolCall>>(new Map());
  const [currentReasoningSteps, setCurrentReasoningSteps] = useState<ReasoningStep[]>([]);
  const [isMemoryUpdating, setIsMemoryUpdating] = useState(false);

  const { handleTokenExpiration } = useAuth();

  useEffect(() => {
    if (BASE_URL === "undefined") {
      console.error("API Base URL is not defined. Check your environment variables.");
      setError("API configuration error. Please check your environment settings.");
    }
  }, []);

  useEffect(() => {
    const loadExistingSessionDetails = async () => {
      if (!ssid) {
        setIsInitializing(false);
        isNewConversationRef.current = true;
        setCurrentChatTitle("New Vault Chat");
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
        console.log('🔍 Debug: Raw message response from API:', messageResponse);

        const formattedMessages = messageResponse.results
          .filter(msg => msg.role === 'user' || msg.role === 'assistant')
          .map(msg => ({
            id: msg.id || msg.timestamp?.toString() || uuidv4(),
            content: msg.content,
            role: msg.role as 'user' | 'assistant',
            feedback: msg.feedback
          }));

        setMessages(formattedMessages);
        setInternalSessionId(ssid);
        setSessionCreated(true);
      } catch (error) {
        console.error('Error loading session details or messages:', error);
        captureChatError(error, {
          action: 'loadExistingSessionDetails',
          projectId: projectId,
          sessionId: ssid,
          apiResponse: error,
          component: 'vault-chat'
        });
        setError('Failed to load vault chat. Please try refreshing.');
        setCurrentChatTitle("Vault Chat");
      } finally {
        setIsLoading(false);
        setIsInitializing(false);
      }
    };

    loadExistingSessionDetails();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debugMessageTimeoutRef.current) {
        clearTimeout(debugMessageTimeoutRef.current);
      }
    };
  }, [ssid, projectId]);

  const handleSubmit = useCallback(async (value?: string) => {
    if (!value?.trim() || (isLoading && !isInitializing)) return;

    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    setError(null);
    if (debugMessageTimeoutRef.current) clearTimeout(debugMessageTimeoutRef.current);
    setCurrentDebugMessage(null);

    let tempSessionId = internalSessionId;
    let shouldCallOnNewSessionCreated = false;

    // Create session first if it doesn't exist
    if (!sessionCreated || !tempSessionId) {
      setIsLoading(true);
      try {
        setCurrentChatTitle("New Vault Chat");
        // Create a unique session ID for vault chat
        tempSessionId = `vault_${uuidv4()}`;
        setInternalSessionId(tempSessionId);
        setSessionCreated(true);
        isNewConversationRef.current = true;
        shouldCallOnNewSessionCreated = true;
      } catch (sessionError) {
        console.error('Failed to create vault chat session:', sessionError);
        captureChatError(sessionError, {
          action: 'createVaultChatSession',
          projectId: projectId,
          apiResponse: sessionError,
          component: 'vault-chat'
        });
        setError('Failed to create vault chat session. Please try again.');
        setIsLoading(false);
        return;
      }
    }

    // Add the user message to the UI
    const userMessage: Message = {
      id: uuidv4(),
      content: value ?? "",
      role: 'user',
    };

    if (isNewConversationRef.current && messages.length === 0) {
      setMessages([userMessage]);
    } else {
      setMessages(prev => [...prev, userMessage]);
    }

    if (isNewConversationRef.current) {
      isNewConversationRef.current = false;
    }

    setIsLoading(true);
    setIsAgentResponding(true);
    let toolCalls: ToolCall[] = [];
    let reasoningSteps: ReasoningStep[] = [];

    try {
      const csrfToken = getCSRFToken();
      const payload = {
        project_id: projectId,
        folder_id: folderId,
        file_ids: fileIds,
        message: value,
        session_id: tempSessionId,
        reasoning: reasoning,
      };

      const assistantMessageId = `assistant-${uuidv4()}`;

      // Use the vault chat endpoint
      const response = await fetch(`${BASE_URL}/reggie/api/v1/vault/chat/stream/`, {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken && { "X-CSRFToken": csrfToken })
        },
        body: JSON.stringify(payload),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          handleTokenExpiration();
          return;
        }
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Failed to get reader from response");
      readerRef.current = reader;

      const decoder = new TextDecoder();
      let assistantMessageCreated = false;
      let buffer = '';

      while (true) {
        if (abortControllerRef.current?.signal.aborted) break;

        const { value: chunkValue, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(chunkValue);
        buffer += chunk;

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;

          if (trimmedLine.startsWith('data: ')) {
            const dataContent = trimmedLine.slice(6);

            if (dataContent === '[DONE]') {
              return;
            }

            try {
              const parsedData = JSON.parse(dataContent);

              if (parsedData.debug) {
                setCurrentDebugMessage(JSON.stringify(parsedData.debug, null, 2));
                if (debugMessageTimeoutRef.current) clearTimeout(debugMessageTimeoutRef.current);
                debugMessageTimeoutRef.current = setTimeout(() => setCurrentDebugMessage(null), 5000);
                continue;
              }

              if (currentDebugMessage) {
                if (debugMessageTimeoutRef.current) clearTimeout(debugMessageTimeoutRef.current);
                setCurrentDebugMessage(null);
              }

              if (parsedData.event === "ChatTitle" && typeof parsedData.title === 'string') {
                setCurrentChatTitle(parsedData.title);
                if (onTitleUpdate) {
                  onTitleUpdate(parsedData.title);
                }
              } else if (parsedData.event === "ToolCallStarted") {
                if(parsedData.tool){
                  const tool = parsedData.tool;
                  const toolCall: ToolCall = {
                    id: tool.tool_call_id,
                    toolName: tool.tool_name,
                    toolArgs: tool.tool_args,
                    status: 'started',
                    startTime: parsedData.created_at,
                  };
                  setCurrentToolCalls(prev => new Map(prev).set(toolCall.id, toolCall));
                }
              } else if (parsedData.event === "ToolCallCompleted") {
                const tool = parsedData.tool;
                if(tool){
                  setCurrentToolCalls(prev => {
                    const newMap = new Map(prev);
                    const existing = newMap.get(tool.tool_call_id);
                    if (existing) {
                      newMap.set(tool.tool_call_id, {
                        ...existing,
                        status: 'completed',
                        result: tool.result,
                        endTime: parsedData.created_at,
                      });
                    }
                    return newMap;
                  });
                }
              } else if (parsedData.event === "RunResponse" || parsedData.event === "RunResponseContent") {
                const tokenPart = parsedData.token ?? parsedData.content ?? '';

                if (parsedData.extra_data?.reasoning_steps) {
                  setCurrentReasoningSteps(parsedData.extra_data.reasoning_steps);
                  reasoningSteps.push(parsedData.extra_data.reasoning_steps);
                }

                if (!assistantMessageCreated && tokenPart.trim()) {
                  setMessages(prev => [...prev, {
                    id: assistantMessageId,
                    content: tokenPart,
                    role: 'assistant',
                    toolCalls: Array.from(currentToolCalls.values()),
                    reasoningSteps: currentReasoningSteps,
                  }]);
                  assistantMessageCreated = true;
                } else if (assistantMessageCreated) {
                  setMessages(prevMessages => {
                    const newMessages = [...prevMessages];
                    const lastMessageIndex = newMessages.length - 1;
                    if (lastMessageIndex >= 0 && newMessages[lastMessageIndex].role === 'assistant') {
                      newMessages[lastMessageIndex] = {
                        ...newMessages[lastMessageIndex],
                        content: newMessages[lastMessageIndex].content + tokenPart,
                        id: parsedData.run_id || parsedData.session_id || newMessages[lastMessageIndex].id,
                        toolCalls: Array.from(currentToolCalls.values()),
                        reasoningSteps: currentReasoningSteps,
                      };
                    }
                    return newMessages;
                  });
                }

                setIsAgentResponding(!isAgentResponding);
              } else if (parsedData.event === "MemoryUpdateStarted") {
                setIsMemoryUpdating(true);
              } else if (parsedData.event) {
                console.log("Received unhandled event type:", parsedData.event, parsedData);
              }
            } catch (e) {
              console.warn("Failed to parse SSE data:", dataContent, e);
              captureChatError(e, {
                action: 'parseSSEData',
                projectId: projectId,
                sessionId: tempSessionId,
                dataContent: dataContent,
                apiResponse: e,
                component: 'vault-chat'
              });
            }
          }
        }
      }
    } catch (streamError) {
      if (streamError instanceof DOMException && streamError.name === 'AbortError') {
        console.log('Request was aborted.');
      } else {
        console.error('Stream error:', streamError);
        captureChatError(streamError, {
          action: 'streamError',
          projectId: projectId,
          sessionId: tempSessionId,
          apiResponse: streamError,
          component: 'vault-chat'
        });
        setError(streamError instanceof Error ? streamError.message : 'An unknown error occurred during streaming.');
        setMessages(prev => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          if (lastIndex < 0 || newMessages[lastIndex].role === 'user') {
            newMessages.push({
              id: uuidv4(),
              role: 'assistant',
              content: 'Sorry, there was an error processing your vault request.'
            });
          } else if (newMessages[lastIndex].role === 'assistant' && newMessages[lastIndex].content === '') {
            newMessages[lastIndex].content = 'Sorry, there was an error processing your vault request.';
          }
          return newMessages;
        });
      }
      if (debugMessageTimeoutRef.current) clearTimeout(debugMessageTimeoutRef.current);
      setCurrentDebugMessage(null);
    } finally {
      setIsLoading(false);
      setIsAgentResponding(false);
      setCurrentToolCalls(new Map());
      setCurrentReasoningSteps([]);
      setIsMemoryUpdating(false);

      toolCalls = [];
      reasoningSteps = [];

      if (onNewSessionCreated && tempSessionId && shouldCallOnNewSessionCreated) {
        onNewSessionCreated(tempSessionId);
      }

      if (readerRef.current) {
        try {
          readerRef.current.releaseLock();
        } catch (e) {
          console.error('Error releasing reader lock:', e);
          captureChatError(e, {
            action: 'releaseReaderLock',
            projectId: projectId,
            sessionId: tempSessionId,
            apiResponse: e,
            component: 'vault-chat'
          });
        }
        readerRef.current = null;
      }
      if (debugMessageTimeoutRef.current) clearTimeout(debugMessageTimeoutRef.current);
      if (onMessageComplete) {
        onMessageComplete();
      }
    }
  }, [projectId, folderId, fileIds, sessionCreated, internalSessionId, currentDebugMessage, messages, isLoading, isInitializing, currentChatTitle, isAgentResponding, onNewSessionCreated, reasoning, handleTokenExpiration, onTitleUpdate, onMessageComplete]);

  return {
    messages,
    handleSubmit,
    isLoading: isLoading || isInitializing,
    error,
    currentDebugMessage,
    currentChatTitle,
    isAgentResponding,
    currentToolCalls,
    currentReasoningSteps,
    isMemoryUpdating,
  };
}