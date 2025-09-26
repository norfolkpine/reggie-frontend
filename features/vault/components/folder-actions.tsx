"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FolderPlus, Plus, FileText, UploadCloud } from "lucide-react";

interface FolderActionsProps {
  onCreateFolder: () => void;
  onUploadFile: () => void;
  onGoogleDriveClick: () => void;
}

export function FolderActions({
  onCreateFolder,
  onUploadFile,
  onGoogleDriveClick
}: FolderActionsProps) {
  return (
    <div className="flex items-center space-x-2">
      <Button onClick={onCreateFolder} size={'sm'}>
        <span className="button-text">New Folder</span>
        <FolderPlus className="h-4 w-4 ml-0 sm:ml-2" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size={'sm'}>
            <span className="button-text">Upload</span>
            <Plus className="h-4 w-4 ml-0 sm:ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onUploadFile}>
            <FileText className="h-4 w-4 mr-2" />
            File
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onGoogleDriveClick}>
            <UploadCloud className="h-4 w-4 mr-2" />
            Google Drive
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
