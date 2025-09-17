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
  GripVertical,
  User,
  Bot
} from "lucide-react";
import { useAiPanel } from "@/contexts/ai-panel-context";
import { cn } from "@/lib/utils";
import { CustomChat } from "@/features/vault/components/vault-chat";

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

  const resizeRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

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

        {/* Chat Messages Area */}
        <div className="flex-1 flex flex-col min-h-0">
          <CustomChat
            agentId=""
            sessionId={undefined}
          />
        </div>

      </div>
    </div>
  );
}