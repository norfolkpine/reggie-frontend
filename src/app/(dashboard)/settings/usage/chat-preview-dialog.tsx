import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils"
import { MarkdownRenderer } from "@/components/ui/markdown-renderer"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ChatPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user_message: string;
  assistant_message: string;
}

export function ChatPreviewDialog({ 
  open, 
  user_message,
  assistant_message,
  onOpenChange, 
}: ChatPreviewDialogProps) {
  const { toast } = useToast();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full">
        <DialogHeader>
          <DialogTitle>Chat Preview</DialogTitle>
          <DialogDescription>
            You can see the conversation of this chatting.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[500px] p-4">
          <div className="space-y-4">
            <div
              className={`flex gap-3 flex-row-reverse`}
            >
              <div className={`flex flex-col gap-1 items-end`}>
                <div className={`rounded-lg px-3 py-2 max-w-[450px] bg-primary text-primary-foreground`}>
                  <p className="text-sm">{user_message}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4 mt-5">
            <div
              className={`flex gap-3`}
            >
              <div className={`flex flex-col gap-1 items-start`}>
                <div className={`rounded-lg px-3 py-2 max-w-[450px] bg-muted`}>
                  <p className="text-sm">{assistant_message}</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="mt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
