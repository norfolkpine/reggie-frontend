"use client";

import { useState, useCallback } from "react";
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
import { DragDropOverlay } from "./File/DragDropOverlayVisible";

interface CustomChatProps {
  agentId: string;
  sessionId?: string;
  onTitleUpdate?: (title: string | null) => void;
}

export function CustomChat({ agentId, sessionId, onTitleUpdate }: CustomChatProps) {
  const {
    messages,
    handleSubmit,
    isLoading,
    error,
    currentDebugMessage,
    currentChatTitle: _currentChatTitle,
    isAgentResponding,
    fileUploads, // Destructure new state
    isUploadingFiles, // Destructure new state
  } = useAgentChat({ 
    agentId, 
    sessionId,
    onTitleChange: onTitleUpdate
  });

  const [input, setInput] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragOverlayVisible, setIsDragOverlayVisible] = useState<boolean>(false);
  
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
        setFiles((prev) => [...prev, ...newFiles]);
      }
    }
  }, [files]); // Added files to dependency array

  const handleFilesDrop = (files: File[]): void => {
    setFiles(prev => [...prev, ...files]);
  };

  const onSubmit = () => {
    // Ensure that input or files are present before submitting
    if (!input.trim() && files.length === 0) return;
    
    handleSubmit(input, files); // Pass files to handleSubmit
    
    setInput(""); // Clear input after sending
    // Files are cleared by MessageInput after successful upload or handled by useAgentChat
    // For now, let's clear them here too, assuming successful submission implies files were handled.
    // This might need adjustment based on how useAgentChat handles file state after submission.
    setFiles([]);
  };

  const isEmpty = messages.length === 0;
  const lastMessage = messages.at(-1);
  
  // Only show typing indicator when the agent is responding AND
  // there's no content yet (empty assistant message) or no assistant message at all
  const hasAssistantMessageWithContent = lastMessage?.role === 'assistant' && lastMessage.content.trim().length > 0;
  const isTyping = isAgentResponding && !hasAssistantMessageWithContent;

  return (
    <ChatContainer className="max-w-full h-full">
      <div
        className="flex-1 flex flex-col relative h-full overflow-hidden"
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
          <div className="flex-1 flex items-center justify-center p-8">
            <PromptSuggestions
              label="Try these prompts ✨"
              className="w-full max-w-2xl mx-auto"
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
          <ChatMessages className="flex-1 p-4 overflow-y-auto">
            <div className="max-w-3xl mx-auto w-full py-4">
              <MessageList 
                messages={messages} 
                isTyping={isTyping}
                customComponents={{
                  message: ({ message }) => {
                    if (message.role === 'assistant') {
                      return (
                        <div className="prose prose-sm dark:prose-invert max-w-none custom-markdown">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeHighlight]}
                            components={{
                              ...MarkdownComponents,
                              // Override heading styles to match BlockNote specs
                              h1: ({ children, ...props }) => (
                                <h1 
                                  className="text-[32px] leading-[1.5] mb-[1rem]"
                                  {...props}
                                >
                                  {children}
                                </h1>
                              ),
                              h2: ({ children, ...props }) => (
                                <h2 
                                  className="text-[24px] leading-[1.5] mb-[0.75rem]"
                                  {...props}
                                >
                                  {children}
                                </h2>
                              ),
                              h3: ({ children, ...props }) => (
                                <h3 
                                  className="text-[18.7px] leading-[1.5] mb-[0.6rem]"
                                  {...props}
                                >
                                  {children}
                                </h3>
                              )
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      );
                    }
                    return null; // Default rendering for user messages
                  }
                }}
              />
            </div>
          </ChatMessages>
        )}

        <div className="border-t mt-auto">
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
                    setFiles(newFiles);
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
    
    </ChatContainer>
  );
}
