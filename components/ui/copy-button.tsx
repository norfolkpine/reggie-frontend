import * as React from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CopyButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  value?: string;
}

export function CopyButton({ value, className, ...props }: CopyButtonProps) {
  const [hasCopied, setHasCopied] = React.useState(false);

  React.useEffect(() => {
    if (hasCopied) {
      const timeout = setTimeout(() => setHasCopied(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [hasCopied]);

  const handleCopy = async (e: React.MouseEvent<HTMLButtonElement>) => {
    try {
      let textToCopy = value;
      if (!textToCopy || textToCopy.trim() === "") {
        // Fallback: grab nearest <pre> ancestor text
        const pre = (e.currentTarget as HTMLElement).closest("pre");
        if (pre) {
          textToCopy = pre.innerText;
        }
      }
      if (textToCopy) {
        await navigator.clipboard.writeText(textToCopy);
      }
      setHasCopied(true);
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };

  return (
    <Button
      size="icon"
      variant="ghost"
      className="h-8 w-8 hover:bg-muted"
      onClick={handleCopy}
      {...props}
    >
      {hasCopied ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
      <span className="sr-only">Copy code</span>
    </Button>
  );
}