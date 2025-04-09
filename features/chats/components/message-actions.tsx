import { Button } from "@/components/ui/button";
import { Check, Copy, ThumbsUp, ThumbsDown, Volume2, RefreshCw, BookOpen, Pencil, MoreHorizontal } from "lucide-react";

export interface MessageActionsProps {
    messageId: string;
    content: string;
    onCopy: (text: string, messageId: string) => Promise<void>;
    copiedMessageId: string | null;
    onSendToJournal: (text: string, messageId: string) => void;
    onOpenCanvas: (messageId: string) => void;
  }
  
 export default function MessageActions({
    messageId,
    content,
    onCopy,
    copiedMessageId,
    onSendToJournal,
    onOpenCanvas,
  }: MessageActionsProps) {
    return (
      <div className="flex items-center gap-2 mt-2 -mb-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          onClick={() => onCopy(content, messageId)}
          title="Copy to clipboard"
        >
          {copiedMessageId === messageId ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          title="Good response"
        >
          <ThumbsUp className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          title="Bad response"
        >
          <ThumbsDown className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          title="Read aloud"
        >
          <Volume2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          title="Regenerate response"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          onClick={() => onSendToJournal(content, messageId)}
          title="Send to journal"
        >
          <BookOpen className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          onClick={() => onOpenCanvas(messageId)}
          title="Open canvas"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          title="More actions"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    );
  }
  