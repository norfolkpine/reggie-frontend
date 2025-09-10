"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  GripVertical
} from "lucide-react";
import { useAiPanel } from "@/contexts/ai-panel-context";
import { cn } from "@/lib/utils";

const MIN_WIDTH = 450;
const MAX_WIDTH = 800;

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
  const [aiResponse, setAiResponse] = useState("");
  const [suggestedPrompts] = useState([
    "Explore these files",
    "List key info for each file", 
    "Ask about this folder"
  ]);

  const resizeRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  // Auto-generate initial insights when panel opens
  useEffect(() => {
    if (isOpen && !aiResponse) {
      generateInitialInsights();
    }
  }, [isOpen]);

  const generateInitialInsights = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const fileCount = currentContext.files?.length || 0;
      
      let insights = `Happy to help you analyze "${currentContext.title}".\n\n`;
      
      if (fileCount > 0) {
        insights += `This location contains ${fileCount} items. `;
        insights += `I can help you understand the contents, find specific information, or organize your files.\n\n`;
        insights += `**What would you like to know?**\n\n`;
        insights += `• Get summaries of documents\n`;
        insights += `• Find specific information across files\n`;
        insights += `• Organize and categorize content\n`;
        insights += `• Extract key insights and patterns`;
      } else {
        insights += `This appears to be an empty location or I don't have access to the file details yet.\n\n`;
        insights += `You can ask me questions about your files, and I'll help analyze and organize your content.`;
      }
      
      setAiResponse(insights);
    } catch (error) {
      setAiResponse("Failed to generate insights. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) return;
    
    setIsLoading(true);
    try {
      // Simulate AI response - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response = `Based on your question "${question}" about ${currentContext.title}:\n\nI can see ${currentContext.files?.length || 0} items in this context. This appears to be ${currentContext.projectId ? 'a project workspace' : 'a file collection'} with various content types.\n\nWould you like me to provide more specific insights about any particular files or aspects of this ${currentContext.title}?`;
      
      setAiResponse(response);
      setQuestion("");
    } catch (error) {
      setAiResponse("Failed to get AI response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromptClick = (prompt: string) => {
    setQuestion(prompt);
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

        {/* AI Response Area */}
        <ScrollArea className="flex-1">
          <div className="p-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : aiResponse ? (
              <div className="prose prose-sm max-w-none">
                <div className="space-y-4">
                  {aiResponse.split('\n').map((line, index) => {
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return (
                        <h3 key={index} className="font-semibold text-gray-900 mt-4">
                          {line.replace(/\*\*/g, '')}
                        </h3>
                      );
                    } else if (line.startsWith('•')) {
                      return (
                        <div key={index} className="flex items-start gap-2 ml-4">
                          <ChevronRight className="h-4 w-4 text-gray-400 mt-0.5" />
                          <span className="text-gray-700">{line.substring(1).trim()}</span>
                        </div>
                      );
                    } else if (line.trim()) {
                      return (
                        <p key={index} className="text-gray-700">
                          {line}
                        </p>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Ask a question about your files or select a suggested prompt above.
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Question Input */}
        <div className="border-t p-4 rounded-br-xl bg-white mt-auto">
          <div className="flex gap-2">
            <Textarea
              placeholder="Enter a prompt here"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="resize-none h-20"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAskQuestion();
                }
              }}
            />
            <Button
              onClick={handleAskQuestion}
              disabled={!question.trim() || isLoading}
              className="self-end"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            AI can make mistakes, so double-check responses.
          </div>
        </div>
      </div>
    </div>
  );
}