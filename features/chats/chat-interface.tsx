"use client";

import type React from "react";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Mic,
  Plus,
  Search,
  Send,
} from "lucide-react";
import { useChat } from "ai/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { toast } from "@/components/ui/use-toast";
import CryptoChart from "./components/crypto-chart";
import { EditorPanel } from "./components/editor-panel";
import { useAuth } from "@/contexts/auth-context";
import { ChatRequestOptions } from "ai";
import { useParams, useRouter } from "next/navigation";

// Add these imports at the top
import { useSearchParams } from 'next/navigation';
import { createChatSession } from '@/api/chat-sessions';
import MessageActions from "./components/message-actions";
import { MarkdownComponents } from "./components/markdown-component";
import TypingIndicator from './components/typing-indicator';


// Function to check if a string is valid JSON with crypto data structure
function isCryptoData(content: string): boolean {
  try {
    const data = JSON.parse(content);
    if (!Array.isArray(data)) return false;
    if (data.length === 0) return false;

    // Check if the data has the expected structure
    const firstItem = data[0];
    return (
      typeof firstItem === "object" &&
      "date" in firstItem &&
      "price" in firstItem &&
      "market_cap" in firstItem &&
      "total_volume" in firstItem
    );
  } catch (e) {
    return false;
  }
}

// Replace useChat import with useAgentChat
import { useAgentChat } from "@/hooks/use-agent-chat";

export default function ChatInterface() {
  const [sessionCreated, setSessionCreated] = useState(false);
  const searchParams = useSearchParams();
  const agentId = searchParams.get('agentId') ?? '';
  const params = useParams();
  const sessionId = params.sessionId as string | null;
  
  // Replace useChat with useAgentChat
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: chatSubmit,
    isLoading,
  } = useAgentChat({ 
    agentId,
    sessionId: sessionId
  });

  useEffect(() => {
    console.log(messages.length);
  }, [messages.length]);

  const handleSubmit = async (
    event?: React.FormEvent<HTMLFormElement>,
    chatRequestOptions?: ChatRequestOptions
  ) => {
    if (!isAuthenticated) {
      router.push("/sign-in");
      return;
    }

    chatSubmit(event);
  };
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageListRef = useRef<HTMLDivElement>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [splitPosition, setSplitPosition] = useState(50); // percentage
  const [isNearBottom, setIsNearBottom] = useState(true);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const percentage =
      ((e.clientX - containerRect.left) / containerRect.width) * 100;

    // Limit the split position between 30% and 70%
    const limitedPercentage = Math.min(Math.max(percentage, 30), 70);
    setSplitPosition(limitedPercentage);
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    document.body.style.userSelect = "";
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove]);

  useEffect(() => {
    if (messages.length > 0) {
      setShowWelcome(false);
      if (isNearBottom) {
        requestAnimationFrame(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        });
      }
    }
  }, [messages, isNearBottom]);

  // Handle scroll position tracking
  const handleScroll = () => {
    if (!messageListRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messageListRef.current;
    const scrollPosition = scrollTop + clientHeight;
    const isCloseToBottom = scrollHeight - scrollPosition < 100;
    setIsNearBottom(isCloseToBottom);
  };

  useEffect(() => {
    const messageList = messageListRef.current;
    if (messageList) {
      messageList.addEventListener("scroll", handleScroll);
      return () => messageList.removeEventListener("scroll", handleScroll);
    }
  }, []);

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const sendToJournal = (text: string, messageId: string) => {
    console.log(`Sending message ${messageId} to journal`);
    toast({
      title: "Sent to Journal",
      description: "This message has been saved to your journal.",
      duration: 3000,
    });
  };

  const handleSaveEdit = (content: string) => {
    if (!editingMessageId) return;
    console.log(
      `Saving edited content for message ${editingMessageId}:`,
      content
    );
    toast({
      title: "Changes Saved",
      description: "Your edits have been saved.",
      duration: 3000,
    });

    messages.map((message) => {
      if (message.id === editingMessageId) {
        message.content = content;
      }
      return message;
    });

    setEditingMessageId(null);
  };

  // Find the message being edited
  const editingMessage = messages.find(
    (message) => message.id === editingMessageId
  );

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Main content area with flexbox layout */}

      <div className="flex flex-1 overflow-hidden" ref={containerRef}>
        {/* Chat area */}
        <div
          className="flex flex-col h-full transition-all duration-300 ease-in-out"
          style={{ width: editingMessageId ? `${splitPosition}%` : "100%" }}
        >
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between">
            <h1 className="text-xl font-medium">ChatGPT 4o</h1>
          </div>

          {showWelcome ? (
            // Welcome screen with centered content
            <div className="flex-1 flex flex-col items-center justify-center px-4">
              <h2 className="text-3xl font-medium text-gray-800 mb-8">
                What can I help with?
              </h2>
              <div className="w-full max-w-2xl">
                <Card className="p-2 shadow-lg border-gray-200 rounded-2xl">
                  <form onSubmit={handleSubmit} className="flex items-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="rounded-full"
                    >
                      <Plus className="h-5 w-5" />
                    </Button>

                    <Input
                      className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                      placeholder="Ask anything"
                      value={input}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    />

                    <div className="flex items-center gap-2 px-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="rounded-full"
                      >
                        <Search className="h-5 w-5" />
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="rounded-full"
                      >
                        <Mic className="h-5 w-5" />
                      </Button>
                    </div>
                  </form>
                </Card>

                <div className="flex justify-between items-center mt-4 text-xs text-muted-foreground px-2">
                  <span>ChatGPT can make mistakes. Check important info.</span>
                  <span>?</span>
                </div>
              </div>
            </div>
          ) : (
            // Chat screen with messages
            <>
              <div className="flex-1 overflow-y-auto" ref={messageListRef}>
                <div
                  className="max-w-3xl mx-auto w-full space-y-6 p-4"
                  style={{ willChange: "transform" }}
                >
                  {messages.map((message, index) => (
                    <div
                      key={message.id}
                      style={{
                        transform: "translate3d(0, 0, 0)",
                        willChange: "transform",
                        contain: "content",
                      }}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                      >
                        {message.role === "user" ? (
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        ) : (
                          <>
                            {isCryptoData(message.content as string) ? (
                              <div className="my-4">
                                <CryptoChart
                                  data={JSON.parse(message.content as string)}
                                  title="Cryptocurrency Data"
                                  description="Price, Market Cap, and Volume"
                                />
                              </div>
                            ) : isLoading && index === messages.length - 1 && message.role === "assistant" ? (
                              <div className="flex justify-start">
                                <div className="max-w-[80%]">
                                  <TypingIndicator />
                                </div>
                              </div>
                            ) : (
                              <div className="markdown">
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  rehypePlugins={[rehypeHighlight]}
                                  components={MarkdownComponents}
                                >
                                  {message.content as string}
                                </ReactMarkdown>
                              </div>
                            )}
                            <MessageActions
                              messageId={message.id}
                              content={message.content as string}
                              onCopy={copyToClipboard}
                              copiedMessageId={copiedMessageId}
                              onSendToJournal={sendToJournal}
                              onOpenCanvas={setEditingMessageId}
                            />
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Fixed input at bottom when chatting */}
              <div className="p-4 bg-gradient-to-t from-background via-background to-transparent">
                <div className="max-w-3xl mx-auto">
                  <Card className="p-2 shadow-lg border-gray-200 rounded-2xl">
                    <form onSubmit={handleSubmit} className="flex items-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="rounded-full"
                      >
                        <Plus className="h-5 w-5" />
                      </Button>

                      <Input
                        className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                        placeholder="Ask anything"
                        value={input}
                        onChange={handleInputChange}
                        disabled={isLoading}
                      />

                      <div className="flex items-center gap-2 px-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="rounded-full"
                        >
                          <Search className="h-5 w-5" />
                        </Button>
                        <span className="text-xs text-muted-foreground px-2 border-x border-gray-200">
                          Deep research
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="rounded-full"
                        >
                          <Mic className="h-5 w-5" />
                        </Button>
                        <Button
                          type="submit"
                          variant="ghost"
                          size="icon"
                          className="rounded-full"
                          disabled={isLoading || !input.trim()}
                        >
                          <Send className="h-5 w-5" />
                        </Button>
                      </div>
                    </form>
                  </Card>

                  <div className="flex justify-between items-center mt-4 text-xs text-muted-foreground px-2">
                    <span>
                      ChatGPT can make mistakes. Check important info.
                    </span>
                    <span>?</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Resizable divider */}
        {editingMessageId && (
          <div
            className="w-1 hover:w-2 bg-gradient-to-r from-transparent via-gray-300 to-transparent cursor-col-resize relative group transition-all"
            onMouseDown={handleMouseDown}
          >
            <div className="absolute inset-0 shadow-[0_0_15px_rgba(0,0,0,0.1)] pointer-events-none" />
            <div className="absolute inset-y-0 left-1/2 w-4 -translate-x-1/2 group-hover:bg-gray-300/10" />
          </div>
        )}

        {/* Canvas editor area */}
        {editingMessageId && (
          <div
            className="flex flex-col h-full transition-all duration-300 ease-in-out"
            style={{ width: `${100 - splitPosition}%` }}
          >
            {editingMessage && (
              <EditorPanel
                content={{
                  content: editingMessage.content,
                  role: editingMessage.role as "user" | "assistant",
                  id: editingMessage.id,
                }}
                show
                onSave={handleSaveEdit}
                onClose={() => {}}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
