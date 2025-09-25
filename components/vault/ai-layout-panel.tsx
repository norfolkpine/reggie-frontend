"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  X,
  FolderOpen
} from "lucide-react";
import { useAiPanel } from "@/contexts/ai-panel-context";
import { VaultChat } from "@/features/vault/components/vault-chat";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

export function AiLayoutPanel() {
  const {
    isOpen,
    currentContext,
    closePanel
  } = useAiPanel();

  const chatMessagesRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    // Handle scroll events if needed
  };

  if (!isOpen) return null;

  return (
    <div className="flex h-full bg-white rounded-xl border shadow-sm">
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
        <div className="flex-1 relative min-h-0">
          <div 
            ref={chatMessagesRef}
            className="absolute inset-0 overflow-y-auto scroll-smooth px-2"
            style={{ scrollBehavior: 'smooth' }}
            onScroll={handleScroll}
          >
            <VaultChat
              agentId = {`vault_${currentContext.projectId}` || ""}
              projectId={currentContext.projectId || ""}
              folderId={currentContext.folderId?.toString()}
              fileIds={currentContext.files?.map(file => file.id?.toString()).filter(Boolean)}
              sessionId={undefined}
            />
          </div>
        </div>

      </div>
    </div>
  );
}