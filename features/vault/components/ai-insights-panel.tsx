"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Sparkles, 
  X, 
  FileText, 
  Key, 
  FolderOpen,
  ChevronRight,
  Loader2,
  Send,
  Minimize2,
  Maximize2,
  Expand,
  Shrink
} from "lucide-react";
import { VaultFile as BaseVaultFile } from "@/types/api";
import { cn } from "@/lib/utils";

// Extended VaultFile interface with additional properties from the API response
interface VaultFile extends BaseVaultFile {
  filename?: string;
  original_filename?: string;
  size?: number;
  type?: number;
  file_type?: string; // This is derived from the filename extension or MIME type for filtering
}

interface AiInsightsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFiles: VaultFile[];
  currentFolder: string;
  projectName: string;
  projectId: string;
  currentFolderId: number;
  onAskQuestion: (question: string) => Promise<string>;
}

export function AiInsightsPanel({
  isOpen,
  onClose,
  selectedFiles,
  currentFolder,
  projectName,
  projectId,
  currentFolderId,
  onAskQuestion
}: AiInsightsPanelProps) {
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [suggestedPrompts] = useState([
    "Explore these files",
    "List key info for each file",
    "Ask about this folder"
  ]);

  // Auto-generate initial insights when panel opens
  useEffect(() => {
    if (isOpen && !aiResponse) {
      generateInitialInsights();
    }
  }, [isOpen]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      // ESC to close panel
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
      
      if (e.key === 'F11') {
        e.preventDefault();
        setIsFullscreen(!isFullscreen);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFullscreen, onClose]);

  const generateInitialInsights = async () => {
    setIsLoading(true);
    try {
      // Simulate AI response - in real implementation, this would call the backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const folderCount = selectedFiles.filter(f => f.is_folder === 1).length;
      const fileCount = selectedFiles.filter(f => f.is_folder !== 1).length;
      
      let insights = `Happy to help you analyze the "${currentFolder || projectName}" folder.\n\n`;
      insights += `The "${currentFolder || projectName}" folder contains ${fileCount} files and ${folderCount} folders. `;
      
      if (fileCount > 0) {
        const fileTypes = getFileTypes(selectedFiles);
        insights += `Based on a review of ${fileCount} files, it appears to be a comprehensive collection of ${fileTypes}. `;
      }
      
      insights += `\n\nHere's an in-depth review of the content:\n\n`;
      insights += `**Overview of Folder Structure:**\n\n`;
      
      // Group files by type
      const groupedFiles = groupFilesByType(selectedFiles);
      Object.entries(groupedFiles).forEach(([type, files]) => {
        if (files.length > 0) {
          insights += `• **${type}** (${files.length} items)\n`;
        }
      });
      
      setAiResponse(insights);
    } catch (error) {
      setAiResponse("Failed to generate insights. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getFileTypes = (files: VaultFile[]) => {
    const types = new Set<string>();
    files.forEach(file => {
      if (file.is_folder !== 1) {
        const ext = file.original_filename?.split('.').pop()?.toLowerCase();
        if (ext) {
          if (['pdf', 'doc', 'docx'].includes(ext)) types.add('documents');
          if (['xls', 'xlsx', 'csv'].includes(ext)) types.add('spreadsheets');
          if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) types.add('images');
          if (['txt', 'md'].includes(ext)) types.add('text files');
        }
      }
    });
    return Array.from(types).join(', ') || 'various files';
  };

  const groupFilesByType = (files: VaultFile[]) => {
    const grouped: Record<string, VaultFile[]> = {
      'Documents': [],
      'Spreadsheets': [],
      'Images': [],
      'Folders': [],
      'Other': []
    };
    
    files.forEach(file => {
      if (file.is_folder === 1) {
        grouped['Folders'].push(file);
      } else {
        const ext = file.original_filename?.split('.').pop()?.toLowerCase();
        if (['pdf', 'doc', 'docx'].includes(ext || '')) {
          grouped['Documents'].push(file);
        } else if (['xls', 'xlsx', 'csv'].includes(ext || '')) {
          grouped['Spreadsheets'].push(file);
        } else if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) {
          grouped['Images'].push(file);
        } else {
          grouped['Other'].push(file);
        }
      }
    });
    
    return grouped;
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await onAskQuestion(question);
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

  if (!isOpen) return null;

  return (
    <>
      {isFullscreen && (
        <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setIsFullscreen(false)} />
      )}
      
      <div 
        className={cn(
          "fixed bg-white border shadow-xl transition-all duration-300 z-50",
          isFullscreen
            ? "inset-4 rounded-lg"
            : "right-0 top-0 h-full border-l",
          !isFullscreen && (isExpanded ? "w-[700px]" : "w-[500px]")
        )}
      >
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          <span className="font-semibold">AI Insights</span>
        </div>
        <div className="flex items-center gap-2">
          {!isFullscreen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? <Shrink className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            title="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="px-4 py-3 bg-gray-50 border-b">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FolderOpen className="h-4 w-4" />
          <span>Analyzing: </span>
          <span className="font-medium text-gray-900">{currentFolder || projectName}</span>
        </div>
      </div>

      <div className="px-4 py-3 border-b">
        <div className={cn(
          "flex gap-2 flex-wrap",
          isFullscreen && "justify-center"
        )}>
          {suggestedPrompts.map((prompt, index) => (
            <Button
              key={index}
              variant="outline"
              size={isFullscreen ? "default" : "sm"}
              className="flex items-center gap-2"
              onClick={() => handlePromptClick(prompt)}
            >
              <FileText className={cn(
                isFullscreen ? "h-4 w-4" : "h-3 w-3"
              )} />
              {prompt}
            </Button>
          ))}
        </div>
      </div>

      <ScrollArea className={cn(
        "flex-1",
        isFullscreen 
          ? "h-[calc(100vh-320px)]" 
          : "h-[calc(100vh-280px)]"
      )}>
        <div className={cn(
          "p-4",
          isFullscreen && "p-6 max-w-4xl mx-auto"
        )}>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className={cn(
                "animate-spin text-blue-600",
                isFullscreen ? "h-12 w-12" : "h-8 w-8"
              )} />
            </div>
          ) : aiResponse ? (
            <div className={cn(
              "prose max-w-none",
              isFullscreen ? "prose-lg" : "prose-sm"
            )}>
              <div className="space-y-4">
                {aiResponse.split('\n').map((line, index) => {
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return (
                      <h3 key={index} className={cn(
                        "font-semibold text-gray-900 mt-4",
                        isFullscreen && "text-lg"
                      )}>
                        {line.replace(/\*\*/g, '')}
                      </h3>
                    );
                  } else if (line.startsWith('•')) {
                    return (
                      <div key={index} className="flex items-start gap-2 ml-4">
                        <ChevronRight className="h-4 w-4 text-gray-400 mt-0.5" />
                        <span className={cn(
                          "text-gray-700",
                          isFullscreen && "text-base"
                        )}>{line.substring(1).trim()}</span>
                      </div>
                    );
                  } else if (line.trim()) {
                    return (
                      <p key={index} className={cn(
                        "text-gray-700",
                        isFullscreen && "text-base leading-relaxed"
                      )}>
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
              <div className={cn(
                isFullscreen && "text-lg"
              )}>
                Ask a question about your files or select a suggested prompt above.
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <div className="flex gap-2">
          <Textarea
            placeholder="Enter a prompt here"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className={cn(
              "resize-none",
              isFullscreen ? "h-24" : "h-20"
            )}
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
    </>
  );
}