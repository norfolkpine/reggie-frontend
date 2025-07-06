import { useState, useCallback, useRef, useEffect } from 'react';
import { createChatSession, getChatSessionMessage, getChatSession } from '@/api/chat-sessions';
import { uploadFiles as apiUploadFiles } from '@/api/files'; // Renamed to avoid conflict
import { TOKEN_KEY } from "@/contexts/auth-context";
import { BASE_URL } from '@/lib/api-client';
import { Feedback } from '@/api/chat-sessions';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  feedback?: Feedback[];
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
}

interface UseAgentChatReturn {
  messages: Message[];
  handleSubmit: (value?: string, files?: File[]) => void; // Added files parameter
  isLoading: boolean;
  error: string | null;
  currentDebugMessage: string | null;
  currentChatTitle: string | null;
  isAgentResponding: boolean;
  fileUploads: FileUploadStatus[]; // To track file upload status
  isUploadingFiles: boolean; // True if any file is currently uploading
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
  const [isAgentResponding, setIsAgentResponding] = useState<boolean>(false);
  const [fileUploads, setFileUploads] = useState<FileUploadStatus[]>([]);
  const [isUploadingFiles, setIsUploadingFiles] = useState<boolean>(false);

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
      }
      if (debugMessageTimeoutRef.current) {
        clearTimeout(debugMessageTimeoutRef.current);
      }
    };
  }, [ssid]);

  const handleSubmit = useCallback(async (value?: string, filesToUpload?: File[]) => {
    if ((!value?.trim() && (!filesToUpload || filesToUpload.length === 0)) || (isLoading && !isInitializing)) return;
    
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    
    setError(null);
    setFileUploads([]); // Reset file uploads for this submission
    if (debugMessageTimeoutRef.current) clearTimeout(debugMessageTimeoutRef.current);
    setCurrentDebugMessage(null);

    let tempSessionId = internalSessionId;

    if (!sessionCreated || !tempSessionId) {
      setIsLoading(true); 
      try {
        setCurrentChatTitle("New Chat"); 
        const session = await createChatSession({ agent_id: agentId });
        tempSessionId = session.session_id;
        setInternalSessionId(tempSessionId);
        setSessionCreated(true);
        isNewConversationRef.current = true; 
      } catch (sessionError) {
        console.error('Failed to create chat session:', sessionError);
        setError('Failed to create chat session. Please check your connection and try again.');
        setIsLoading(false);
        return;
      }
    }

    // Handle file uploads first if files are provided
    if (filesToUpload && filesToUpload.length > 0 && tempSessionId) {
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
          setIsUploadingFiles(false);
          setIsLoading(false); // Also set overall loading to false
          return; // Stop if any file upload fails
        }
      } catch (e) {
          // This catch is for errors in the Promise.all orchestration itself, though individual errors are handled above.
          console.error('Error during file upload orchestration:', e);
          setError('A general error occurred during file uploads.');
          setIsUploadingFiles(false);
          setIsLoading(false);
          return;
      } finally {
        setIsUploadingFiles(false);
      }
    }

    // Proceed with sending the message if there's text input or if files were uploaded successfully (even if text is empty)
    if (!value?.trim() && (!filesToUpload || filesToUpload.length === 0)) {
      // This case should ideally be caught by the initial guard, but as a safety net.
      // If no text and no files, and somehow passed the initial guard (e.g. files were present but all failed to upload and error was cleared),
      // we might not want to proceed. However, current logic proceeds if files were successfully uploaded.
      // If only files were "sent" and no text, the backend will receive an empty message.
      // This behavior might need refinement based on product requirements.
    }


    const userMessageContent = value ?? "";
    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: userMessageContent,
      role: 'user'
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

    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) throw new Error("Authentication token is missing");

      const payload = {
        agent_id: agentId,
        message: userMessageContent,
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
              } else if (parsedData.event === "RunResponse") {
                const tokenPart = parsedData.token ?? parsedData.content;
                if (typeof tokenPart === 'string' && tokenPart.length > 0) {
                  if (isAgentResponding) setIsAgentResponding(false);
                  setMessages(prevMessages => {
                    const newMessages = [...prevMessages];
                    const lastMessageIndex = newMessages.length - 1;
                    if (lastMessageIndex >= 0 && newMessages[lastMessageIndex].role === 'assistant') {
                      newMessages[lastMessageIndex] = {
                        ...newMessages[lastMessageIndex],
                        content: newMessages[lastMessageIndex].content + tokenPart,
                        id: parsedData.run_id || newMessages[lastMessageIndex].id, 
                      };
                    }
                    return newMessages;
                  });
                }
              } else if (parsedData.event) {
                console.log("Received unhandled event type:", parsedData.event, parsedData);
              } else {
                console.log("Received data without recognized event type:", parsedData);
              }
            } catch (e) {
              console.error("Failed to parse SSE data:", dataContentForDoneCheck, e);
            }
          }
        }
        if (dataContentForDoneCheck === "[DONE]") break; 
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
          if (lastIndex >= 0 && newMessages[lastIndex].role === 'assistant' && newMessages[lastIndex].content === '') {
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
      setIsLoading(false); // General loading state for agent response
      setIsAgentResponding(false); // Ensure this is false at the end
      if (readerRef.current) {
        try { readerRef.current.releaseLock(); } 
        catch (e) { console.error('Error releasing reader lock:', e); }
        readerRef.current = null;
      }
      if (debugMessageTimeoutRef.current) clearTimeout(debugMessageTimeoutRef.current);
    }
  }, [agentId, sessionCreated, internalSessionId, currentDebugMessage, messages, isLoading, isInitializing, currentChatTitle, isAgentResponding]);
  
  return {
    messages,
    handleSubmit,
    isLoading: isLoading || isInitializing || isUploadingFiles, // Combined loading state
    error,
    currentDebugMessage,
    currentChatTitle,
    isAgentResponding,
    fileUploads,
    isUploadingFiles,
  };
}