"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileUpload } from "./file-upload";

interface FileUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onUploadComplete: (uploadedFiles: any[]) => void;
}

export function FileUploadDialog({
  open,
  onOpenChange,
  projectId,
  onUploadComplete
}: FileUploadDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Files to Vault</DialogTitle>
          <DialogDescription>
            Upload files to your vault. Supported formats include PDF, DOCX, XLSX, TXT, CSV, JPEG, and PNG.
          </DialogDescription>
        </DialogHeader>
        <FileUpload
          onUploadComplete={onUploadComplete}
          projectId={projectId}
        />
      </DialogContent>
    </Dialog>
  );
}
