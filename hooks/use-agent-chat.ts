import { useState, useCallback, useRef, useEffect } from 'react';
import { createChatSession } from '@/api/chat-sessions';
import { uploadFiles as apiUploadFiles } from '@/api/files';
import { BASE_URL } from '@/lib/api-client';
import { Feedback } from '@/api/chat-sessions';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from "@/contexts/auth-context";
import { ToolCall } from '@/components/ui/chat-message';
import { captureChatError } from '@/lib/error-handler';
import { ReferencesData } from '@/types/message';
import { useChatStream } from '@/contexts/chat-stream-context';

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
  onTitleUpdate?: (title: string | null) => void;
  onMessageComplete?: () => void;
  reasoning?: boolean;
}

interface UseAgentChatReturn {
  messages: Message[];
  handleSubmit: (value?: string, files?: File[]) => void;
  uploadFiles: (files: File[]) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  currentDebugMessage: string | null;
  currentChatTitle: string | null;
  isAgentResponding: boolean;
  fileUploads: FileUploadStatus[];
  isUploadingFiles: boolean;
  currentToolCalls: Map<string, ToolCall>;
  currentReasoningSteps: ReasoningStep[];
  isMemoryUpdating: boolean;
}

export function useAgentChat({ agentId, sessionId: ssid = null, onNewSessionCreated, onTitleUpdate, onMessageComplete, reasoning = false }: UseAgentChatProps): UseAgentChatReturn {
  const chatStream = useChatStream();
  const [internalSessionId, setInternalSessionId] = useState<string | null>(ssid);
  const [isInitializing, setIsInitializing] = useState(!!ssid);
  const [fileUploads, setFileUploads] = useState<FileUploadStatus[]>([]);
  const [isUploadingFiles, setIsUploadingFiles] = useState<boolean>(false);
  const isNewConversationRef = useRef<boolean>(true);
  const lastLoadedSessionRef = useRef<string | null>(null);

  const updateVersion = chatStream.updateVersion;
  const messages = chatStream.getMessages(internalSessionId);
  const currentChatTitle = chatStream.getTitle(internalSessionId);
  const isAgentResponding = chatStream.getIsAgentResponding(internalSessionId);
  const currentToolCalls = chatStream.getCurrentToolCalls(internalSessionId);
  const currentReasoningSteps = chatStream.getCurrentReasoningSteps(internalSessionId);
  const isMemoryUpdating = chatStream.getIsMemoryUpdating(internalSessionId);
  const currentDebugMessage = chatStream.getDebugMessage(internalSessionId);
  const error = chatStream.getError(internalSessionId);
  const isStreaming = chatStream.getIsStreaming(internalSessionId);
  const isLoading = isInitializing || isStreaming || isUploadingFiles;

  useEffect(() => {
    if (BASE_URL === "undefined") {
      console.error("API Base URL is not defined. Check your environment variables.");
    }
  }, []);

  useEffect(() => {
    if (lastLoadedSessionRef.current === ssid && internalSessionId === ssid) {
      return;
    }

    const loadSession = async () => {
      if (!ssid) {
        setIsInitializing(false);
        isNewConversationRef.current = true;
        setInternalSessionId(null);
        setFileUploads([]);
        lastLoadedSessionRef.current = null;
        return;
      }
      
      setInternalSessionId(ssid);
      isNewConversationRef.current = false;
      setFileUploads([]);
      
      const existingMessages = chatStream.getMessages(ssid);
      const hasExistingMessages = existingMessages && existingMessages.length > 0;
      
      if (hasExistingMessages) {
        lastLoadedSessionRef.current = ssid;
        setIsInitializing(false);
        return;
      }
      
      setIsInitializing(true);
      lastLoadedSessionRef.current = ssid;
      
      await chatStream.loadSession(ssid, agentId);
      
      setIsInitializing(false);
    };

    loadSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ssid, agentId, internalSessionId]);

  const uploadFiles = useCallback(async (filesToUpload: File[]) => {
    if (!filesToUpload || filesToUpload.length === 0) return;
    
    let tempSessionId = internalSessionId;
    if (!tempSessionId) {
      try {
        const session = await createChatSession({ agent_id: agentId });
        tempSessionId = session.session_id;
        setInternalSessionId(tempSessionId);
        chatStream.switchSession(tempSessionId, agentId);
        isNewConversationRef.current = true; 
        if (onNewSessionCreated && tempSessionId) {
          onNewSessionCreated(tempSessionId);
        }
      } catch (sessionError) {
        console.error('Failed to create chat session:', sessionError);
        captureChatError(sessionError, { 
          action: 'createChatSession',
          agentId: agentId,
          apiResponse: sessionError,
          component: 'chat'
        });
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
          captureChatError(uploadError, { 
            action: 'uploadFile',
            agentId: agentId,
            fileName: file.name, 
            sessionId: tempSessionId,
            apiResponse: uploadError,
            component: 'chat'
          });
          const errorMessage = uploadError instanceof Error ? uploadError.message : 'Unknown upload error';
          setFileUploads(prev => prev.map((fu, i) => i === index ? { ...fu, status: 'error', error: errorMessage } : fu));
          return { success: false, file, error: errorMessage };
        }
      });

      const uploadResults = await Promise.all(uploadPromises);
      const failedUploads = uploadResults.filter(result => !result.success);

      if (failedUploads.length > 0) {
        console.error(`Failed to upload ${failedUploads.length} file(s)`);
      }
    } catch (e) {
      console.error('Error during file upload orchestration:', e);
      captureChatError(e, { 
        action: 'fileUploadOrchestration',
        agentId: agentId,
        sessionId: tempSessionId,
        apiResponse: e,
        component: 'chat'
      });
    } finally {
      setIsUploadingFiles(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentId, internalSessionId, onNewSessionCreated]);

  const handleSubmit = useCallback(async (value?: string, filesToUpload?: File[]) => {
    if (!value?.trim() || (isLoading && !isInitializing)) return;
    
    const userMessageContent = value ?? "";
    
    const newSessionId = await chatStream.startStream(
      agentId,
      internalSessionId,
      userMessageContent,
      filesToUpload,
      reasoning,
      {
        onNewSessionCreated: (sessionId) => {
          setInternalSessionId(sessionId);
          if (onNewSessionCreated) {
            onNewSessionCreated(sessionId);
          }
        },
        onTitleUpdate: (title) => {
                if (onTitleUpdate) {
            onTitleUpdate(title);
          }
        },
        onMessageComplete: () => {
          if (onMessageComplete) {
            onMessageComplete();
          }
        }
      }
    );

    if (newSessionId && newSessionId !== internalSessionId) {
      setInternalSessionId(newSessionId);
      isNewConversationRef.current = false;
    } else if (newSessionId) {
      isNewConversationRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentId, internalSessionId, isLoading, isInitializing, reasoning, onNewSessionCreated, onTitleUpdate, onMessageComplete]);
  
  return {
    messages,
    handleSubmit,
    uploadFiles,
    isLoading,
    error,
    currentDebugMessage,
    currentChatTitle,
    isAgentResponding,
    fileUploads,
    isUploadingFiles,
    currentToolCalls,
    currentReasoningSteps,
    isMemoryUpdating,
  };
}