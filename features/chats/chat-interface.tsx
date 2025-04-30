"use client";

import type React from "react";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Mic, Plus, Search, Send } from "lucide-react";
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
import { useSearchParams } from "next/navigation";
import { createChatSession } from "@/api/chat-sessions";
import MessageActions from "./components/message-actions";
import { MarkdownComponents } from "./components/markdown-component";
import TypingIndicator from "./components/typing-indicator";

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

import { useAgentChat } from "@/hooks/use-agent-chat";
import { createGoogleDoc } from "@/api/integration-google-drive";
import { truncateText } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { InputMessage } from "./components/input-message";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export default function ChatInterface() {
  const searchParams = useSearchParams();
  const agentId = searchParams.get("agentId") ?? "";
  const params = useParams();
  const sessionId = params.sessionId as string | null;

  const {
    messages,
    handleSubmit: chatSubmit,
    isLoading,
  } = useAgentChat({
    agentId,
    sessionId: sessionId,
  });

  const handleSubmit = async (value?: string) => {
    if (!isAuthenticated) {
      router.push("/sign-in");
      return;
    }

    chatSubmit(value);
  };
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageListRef = useRef<HTMLDivElement>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);
  // Remove isDragging and containerRef as they're no longer needed with ResizablePanelGroup
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Remove manual resize handlers as they're no longer needed with ResizablePanelGroup

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

  async function handleOnSend(
    id: "google-drive" | "journal",
    text: string,
    messageId: string
  ): Promise<void> {
    if (id === "journal") {
      sendToJournal(text, messageId);
    } else if (id === "google-drive") {
      try {
        const data = await createGoogleDoc({
          title: truncateText(text ?? ""),
          markdown: text ?? "",
        });
        toast({
          title: "Success created Google Doc",
          description: "Click to open document",
          action: (<Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(data.doc_url, '_blank')}
          >
            Open
          </Button>
          )
        });
      } catch (e) {
        toast({
          title: "Failed creating Google Doc",
          description: "We were unable to create your document in Google Drive. Please try again."
        });
      }
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Main content area with flexbox layout */}

      <ResizablePanelGroup direction="horizontal" className="flex-1 overflow-hidden">
        {/* Chat area */}
        <ResizablePanel defaultSize={editingMessageId ? 60 : 100} minSize={30} className="flex flex-col h-full">
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
              <InputMessage loading={isLoading} onSubmit={handleSubmit} />


                <div className="flex justify-between items-center mt-4 text-xs text-muted-foreground px-2">
                  <span>Reggie can make mistakes. Check important info.</span>
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
                      className={`flex ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`rounded-lg px-4 py-2 ${
                          message.role === "user"
                            ? "max-w-[80%] bg-primary text-primary-foreground"
                            : ""
                        }`}
                      >
                        {message.role === "user" ? (
                          <p className="whitespace-pre-wrap">
                            {message.content}
                          </p>
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
                            ) : isLoading &&
                              index === messages.length - 1 &&
                              message.role === "assistant" ? (
                              <div className="flex justify-start">
                                <div>
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
                              onSend={handleOnSend}
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
                  <InputMessage loading={isLoading} onSubmit={handleSubmit} />

                  <div className="flex justify-between items-center mt-4 text-xs text-muted-foreground px-2">
                    <span>
                      Reggie can make mistakes. Check important info.
                    </span>
                    <span>?</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </ResizablePanel>

        {/* Editor panel */}
        {editingMessageId && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={40} minSize={30} className="h-full">
              <EditorPanel
                content={{
                  content: editingMessage?.content || "",
                  role: editingMessage?.role as "user" | "assistant",
                  id: editingMessage?.id || "",
                }}
                show
                onSave={handleSaveEdit}
                onClose={() => setEditingMessageId(null)}
              />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
}
