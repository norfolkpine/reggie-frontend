"use client";

import { useRef, useState, useEffect } from "react";
import {
  X,
  FolderOpen
} from "lucide-react";
import { useRightSection } from "@/hooks/use-right-section";
import { VaultChat } from "@/features/vault/components/vault-chat";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getVaultFilesByProject } from "@/api/vault";
import { VaultFile } from "@/features/vault/types/vault";

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

  const [folders, setFolders] = useState<VaultFile[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>(contextData?.folderId?.toString() || "0");

  const chatMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchFolders = async () => {
      if (!contextData?.projectId) return;

      try {
        const response = await getVaultFilesByProject(contextData.projectId, 1, 1000, "", 0);
        const allFolders = response.results.filter((file: VaultFile) => file.is_folder);
        setFolders(allFolders);
      } catch (error) {
        console.error("Error fetching folders:", error);
      }
    };

    fetchFolders();
  }, [contextData?.projectId]);

  useEffect(() => {
    if (contextData?.folderId !== undefined) {
      setSelectedFolderId(contextData.folderId.toString());
    }
  }, [contextData?.folderId]);

  const handleScroll = () => {
    // Handle scroll events if needed
  };

  const handleClose = () => {
    console.log('AI Layout Panel close button clicked');
    hideRightSection();
  };

  const handleFolderChange = (value: string) => {
    setSelectedFolderId(value);
  };

  const selectedFolder = folders.find(f => f.id.toString() === selectedFolderId);
  const selectedFolderTitle = selectedFolderId === "0"
    ? "Root Folder"
    : selectedFolder?.original_filename || "Current Folder";

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
              className="p-2 rounded-md hover:bg-muted hover:text-foreground z-40 relative bg-background"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Current Context */}
        <div className="px-4 py-3 bg-muted/50 border-b border-border">
          <div className="flex items-center gap-2 text-sm">
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Analyzing: </span>
            <Select value={selectedFolderId} onValueChange={handleFolderChange}>
              <SelectTrigger className="h-8 flex-1 max-w-xs">
                <SelectValue>
                  <span className="font-medium truncate">
                    {selectedFolderTitle}
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">
                  {"Root Folder"}
                </SelectItem>
                {folders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id.toString()}>
                    {folder.original_filename || `Folder ${folder.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              folderId={selectedFolderId}
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