"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Loader2, Bot, User, X, Maximize2, Minimize2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: Array<{ file: string; relevance: number }>;
}

interface VaultAiChatProps {
  projectUuid: string;
  parentId?: number;
  fileIds?: number[];
  onClose?: () => void;
  className?: string;
}

export function VaultAiChat({ 
  projectUuid, 
  parentId = 0, 
  fileIds = [], 
  onClose,
  className 
}: VaultAiChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Create a new message for the assistant response
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
      timestamp: new Date()
    };
    setMessages(prev => [...prev, assistantMessage]);

    try {
      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController();

      const response = await fetch("/api/vault-files/vault-agent-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          project_uuid: projectUuid,
          parent_id: parentId,
          file_ids: fileIds,
          message: input
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let accumulatedContent = "";
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.content) {
                  accumulatedContent += data.content;
                  
                  // Update the assistant message with accumulated content
                  setMessages(prev => 
                    prev.map(msg => 
                      msg.id === assistantMessage.id 
                        ? { ...msg, content: accumulatedContent }
                        : msg
                    )
                  );
                }

                if (data.sources) {
                  // Update sources if provided
                  setMessages(prev => 
                    prev.map(msg => 
                      msg.id === assistantMessage.id 
                        ? { ...msg, sources: data.sources }
                        : msg
                    )
                  );
                }

                if (data.finished) {
                  // Streaming finished
                  break;
                }

                if (data.error) {
                  throw new Error(data.error);
                }
              } catch (e) {
                // Skip invalid JSON
                console.error("Failed to parse SSE data:", e);
              }
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Request was cancelled');
      } else {
        console.error("AI chat error:", error);
        toast({
          title: "Error",
          description: "Failed to get AI response. Please try again.",
          variant: "destructive"
        });
        
        // Remove the empty assistant message on error
        setMessages(prev => prev.filter(msg => msg.id !== assistantMessage.id));
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const cancelRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  return (
    <Card className={cn(
      "flex flex-col",
      isExpanded ? "fixed inset-4 z-50" : "h-[600px]",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between py-3">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Vault AI Assistant
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">
                Ask questions about your vault files.
                The AI will analyze and provide insights based on the content.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bot className="h-4 w-4" />
                      </div>
                    </div>
                  )}
                  
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-4 py-2",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    {message.role === "assistant" ? (
                      <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none">
                        {message.content || "Thinking..."}
                      </ReactMarkdown>
                    ) : (
                      <p className="text-sm">{message.content}</p>
                    )}
                    
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-border/50">
                        <p className="text-xs font-medium mb-1">Sources:</p>
                        <div className="space-y-1">
                          {message.sources.map((source, idx) => (
                            <div key={idx} className="text-xs text-muted-foreground">
                              • {source.file} ({Math.round(source.relevance * 100)}% relevant)
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground mt-1">
                      {format(message.timestamp, "HH:mm")}
                    </div>
                  </div>
                  
                  {message.role === "user" && (
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                        <User className="h-4 w-4 text-primary-foreground" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your vault files..."
              className="min-h-[60px] resize-none"
              disabled={isLoading}
            />
            {isLoading ? (
              <Button
                variant="destructive"
                size="icon"
                onClick={cancelRequest}
              >
                <X className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSend}
                disabled={!input.trim()}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}