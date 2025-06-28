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

interface CustomChatProps {
  agentId: string;
  sessionId?: string;
}

export function CustomChat({ agentId, sessionId }: CustomChatProps) {
  const {
    messages,
    handleSubmit,
    isLoading,
    error,
    currentDebugMessage,
    currentChatTitle,
  } = useAgentChat({ agentId, sessionId });

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
      setFiles((prev) => [...prev, ...droppedFiles]);
    }
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && files.length === 0) return;
    
    handleSubmit(input, {
      experimental_attachments: files.length > 0 ? files : undefined,
    });
    
    setInput("");
    setFiles([]); // Clear files after sending
  };

  const isEmpty = messages.length === 0;
  const lastMessage = messages.at(-1);
  const isTyping = lastMessage?.role === "user";

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
              suggestions={["What is the capital of France?", "Tell me a joke"]}
            />
          </div>
        )}

        {!isEmpty && (
          <ChatMessages className="flex-1 p-4 overflow-y-auto">
            <div className="max-w-3xl mx-auto w-full py-4">
              <MessageList messages={messages} isTyping={isTyping} />
            </div>
          </ChatMessages>
        )}

        {error && (
          <div className="p-3 text-sm text-red-500 border-t bg-red-50">
            <div className="max-w-3xl mx-auto w-full">
              {error}
            </div>
          </div>
        )}

        {currentDebugMessage && (
          <div className="p-3 text-xs text-gray-500 border-t bg-yellow-50">
            <div className="max-w-3xl mx-auto w-full">
              Debug: {currentDebugMessage}
            </div>
          </div>
        )}

        <div className="border-t mt-auto">
          <div className="max-w-3xl mx-auto w-full p-4">
            <ChatForm
              isPending={isLoading || isTyping}
              handleSubmit={onSubmit}
            >
              {({ setFiles: setFormFiles }) => (
                <MessageInput
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  allowAttachments
                  files={files}
                  setFiles={(newFiles) => {
                    setFiles(newFiles);
                    setFormFiles(newFiles);
                  }}
                  stop={() => {}}
                  isGenerating={isLoading}
                />
              )}
            </ChatForm>
          </div>
        </div>
      </div>
    </ChatContainer>
  );
}
