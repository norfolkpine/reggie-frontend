"use client";

import { useState, useCallback, useEffect, useRef, useMemo, memo } from "react";
import {
  ChatContainer,
  ChatForm,
  ChatMessages,
} from "@/components/ui/chat";
import { PromptSuggestions } from "@/components/ui/prompt-suggestions";
import { MessageInput } from "@/components/ui/message-input";
import { MessageList } from "@/components/ui/message-list";
import { useAgentChat } from "@/hooks/use-agent-chat";
import { Paperclip } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { MarkdownComponents } from "./markdown-component";
import MessageActions from "./message-actions";
import { sendUserFeedback } from "../api/user-feedback";
import { UserFeedbackType } from "@/api/chat-sessions";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Brain, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";

interface CustomChatProps {
  agentId: string;
  sessionId?: string;
  onTitleUpdate?: (title: string | null) => void;
  onNewSessionCreated?: (newSessionId: string) => void;
  onMessageComplete?: () => void;
}

export function CustomChat({ agentId, sessionId, onTitleUpdate, onNewSessionCreated, onMessageComplete }: CustomChatProps) {
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [messageFeedback, setMessageFeedback] = useState<Record<string, { isGood?: boolean; isBad?: boolean }>>({});
  const [completedMessages, setCompletedMessages] = useState<Set<string>>(new Set());
  const [reasoningEnabled, setReasoningEnabled] = useState(false);
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLElement | null>(null);

  // Responsive input container style
  const inputContainerStyle = useMemo(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      return { height: 'auto' };
    }
    return { height: 'auto', minHeight: '200px' };
  }, []);

  const {
    messages,
    handleSubmit,
    uploadFiles, // Destructure the new uploadFiles function
    isLoading,
    error,
    currentDebugMessage,
    currentChatTitle: _currentChatTitle,
    isAgentResponding,
    fileUploads, // Destructure new state
    isUploadingFiles, // Destructure new state
    currentToolCalls, // Add this from useAgentChat
    currentReasoningSteps, // Add this from useAgentChat
    isMemoryUpdating, // Add memory updating state
  } = useAgentChat({
    agentId,
    sessionId,
    onNewSessionCreated,
    onTitleUpdate,
    reasoning: reasoningEnabled, // Pass reasoning state to hook
    onMessageComplete, // Pass onMessageComplete to hook
  });
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    // Only set drag over to false if we're leaving the main container
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  const uploadLimit = useMemo(() => {
    return process.env.NEXT_PUBLIC_CHAT_UPLOAD_LIMIT ? parseFloat(process.env.NEXT_PUBLIC_CHAT_UPLOAD_LIMIT) : 15;
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length === 0) return;

    // Create a Set of existing file identifiers for efficient lookup
    const existingFilesSet = new Set(files.map(f => `${f.name}-${f.size}`));

    // Filter out duplicate files efficiently
    const newFiles = droppedFiles.filter(df => {
      const fileKey = `${df.name}-${df.size}`;
      return !existingFilesSet.has(fileKey);
    });

    if (newFiles.length === 0) return;

    // Check file size limit
    const oversizedFile = newFiles.find(f => f.size / 1024 / 1024 > uploadLimit);
    if (oversizedFile) {
      toast({
        title: "Upload Error",
        description: `File "${oversizedFile.name}" is too large. Please upload files smaller than ${uploadLimit}MB!`,
        variant: "destructive"
      });
      return;
    }

    setFiles(prev => [...prev, ...newFiles]);
    uploadFiles(newFiles);
  }, [files, uploadFiles, uploadLimit, toast]);

  const onSubmit = () => {
    // Ensure that input is present before submitting
    if (!input.trim()) return;
    
    handleSubmit(input, files); // Pass files to handleSubmit
    
    setInput(""); // Clear input after sending
    setFiles([]); // Clear files after sending
  };

  const copyToClipboard = useCallback(async (text: string): Promise<boolean> => {
    // Try the modern clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        console.warn('Clipboard API failed, trying fallback method:', err);
      }
    }

    // Fallback method using a temporary textarea
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.cssText = 'position: fixed; left: -999999px; top: -999999px; opacity: 0;';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);

      return successful;
    } catch (err) {
      console.error('Fallback copy method failed:', err);
      return false;
    }
  }, []);

  const handleCopy = useCallback(async (text: string, messageId: string) => {
    try {
      const success = await copyToClipboard(text);

      if (success) {
        setCopiedMessageId(messageId);
        toast({
          title: "Copied to clipboard!",
          duration: 2000,
        });

        // Reset copied state after delay
        setTimeout(() => setCopiedMessageId(null), 2000);
      } else {
        throw new Error('Copy failed');
      }
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast({
        title: "Failed to copy to clipboard",
        description: "Please try selecting and copying the text manually",
        variant: "destructive",
        duration: 3000,
      });
    }
  }, [copyToClipboard, toast]);

  const handleSend = (destination: 'google-drive' | 'journal', text: string, messageId: string) => {
    // TODO: Implement sending to Google Drive or Journal
    console.log(`Sending to ${destination}:`, text, messageId);
  };

  const handleOpenCanvas = (messageId: string) => {
    // TODO: Implement canvas opening functionality
    console.log('Opening canvas for message:', messageId);
  };

  const submitFeedback = useCallback(async (
    messageId: string,
    feedbackType: 'good' | 'bad',
    feedback?: { type: string; text: string }
  ) => {
    setMessageFeedback(prev => ({
      ...prev,
      [messageId]: { isGood: feedbackType === 'good', isBad: feedbackType === 'bad' }
    }));

    try {
      await sendUserFeedback({
        chat_id: messageId,
        feedback_type: feedbackType as UserFeedbackType,
        feedback_text: feedback ? `${feedback.type}: ${feedback.text}` : undefined,
        session: sessionId
      });

      toast({
        title: "Feedback submitted",
        description: feedback
          ? "Thank you for your detailed feedback!"
          : "Thank you for your feedback!",
      });
    } catch (error) {
      console.error('Failed to send feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    }
  }, [sessionId, toast]);

  const handleGoodResponse = useCallback((messageId: string, feedback?: { type: string; text: string }) => {
    submitFeedback(messageId, 'good', feedback);
  }, [submitFeedback]);

  const handleBadResponse = useCallback((messageId: string, feedback?: { type: string; text: string }) => {
    submitFeedback(messageId, 'bad', feedback);
  }, [submitFeedback]);

  const isEmpty = messages.length === 0;
  const lastMessage = messages.at(-1);
  
  // Only show typing indicator when the agent is responding AND
  // there's no content yet (empty assistant message) or no assistant message at all
  const hasAssistantMessageWithContent = lastMessage?.role === 'assistant' && lastMessage.content.trim().length > 0;
  const isTyping = isAgentResponding && !hasAssistantMessageWithContent;

  // Optimized scroll function with debouncing
  const scrollToBottom = useCallback(() => {
    const scrollToBottomImmediate = () => {
      if (chatMessagesRef.current) {
        chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
        return;
      }

      // Fallback to finding scroll container
      if (!scrollContainerRef.current) {
        scrollContainerRef.current = document.querySelector('[class*="overflow-y-auto"]') as HTMLElement;
      }

      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      }
    };

    // Use requestAnimationFrame for smoother scrolling
    requestAnimationFrame(scrollToBottomImmediate);
  }, []);

  // Combined scroll effect with optimized dependencies
  useEffect(() => {
    const shouldScroll =
      isAgentResponding ||
      messages.length > 0 ||
      currentToolCalls.size > 0 ||
      (currentReasoningSteps && currentReasoningSteps.length > 0);

    if (shouldScroll) {
      const timer = setTimeout(scrollToBottom, 50);
      return () => clearTimeout(timer);
    }
  }, [messages, isAgentResponding, currentToolCalls, currentReasoningSteps, scrollToBottom]);

  // Mark the last assistant message as completed when agent stops responding
  useEffect(() => {
    if (!isAgentResponding && lastMessage?.role === 'assistant' && lastMessage.content.trim().length > 0) {
      setCompletedMessages(prev => new Set([...prev, lastMessage.id]));
    }
  }, [isAgentResponding, lastMessage]);

  // Memoize filtered messages to prevent recalculation
  const filteredMessages = useMemo(() =>
    messages.filter(m => m.role === 'user' || m.role === 'assistant'),
    [messages]
  );

  // Memoize message options function
  const getMessageOptions = useCallback((message: any) => {
    if (message.role === 'assistant' && completedMessages.has(message.id)) {
      const feedback = messageFeedback[message.id] || {};
      return {
        actions: (
          <MessageActions
            messageId={message.id}
            content={message.content}
            onCopy={handleCopy}
            copiedMessageId={copiedMessageId}
            onSend={handleSend}
            onOpenCanvas={handleOpenCanvas}
            isGood={feedback.isGood}
            isBad={feedback.isBad}
            onGoodResponse={handleGoodResponse}
            onBadResponse={handleBadResponse}
          />
        )
      };
    }
    return {};
  }, [completedMessages, messageFeedback, handleCopy, copiedMessageId, handleSend, handleOpenCanvas, handleGoodResponse, handleBadResponse]);

  // Memoize drag overlay
  const dragOverlay = useMemo(() => {
    if (!isDragOver) return null;

    return (
      <div className="absolute inset-0 bg-blue-500/10 backdrop-blur-sm border-2 border-dashed border-blue-400 z-50 flex items-center justify-center transition-all duration-200">
        <div className="bg-white/95 rounded-xl p-6 shadow-xl border border-blue-200 transform scale-100 transition-transform">
          <div className="text-center">
            <Paperclip className="w-12 h-12 mx-auto mb-3 text-blue-500 animate-bounce" />
            <p className="text-lg font-semibold text-gray-900">Drop files here</p>
            <p className="text-sm text-gray-600 mt-1">Release to upload</p>
          </div>
        </div>
      </div>
    );
  }, [isDragOver]);

  // Memoize status indicators
  const statusIndicators = useMemo(() => {
    const indicators = [];

    if (isMemoryUpdating) {
      indicators.push(
        <div key="memory" className="py-2 px-3 sm:py-[2px] text-xs sm:text-sm text-blue-700 bg-blue-50 leading-tight border-b border-blue-100">
          <div className="max-w-3xl mx-auto w-full inline-flex items-center gap-2">
            <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            <span className="truncate">Agent is updating its memory...</span>
          </div>
        </div>
      );
    }

    if (error) {
      indicators.push(
        <div key="error" className="py-2 px-3 sm:py-[2px] text-sm text-red-600 bg-red-50 leading-tight border-b border-red-100">
          <div className="max-w-3xl mx-auto w-full">
            <span className="truncate">{error}</span>
          </div>
        </div>
      );
    }

    if (currentDebugMessage) {
      indicators.push(
        <div key="debug" className="py-2 px-3 sm:py-[2px] text-xs text-gray-600 bg-yellow-50 leading-tight border-b border-yellow-100">
          <div className="max-w-3xl mx-auto w-full inline-flex items-center gap-1">
            <span className="font-medium flex-shrink-0">Debug:</span>
            <span className="truncate">{currentDebugMessage}</span>
          </div>
        </div>
      );
    }

    return indicators;
  }, [isMemoryUpdating, error, currentDebugMessage]);

  return (
    <div className="flex flex-col h-full max-w-full overflow-hidden bg-gradient-to-b from-background to-background/95">
      <div
        className="flex-1 flex flex-col relative min-h-0 overflow-hidden"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {dragOverlay}

        <div id="chat-messages-container" className="flex-1 flex flex-col overflow-hidden" >
          {isEmpty && (
            <div className="flex-1 flex items-center justify-center p-3 sm:p-4 md:p-6">
              <div className="w-full max-w-2xl lg:max-w-3xl xl:max-w-4xl">
                <PromptSuggestions
                  label="Try these prompts ✨"
                  append={(message) => {
                    setInput(message.content);
                    handleSubmit(message.content);
                    setInput("");
                  }}
                  suggestions={[
                    "What are the requirements for a wholesale investor?",
                    "What is AML/KYC?",
                    "List all agents and capabilities"
                  ]}
                />
              </div>
            </div>
          )}

          {!isEmpty && (
            <div
              ref={chatMessagesRef}
              className="flex-1 overflow-y-auto scroll-smooth"
              style={{ scrollbarWidth: 'thin' }}
            >
              <div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto w-full py-2 sm:py-3 px-3 sm:px-4 lg:px-6">
                <MessageList
                  messages={filteredMessages}
                  isTyping={isTyping}
                  currentToolCalls={currentToolCalls}
                  currentReasoningSteps={currentReasoningSteps}
                  isAgentResponding={isAgentResponding}
                  messageOptions={getMessageOptions}
                />
              </div>
            </div>
          )}
        </div>

        {statusIndicators}

        <div id="chat-input-container" className="border-t bg-background/95 backdrop-blur-sm flex-shrink-0" style={inputContainerStyle}>
          <div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto w-full px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
            {/* Reasoning Toggle */}
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <Button
                type="button"
                variant={reasoningEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => setReasoningEnabled(!reasoningEnabled)}
                className="flex items-center gap-2 text-xs sm:text-sm h-8 sm:h-9 px-3"
                disabled={isLoading || isTyping}
              >
                {reasoningEnabled ? <Brain className="h-3 w-3 sm:h-4 sm:w-4" /> : <Lightbulb className="h-3 w-3 sm:h-4 sm:w-4" />}
                <span className="hidden xs:inline">{reasoningEnabled ? "Reasoning Enabled" : "Enable Reasoning"}</span>
                <span className="xs:hidden">{reasoningEnabled ? "Reasoning" : "Think"}</span>
              </Button>

              {reasoningEnabled && (
                <span className="text-xs text-muted-foreground hidden sm:inline truncate">
                  Agent will show its thinking process and tool usage
                </span>
              )}

              {isAgentResponding && reasoningEnabled && (
                <div className="flex items-center gap-2 text-xs text-blue-600 ml-auto">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="hidden sm:inline">Showing reasoning...</span>
                  <span className="sm:hidden">Reasoning...</span>
                </div>
              )}
            </div>

            <ChatForm
              isPending={isLoading || isTyping}
              handleSubmit={(event) => {
                event?.preventDefault?.();
                onSubmit();
              }}
            >
              {({ setFiles: setFormFiles }) => (
                <MessageInput
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  allowAttachments
                  files={files}
                  setFiles={(newFiles) => {
                    if (Array.isArray(newFiles)) {
                      const currentFiles = files || [];
                      const addedFiles = newFiles.filter(newFile =>
                        !currentFiles.some(existingFile =>
                          existingFile.name === newFile.name &&
                          existingFile.size === newFile.size
                        )
                      );
                      setFiles([...newFiles]);
                      // Trigger immediate upload of newly added files
                      if (addedFiles.length > 0) {
                        uploadFiles(addedFiles);
                      }
                    } else {
                      setFiles([]);
                    }
                    setFormFiles?.(newFiles);
                  }}
                  stop={() => {
                    // Add logic to stop/abort uploads if needed, via useAgentChat's abortController
                  }}
                  isGenerating={isLoading}
                  fileUploads={fileUploads}
                  isUploadingFiles={isUploadingFiles}
                />
              )}
            </ChatForm>
          </div>
        </div>
      </div>
    </div>
  );
}
