"use client";

import React, { createContext, useContext, useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { createChatSession, getChatSessionMessage, getChatSession } from '@/api/chat-sessions';
import { uploadFiles as apiUploadFiles } from '@/api/files';
import { BASE_URL } from '@/lib/api-client';
import { Feedback } from '@/api/chat-sessions';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from "@/contexts/auth-context";
import { ToolCall } from '@/components/ui/chat-message';
import { captureChatError } from '@/lib/error-handler';
import { getCSRFToken } from '@/api';
import { ReferencesData } from '@/types/message';
import { usePathname } from 'next/navigation';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  feedback?: Feedback[];
  toolCalls?: ToolCall[];
  reasoningSteps?: ReasoningStep[];
  references?: ReferencesData[];
  experimental_attachments?: { name: string; contentType: string; url: string }[];
  isError?: boolean;
}

interface ReasoningStep {
  title: string;
  reasoning: string;
  action?: string;
  result?: string;
  nextAction?: string;
  confidence?: number;
}

interface SessionState {
  messages: Message[];
  title: string | null;
  agentId: string;
  isStreaming: boolean;
  isAgentResponding: boolean;
  currentToolCalls: Map<string, ToolCall>;
  currentReasoningSteps: ReasoningStep[];
  isMemoryUpdating: boolean;
  debugMessage: string | null;
  error: string | null;
}

interface ChatStreamContextType {
  updateVersion: number;
  getSessionState: (sessionId: string | null) => SessionState | null;
  getMessages: (sessionId: string | null) => Message[];
  getTitle: (sessionId: string | null) => string | null;
  getIsStreaming: (sessionId: string | null) => boolean;
  getIsAgentResponding: (sessionId: string | null) => boolean;
  getCurrentToolCalls: (sessionId: string | null) => Map<string, ToolCall>;
  getCurrentReasoningSteps: (sessionId: string | null) => ReasoningStep[];
  getIsMemoryUpdating: (sessionId: string | null) => boolean;
  getDebugMessage: (sessionId: string | null) => string | null;
  getError: (sessionId: string | null) => string | null;
  startStream: (
    agentId: string,
    sessionId: string | null,
    message: string,
    files?: File[],
    reasoning?: boolean,
    callbacks?: {
      onNewSessionCreated?: (newSessionId: string) => void;
      onTitleUpdate?: (title: string | null) => void;
      onMessageComplete?: () => void;
    }
  ) => Promise<string | null>;
  endStream: (sessionId: string | null) => void;
  switchSession: (newSessionId: string | null, agentId: string) => void;
  loadSession: (sessionId: string, agentId: string) => Promise<void>;
  clearSession: (sessionId: string | null) => void;
  updateMessage: (sessionId: string | null, messageId: string, updates: Partial<Message>) => void;
}

const ChatStreamContext = createContext<ChatStreamContextType | null>(null);

export function ChatStreamProvider({ children }: { children: React.ReactNode }) {
  const sessionsRef = useRef<Map<string, SessionState>>(new Map());
  const streamReadersRef = useRef<Map<string, ReadableStreamDefaultReader>>(new Map());
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());
  const debugMessageTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const activeSessionIdRef = useRef<string | null>(null);
  const activeAgentIdRef = useRef<string | null>(null);
  const [updateVersion, setUpdateVersion] = useState(0);
  const pathname = usePathname();
  const { handleTokenExpiration } = useAuth();

  const triggerUpdate = useCallback(() => {
    setUpdateVersion(prev => prev + 1);
  }, []);

  const ensureSession = useCallback((sessionId: string | null, agentId: string): SessionState => {
    if (!sessionId) {
      const tempId = 'temp-' + uuidv4();
      if (!sessionsRef.current.has(tempId)) {
        sessionsRef.current.set(tempId, {
          messages: [],
          title: "New Chat",
          agentId,
          isStreaming: false,
          isAgentResponding: false,
          currentToolCalls: new Map(),
          currentReasoningSteps: [],
          isMemoryUpdating: false,
          debugMessage: null,
          error: null,
        });
      }
      return sessionsRef.current.get(tempId)!;
    }
    
    if (!sessionsRef.current.has(sessionId)) {
      sessionsRef.current.set(sessionId, {
        messages: [],
        title: null,
        agentId,
        isStreaming: false,
        isAgentResponding: false,
        currentToolCalls: new Map(),
        currentReasoningSteps: [],
        isMemoryUpdating: false,
        debugMessage: null,
        error: null,
      });
    }
    return sessionsRef.current.get(sessionId)!;
  }, []);

  const getSessionState = useCallback((sessionId: string | null): SessionState | null => {
    if (!sessionId) return null;
    return sessionsRef.current.get(sessionId) || null;
  }, []);

  const getMessages = useCallback((sessionId: string | null): Message[] => {
    if (!sessionId) return [];
    const state = sessionsRef.current.get(sessionId);
    return state?.messages || [];
  }, []);

  const getTitle = useCallback((sessionId: string | null): string | null => {
    if (!sessionId) return null;
    const state = sessionsRef.current.get(sessionId);
    return state?.title || null;
  }, []);

  const getIsStreaming = useCallback((sessionId: string | null): boolean => {
    if (!sessionId) return false;
    const state = sessionsRef.current.get(sessionId);
    return state?.isStreaming || false;
  }, []);

  const getIsAgentResponding = useCallback((sessionId: string | null): boolean => {
    if (!sessionId) return false;
    const state = sessionsRef.current.get(sessionId);
    return state?.isAgentResponding || false;
  }, []);

  const getCurrentToolCalls = useCallback((sessionId: string | null): Map<string, ToolCall> => {
    if (!sessionId) return new Map();
    const state = sessionsRef.current.get(sessionId);
    return state?.currentToolCalls || new Map();
  }, []);

  const getCurrentReasoningSteps = useCallback((sessionId: string | null): ReasoningStep[] => {
    if (!sessionId) return [];
    const state = sessionsRef.current.get(sessionId);
    return state?.currentReasoningSteps || [];
  }, []);

  const getIsMemoryUpdating = useCallback((sessionId: string | null): boolean => {
    if (!sessionId) return false;
    const state = sessionsRef.current.get(sessionId);
    return state?.isMemoryUpdating || false;
  }, []);

  const getDebugMessage = useCallback((sessionId: string | null): string | null => {
    if (!sessionId) return null;
    const state = sessionsRef.current.get(sessionId);
    return state?.debugMessage || null;
  }, []);

  const getError = useCallback((sessionId: string | null): string | null => {
    if (!sessionId) return null;
    const state = sessionsRef.current.get(sessionId);
    return state?.error || null;
  }, []);

  const endStream = useCallback((sessionId: string | null) => {
    if (!sessionId) return;

    const abortController = abortControllersRef.current.get(sessionId);
    if (abortController) {
      abortController.abort();
      abortControllersRef.current.delete(sessionId);
    }

    const reader = streamReadersRef.current.get(sessionId);
    if (reader) {
      try {
        reader.releaseLock();
      } catch (e) {
        console.error('Error releasing reader lock:', e);
      }
      streamReadersRef.current.delete(sessionId);
    }

    const timeout = debugMessageTimeoutsRef.current.get(sessionId);
    if (timeout) {
      clearTimeout(timeout);
      debugMessageTimeoutsRef.current.delete(sessionId);
    }

    const state = sessionsRef.current.get(sessionId);
    if (state) {
      state.isStreaming = false;
      state.isAgentResponding = false;
      state.isMemoryUpdating = false;
      state.currentToolCalls = new Map();
      state.currentReasoningSteps = [];
      state.debugMessage = null;
      triggerUpdate();
    }
  }, [triggerUpdate]);

  const clearSession = useCallback((sessionId: string | null) => {
    if (!sessionId) return;
    endStream(sessionId);
    sessionsRef.current.delete(sessionId);
    triggerUpdate();
  }, [endStream, triggerUpdate]);

  const switchSession = useCallback((newSessionId: string | null, agentId: string) => {
    if (activeSessionIdRef.current === newSessionId && activeAgentIdRef.current === agentId) {
      return;
    }
    
    if (activeSessionIdRef.current && activeSessionIdRef.current !== newSessionId) {
      endStream(activeSessionIdRef.current);
    }
    
    activeSessionIdRef.current = newSessionId;
    activeAgentIdRef.current = agentId;
    
    if (newSessionId) {
      ensureSession(newSessionId, agentId);
    }
    
    triggerUpdate();
  }, [endStream, ensureSession, triggerUpdate]);

  const loadSession = useCallback(async (sessionId: string, agentId: string) => {
    const state = ensureSession(sessionId, agentId);
    state.error = null;

    try {
      const sessionDetails = await getChatSession(sessionId);
      state.title = sessionDetails.title;

      const messageResponse = await getChatSessionMessage(sessionId);
      
      const formattedMessages: Message[] = messageResponse.results
        .filter(msg => msg.role === 'user' || msg.role === 'assistant')
        .map(msg => ({
          id: msg.id || msg.timestamp?.toString() || uuidv4(),
          content: msg.content,
          role: msg.role as 'user' | 'assistant',
          feedback: msg.feedback
        }));

      const hasExistingMessages = state.messages.length > 0;
      const existingMessageIds = new Set(state.messages.map(m => m.id));
      const loadedMessageIds = new Set(formattedMessages.map(m => m.id));
      
      if (hasExistingMessages && 
          existingMessageIds.size === loadedMessageIds.size &&
          Array.from(existingMessageIds).every(id => loadedMessageIds.has(id))) {
        triggerUpdate();
        return;
      }

      state.messages = formattedMessages;
      triggerUpdate();
    } catch (error) {
      console.error('Error loading session details or messages:', error);
      captureChatError(error, {
        action: 'loadExistingSessionDetails',
        agentId: agentId,
        sessionId: sessionId,
        apiResponse: error,
        component: 'chat'
      });
      state.error = 'Failed to load chat. Please try refreshing.';
      state.title = "Chat";
      triggerUpdate();
    }
  }, [ensureSession, triggerUpdate]);

  const updateMessage = useCallback((sessionId: string | null, messageId: string, updates: Partial<Message>) => {
    if (!sessionId) return;
    const state = sessionsRef.current.get(sessionId);
    if (!state) return;

    const messageIndex = state.messages.findIndex(msg => msg.id === messageId);
    if (messageIndex >= 0) {
      state.messages[messageIndex] = { ...state.messages[messageIndex], ...updates };
      triggerUpdate();
    }
  }, [triggerUpdate]);

  const startStream = useCallback(async (
    agentId: string,
    sessionId: string | null,
    message: string,
    files?: File[],
    reasoning: boolean = false,
    callbacks?: {
      onNewSessionCreated?: (newSessionId: string) => void;
      onTitleUpdate?: (title: string | null) => void;
      onMessageComplete?: () => void;
    }
  ): Promise<string | null> => {
    if (sessionId) {
      endStream(sessionId);
    }

    let finalSessionId = sessionId;
    let isNewSession = false;

    if (!finalSessionId) {
      try {
        const session = await createChatSession({ agent_id: agentId });
        finalSessionId = session.session_id;
        isNewSession = true;
        
        const state = ensureSession(finalSessionId, agentId);
        state.title = "New Chat";
        state.agentId = agentId;
        triggerUpdate();
        
        if (callbacks?.onNewSessionCreated) {
          callbacks.onNewSessionCreated(finalSessionId);
        }
      } catch (sessionError) {
        console.error('Failed to create chat session:', sessionError);
        captureChatError(sessionError, {
          action: 'createChatSession',
          agentId: agentId,
          apiResponse: sessionError,
          component: 'chat'
        });
        const state = ensureSession(null, agentId);
        state.error = 'Failed to create chat session. Please check your connection and try again.';
        triggerUpdate();
        return null;
      }
    }

    const state = ensureSession(finalSessionId, agentId);
    state.error = null;
    state.isStreaming = true;
    state.isAgentResponding = true;
    activeSessionIdRef.current = finalSessionId;
    activeAgentIdRef.current = agentId;
    triggerUpdate();

    let attachments: { id: string; name: string; contentType: string; url: string }[] | undefined = undefined;
    if (files && files.length > 0) {
      try {
        const uploadResponse = await apiUploadFiles(files, { session_id: finalSessionId, is_ephemeral: true });
        if (Array.isArray(uploadResponse?.documents) && uploadResponse.documents.length > 0) {
          attachments = uploadResponse.documents.map(doc => ({
            id: doc.uuid,
            name: doc.title,
            contentType: doc.file_type,
            url: doc.file
          }));
        }
      } catch (uploadError) {
        console.error('File upload failed:', uploadError);
        state.error = 'File upload failed.';
        triggerUpdate();
      }
    }

    const userMessage: Message = {
      id: uuidv4(),
      content: message,
      role: 'user',
      ...(attachments && { experimental_attachments: attachments })
    };

    state.messages = [...state.messages, userMessage];
    triggerUpdate();

    const abortController = new AbortController();
    abortControllersRef.current.set(finalSessionId, abortController);

    try {
      const csrfToken = getCSRFToken();
      const payload = {
        agent_id: agentId,
        message: message,
        session_id: finalSessionId,
        reasoning: reasoning,
      };

      const assistantMessageId = `assistant-${uuidv4()}`;
      let assistantMessageCreated = false;

      const response = await fetch(`${BASE_URL}/opie/api/v1/chat/stream/`, {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json", ...(csrfToken && { "X-CSRFToken": csrfToken }) },
        body: JSON.stringify(payload),
        signal: abortController.signal,
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          handleTokenExpiration();
          return finalSessionId;
        }
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Failed to get reader from response");
      streamReadersRef.current.set(finalSessionId, reader);

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        if (abortController.signal.aborted) break;

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
            const dataContent = trimmedLine.substring(6);

            if (dataContent === '[DONE]') {
              state.isAgentResponding = false;
              state.isStreaming = false;
              triggerUpdate();
              if (callbacks?.onMessageComplete) {
                callbacks.onMessageComplete();
              }
              return finalSessionId;
            }

            try {
              const parsedData = JSON.parse(dataContent);

              if (parsedData.error) {
                state.isAgentResponding = false;
                state.isStreaming = false;
                
                const lastIndex = state.messages.length - 1;
                if (lastIndex >= 0 && state.messages[lastIndex].role === 'user') {
                  state.messages = [...state.messages, {
                    id: uuidv4(),
                    role: 'assistant',
                    content: parsedData.error,
                    isError: true
                  }];
                } else if (lastIndex >= 0 && state.messages[lastIndex].role === 'assistant' && !state.messages[lastIndex].content.trim()) {
                  const updatedMessages = [...state.messages];
                  updatedMessages[lastIndex] = {
                    ...updatedMessages[lastIndex],
                    content: parsedData.error,
                    isError: true
                  };
                  state.messages = updatedMessages;
                }
                triggerUpdate();
                return finalSessionId;
              }

              if (parsedData.debug) {
                state.debugMessage = JSON.stringify(parsedData.debug, null, 2);
                const existingTimeout = debugMessageTimeoutsRef.current.get(finalSessionId);
                if (existingTimeout) clearTimeout(existingTimeout);
                const timeout = setTimeout(() => {
                  state.debugMessage = null;
                  triggerUpdate();
                }, 5000);
                debugMessageTimeoutsRef.current.set(finalSessionId, timeout);
                triggerUpdate();
                continue;
              }

              if (state.debugMessage) {
                const existingTimeout = debugMessageTimeoutsRef.current.get(finalSessionId);
                if (existingTimeout) clearTimeout(existingTimeout);
                state.debugMessage = null;
                triggerUpdate();
              }

              if (parsedData.event === "ChatTitle" && typeof parsedData.title === 'string') {
                state.title = parsedData.title;
                triggerUpdate();
                if (callbacks?.onTitleUpdate) {
                  callbacks.onTitleUpdate(parsedData.title);
                }
              } else if (parsedData.event === "RunStarted") {
                state.isAgentResponding = true;
                triggerUpdate();
              } else if (parsedData.event === "RunCompleted") {
                state.isAgentResponding = false;
                if (parsedData.content) {
                  const lastMessageIndex = state.messages.length - 1;
                  if (lastMessageIndex >= 0 && state.messages[lastMessageIndex].role === 'assistant') {
                    const updatedMessages = [...state.messages];
                    updatedMessages[lastMessageIndex] = {
                      ...updatedMessages[lastMessageIndex],
                      content: parsedData.content,
                      id: parsedData.run_id || parsedData.session_id || updatedMessages[lastMessageIndex].id,
                      toolCalls: Array.from(state.currentToolCalls.values()),
                      reasoningSteps: state.currentReasoningSteps,
                    };
                    state.messages = updatedMessages;
                  }
                }
                triggerUpdate();
              } else if (parsedData.event === "ToolCallStarted") {
                if (parsedData.tool) {
                  const tool = parsedData.tool;
                  const toolCall: ToolCall = {
                    id: tool.tool_call_id,
                    toolName: tool.tool_name,
                    toolArgs: tool.tool_args,
                    status: 'started',
                    startTime: parsedData.created_at,
                  };
                  state.currentToolCalls = new Map(state.currentToolCalls).set(toolCall.id, toolCall);
                  triggerUpdate();
                }
              } else if (parsedData.event === "ToolCallCompleted") {
                const tool = parsedData.tool;
                if (tool) {
                  const newMap = new Map(state.currentToolCalls);
                  const existing = newMap.get(tool.tool_call_id);
                  if (existing) {
                    newMap.set(tool.tool_call_id, {
                      ...existing,
                      status: 'completed',
                      result: tool.result,
                      endTime: parsedData.created_at,
                    });
                    state.currentToolCalls = newMap;
                    triggerUpdate();
                  }
                }
              } else if (parsedData.event === "RunResponse" || parsedData.event === "RunResponseContent" || parsedData.event === "RunContent") {
                const tokenPart = parsedData.token ?? parsedData.content ?? '';

                if (parsedData.extra_data?.reasoning_steps) {
                  state.currentReasoningSteps = parsedData.extra_data.reasoning_steps;
                }

                if (!assistantMessageCreated) {
                  state.messages = [...state.messages, {
                    id: assistantMessageId,
                    content: tokenPart,
                    role: 'assistant',
                    toolCalls: Array.from(state.currentToolCalls.values()),
                    reasoningSteps: state.currentReasoningSteps,
                  }];
                  assistantMessageCreated = true;
                } else {
                  const lastMessageIndex = state.messages.length - 1;
                  if (lastMessageIndex >= 0 && state.messages[lastMessageIndex].role === 'assistant') {
                    const updatedMessages = [...state.messages];
                    updatedMessages[lastMessageIndex] = {
                      ...updatedMessages[lastMessageIndex],
                      content: updatedMessages[lastMessageIndex].content + tokenPart,
                      id: parsedData.run_id || parsedData.session_id || updatedMessages[lastMessageIndex].id,
                      toolCalls: Array.from(state.currentToolCalls.values()),
                      reasoningSteps: state.currentReasoningSteps,
                    };
                    state.messages = updatedMessages;
                  } else {
                    state.messages = [...state.messages, {
                      id: assistantMessageId,
                      content: tokenPart,
                      role: 'assistant',
                      toolCalls: Array.from(state.currentToolCalls.values()),
                      reasoningSteps: state.currentReasoningSteps,
                    }];
                  }
                }
                state.isAgentResponding = true;
                triggerUpdate();
              } else if (parsedData.event === "MemoryUpdateStarted") {
                state.isMemoryUpdating = true;
                triggerUpdate();
              } else if (parsedData.event === "MemoryUpdateCompleted") {
                state.isMemoryUpdating = false;
                triggerUpdate();
              } else if (parsedData.event === "References") {
                if (parsedData.extra_data?.references) {
                  const referencesData: ReferencesData[] = parsedData.extra_data.references;
                  const lastMessageIndex = state.messages.length - 1;
                  if (lastMessageIndex >= 0 && state.messages[lastMessageIndex].role === 'assistant') {
                    const updatedMessages = [...state.messages];
                    updatedMessages[lastMessageIndex] = {
                      ...updatedMessages[lastMessageIndex],
                      references: referencesData,
                    };
                    state.messages = updatedMessages;
                    triggerUpdate();
                  }
                }
              }
            } catch (e) {
              console.warn("Failed to parse SSE data:", dataContent, e);
              captureChatError(e, {
                action: 'parseSSEData',
                agentId: agentId,
                sessionId: finalSessionId,
                dataContent: dataContent,
                apiResponse: e,
                component: 'chat'
              });
            }
          }
        }
      }

      state.isStreaming = false;
      state.isAgentResponding = false;
      state.isMemoryUpdating = false;
      state.currentToolCalls = new Map();
      state.currentReasoningSteps = [];
      triggerUpdate();

      if (callbacks?.onMessageComplete) {
        callbacks.onMessageComplete();
      }

      return finalSessionId;
    } catch (streamError) {
      state.isStreaming = false;
      state.isAgentResponding = false;
      state.isMemoryUpdating = false;
      state.currentToolCalls = new Map();
      state.currentReasoningSteps = [];

      if (streamError instanceof DOMException && streamError.name === 'AbortError') {
        // Request was aborted
      } else {
        console.error('Stream error:', streamError);
        captureChatError(streamError, {
          action: 'streamError',
          agentId: agentId,
          sessionId: finalSessionId,
          apiResponse: streamError,
          component: 'chat'
        });
        state.error = streamError instanceof Error ? streamError.message : 'An unknown error occurred during streaming.';
        
        const lastIndex = state.messages.length - 1;
        if (lastIndex < 0 || state.messages[lastIndex].role === 'user') {
          state.messages = [...state.messages, {
            id: uuidv4(),
            role: 'assistant',
            content: 'Sorry, there was an error processing your request.',
            isError: true
          }];
        } else if (state.messages[lastIndex].role === 'assistant' && !state.messages[lastIndex].content.trim()) {
          const updatedMessages = [...state.messages];
          updatedMessages[lastIndex] = {
            ...updatedMessages[lastIndex],
            content: 'Sorry, there was an error processing your request.',
            isError: true
          };
          state.messages = updatedMessages;
        }
      }
      triggerUpdate();
      return finalSessionId;
    } finally {
      const reader = streamReadersRef.current.get(finalSessionId);
      if (reader) {
        try {
          reader.releaseLock();
        } catch (e) {
          console.error('Error releasing reader lock:', e);
        }
        streamReadersRef.current.delete(finalSessionId);
      }
      abortControllersRef.current.delete(finalSessionId);
      
      const timeout = debugMessageTimeoutsRef.current.get(finalSessionId);
      if (timeout) {
        clearTimeout(timeout);
        debugMessageTimeoutsRef.current.delete(finalSessionId);
      }
    }
  }, [endStream, ensureSession, triggerUpdate, handleTokenExpiration]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionsRef.current.forEach((_, sessionId) => {
        endStream(sessionId);
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [endStream]);

  useEffect(() => {
    return () => {
      sessionsRef.current.forEach((_, sessionId) => {
        endStream(sessionId);
      });
    };
  }, [endStream]);

  const value: ChatStreamContextType = useMemo(() => ({
    updateVersion,
    getSessionState,
    getMessages,
    getTitle,
    getIsStreaming,
    getIsAgentResponding,
    getCurrentToolCalls,
    getCurrentReasoningSteps,
    getIsMemoryUpdating,
    getDebugMessage,
    getError,
    startStream,
    endStream,
    switchSession,
    loadSession,
    clearSession,
    updateMessage,
  }), [
    updateVersion,
    getSessionState,
    getMessages,
    getTitle,
    getIsStreaming,
    getIsAgentResponding,
    getCurrentToolCalls,
    getCurrentReasoningSteps,
    getIsMemoryUpdating,
    getDebugMessage,
    getError,
    startStream,
    endStream,
    switchSession,
    loadSession,
    clearSession,
    updateMessage,
  ]);

  return (
    <ChatStreamContext.Provider value={value}>
      {children}
    </ChatStreamContext.Provider>
  );
}

export function useChatStream() {
  const context = useContext(ChatStreamContext);
  if (!context) {
    throw new Error('useChatStream must be used within ChatStreamProvider');
  }
  return context;
}

