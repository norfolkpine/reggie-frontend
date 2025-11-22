"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

interface WorkflowResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: {
    status: string;
    result?: string;
    error?: string;
  } | null;
}

export function WorkflowResultDialog({ open, onOpenChange, result }: WorkflowResultDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[50vh] overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Workflow Execution Result</DialogTitle>
          <DialogDescription>
            Status: {result?.status || 'Unknown'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 min-h-0 overflow-y-auto p-4 bg-gray-50 rounded-md">
          {result?.error ? (
            <div className="text-red-600 whitespace-pre-wrap">
              <strong>Error:</strong> {result.error}
            </div>
          ) : (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
              >
                {result?.result || 'No result available'}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
