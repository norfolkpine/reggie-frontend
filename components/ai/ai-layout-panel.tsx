"use client";

import { useState, useEffect, useCallback, useRef, flushSync } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Sparkles, 
  X, 
  FileText, 
  FolderOpen,
  ChevronRight,
  Loader2,
  Send,
  GripVertical,
  User,
  Bot
} from "lucide-react";
import { useAiPanel } from "@/contexts/ai-panel-context";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";
import { chatWithVaultAgent } from "@/api/vault";

const MIN_WIDTH = 450;
const MAX_WIDTH = 800;

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

export function AiLayoutPanel() {
  const { 
    isOpen, 
    panelWidth, 
    isResizing,
    currentContext, 
    closePanel, 
    setPanelWidth,
    setIsResizing 
  } = useAiPanel();
  
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [suggestedPrompts] = useState([
    "Explore these files",
    "List key info for each file", 
    "Ask about this folder"
  ]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const resizeRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  // Auto-generate initial insights when panel opens or context changes
  useEffect(() => {
    if (isOpen && currentContext.projectId) {
      // Clear previous messages when context changes
      setMessages([]);
      generateInitialInsights();
    }
  }, [isOpen, currentContext.projectId]);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const generateInitialInsights = async () => {
    const fileCount = currentContext.files?.length || 0;
    
    let insights = `Happy to help you analyze "${currentContext.title}".\n\n`;
    
    if (fileCount > 0) {
      insights += `This location contains ${fileCount} items. `;
      insights += `I can help you understand the contents, find specific information, or organize your files.\n\n`;
      insights += `**What would you like to know?**\n\n`;
      insights += `• Get summaries of documents.\n\n`;
      insights += `• Find specific information across files.\n\n`;
      insights += `• Organize and categorize content.\n\n`;
      insights += `• Extract key insights and patterns.`;
    } else {
      insights += `This appears to be an empty location or I don't have access to the file details yet.\n\n`;
      insights += `You can ask me questions about your files, and I'll help analyze and organize your content.`;
    }
    
    // Add system message
    const systemMessage: Message = {
      id: Date.now().toString(),
      role: "system",
      content: insights,
      timestamp: new Date()
    };
    
    setMessages([systemMessage]);
  };

  const handleAskQuestion = async () => {
    if (!question.trim() || isLoading) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: question,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setQuestion("");
    setIsLoading(true);
    
    // Add placeholder assistant message
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
      timestamp: new Date()
    };
    setMessages(prev => [...prev, assistantMessage]);
    
    try {
      // Get file IDs from context
      const fileIds = currentContext.files?.map(f => f.id).filter(Boolean) || [];
      
      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController();
      
      // Call the vault-agent-chat endpoint with streaming
      const response = await chatWithVaultAgent({
        project_uuid: currentContext.projectId,
        parent_id: currentContext.folderId || 0,
        file_ids: fileIds,
        message: userMessage.content  // Use the saved user message content
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
            console.log("line", line);
            if (line.startsWith("data: ")) {
              const dataStr = line.slice(6);

              // Handle [DONE] token
              if (dataStr === "[DONE]") {
                break;
              }

              try {
                const data = JSON.parse(dataStr);
                
                // Handle different data structures from backend
                if (data.type === 'content' && data.data) {
                  accumulatedContent += data.data;
                  // Force immediate update for streaming effect
                  setMessages(prev =>
                    prev.map(msg =>
                      msg.id === assistantMessage.id
                        ? { ...msg, content: accumulatedContent }
                        : msg
                    )
                  );

                  // Small delay to ensure visual streaming effect
                  await new Promise(resolve => setTimeout(resolve, 100));
                } else if (data.content) {
                  // Fallback for direct content structure
                  accumulatedContent += data.content;
                  // Force immediate update for streaming effect
                  setMessages(prev =>
                    prev.map(msg =>
                      msg.id === assistantMessage.id
                        ? { ...msg, content: accumulatedContent }
                        : msg
                    )
                  );

                  // Small delay to ensure visual streaming effect
                  await new Promise(resolve => setTimeout(resolve, 100));
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
        // Update the assistant message with error
        setMessages(prev => 
          prev.map(msg => 
            msg.id === assistantMessage.id 
              ? { ...msg, content: "Failed to get AI response. Please try again." }
              : msg
          )
        );
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAskQuestion();
    }
  };
  
  const cancelRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handlePromptClick = (prompt: string) => {
    setQuestion(prompt);
    // Auto-send the prompt after a brief delay
    setTimeout(() => {
      handleAskQuestion();
    }, 100);
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = panelWidth;
  }, [panelWidth, setIsResizing]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    
    const deltaX = startXRef.current - e.clientX; // Inverted because panel is on the right
    const newWidth = Math.min(Math.max(startWidthRef.current + deltaX, MIN_WIDTH), MAX_WIDTH);
    setPanelWidth(newWidth);
  }, [isResizing, setPanelWidth]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, [setIsResizing]);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  if (!isOpen) return null;

  return (
    <div 
      className="flex h-full bg-white rounded-xl border shadow-sm"
      style={{ width: panelWidth }}
    >
      {/* Resize Handle */}
      <div 
        ref={resizeRef}
        className={cn(
          "w-1 bg-transparent hover:transparent cursor-col-resize flex items-center justify-center group transition-colors relative rounded-l-xl",
          isResizing && "bg-transparent"
        )}
        onMouseDown={handleMouseDown}
      >
        {/* Vertical line indicator */}
        <div className={cn(
          "absolute left-1 top-4 bottom-4 w-px bg-transparent group-hover:transparent transition-colors rounded-full",
          isResizing && "bg-transparent"
        )} />
        <GripVertical className="w-3 h-3 text-transparent group-hover:transparent relative z-10" />
      </div>

      {/* Panel Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 border-b rounded-tr-xl bg-white">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <span className="text-xl text-gray-900">AI Assistant</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={closePanel}
            title="Close AI Assistant"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Current Context */}
        <div className="px-4 py-3 bg-gray-50 border-b">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FolderOpen className="h-4 w-4" />
            <span>Analyzing: </span>
            <span className="font-medium text-gray-900 truncate">
              {currentContext.title}
            </span>
          </div>
        </div>

        {/* Suggested Prompts */}
        <div className="px-4 py-3 border-b">
          <div className="flex gap-2 flex-wrap">
            {suggestedPrompts.map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => handlePromptClick(prompt)}
              >
                <FileText className="h-3 w-3" />
                {prompt}
              </Button>
            ))}
          </div>
        </div>

        {/* Chat Messages Area */}
        <ScrollArea className="flex-1" ref={scrollAreaRef}>
          <div className="p-4">
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
                    {message.role !== "user" && (
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          {message.role === "system" ? (
                            <Sparkles className="h-4 w-4 text-primary" />
                          ) : (
                            <Bot className="h-4 w-4 text-primary" />
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div
                      className={cn(
                        "max-w-[85%] rounded-lg px-4 py-2",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : message.role === "system"
                          ? "bg-blue-50 text-blue-900"
                          : "bg-muted"
                      )}
                    >
                      {message.role === "assistant" || message.role === "system" ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown>
                            {message.content || "Thinking..."}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm">{message.content}</p>
                      )}
                      
                      <div className="text-xs opacity-70 mt-1">
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
          </div>
        </ScrollArea>

        {/* Question Input */}
        <div className="border-t p-4 rounded-br-xl bg-white mt-auto">
          <div className="flex gap-2">
            <Textarea
              placeholder="Ask about your vault files..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="resize-none h-20"
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
            {isLoading ? (
              <Button
                variant="destructive"
                onClick={cancelRequest}
                className="self-end"
              >
                <X className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleAskQuestion}
                disabled={!question.trim()}
                className="self-end"
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="mt-2 text-xs text-gray-500">
            AI can make mistakes, so double-check responses.
          </div>
        </div>
      </div>
    </div>
  );
}