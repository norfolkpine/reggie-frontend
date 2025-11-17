import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy, ThumbsUp, ThumbsDown, Volume2, RefreshCw, BookOpen, Pencil, MoreHorizontal, Send, Square } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { IconBrandGoogleDrive } from "@tabler/icons-react";
import { FeedbackForm } from "./feedback-form";
import { ActionButton } from "./action-button";
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis";

export interface MessageActionsProps {
    messageId: string;
    content: string;
    onCopy: (text: string, messageId: string) => Promise<void>;
    copiedMessageId: string | null;
    onSend: (id: 'google-drive' | 'journal' ,text: string, messageId: string) => void;
    onOpenCanvas: (messageId: string) => void;
    isGood?: boolean;
    isBad?: boolean;
    onGoodResponse?: (messageId: string, feedback?: { type: string; text: string }) => void;
    onBadResponse?: (messageId: string, feedback?: { type: string; text: string }) => void;
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
    const [showFeedbackForm, setShowFeedbackForm] = useState<boolean>(false);
    const [feedbackType, setFeedbackType] = useState<'good' | 'bad'>('bad');
    const { isPlaying, play, stop } = useSpeechSynthesis({});

    useEffect(() => {
        if (isGood !== localGood) setLocalGood(isGood);
        if (isBad !== localBad) setLocalBad(isBad);
    }, [isGood, isBad]);

    const handleGood = () => {
        setFeedbackType('good');
        setShowFeedbackForm(true);
    };
    
    const handleBad = () => {
        setFeedbackType('bad');
        setShowFeedbackForm(true);
    };

    const handleFeedbackSubmit = (feedback: { type: string; text: string }) => {
        if (feedbackType === 'good') {
            setLocalGood(true);
            setLocalBad(false);
            onGoodResponse && onGoodResponse(messageId, feedback);
        } else {
            setLocalBad(true);
            setLocalGood(false);
            onBadResponse && onBadResponse(messageId, feedback);
        }
    };

    const handleReadAloud = () => {
        if (isPlaying) {
            stop();
        } else {
            play(content);
        }
    };

    const showGood = localGood || isGood;
    const showBad = localBad || isBad;

    return (
      <>
        <div className="flex items-center gap-2 relative z-10">
          <ActionButton
            icon={Copy}
            activeIcon={Check}
            isActive={copiedMessageId === messageId}
            onClick={() => onCopy(content, messageId)}
            title="Copy to clipboard"
          />
          <ActionButton
            icon={ThumbsUp}
            isActive={showGood}
            onClick={handleGood}
            title="Good response"
            className={showGood ? "text-yellow-500 hover:text-yellow-600" : ""}
          />
          <ActionButton
            icon={ThumbsDown}
            isActive={showBad}
            onClick={handleBad}
            title="Bad response"
            className={showBad ? "text-yellow-500 hover:text-yellow-600" : ""}
          />
          <ActionButton
            icon={Volume2}
            activeIcon={Square}
            isActive={isPlaying}
            onClick={handleReadAloud}
            title={isPlaying ? "Stop reading" : "Read aloud"}
          />
          <ActionButton
            icon={RefreshCw}
            title="Regenerate response"
          />
          <Popover>
            <PopoverTrigger asChild>
              <ActionButton
                icon={Send}
                title="Send to..."
              />
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
          <ActionButton
            icon={Pencil}
            onClick={() => onOpenCanvas(messageId)}
            title="Open canvas"
          />
          <ActionButton
            icon={MoreHorizontal}
            title="More actions"
          />
        </div>

        {showFeedbackForm && (
          <FeedbackForm
            isOpen={showFeedbackForm}
            onClose={() => setShowFeedbackForm(false)}
            onSubmit={handleFeedbackSubmit}
            messageId={messageId}
            feedbackType={feedbackType}
          />
        )}
      </>
    );
}
  