"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  X,
  FolderOpen
} from "lucide-react";
import { useRightSection } from "@/hooks/use-right-section";
import { VaultChat } from "@/features/vault/components/vault-chat";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

interface AiLayoutPanelProps {
  contextData?: {
    title: string;
    files: any[];
    folderId: number;
    projectId: string;
  };
}

export function AiLayoutPanel({ contextData }: AiLayoutPanelProps) {
  const { hideRightSection } = useRightSection();
  const currentContext = contextData;

  const chatMessagesRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    // Handle scroll events if needed
  };

  const handleClose = () => {
    console.log('AI Layout Panel close button clicked');
    hideRightSection();
  };

  return (
    <div className="flex bg-card rounded-xl border border-border shadow-sm mr-2 my-2" style={{ height: 'calc(100% - 1rem)' }}>
      {/* Panel Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="py-2 px-3 flex items-center justify-between w-full border-b border-border">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              
              <h1 className="text-xl font-medium text-foreground">AI Assistant</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Button clicked directly');
                handleClose();
              }}
              title="Close AI Assistant"
              className="p-2 rounded-md hover:bg-muted hover:text-foreground z-50 relative bg-background"
              style={{ zIndex: 9999 }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Current Context */}
        <div className="px-4 py-3 bg-muted/50 border-b border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FolderOpen className="h-4 w-4" />
            <span>Analyzing: </span>
            <span className="font-medium text-foreground truncate">
              {currentContext?.title || "No context"}
            </span>
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 relative min-h-0">
          <div
            ref={chatMessagesRef}
            className="absolute inset-0 overflow-y-auto scroll-smooth px-2"
            style={{ scrollBehavior: 'smooth' }}
            onScroll={handleScroll}
          >
            <VaultChat
              agentId={`vault_${currentContext?.projectId || ""}`}
              projectId={currentContext?.projectId || ""}
              folderId={currentContext?.folderId?.toString()}
              fileIds={currentContext?.files?.map(file => file.id?.toString()).filter(Boolean) || []}
              sessionId={undefined}
              contextData={currentContext}
            />
          </div>
        </div>

      </div>
    </div>
  );
}