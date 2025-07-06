"use client"

import React, { useMemo, useState } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "framer-motion"
import { Ban, ChevronRight, Code2, Loader2, Terminal, Timer, CheckCircle, AlertCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { FilePreview } from "@/components/ui/file-preview"
import { MarkdownRenderer } from "@/components/ui/markdown-renderer"

const chatBubbleVariants = cva(
  "group/message relative break-words rounded-lg p-3 text-sm sm:max-w-[70%]",
  {
    variants: {
      isUser: {
        true: "bg-primary text-primary-foreground",
        false: "bg-muted text-foreground",
      },
      animation: {
        none: "",
        slide: "duration-300 animate-in fade-in-0",
        scale: "duration-300 animate-in fade-in-0 zoom-in-75",
        fade: "duration-500 animate-in fade-in-0",
      },
    },
    compoundVariants: [
      {
        isUser: true,
        animation: "slide",
        class: "slide-in-from-right",
      },
      {
        isUser: false,
        animation: "slide",
        class: "slide-in-from-left",
      },
      {
        isUser: true,
        animation: "scale",
        class: "origin-bottom-right",
      },
      {
        isUser: false,
        animation: "scale",
        class: "origin-bottom-left",
      },
    ],
  }
)

type Animation = VariantProps<typeof chatBubbleVariants>["animation"]

interface Attachment {
  name?: string
  contentType?: string
  url: string
}

// Updated ToolInvocation to match useAgentChat and desired display
export interface ToolInvocation {
  toolCallId?: string; // Optional: if you want to display it
  toolName: string;
  args?: any; // Arguments used for the tool call
  state: "partial-call" | "call" | "result"; // State of the tool call
  result?: {
    __cancelled?: boolean;
    [key: string]: any; // The actual result from the tool
  };
  duration?: number; // Time taken for the tool call
  confidence?: number; // Confidence score for the tool call
}
// Keep PartialToolCall, ToolCall (as state), ToolResult (as state) if they are used internally for state transitions,
// but the primary ToolInvocation type for message parts should be the one above.

// Updated ReasoningPart to include new fields
export interface ReasoningPart {
  type: "reasoning";
  reasoning: string; // This will store the main explanation, title, action, confidence combined
  // Individual fields can be parsed from the string or passed separately if structure changes
}

export interface ToolInvocationPart {
  type: "tool-invocation";
  toolInvocation: ToolInvocation; // Uses the updated ToolInvocation type
}

export interface TextPart {
  type: "text";
  text: string;
}

// For compatibility with AI SDK types, not used
export interface SourcePart {
  type: "source";
  source?: any;
}

export interface FilePart {
  type: "file";
  mimeType: string;
  data: string;
}

export interface StepStartPart {
  type: "step-start";
}

export type MessagePart =
  | TextPart
  | ReasoningPart
  | ToolInvocationPart
  | SourcePart
  | FilePart
  | StepStartPart;

export interface Message {
  id: string;
  role: "user" | "assistant" | (string & {});
  content: string; // Fallback or simple text content
  createdAt?: Date;
  experimental_attachments?: Attachment[];
  toolInvocations?: ToolInvocation[]; // Can be a top-level array of tool calls
  parts?: MessagePart[]; // Or tool calls/reasoning can be part of 'parts'
}

export interface ChatMessageProps extends Message {
  showTimeStamp?: boolean;
  animation?: Animation;
  actions?: React.ReactNode;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  role,
  content,
  createdAt,
  showTimeStamp = false,
  animation = "scale",
  actions,
  experimental_attachments,
  toolInvocations, // Top-level tool invocations
  parts, // Structured parts of the message
}) => {
  const files = useMemo(() => {
    return experimental_attachments?.map((attachment) => {
      const dataArray = dataUrlToUint8Array(attachment.url);
      const file = new File([dataArray], attachment.name ?? "Unknown", {
        type: attachment.contentType,
      });
      return file;
    });
  }, [experimental_attachments]);

  const isUser = role === "user";

  const formattedTime = createdAt?.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isUser) {
    return (
      <div
        className={cn("flex flex-col", isUser ? "items-end" : "items-start")}
      >
        {files ? (
          <div className="mb-1 flex flex-wrap gap-2">
            {files.map((file, index) => {
              return <FilePreview file={file} key={index} />;
            })}
          </div>
        ) : null}

        <div className={cn(chatBubbleVariants({ isUser, animation }))}>
          <MarkdownRenderer>{content}</MarkdownRenderer>
        </div>

        {showTimeStamp && createdAt ? (
          <time
            dateTime={createdAt.toISOString()}
            className={cn(
              "mt-1 block px-1 text-xs opacity-50",
              animation !== "none" && "duration-500 animate-in fade-in-0"
            )}
          >
            {formattedTime}
          </time>
        ) : null}
      </div>
    );
  }

  // Assistant messages: Render parts if available, otherwise fallback to content
  // ToolInvocations can also be at the top level of the message object
  // We'll prioritize rendering parts, then top-level toolInvocations if parts are empty/not relevant

  const hasRenderableParts = parts && parts.some(part => part.type === 'text' || part.type === 'reasoning' || part.type === 'tool-invocation');

  if (hasRenderableParts) {
    return (
      <>
        {parts!.map((part, index) => {
          switch (part.type) {
            case "text":
              return (
                <div
                  className={cn("flex flex-col items-start")} // Assistant messages are always items-start
                  key={`text-${index}`}
                >
                  <div className={cn(chatBubbleVariants({ isUser: false, animation }))}>
                    <MarkdownRenderer>{part.text}</MarkdownRenderer>
                    {actions && index === parts!.length -1 /* Show actions only on last part potentially */ ? (
                      <div className="absolute -bottom-4 right-2 flex space-x-1 rounded-lg border bg-background p-1 text-foreground opacity-0 transition-opacity group-hover/message:opacity-100">
                        {actions}
                      </div>
                    ) : null}
                  </div>
                  {showTimeStamp && createdAt && index === parts!.length -1 /* Show timestamp only on last part */ ? (
                     <time dateTime={createdAt.toISOString()} className={cn("mt-1 block px-1 text-xs opacity-50", animation !== "none" && "duration-500 animate-in fade-in-0")}>
                       {formattedTime}
                     </time>
                   ) : null}
                </div>
              );
            case "reasoning":
              return <ReasoningBlock key={`reasoning-${index}`} part={part} />;
            case "tool-invocation":
              // Render a single tool invocation part
              return <SingleToolCallDisplay key={`tool-invocation-${index}`} invocation={part.toolInvocation} />;
            default:
              return null;
          }
        })}
      </>
    );
  }

  // If no structured parts, but top-level toolInvocations exist, render them
  if (toolInvocations && toolInvocations.length > 0) {
    return <MultiToolCallDisplay toolInvocations={toolInvocations} />;
  }

  // Fallback for simple assistant message content if no parts or toolInvocations
  return (
    <div className={cn("flex flex-col items-start")}>
      <div className={cn(chatBubbleVariants({ isUser: false, animation }))}>
        <MarkdownRenderer>{content}</MarkdownRenderer>
        {actions ? (
          <div className="absolute -bottom-4 right-2 flex space-x-1 rounded-lg border bg-background p-1 text-foreground opacity-0 transition-opacity group-hover/message:opacity-100">
            {actions}
          </div>
        ) : null}
      </div>
      {showTimeStamp && createdAt ? (
        <time
          dateTime={createdAt.toISOString()}
          className={cn(
            "mt-1 block px-1 text-xs opacity-50",
            animation !== "none" && "duration-500 animate-in fade-in-0"
          )}
        >
          {formattedTime}
        </time>
      ) : null}
    </div>
  );
};

function dataUrlToUint8Array(data: string) {
  const base64 = data.split(",")[1];
  const buf = Buffer.from(base64, "base64");
  return new Uint8Array(buf);
}

const ReasoningBlock = ({ part }: { part: ReasoningPart }) => {
  const [isOpen, setIsOpen] = useState(true); // Default to open

  // Attempt to parse title, action, confidence from the reasoning string
  let title = "Thinking";
  let action = "";
  let confidence = "";
  let explanation = part.reasoning;

  const lines = part.reasoning.split('\n');
  if (lines.length > 1) { // Check if there are lines to parse
    const titleMatch = lines[0].match(/^Title: (.*)/);
    if (titleMatch) title = titleMatch[1];

    const actionMatch = lines.find(line => line.startsWith("Action:"));
    if (actionMatch) action = actionMatch.substring("Action: ".length);

    const confidenceMatch = lines.find(line => line.startsWith("Confidence:"));
    if (confidenceMatch) confidence = confidenceMatch.substring("Confidence: ".length);

    // The rest is explanation
    const explanationLines = [];
    let foundExplanationStart = false;
    for (const line of lines) {
        if (foundExplanationStart) {
            explanationLines.push(line);
        } else if (line.trim() === "" && !action && !confidence) {
            // Heuristic: if an empty line appears after title and no action/confidence, assume rest is explanation
            foundExplanationStart = true;
        } else if (line.startsWith("Confidence:")) { // Explanation starts after confidence
            foundExplanationStart = true;
        }
    }
    if (explanationLines.length > 0) {
        explanation = explanationLines.join("\n").trim();
    } else if (!action && !confidence && lines.length > (titleMatch ? 1 : 0)) {
        // If no action/confidence, and there's more than just a title line, assume the rest (or all if no title) is explanation
        explanation = lines.slice(titleMatch ? 1 : 0).join("\n").trim();
    }
  }


  return (
    <div className="mb-2 flex w-full flex-col items-start sm:max-w-[85%]"> {/* Increased width slightly */}
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="group w-full overflow-hidden rounded-lg border bg-muted/80" // Slightly less muted
      >
        <CollapsibleTrigger asChild>
          <button className="flex w-full items-center justify-between p-3 text-sm hover:bg-muted/90">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ChevronRight className={cn("h-4 w-4 transition-transform", isOpen && "rotate-90")} />
              <span className="font-medium text-foreground">{title}</span>
            </div>
            {/* Optionally show action or confidence here if needed */}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent forceMount>
          <motion.div
            initial={false}
            animate={isOpen ? "open" : "closed"}
            variants={{
              open: { height: "auto", opacity: 1, marginTop: 0 },
              closed: { height: 0, opacity: 0, marginTop: 0 },
            }}
            transition={{ duration: 0.2, ease: "circOut" }}
            className="border-t border-muted"
          >
            <div className="p-3 text-xs">
              {action && <p className="mb-1"><span className="font-semibold">Action:</span> {action}</p>}
              {confidence && <p className="mb-2"><span className="font-semibold">Confidence:</span> {confidence}</p>}
              {explanation && explanation !== title && ( // Avoid repeating title if it's the only content
                <div className="whitespace-pre-wrap text-muted-foreground">
                  <MarkdownRenderer>{explanation}</MarkdownRenderer>
                </div>
              )}
            </div>
          </motion.div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

// Renamed the original ToolCall to MultiToolCallDisplay for clarity when rendering an array
const MultiToolCallDisplay = ({ toolInvocations }: { toolInvocations: ToolInvocation[] }) => {
  if (!toolInvocations || toolInvocations.length === 0) return null;
  return (
    <div className="flex flex-col items-start gap-2">
      {toolInvocations.map((invocation, index) => (
        <SingleToolCallDisplay key={invocation.toolCallId || index} invocation={invocation} />
      ))}
    </div>
  );
};

// New component to render a single tool invocation, used by parts and MultiToolCallDisplay
const SingleToolCallDisplay = ({ invocation }: { invocation: ToolInvocation }) => {
  const isCancelled = invocation.state === "result" && invocation.result?.__cancelled === true;
  const { toolName, args, state, result, duration, confidence } = invocation;

  if (isCancelled) {
    return (
      <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 text-sm text-muted-foreground sm:max-w-[85%] w-full">
        <Ban className="h-4 w-4 text-destructive" />
        <span>
          Cancelled <span className="font-mono">{`\`${toolName}\``}</span>
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 rounded-lg border bg-muted/80 px-3 py-2 text-sm sm:max-w-[85%] w-full my-1">
      <div className="flex items-center gap-2 text-muted-foreground">
        {state === "call" || state === "partial-call" ? (
          <>
            <Terminal className="h-4 w-4 text-blue-500" />
            <span>Calling <span className="font-mono text-foreground">{`\`${toolName}\``}</span>...</span>
            <Loader2 className="h-3 w-3 animate-spin" />
          </>
        ) : (
          <>
            <Code2 className="h-4 w-4 text-green-500" />
            <span>Result from <span className="font-mono text-foreground">{`\`${toolName}\``}</span></span>
          </>
        )}
      </div>

      {args && Object.keys(args).length > 0 && (
        <div>
          <span className="text-xs font-semibold text-muted-foreground">Arguments:</span>
          <pre className="mt-1 overflow-x-auto whitespace-pre-wrap rounded bg-background/50 p-1.5 text-xs text-foreground">
            {JSON.stringify(args, null, 2)}
          </pre>
        </div>
      )}

      {state === "result" && result && !result.__cancelled && (
        <div>
          <span className="text-xs font-semibold text-muted-foreground">Result:</span>
          <pre className="mt-1 overflow-x-auto whitespace-pre-wrap rounded bg-background/50 p-1.5 text-xs text-foreground">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
        {duration !== undefined && (
          <div className="flex items-center gap-1">
            <Timer className="h-3 w-3" />
            <span>{duration.toFixed(2)}s</span>
          </div>
        )}
        {confidence !== undefined && (
           <div className="flex items-center gap-1">
            {confidence > 0.7 ? <CheckCircle className="h-3 w-3 text-green-500" /> : <AlertCircle className="h-3 w-3 text-orange-400" />}
            <span>{(confidence * 100).toFixed(0)}% conf.</span>
          </div>
        )}
      </div>
    </div>
  );
};
