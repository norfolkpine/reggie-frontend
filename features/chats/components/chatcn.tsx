"use client";

import { useState } from "react";
import {
  ChatContainer,
  ChatForm,
  ChatMessages,
} from "@/components/ui/chat";
import { PromptSuggestions } from "@/components/ui/prompt-suggestions";
import { MessageInput } from "@/components/ui/message-input";
import { MessageList } from "@/components/ui/message-list";
import { useAgentChat } from "@/hooks/use-agent-chat";

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

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(input);
    setInput("");
  };

  const isEmpty = messages.length === 0;
  const lastMessage = messages.at(-1);
  const isTyping = lastMessage?.role === "user";

  return (
    <ChatContainer>
      {isEmpty && (
        <PromptSuggestions
          label="Try these prompts ✨"
          append={(message) => {
            setInput(message.content);
            handleSubmit(message.content);
            setInput("");
          }}
          suggestions={["What is the capital of France?", "Tell me a joke"]}
        />
      )}

      {!isEmpty && (
        <ChatMessages>
          <MessageList messages={messages} isTyping={isTyping} />
        </ChatMessages>
      )}

      {error && (
        <div className="p-2 text-sm text-red-500 border-t bg-red-50">
          {error}
        </div>
      )}

      {currentDebugMessage && (
        <div className="p-2 text-xs text-gray-500 border-t bg-yellow-50">
          Debug: {currentDebugMessage}
        </div>
      )}

      <ChatForm
        className="mt-auto"
        isPending={isLoading || isTyping}
        handleSubmit={onSubmit}
      >
        {({ files, setFiles }) => (
          <MessageInput
            value={input}
            onChange={(e) => setInput(e.target.value)}
            allowAttachments
            files={files}
            setFiles={setFiles}
            stop={() => {}}
            isGenerating={isLoading}
          />
        )}
      </ChatForm>
    </ChatContainer>
  );
}
