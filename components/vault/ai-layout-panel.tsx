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
    hideRightSection();
  };

  return (
    <div className="flex h-full bg-card rounded-xl border border-border shadow-sm">
      {/* Panel Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 border-b border-border rounded-t-xl bg-card">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-xl text-card-foreground">AI Assistant</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            title="Close AI Assistant"
          >
            <X className="h-4 w-4" />
          </Button>
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