"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      // Filter out files that might already be in the list by name and size (basic check)
      const newFiles = droppedFiles.filter(
        df => !(files && files.some(f => f.name === df.name && f.size === df.size))
      );
      if (newFiles.length > 0) {
        const fileSize = newFiles[0].size/1024/1024;
        if (fileSize > parseFloat(Number(process.env.NEXT_PUBLIC_CHAT_UPLOAD_LIMIT))) {
          toast({title: "Upload Error", description: "Too large file, please upload less than 15MB!", variant: "destructive"});
          return;
        }
        setFiles((prev) => [...prev, ...newFiles]);
        // Trigger immediate upload of new files
        uploadFiles(newFiles);
      }
    }
  }, [files, uploadFiles]); // Added uploadFiles to dependency array

  const onSubmit = () => {
    // Ensure that input is present before submitting
    if (!input.trim()) return;
    
    handleSubmit(input, files); // Pass files to handleSubmit
    
    setInput(""); // Clear input after sending
    setFiles([]); // Clear files after sending
  };

  const handleCopy = async (text: string, messageId: string) => {
    const copyToClipboard = async (text: string) => {
      // Try the modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(text)
          return true
        } catch (err) {
          console.warn('Clipboard API failed, trying fallback method:', err)
        }
      }

      // Fallback method using a temporary textarea
      try {
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        
        const successful = document.execCommand('copy')
        document.body.removeChild(textArea)
        
        if (successful) {
          return true
        } else {
          throw new Error('execCommand copy failed')
        }
      } catch (err) {
        console.error('Fallback copy method failed:', err)
        return false
      }
    }

    try {
      const success = await copyToClipboard(text)
      
      if (success) {
        setCopiedMessageId(messageId);
        toast({
          title: "Copied to clipboard!",
          duration: 2000,
        });
        setTimeout(() => setCopiedMessageId(null), 2000);
      } else {
        throw new Error('Copy failed')
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
  };

  const handleSend = (destination: 'google-drive' | 'journal', text: string, messageId: string) => {
    // TODO: Implement sending to Google Drive or Journal
    console.log(`Sending to ${destination}:`, text, messageId);
  };

  const handleOpenCanvas = (messageId: string) => {
    // TODO: Implement canvas opening functionality
    console.log('Opening canvas for message:', messageId);
  };

  const handleGoodResponse = async (messageId: string, feedback?: { type: string; text: string }) => {
    setMessageFeedback(prev => ({
      ...prev,
      [messageId]: { isGood: true, isBad: false }
    }));
    
    try {
      await sendUserFeedback({
        chat_id: messageId,
        feedback_type: 'good' as UserFeedbackType,
        feedback_text: feedback ? `${feedback.type}: ${feedback.text}` : undefined,
        session: sessionId
      });
      
      if (feedback) {
        toast({
          title: "Feedback submitted",
          description: "Thank you for your detailed feedback!",
        });
      } else {
        toast({
          title: "Feedback submitted",
          description: "Thank you for your feedback!",
        });
      }
    } catch (error) {
      console.error('Failed to send feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBadResponse = async (messageId: string, feedback?: { type: string; text: string }) => {
    setMessageFeedback(prev => ({
      ...prev,
      [messageId]: { isGood: false, isBad: true }
    }));
    
    try {
      await sendUserFeedback({
        chat_id: messageId,
        feedback_type: 'bad' as UserFeedbackType,
        feedback_text: feedback ? `${feedback.type}: ${feedback.text}` : undefined,
        session: sessionId
      });
      
      if (feedback) {
        toast({
          title: "Feedback submitted",
          description: "Thank you for your detailed feedback!",
        });
      } else {
        toast({
          title: "Feedback submitted",
          description: "Thank you for your feedback!",
        });
      }
    } catch (error) {
      console.error('Failed to send feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isEmpty = messages.length === 0;
  const lastMessage = messages.at(-1);
  
  // Only show typing indicator when the agent is responding AND
  // there's no content yet (empty assistant message) or no assistant message at all
  const hasAssistantMessageWithContent = lastMessage?.role === 'assistant' && lastMessage.content.trim().length > 0;
  const isTyping = isAgentResponding && !hasAssistantMessageWithContent;

  // Mark the last assistant message as completed when agent stops responding
  useEffect(() => {
    if (!isAgentResponding && lastMessage?.role === 'assistant' && lastMessage.content.trim().length > 0) {
      setCompletedMessages(prev => new Set([...prev, lastMessage.id]));
    }
  }, [isAgentResponding, lastMessage]);

  // Manual scroll trigger for streaming responses
  useEffect(() => {
    if (isAgentResponding && messages.length > 0) {
      const timer = setTimeout(() => {
        // Find the ChatMessages container and scroll it
        const chatMessagesContainer = document.querySelector('[class*="overflow-y-auto"]') as HTMLElement;
        if (chatMessagesContainer) {
          chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAgentResponding, messages]);

  // Additional scroll trigger for message updates
  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        const chatMessagesContainer = document.querySelector('[class*="overflow-y-auto"]') as HTMLElement;
        if (chatMessagesContainer) {
          chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  // Scroll trigger for tool calls and reasoning steps
  useEffect(() => {
    if (currentToolCalls.size > 0 || (currentReasoningSteps && currentReasoningSteps.length > 0)) {
      const timer = setTimeout(() => {
        const chatMessagesContainer = document.querySelector('[class*="overflow-y-auto"]') as HTMLElement;
        if (chatMessagesContainer) {
          chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentToolCalls, currentReasoningSteps]);

  return (
    <div className="flex flex-col h-full max-w-full">
      <div
        className="flex-1 flex flex-col relative min-h-0"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragOver && (
          <div className="absolute inset-0 bg-blue-500/10 border-2 border-dashed border-blue-400 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 shadow-lg border border-blue-200">
              <div className="text-center">
                <Paperclip className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <p className="text-lg font-medium text-gray-900">Drop files here</p>
                <p className="text-sm text-gray-500">Release to upload</p>
              </div>
            </div>
          </div>
        )}
        
        {isEmpty && (
          <div className="flex-1 flex items-center justify-center p-8 min-h-0">
            <PromptSuggestions
              label="Try these prompts ✨"
              append={(message) => {
                setInput(message.content);
                handleSubmit(message.content);
                setInput("");
              }}
              suggestions={["What is a sophisticated investor?", "What is AML/KYC?"]}
            />
          </div>
        )}

        {!isEmpty && (
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="max-w-3xl mx-auto w-full py-4">
              <MessageList 
                messages={messages.filter(m => m.role === 'user' || m.role === 'assistant')} 
                isTyping={isTyping}
                currentToolCalls={currentToolCalls}
                currentReasoningSteps={currentReasoningSteps}
                isAgentResponding={isAgentResponding}
                messageOptions={(message) => {
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
                }}
              />
            </div>
          </div>
        )}

        <div className="border-t mt-auto">
          {/* Memory Updating Indicator - Positioned above the input box */}
          {isMemoryUpdating && (
            <div className="py-[2px] px-3 text-xs text-blue-700 bg-blue-50 leading-tight">
              <div className="max-w-3xl mx-auto w-full inline-flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>
                <span>Agent is updating its memory...</span>
              </div>
            </div>
          )}
          {/* Error Message - Positioned above the input box */}
          {error && (
            <div className="py-[2px] px-3 text-sm text-red-500 bg-red-50 leading-tight">
              <div className="max-w-3xl mx-auto w-full">
                {error}
              </div>
            </div>
          )}

          {/* Debug Message - Positioned above the input box */}
          {currentDebugMessage && (
            <div className="py-[2px] px-3 text-xs text-gray-500 bg-yellow-50 leading-tight">
              <div className="max-w-3xl mx-auto w-full inline-flex items-center">
                <span className="font-medium mr-1">Debug:</span> {currentDebugMessage}
              </div>
            </div>
          )}
          
          <div className="max-w-3xl mx-auto w-full p-4">
            {/* Reasoning Toggle */}
            <div className="flex items-center gap-2 mb-3">
              <Button
                type="button"
                variant={reasoningEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => setReasoningEnabled(!reasoningEnabled)}
                className="flex items-center gap-2"
                disabled={isLoading || isTyping}
              >
                {reasoningEnabled ? <Brain className="h-4 w-4" /> : <Lightbulb className="h-4 w-4" />}
                {reasoningEnabled ? "Reasoning Enabled" : "Enable Reasoning"}
              </Button>
              {reasoningEnabled && (
                <span className="text-xs text-muted-foreground">
                  Agent will show its thinking process and tool usage
                </span>
              )}
              {isAgentResponding && reasoningEnabled && (
                <div className="flex items-center gap-1 text-xs text-blue-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span>Showing reasoning...</span>
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
                  isGenerating={isLoading} // isLoading now includes isUploadingFiles
                  fileUploads={fileUploads} // Pass down fileUploads
                  isUploadingFiles={isUploadingFiles} // Pass down isUploadingFiles
                />
              )}
            </ChatForm>
          </div>
        </div>
      </div>
    </div>
  );
}
