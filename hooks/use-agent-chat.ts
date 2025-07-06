import { useState, useCallback, useRef, useEffect } from 'react';
import { createChatSession, getChatSessionMessage, getChatSession } from '@/api/chat-sessions';
import { uploadFiles as apiUploadFiles } from '@/api/files'; // Renamed to avoid conflict
import { TOKEN_KEY } from "@/contexts/auth-context";
import { BASE_URL } from '@/lib/api-client';
import { Feedback } from '@/api/chat-sessions';
import type {
  MessagePart,
  ToolInvocation as UIToolInvocation, // Renamed to avoid naming conflict
  ReasoningPart as UIReasoningPart, // Renamed
} from '@/components/ui/chat-message'; // Assuming types are exported from here

// Enhanced Message interface
interface Message {
  id: string;
  content: string; // May become primarily for user messages or simple assistant text
  role: 'user' | 'assistant' | 'system';
  feedback?: Feedback[];
  parts?: MessagePart[]; // For structured assistant messages
  toolInvocations?: UIToolInvocation[]; // For top-level tool calls if not in parts
}

export interface FileUploadStatus {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  progress?: number;
}

interface UseAgentChatProps {
  agentId: string;
  sessionId?: string | null;
}

// API response types (simplified based on provided JSON)
interface ToolCallAPI {
  tool_call_id: string;
  tool_name: string;
  args: any;
  result?: any; // Result might come later or in a different event
  duration?: number;
  confidence?: number;
}

interface ReasoningStepAPI {
  title: string;
  action: string;
  confidence: number;
  reasoning: string; // This is the explanation
}

interface FinalAnswerAPI {
  summary: string;
}

interface DebugInfoAPI {
  build_time?: string;
  [key: string]: any; // Other debug fields
}


interface UseAgentChatReturn {
  messages: Message[];
  handleSubmit: (value?: string, files?: File[]) => void;
  isLoading: boolean;
  error: string | null;
  currentDebugMessage: string | null;
  currentChatTitle: string | null;
  isAgentResponding: boolean;
  fileUploads: FileUploadStatus[];
  isUploadingFiles: boolean;
  finalAnswer: FinalAnswerAPI | null;
  buildTime: string | null;
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
  const [finalAnswer, setFinalAnswer] = useState<FinalAnswerAPI | null>(null);
  const [buildTime, setBuildTime] = useState<string | null>(null);

  // Ref to hold accumulating tool calls and reasoning steps for the current assistant message
  const currentToolCallsRef = useRef<ToolCallAPI[]>([]);
  const currentReasoningStepsRef = useRef<ReasoningStepAPI[]>([]);

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
        setFinalAnswer(null);
        setBuildTime(null);
        return;
      }
      
      isNewConversationRef.current = false;
      setIsLoading(true);
      setIsInitializing(true);
      setError(null);
      setFileUploads([]);
      setFinalAnswer(null);
      setBuildTime(null);
      
      try {
        const sessionDetails = await getChatSession(ssid);
        setCurrentChatTitle(sessionDetails.title);
        
        const messageResponse = await getChatSessionMessage(ssid);
        // TODO: Adapt message loading if old messages also have structured parts.
        // For now, assuming old messages are simple content.
        const formattedMessages = messageResponse.results.map(msg => ({
          id: msg.id || msg.timestamp?.toString() || crypto.randomUUID(),
          content: msg.content,
          role: msg.role as 'user' | 'assistant',
          feedback: msg.feedback,
          parts: [], // Initialize parts for older messages if needed
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
    setFileUploads([]);
    if (debugMessageTimeoutRef.current) clearTimeout(debugMessageTimeoutRef.current);
    setCurrentDebugMessage(null);
    setFinalAnswer(null); // Reset final answer for new submission
    // buildTime is usually part of the initial debug info, so might not need reset here

    // Reset accumulators for the new response
    currentToolCallsRef.current = [];
    currentReasoningStepsRef.current = [];

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

    if (filesToUpload && filesToUpload.length > 0 && tempSessionId) {
      setIsUploadingFiles(true);
      const initialFileUploadStates: FileUploadStatus[] = filesToUpload.map(file => ({
        file, status: 'pending',
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
          setIsLoading(false);
          return;
        }
      } catch (e) {
        console.error('Error during file upload orchestration:', e);
        setError('A general error occurred during file uploads.');
        setIsUploadingFiles(false);
        setIsLoading(false);
        return;
      } finally {
        setIsUploadingFiles(false);
      }
    }

    const userMessageContent = value ?? "";
    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: userMessageContent,
      role: 'user',
      parts: [],
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

    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) throw new Error("Authentication token is missing");

      const payload = {
        agent_id: agentId,
        message: userMessageContent,
        session_id: tempSessionId,
      };

      const assistantMessageId = `assistant-${crypto.randomUUID()}`;
      // Initialize assistant message with empty parts array
      setMessages(prev => [...prev, { id: assistantMessageId, content: '', role: 'assistant', parts: [] }]);

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
      let dataBuffer = '';

      while (true) {
        if (abortControllerRef.current?.signal.aborted) break;
        const { value: chunkValue, done } = await reader.read();
        if (done) break;

        dataBuffer += decoder.decode(chunkValue, { stream: true });
        const lines = dataBuffer.split("\n");
        dataBuffer = lines.pop() || ''; // Keep incomplete line for next chunk

        for (const line of lines) {
          if (line.startsWith("data:")) {
            constjsonData = line.slice(5).trim();
            if (jsonData === "[DONE]") {
              // Process any remaining tool calls or reasoning steps before finishing
              setMessages(prevMessages => {
                const newMessages = [...prevMessages];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage && lastMessage.role === 'assistant') {
                  const updatedParts: MessagePart[] = [];
                  currentReasoningStepsRef.current.forEach(step => {
                    updatedParts.push({
                      type: 'reasoning',
                      reasoning: `Title: ${step.title}\nAction: ${step.action}\nConfidence: ${step.confidence}\n\n${step.reasoning}`,
                    } as UIReasoningPart); // Cast to UIReasoningPart
                  });
                  currentToolCallsRef.current.forEach(tc => {
                    updatedParts.push({
                      type: 'tool-invocation',
                      toolInvocation: {
                        toolName: tc.tool_name,
                        state: tc.result ? 'result' : 'call', // Assume 'call' if no result yet, 'result' if result is present
                        args: tc.args,
                        result: tc.result,
                        // toolCallId: tc.tool_call_id, // Add if your UI type supports it
                        // duration: tc.duration, // Add if your UI type supports it
                        // confidence: tc.confidence, // Add if your UI type supports it
                      },
                    } as any); // Cast to any for now, refine ToolInvocationPart in chat-message.tsx
                  });
                  lastMessage.parts = [...(lastMessage.parts || []), ...updatedParts];
                  // Clear refs after processing
                  currentReasoningStepsRef.current = [];
                  currentToolCallsRef.current = [];
                }
                return newMessages;
              });
              gotoStreamDone; // Exit outer loop
            }

            try {
              const parsedData = JSON.parse(jsonData);

              if (parsedData.debug) {
                const debugInfo = parsedData.debug as DebugInfoAPI;
                setCurrentDebugMessage(JSON.stringify(debugInfo, null, 2));
                if (debugInfo.build_time) {
                  setBuildTime(debugInfo.build_time);
                }
                if (debugMessageTimeoutRef.current) clearTimeout(debugMessageTimeoutRef.current);
                debugMessageTimeoutRef.current = setTimeout(() => setCurrentDebugMessage(null), 5000);
                // Do not continue, debug info might accompany other events
              }
              
              // Clear general debug message if a content event comes through
              // if (currentDebugMessage && (parsedData.event === "RunResponseContent" || parsedData.event === "ToolCallCompleted" || parsedData.event === "ReasoningStep")) {
              //    if (debugMessageTimeoutRef.current) clearTimeout(debugMessageTimeoutRef.current);
              //    setCurrentDebugMessage(null);
              // }

              if (parsedData.event === "ChatTitle" && typeof parsedData.title === 'string') {
                setCurrentChatTitle(parsedData.title);
              } else if (parsedData.event === "RunResponseContent") { // Text content
                const tokenPart = parsedData.content ?? '';
                if (isAgentResponding) setIsAgentResponding(false); // Potentially set to false only on [DONE] or error
                setMessages(prevMessages => {
                  const newMessages = [...prevMessages];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage && lastMessage.role === 'assistant') {
                    // Append to existing text part or create new one
                    let textPartFound = false;
                    if (!lastMessage.parts) lastMessage.parts = [];
                    lastMessage.parts = lastMessage.parts.map(part => {
                      if (part.type === 'text') {
                        part.text += tokenPart;
                        textPartFound = true;
                      }
                      return part;
                    });
                    if (!textPartFound) {
                      lastMessage.parts.push({ type: 'text', text: tokenPart });
                    }
                    // Also update content for simple display or if parts are not fully rendered
                    lastMessage.content += tokenPart;
                  }
                  return newMessages;
                });
              } else if (parsedData.event === "ToolCallCompleted" || parsedData.tool_call_id) { // Assuming tool calls come as distinct objects
                const toolCall = parsedData as ToolCallAPI; // Or parsedData.tool_call
                currentToolCallsRef.current.push(toolCall);
                // Defer updating message parts until [DONE] or specific intervals to batch updates
              } else if (parsedData.event === "ReasoningStep" || parsedData.reasoning_steps) { // Assuming reasoning steps might come individually or as a list
                const newSteps = Array.isArray(parsedData.reasoning_steps) ? parsedData.reasoning_steps : [parsedData as ReasoningStepAPI];
                currentReasoningStepsRef.current.push(...newSteps);
                 // Defer updating message parts
              } else if (parsedData.event === "FinalAnswer" || parsedData.final_answer) {
                setFinalAnswer(parsedData.final_answer as FinalAnswerAPI || parsedData as FinalAnswerAPI);
              }
              // other event types like ToolCallStarted can be handled here
            } catch (e) {
              console.error("Failed to parse SSE data line:", jsonData, e);
            }
          }
        }
      }
      // Append any remaining characters in dataBuffer if needed, or handle if stream ends mid-JSON object
      dataBuffer += decoder.decode(undefined, { stream: false }); // Process final part of stream
      if (dataBuffer.startsWith("data:")) {
          const jsonData = dataBuffer.slice(5).trim();
          if (jsonData === "[DONE]") {
             // Final processing if needed
          } else if (jsonData) {
            try {
              // Try to parse the last bit of data if it wasn't [DONE]
              const parsedData = JSON.parse(jsonData);
              // Handle this parsedData similarly to above (e.g. if it's a final_answer or debug info)
               if (parsedData.final_answer) {
                setFinalAnswer(parsedData.final_answer as FinalAnswerAPI);
              }
              if (parsedData.debug && parsedData.debug.build_time) {
                setBuildTime(parsedData.debug.build_time);
              }
            } catch(e) {
              console.error("Error parsing final buffered data:", jsonData, e);
            }
          }
      }


      streamDone:; // Label for goto

    } catch (streamError) {
      if (streamError instanceof DOMException && streamError.name === 'AbortError') {
        console.log('Request was aborted.');
      } else {
        console.error('Stream error:', streamError);
        setError(streamError instanceof Error ? streamError.message : 'An unknown error occurred during streaming.');
        setMessages(prev => { // Ensure error message is displayed
          const newMessages = [...prev];
          const lastMsg = newMessages[newMessages.length - 1];
          if (lastMsg && lastMsg.role === 'assistant' && lastMsg.content === '' && (!lastMsg.parts || lastMsg.parts.length === 0)) {
            lastMsg.content = 'Sorry, there was an error processing your request.';
            if(!lastMsg.parts) lastMsg.parts = [];
            lastMsg.parts.push({ type: 'text', text: 'Sorry, there was an error processing your request.' });
          } else if (!lastMsg || lastMsg.role === 'user') {
            newMessages.push({ id: crypto.randomUUID(), role: 'assistant', content: 'Sorry, there was an error processing your request.', parts: [{ type: 'text', text: 'Sorry, there was an error processing your request.' }]});
          }
          return newMessages;
        });
      }
      if (debugMessageTimeoutRef.current) clearTimeout(debugMessageTimeoutRef.current);
      setCurrentDebugMessage(null);
    } finally {
      setIsLoading(false);
      setIsAgentResponding(false);
      if (readerRef.current) {
        try { readerRef.current.releaseLock(); } 
        catch (e) { console.error('Error releasing reader lock:', e); }
        readerRef.current = null;
      }
      if (debugMessageTimeoutRef.current) clearTimeout(debugMessageTimeoutRef.current);

      // Final flush of any collected parts to the message after stream ends (either success or error)
      setMessages(prevMessages => {
        const newMessages = [...prevMessages];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage && lastMessage.role === 'assistant') {
          const updatedParts: MessagePart[] = [];
          if (currentReasoningStepsRef.current.length > 0) {
            currentReasoningStepsRef.current.forEach(step => {
              updatedParts.push({
                type: 'reasoning',
                reasoning: `Title: ${step.title}\nAction: ${step.action}\nConfidence: ${step.confidence}\n\n${step.reasoning}`,
              } as UIReasoningPart);
            });
          }
          if (currentToolCallsRef.current.length > 0) {
            currentToolCallsRef.current.forEach(tc => {
              updatedParts.push({
                type: 'tool-invocation',
                toolInvocation: {
                  toolName: tc.tool_name,
                  state: tc.result ? 'result' : 'call',
                  args: tc.args,
                  result: tc.result,
                  // toolCallId: tc.tool_call_id,
                  // duration: tc.duration,
                  // confidence: tc.confidence,
                },
              } as any); // Adjust type as needed
            });
          }
          if (updatedParts.length > 0) {
            if (!lastMessage.parts) lastMessage.parts = [];
            // Avoid duplicating parts if they were already added by [DONE] block
            // This simple concatenation might lead to duplicates if [DONE] also processed them.
            // A more robust solution would be to ensure parts are only added once.
            // For now, assuming [DONE] handles the final flush primarily.
            const existingPartIdentifiers = new Set(lastMessage.parts.map(p => JSON.stringify(p)));
            updatedParts.forEach(up => {
              if (!existingPartIdentifiers.has(JSON.stringify(up))) {
                lastMessage.parts!.push(up);
              }
            });
          }
        }
        // Clear refs after final processing
        currentReasoningStepsRef.current = [];
        currentToolCallsRef.current = [];
        return newMessages;
      });
    }
  }, [agentId, sessionCreated, internalSessionId, messages, isLoading, isInitializing]); // Ensure all dependencies are listed
  
  return {
    messages,
    handleSubmit,
    isLoading: isLoading || isInitializing || isUploadingFiles,
    error,
    currentDebugMessage,
    currentChatTitle,
    isAgentResponding,
    fileUploads,
    isUploadingFiles,
    finalAnswer,
    buildTime,
  };
}