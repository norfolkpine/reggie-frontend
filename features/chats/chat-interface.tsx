"use client";

import type React from "react";

import { useState, useRef, useEffect, useCallback, useMemo, memo } from "react";
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
import { sendUserFeedback } from "./api/user-feedback";
import { MarkdownComponents } from "./components/markdown-component";
import TypingIndicator from "./components/typing-indicator";
import AgentChatDock from "./components/agent-chat-dock";
import { ChatSessionProvider } from "./ChatSessionContext"; // Import the provider
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

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

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

// Memoized AgentChatDock to prevent unnecessary re-renders
const MemoizedAgentChatDock = memo(AgentChatDock, (prevProps, nextProps) => {
  // Custom comparison function - only re-render if these specific props change
  return (
    prevProps.onSelectChat === nextProps.onSelectChat &&
    prevProps.onNewChat === nextProps.onNewChat
    // Add other props that should trigger re-render if they change
    // For example: prevProps.selectedChatId === nextProps.selectedChatId
  );
});

// Set display name for debugging
MemoizedAgentChatDock.displayName = 'MemoizedAgentChatDock';

export default function ChatInterface() {
  const searchParams = useSearchParams();
  const agentId = searchParams.get("agentId") ?? process.env.NEXT_PUBLIC_DEFAULT_AGENT_ID;
  const params = useParams();
  const sessionId = params.sessionId as string | null;
  const router = useRouter();

  const {
    messages,
    handleSubmit: chatSubmit,
    isLoading,
    error,
    currentDebugMessage,
    currentChatTitle
  } = useAgentChat({
    agentId: agentId!,
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
  const { isAuthenticated } = useAuth();

  // State for feedback dialog
  const [feedbackDialog, setFeedbackDialog] = useState<{
    open: boolean;
    messageId: string;
    feedbackType: 'good' | 'bad' | null;
    text?: string;
  }>({ open: false, messageId: '', feedbackType: null, text: '' });

  const [feedbackHighlight, setFeedbackHighlight] = useState<Record<string, 'good' | 'bad' | null>>({});

  // Memoize the callback functions to prevent AgentChatDock re-renders
  const handleSelectChat = useCallback((chatId: string, agentCode?: string | null) => {
    // Don't navigate if we're already on this chat
    if (sessionId === chatId) {
      console.log('Already on this chat:', chatId);
      return;
    }

    console.log('Navigating to chat:', chatId, 'with agent:', agentCode);
    
    // Navigate to the selected chat
    let url = `/chat/${chatId}`;
    if (agentCode) {
      const params = new URLSearchParams({ agentId: agentCode });
      url += `?${params.toString()}`;
    } else if (agentId) {
      // Use current agentId if no agentCode provided
      const params = new URLSearchParams({ agentId: agentId });
      url += `?${params.toString()}`;
    }
    
    setShowWelcome(false);
    
    // Force navigation using replace to ensure route change
    router.replace(url);
    
    // Alternatively, you can use router.push with refresh
    // router.push(url);
    // router.refresh();
  }, [router, sessionId, agentId]); // Include sessionId and agentId in dependencies

  const handleNewChat = useCallback(async () => {
    console.log('Creating new chat...');
    
    // Reset the current chat state
    setShowWelcome(true);
    
    try {
      // Create a new chat session
      const newSession = await createChatSession({
        title: "New Conversation",
        agent_id: agentId,
        agent_code: "gpt-4o", // Default agent code
      });
      
      console.log('New session created:', newSession.session_id);
      
      // Navigate to the new chat session
      const url = `/chat/${newSession.session_id}?agentId=${agentId}`;
      router.replace(url);
      
      toast({
        title: "New Chat Created",
        description: "Starting a fresh conversation",
        duration: 2000,
      });
    } catch (error) {
      console.error("Error creating new chat session:", error);
      toast({
        title: "Error",
        description: "Failed to create a new chat session",
        duration: 3000,
      });
    }
  }, [router, agentId]); // Only recreate if router or agentId changes

  // Memoize other callback functions that don't need to change frequently
  const handleFeedbackDialogClose = useCallback(async (feedbackText?: string) => {
    try {
      if (feedbackDialog.feedbackType === 'good' || feedbackDialog.feedbackType === 'bad') {
        await sendUserFeedback({
          chat_id: feedbackDialog.messageId,
          feedback_type: feedbackDialog.feedbackType,
          feedback_text: feedbackText,
          session: sessionId || undefined,
        });
      }
      setFeedbackDialog({ open: false, messageId: '', feedbackType: null, text: '' });
    } catch (err) {
      // Handle error
    }
  }, [feedbackDialog.feedbackType, feedbackDialog.messageId, sessionId]);

  const copyToClipboard = useCallback(async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  }, []);

  const sendToJournal = useCallback((text: string, messageId: string) => {
    console.log(`Sending message ${messageId} to journal`);
    toast({
      title: "Sent to Journal",
      description: "This message has been saved to your journal.",
      duration: 3000,
    });
  }, []);

  const handleSaveEdit = useCallback((content: string) => {
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
  }, [editingMessageId, messages]);

  const handleOnSend = useCallback(async (
    id: "google-drive" | "journal",
    text: string,
    messageId: string
  ): Promise<void> => {
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
  }, [sendToJournal]);

  // Find the message being edited
  const editingMessage = useMemo(
    () => messages.find(
      (message) => message.id === editingMessageId && (message.role === 'assistant' || message.role === 'system')
    ),
    [messages, editingMessageId]
  );

  // Add effect to handle route parameter changes
  useEffect(() => {
    console.log('Route params changed:', { sessionId, agentId });
    
    // Reset welcome state when we have a valid session
    if (sessionId && sessionId !== 'undefined') {
      setShowWelcome(false);
    } else {
      setShowWelcome(true);
    }
  }, [sessionId, agentId]);

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
  const handleScroll = useCallback(() => {
    if (!messageListRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messageListRef.current;
    const scrollPosition = scrollTop + clientHeight;
    const isCloseToBottom = scrollHeight - scrollPosition < 100;
    setIsNearBottom(isCloseToBottom);
  }, []);

  useEffect(() => {
    const messageList = messageListRef.current;
    if (messageList) {
      messageList.addEventListener("scroll", handleScroll);
      return () => messageList.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 border-b flex items-center justify-between">
        <div className="text-lg font-semibold truncate" title={currentChatTitle || "Chat"}>
          {currentChatTitle || "Chat"}
        </div>
        <Button size="icon" variant="outline" onClick={handleNewChat}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Content Row */}
      <div className="flex flex-1 overflow-hidden">
        {/* Use memoized AgentChatDock */}
        <MemoizedAgentChatDock 
          onSelectChat={handleSelectChat} 
          onNewChat={handleNewChat} 
        />
        
        <div className="flex-1 flex flex-col min-h-0">
          {/* Main content area with flexbox layout */}
          <ResizablePanelGroup direction="horizontal" className="flex-1 overflow-hidden">
            {/* Chat area */}
            <ResizablePanel defaultSize={editingMessageId ? 60 : 100} minSize={30} className="flex flex-col h-full min-h-0">
              
              {/* Display Debug Message */}
              {currentDebugMessage && (
                <div className="max-w-3xl mx-auto w-full p-4 sticky top-0 z-10 bg-background">
                  <Card className="p-3 bg-yellow-100 border-yellow-300 text-yellow-700 text-xs">
                    <pre className="whitespace-pre-wrap break-all">
                      <strong>Debug Info:</strong><br />
                      {currentDebugMessage}
                    </pre>
                  </Card>
                </div>
              )}

              {error && (
                <Alert variant="destructive" className="mx-4 my-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

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
                          key={message.id + '-' + index}
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
                                ) : (
                                  <>
                                    <div className="markdown">
                                      <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        rehypePlugins={[rehypeHighlight]}
                                        components={MarkdownComponents}
                                      >
                                        {message.content as string}
                                      </ReactMarkdown>
                                    </div>
                                    {isLoading && index === messages.length - 1 && message.role === "assistant" && (!message.content || (message.content as string).length === 0) && (
                                      <div className="flex justify-start">
                                        <TypingIndicator />
                                      </div>
                                    )}
                                  </>
                                )}
                                {(() => {
                                  const isNewestAssistant = index === messages.length - 1 && message.role === "assistant";
                                  const showActions = !(isNewestAssistant && isLoading);
                                  return showActions;
                                })() && (
                                  <div className="flex items-center gap-2 mt-2 -mb-1">
                                    <MessageActions
                                      messageId={message.id}
                                      content={message.content as string}
                                      onCopy={copyToClipboard}
                                      copiedMessageId={copiedMessageId}
                                      onSend={handleOnSend}
                                      onOpenCanvas={setEditingMessageId}
                                      onGoodResponse={(messageId: string) => {
                                        setFeedbackHighlight(prev => ({ ...prev, [messageId]: 'good' }));
                                        setFeedbackDialog({ open: true, messageId, feedbackType: 'good' });
                                      }}
                                      onBadResponse={(messageId: string) => {
                                        setFeedbackHighlight(prev => ({ ...prev, [messageId]: 'bad' }));
                                        setFeedbackDialog({ open: true, messageId, feedbackType: 'bad' });
                                      }}
                                      isGood={feedbackHighlight[message.id] === 'good' || (message.feedback && message.feedback.length > 0 ? message.feedback[message.feedback.length - 1].feedback_type === 'good' : false)}
                                      isBad={feedbackHighlight[message.id] === 'bad' || (message.feedback && message.feedback.length > 0 ? message.feedback[message.feedback.length - 1].feedback_type === 'bad' : false)}
                                    />
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      ))}

                      <div ref={messagesEndRef} />
                    </div>
                  </div>

                  {/* Feedback Dialog */}
                  <Dialog open={feedbackDialog.open} onOpenChange={(open) => setFeedbackDialog((prev) => ({ ...prev, open }))}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{feedbackDialog.feedbackType === 'good' ? 'Good Response' : 'Bad Response'} Feedback</DialogTitle>
                        <DialogDescription>
                          Optional: Let us know why you think this response was {feedbackDialog.feedbackType === 'good' ? 'good' : 'bad'}.
                        </DialogDescription>
                      </DialogHeader>
                      <Textarea
                        value={feedbackDialog.text}
                        onChange={e => setFeedbackDialog(prev => ({ ...prev, text: e.target.value }))}
                        placeholder="Your feedback (optional)"
                        rows={3}
                      />
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            if (feedbackDialog.messageId) {
                              setFeedbackHighlight(prev => ({ ...prev, [feedbackDialog.messageId]: null }));
                            }
                            setFeedbackDialog({ open: false, messageId: '', feedbackType: null, text: '' });
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => handleFeedbackDialogClose(feedbackDialog.text || undefined)}
                        >
                          Submit
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

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
      </div>
    </div>
  );
}