"use client";

import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";

interface BulkActionsProps {
  selectedFilesCount: number;
  isDeleting: boolean;
  onBulkDelete: () => void;
}

export function BulkActions({
  selectedFilesCount,
  isDeleting,
  onBulkDelete
}: BulkActionsProps) {
  if (selectedFilesCount === 0) {
    return null;
  }

  return (
    <Button
      variant="destructive"
      onClick={onBulkDelete}
      disabled={isDeleting}
    >
      {isDeleting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          <span className="button-text">Deleting...</span>
        </>
      ) : (
        <>
          <Trash2 className="mr-2 h-4 w-4" />
          <span className="button-text">Delete Selected ({selectedFilesCount})</span>
        </>
      )}
    </Button>
  );
}
