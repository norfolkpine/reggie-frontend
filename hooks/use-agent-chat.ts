import { useState, useCallback, useRef, useEffect } from 'react';
import { createChatSession, getChatSessionMessage, getChatSession } from '@/api/chat-sessions';
import { uploadFiles as apiUploadFiles } from '@/api/files'; // Renamed to avoid conflict
import { TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from "../lib/constants";
import { BASE_URL, getCSRFToken } from '@/lib/api-client';
import { Feedback } from '@/api/chat-sessions';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from "@/contexts/auth-context";
import { ToolCall } from '@/components/ui/chat-message';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  feedback?: Feedback[];
  toolCalls?: ToolCall[];
  reasoningSteps?: ReasoningStep[];
  experimental_attachments?: { name: string; contentType: string; url: string }[];
}


interface ReasoningStep {
  title: string;
  reasoning: string;
  action?: string;
  result?: string;
  nextAction?: string;
  confidence?: number;
}

export interface FileUploadStatus {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  progress?: number; // Optional: for future progress tracking
}

interface UseAgentChatProps {
  agentId: string;
  sessionId?: string | null;
  onNewSessionCreated?: (newSessionId: string) => void;
  onTitleUpdate?: (title: string | null) => void; // Add title update callback
  onMessageComplete?: () => void; // Add message complete callback
  reasoning?: boolean; // Add reasoning parameter
}

interface UseAgentChatReturn {
  messages: Message[];
  handleSubmit: (value?: string, files?: File[]) => void; // Added files parameter
  uploadFiles: (files: File[]) => Promise<void>; // New function for immediate file uploads
  isLoading: boolean;
  error: string | null;
  currentDebugMessage: string | null;
  currentChatTitle: string | null;
  isAgentResponding: boolean;
  fileUploads: FileUploadStatus[]; // To track file upload status
  isUploadingFiles: boolean; // True if any file is currently uploading
  currentToolCalls: Map<string, ToolCall>; // Current active tool calls
  currentReasoningSteps: ReasoningStep[]; // Current reasoning steps
  isMemoryUpdating: boolean; // Add memory updating state
}

export function useAgentChat({ agentId, sessionId: ssid = null, onNewSessionCreated, onTitleUpdate, onMessageComplete, reasoning = false }: UseAgentChatProps): UseAgentChatReturn {
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
  const [fileUploads, setFileUploads] = useState<FileUploadStatus[]>([]);
  const [isUploadingFiles, setIsUploadingFiles] = useState<boolean>(false);
  const [currentToolCalls, setCurrentToolCalls] = useState<Map<string, ToolCall>>(new Map());
  const [currentReasoningSteps, setCurrentReasoningSteps] = useState<ReasoningStep[]>([]);
  // Add state for memory updating
  const [isMemoryUpdating, setIsMemoryUpdating] = useState(false);

  const { handleTokenExpiration } = useAuth();

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
        setFileUploads([]);
        return;
      }
      
      isNewConversationRef.current = false;
      setIsLoading(true);
      setIsInitializing(true);
      setError(null);
      setFileUploads([]);
      
      try {
        const sessionDetails = await getChatSession(ssid);
        setCurrentChatTitle(sessionDetails.title);
        
        const messageResponse = await getChatSessionMessage(ssid);
        console.log('🔍 Debug: Raw message response from API:', messageResponse);
        console.log('🔍 Debug: Message results:', messageResponse.results);
        
        const formattedMessages = messageResponse.results
          .filter(msg => msg.role === 'user' || msg.role === 'assistant')
          .map(msg => {
           
            return {
              id: msg.id || msg.timestamp?.toString() || uuidv4(),
              content: msg.content,
              role: msg.role as 'user' | 'assistant',
              feedback: msg.feedback
            };
          });
        
        
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
      }
      if (debugMessageTimeoutRef.current) {
        clearTimeout(debugMessageTimeoutRef.current);
      }
    };
  }, [ssid]);

  const uploadFiles = useCallback(async (filesToUpload: File[]) => {
    if (!filesToUpload || filesToUpload.length === 0) return;
    
    // Create session first if it doesn't exist
    let tempSessionId = internalSessionId;
    if (!sessionCreated || !tempSessionId) {
      try {
        setCurrentChatTitle("New Chat"); 
        const session = await createChatSession({ agent_id: agentId });
        tempSessionId = session.session_id;
        setInternalSessionId(tempSessionId);
        setSessionCreated(true);
        isNewConversationRef.current = true; 
        if (onNewSessionCreated && tempSessionId) {
          onNewSessionCreated(tempSessionId);
        }
      } catch (sessionError) {
        console.error('Failed to create chat session:', sessionError);
        setError('Failed to create chat session. Please check your connection and try again.');
        return;
      }
    }

    setIsUploadingFiles(true);
    const initialFileUploadStates: FileUploadStatus[] = filesToUpload.map(file => ({
      file,
      status: 'pending',
    }));
    setFileUploads(initialFileUploadStates);

    try {
      const uploadPromises = filesToUpload.map(async (file, index) => {
        setFileUploads(prev => prev.map((fu, i) => i === index ? { ...fu, status: 'uploading' } : fu));
        try {
          await apiUploadFiles([file], { session_id: tempSessionId!, is_ephemeral: true });
          setFileUploads(prev => prev.map((fu, i) => i === index ? { ...fu, status: 'success' } : fu));
          return { success: true, file };
        } catch (uploadError) {
          console.error(`Failed to upload file ${file.name}:`, uploadError);
          const errorMessage = uploadError instanceof Error ? uploadError.message : 'Unknown upload error';
          setFileUploads(prev => prev.map((fu, i) => i === index ? { ...fu, status: 'error', error: errorMessage } : fu));
          return { success: false, file, error: errorMessage };
        }
      });

      const uploadResults = await Promise.all(uploadPromises);
      const failedUploads = uploadResults.filter(result => !result.success);

      if (failedUploads.length > 0) {
        setError(`Failed to upload ${failedUploads.length} file(s). ${failedUploads.map(f => `${f.file.name}: ${f.error}`).join(', ')}`);
      }
    } catch (e) {
      console.error('Error during file upload orchestration:', e);
      setError('A general error occurred during file uploads.');
    } finally {
      setIsUploadingFiles(false);
    }
  }, [agentId, sessionCreated, internalSessionId, onNewSessionCreated]);

  const handleSubmit = useCallback(async (value?: string, filesToUpload?: File[]) => {
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
        setCurrentChatTitle("New Chat"); 
        const session = await createChatSession({ agent_id: agentId });
        tempSessionId = session.session_id;
        setInternalSessionId(tempSessionId);
        setSessionCreated(true);
        isNewConversationRef.current = true; 
        shouldCallOnNewSessionCreated = true;
        // Don't call onNewSessionCreated here - we'll call it after message processing is complete
      } catch (sessionError) {
        console.error('Failed to create chat session:', sessionError);
        setError('Failed to create chat session. Please check your connection and try again.');
        setIsLoading(false);
        return;
      }
    }

    // Now that we have a session, add the user message to the UI
    const userMessageContent = value ?? "";
    let attachments: { id: string; name: string; contentType: string; url: string }[] | undefined = undefined;
    if (filesToUpload && filesToUpload.length > 0) {
      // Upload files and get their metadata
      const uploadResponse = await apiUploadFiles(filesToUpload, { session_id: tempSessionId!, is_ephemeral: true });
      if (Array.isArray(uploadResponse?.documents) && uploadResponse.documents.length > 0) {
        attachments = uploadResponse.documents.map(doc => ({
          id: doc.uuid,
          name: doc.title,
          contentType: doc.file_type,
          url: doc.file
        }));
      } else {
        setError('File upload failed or returned no files.');
        attachments = [];
      }
    }
    const userMessage: Message = {
      id: uuidv4(),
      content: userMessageContent,
      role: 'user',
      ...(attachments && { experimental_attachments: attachments })
    };
    
    if (isNewConversationRef.current && messages.length === 0) {
      setMessages([userMessage]);
    } else {
      setMessages(prev => [...prev, userMessage]);
    }

    if (isNewConversationRef.current) {
        isNewConversationRef.current = false;
    }
    
    setIsLoading(true); // General loading state for agent response
    setIsAgentResponding(true);
    let toolCalls: ToolCall[] = [];
    let reasoningSteps: ReasoningStep[] = [];

    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) throw new Error("Authentication token is missing");

      const payload = {
        agent_id: agentId,
        message: userMessageContent,
        session_id: tempSessionId,
        reasoning: reasoning, // Add reasoning parameter to payload
      };

      const assistantMessageId = `assistant-${uuidv4()}`;
      // Don't create empty assistant message here - wait for actual content

      const csrfToken = getCSRFToken();
      const response = await fetch(`${BASE_URL}/reggie/api/v1/chat/stream/`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}`,
          ...(csrfToken && { "X-CSRFToken": csrfToken }),
        },
        body: JSON.stringify(payload),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        if (response.status === 401) {
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

        // Process complete lines from the buffer
        const lines = buffer.split('\n');
        // Keep the last line in the buffer if it's incomplete
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;

          if (trimmedLine.startsWith('data: ')) {
            const dataContent = trimmedLine.slice(6); // Remove 'data: ' prefix
            
            if (dataContent === '[DONE]') {
              return; // End of stream
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
               
                // Handle tool call completed
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
                
                // Update reasoning steps if available
                if (parsedData.extra_data?.reasoning_steps) {
                  setCurrentReasoningSteps(parsedData.extra_data.reasoning_steps);
                  reasoningSteps.push(parsedData.extra_data.reasoning_steps);
                }
                
                // Create assistant message only when we start receiving content
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
                  // Update existing assistant message
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
              } else {
                console.log("Received data without recognized event type:", parsedData);
              }
            } catch (e) {
              // Log parsing errors for debugging, but don't clear the buffer
              // as this might be an incomplete JSON object
              console.warn("Failed to parse SSE data:", dataContent, e);
            }
          }
        }
      }
    } catch (streamError) {
      if (streamError instanceof DOMException && streamError.name === 'AbortError') {
        console.log('Request was aborted.');
      } else {
        console.error('Stream error:', streamError);
        setError(streamError instanceof Error ? streamError.message : 'An unknown error occurred during streaming.');
        setMessages(prev => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          // If no assistant message was created yet, or if the last message is a user message, add an error message
          if (lastIndex < 0 || newMessages[lastIndex].role === 'user') {
            newMessages.push({ id: uuidv4(), role: 'assistant', content: 'Sorry, there was an error processing your request.'});
          } else if (newMessages[lastIndex].role === 'assistant' && newMessages[lastIndex].content === '') {
            // If we have an empty assistant message, update it with the error
            newMessages[lastIndex].content = 'Sorry, there was an error processing your request.';
          }
          return newMessages;
        });
      }
      if (debugMessageTimeoutRef.current) clearTimeout(debugMessageTimeoutRef.current);
      setCurrentDebugMessage(null);
    } finally {
      setIsLoading(false); // General loading state for agent response
      setIsAgentResponding(false); // Ensure this is false at the end
      
      // Clear current tool calls and reasoning steps after completion
      setCurrentToolCalls(new Map());
      setCurrentReasoningSteps([]);
      setIsMemoryUpdating(false); // Set memory updating state to false at the end

      toolCalls = [];
      reasoningSteps = [];
      
      // Call onNewSessionCreated after message processing is complete
      // This ensures the URL update happens after the message is fully displayed
      if (onNewSessionCreated && tempSessionId && shouldCallOnNewSessionCreated) {
        onNewSessionCreated(tempSessionId);
      }
      
      if (readerRef.current) {
        try { readerRef.current.releaseLock(); } 
        catch (e) { console.error('Error releasing reader lock:', e); }
        readerRef.current = null;
      }
      if (debugMessageTimeoutRef.current) clearTimeout(debugMessageTimeoutRef.current);
      if (onMessageComplete) {
        onMessageComplete();
      }
    }
  }, [agentId, sessionCreated, internalSessionId, currentDebugMessage, messages, isLoading, isInitializing, currentChatTitle, isAgentResponding, onNewSessionCreated, reasoning, handleTokenExpiration, onTitleUpdate, onMessageComplete]);
  
  return {
    messages,
    handleSubmit,
    uploadFiles,
    isLoading: isLoading || isInitializing || isUploadingFiles, // Combined loading state
    error,
    currentDebugMessage,
    currentChatTitle,
    isAgentResponding,
    fileUploads,
    isUploadingFiles,
    currentToolCalls,
    currentReasoningSteps,
    isMemoryUpdating, // Export this state
  };
}