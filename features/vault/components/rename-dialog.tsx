"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface RenameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  currentName: string;
  newName: string;
  onNameChange: (name: string) => void;
  onConfirm: () => void;
  isLoading: boolean;
  placeholder?: string;
}

export function RenameDialog({
  open,
  onOpenChange,
  title,
  description,
  currentName,
  newName,
  onNameChange,
  onConfirm,
  isLoading,
  placeholder = "New name"
}: RenameDialogProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim() && newName.trim() !== currentName) {
      onConfirm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClick={e => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription>
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Input
            value={newName}
            onChange={e => onNameChange(e.target.value)}
            placeholder={placeholder}
            autoFocus
          />
          <DialogFooter className="mt-4">
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={onConfirm}
              disabled={isLoading || !newName.trim() || newName.trim() === currentName}
            >
              {isLoading ? "Renaming..." : "Rename"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
