"use client";

import { useState, useCallback } from "react";
import {
  ChatContainer,
  ChatForm,
  ChatMessages,
} from "@/components/ui/chat"; // Keep ChatMessages if it's just a container
import { PromptSuggestions } from "@/components/ui/prompt-suggestions";
import { MessageInput } from "@/components/ui/message-input";
// MessageList might be replaced by direct mapping if ChatMessages from @/components/ui/chat doesn't suit
// For now, let's assume we will map directly and use ChatMessage component
// import { MessageList } from "@/components/ui/message-list";
import { useAgentChat } from "@/hooks/use-agent-chat";
import { ChatMessage, Message } from "@/components/ui/chat-message"; // Import ChatMessage
import { Card } from "@/components/ui/card"; // For Final Answer display
import ReactMarkdown from "react-markdown"; // For Final Answer display (optional)
import remarkGfm from "remark-gfm"; // For Final Answer display (optional)

import { Paperclip } from "lucide-react";
// ReactMarkdown and rehypeHighlight might not be needed directly here if ChatMessage handles it.
// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";
// import rehypeHighlight from "rehype-highlight";
// import { MarkdownComponents } from "./markdown-component";


interface CustomChatProps {
  agentId: string;
  sessionId?: string;
  onTitleUpdate?: (title: string | null) => void; // Prop to update title in parent if needed
}

export function CustomChat({ agentId, sessionId, onTitleUpdate }: CustomChatProps) {
  const {
    messages,
    handleSubmit,
    isLoading,
    error,
    currentDebugMessage,
    // currentChatTitle is handled by the parent ChatsComponent which gets it from its own useAgentChat instance
    // onTitleUpdate can be used if CustomChat needs to inform parent of title changes originating from its specific interactions
    isAgentResponding,
    fileUploads,
    isUploadingFiles,
    finalAnswer, // Get finalAnswer
    buildTime,   // Get buildTime
  } = useAgentChat({ 
    agentId, 
    sessionId,
    // Pass the onTitleUpdate callback to the hook if it's designed to call it
    // This hook instance in CustomChat might generate its own title if it creates a new session
    onTitleChange: onTitleUpdate
  });

  const [input, setInput] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  
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
          <ChatMessages className="flex-1 p-4 overflow-y-auto"> {/* ChatMessages here is likely just a styled div for scrolling */}
            <div className="max-w-3xl mx-auto w-full py-4 space-y-4"> {/* Added space-y-4 for spacing between messages */}
              {messages.map((message, index) => {
                const isLastMessage = index === messages.length - 1;
                // Actions are not currently part of CustomChat's design, but ChatMessage supports an 'actions' prop
                // const showActions = message.role === 'assistant' && !(isLastMessage && isLoading);

                return (
                  <div
                    key={message.id + '-' + index}
                    className={`flex w-full ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <ChatMessage
                      {...(message as Message)} // Cast to the Message type expected by ChatMessage
                      animation="slide"
                      // actions={showActions ? <YourActionsComponent /> : undefined} // Example if actions were needed
                    />
                  </div>
                );
              })}
            </div>
          </ChatMessages>
        )}

        {/* Final Answer Display */}
        {finalAnswer && !isLoading && ( // Show only if finalAnswer exists and not loading new response
          <div className="max-w-3xl mx-auto w-full p-4">
            <Card className="p-4 bg-sky-50 border-sky-200 shadow-md">
              <h3 className="text-md font-semibold text-sky-700 mb-2">Summary</h3>
              <div className="prose prose-sm dark:prose-invert max-w-none custom-markdown">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {finalAnswer.summary}
                </ReactMarkdown>
              </div>
            </Card>
          </div>
        )}

        <div className="border-t mt-auto">
          {error && (
            <div className="py-1 px-3 text-sm text-red-500 bg-red-50 leading-tight">
              <div className="max-w-3xl mx-auto w-full">
                {error}
              </div>
            </div>
          )}

          {currentDebugMessage && (
            <div className="py-1 px-3 text-xs text-gray-500 bg-yellow-50 leading-tight">
              <div className="max-w-3xl mx-auto w-full inline-flex items-center">
                <span className="font-medium mr-1">Debug:</span>
                <pre className="whitespace-pre-wrap break-all">{currentDebugMessage}</pre>
              </div>
            </div>
          )}
          
          <div className="max-w-3xl mx-auto w-full p-4">
            <ChatForm
              isPending={isLoading || isAgentResponding} {/* Use isAgentResponding for more accurate pending state */}
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
                  isGenerating={isLoading || isAgentResponding}
                  fileUploads={fileUploads}
                  isUploadingFiles={isUploadingFiles}
                />
              )}
            </ChatForm>
            {buildTime && (
              <div className="mt-2 text-xs text-muted-foreground text-center">
                Agent Build Time: {buildTime}
              </div>
            )}
          </div>
        </div>
      </div>
    </ChatContainer>
  );
}
