import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy, ThumbsUp, ThumbsDown, Volume2, RefreshCw, BookOpen, Pencil, MoreHorizontal, Send } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { IconBrandGoogleDrive } from "@tabler/icons-react";

export interface MessageActionsProps {
    messageId: string;
    content: string;
    onCopy: (text: string, messageId: string) => Promise<void>;
    copiedMessageId: string | null;
    onSend: (id: 'google-drive' | 'journal' ,text: string, messageId: string) => void;
    onOpenCanvas: (messageId: string) => void;
    isGood?: boolean;
    isBad?: boolean;
    onGoodResponse?: (messageId: string) => void;
    onBadResponse?: (messageId: string) => void;
}

export default function MessageActions({
    messageId,
    content,
    onCopy,
    copiedMessageId,
    onSend,
    onOpenCanvas,
    onGoodResponse,
    onBadResponse,
    isGood = false,
    isBad = false,
}: MessageActionsProps) {
    const [localGood, setLocalGood] = useState<boolean>(false);
    const [localBad, setLocalBad] = useState<boolean>(false);

    useEffect(() => {
        if (isGood !== localGood) setLocalGood(isGood);
        if (isBad !== localBad) setLocalBad(isBad);
    }, [isGood, isBad]);

    const handleGood = () => {
        setLocalGood(true);
        setLocalBad(false);
        onGoodResponse && onGoodResponse(messageId);
    };
    const handleBad = () => {
        setLocalBad(true);
        setLocalGood(false);
        onBadResponse && onBadResponse(messageId);
    };
    const showGood = localGood || isGood;
    const showBad = localBad || isBad;

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
          className={`h-8 w-8 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100`}
          title="Good response"
          onClick={handleGood}
        >
          <ThumbsUp className="h-4 w-4" style={{ fill: showGood ? '#eab308' : 'none' }} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100`}
          title="Bad response"
          onClick={handleBad}
        >
          <ThumbsDown className="h-4 w-4" style={{ fill: showBad ? '#eab308' : 'none' }} />
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
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              title="Send to..."
            >
              <Send className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2">
            <div className="flex flex-col gap-2">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={() => onSend('journal', content, messageId)}
              >
                <BookOpen className="h-4 w-4" />
                Send to Journal
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={() => onSend('google-drive', content, messageId)}
              >
                <IconBrandGoogleDrive className="h-4 w-4" />
                Send to Drive
              </Button>
            </div>
          </PopoverContent>
        </Popover>
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
  