import React from "react"
import {
  ChatMessage,
  ToolCall,
  type ChatMessageProps,
  type Message,
} from "@/components/ui/chat-message"
import { TypingIndicator } from "@/components/ui/typing-indicator"
import { AgentThinking } from "./agent-thinking"
import { motion } from "framer-motion";

type AdditionalMessageOptions = Omit<ChatMessageProps, keyof Message>

interface MessageListProps {
  messages: Message[]
  showTimeStamps?: boolean
  isTyping?: boolean
  messageOptions?:
    | AdditionalMessageOptions
    | ((message: Message) => AdditionalMessageOptions)
  currentToolCalls: Map<string, ToolCall>
  currentReasoningSteps: any[],
  isAgentResponding: boolean
}

export function MessageList({
  messages,
  showTimeStamps = true,
  isTyping = false,
  messageOptions,
  currentToolCalls,
  currentReasoningSteps,
  isAgentResponding,
}: MessageListProps) {
  

  return (
    <div className="space-y-2 md:space-y-4 overflow-visible">


      {messages.map((message, index) => {
        const additionalOptions =
          typeof messageOptions === "function"
            ? messageOptions(message)
            : messageOptions

        return (
          <ChatMessage
            key={index}
            showTimeStamp={showTimeStamps}
            {...message}
            {...additionalOptions}
          />
        )
      })}
      
      { isTyping && isAgentResponding && (currentToolCalls.size > 0 || currentReasoningSteps.length > 0) && (
        <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-2 md:mt-4"
      >
              <AgentThinking
                toolCalls={Array.from(currentToolCalls.values())}
                reasoningSteps={currentReasoningSteps}
                isActive={true}
              />
           </motion.div>
      )}
      {/* Typing Indicator - Show when agent is responding but no content yet */}
      {isTyping && (
        <div className="chat-message assistant">
          <div className="flex items-start">
            <div className="rounded-lg bg-muted px-4 py-2 max-w-[85%]">
              <TypingIndicator />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
