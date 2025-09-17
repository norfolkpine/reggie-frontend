"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Folder, File } from "lucide-react";
import { VaultFile } from "@/types/api";

interface DeleteFolderConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folder: VaultFile | null;
  childrenCount: number;
  onConfirmDelete: () => void;
  isDeleting?: boolean;
}

export function DeleteFolderConfirmationDialog({
  open,
  onOpenChange,
  folder,
  childrenCount,
  onConfirmDelete,
  isDeleting = false
}: DeleteFolderConfirmationDialogProps) {
  if (!folder) return null;

  const handleConfirm = () => {
    onConfirmDelete();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Folder
          </DialogTitle>
          <DialogDescription className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Folder className="h-5 w-5 text-blue-500" />
              <span className="font-medium">{folder.original_filename}</span>
            </div>
            
            {childrenCount > 0 ? (
              <div className="space-y-2">
                <p className="font-medium text-destructive">
                  This folder contains {childrenCount} item(s).
                </p>
                <p>
                  Deleting this folder will permanently remove:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                  <li>The folder "{folder.original_filename}"</li>
                  <li>All files and subfolders inside it</li>
                  <li>This action cannot be undone</li>
                </ul>
              </div>
            ) : (
              <p>
                Are you sure you want to delete the folder "{folder.original_filename}"?
                This action cannot be undone.
              </p>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : `Delete${childrenCount > 0 ? ` All (${childrenCount + 1})` : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}