"use client";

import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface AskAIButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function AskAIButton({ onClick, disabled }: AskAIButtonProps) {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-2"
    >
      <Sparkles className="h-4 w-4" />
      <span className="button-text">Ask AI</span>
    </Button>
  );
}
