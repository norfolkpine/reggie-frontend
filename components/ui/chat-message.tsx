"use client"

import React, { useMemo, useState } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "framer-motion"
import { Ban, ChevronRight, Code2, Loader2, Terminal } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { FilePreview } from "@/components/ui/file-preview"
import { MarkdownRenderer } from "@/components/ui/markdown-renderer"
import { AgentThinking } from "@/components/ui/agent-thinking"
import { ReferencesData } from "@/types/message"

const chatBubbleVariants = cva(
  "group/message relative break-words rounded-lg p-3 text-sm",
  {
    variants: {
      isUser: {
        true: "bg-primary text-primary-foreground sm:max-w-[70%]",
        false: "bg-muted text-foreground w-full",
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

interface PartialToolCall {
  state: "partial-call"
  toolName: string
}

interface LegacyToolCall {
  state: "call"
  toolName: string
}

interface ToolResult {
  state: "result"
  toolName: string
  result: {
    __cancelled?: boolean
    [key: string]: any
  }
}

type ToolInvocation = PartialToolCall | LegacyToolCall | ToolResult

interface ReasoningPart {
  type: "reasoning"
  reasoning: string
}

interface ToolInvocationPart {
  type: "tool-invocation"
  toolInvocation: ToolInvocation
}

interface TextPart {
  type: "text"
  text: string
}

// For compatibility with AI SDK types, not used
interface SourcePart {
  type: "source"
  source?: any
}

interface FilePart {
  type: "file"
  mimeType: string
  data: string
}

interface StepStartPart {
  type: "step-start"
}

type MessagePart =
  | TextPart
  | ReasoningPart
  | ToolInvocationPart
  | SourcePart
  | FilePart
  | StepStartPart

export interface Message {
  id: string
  role: "user" | "assistant" | (string & {})
  content: string
  createdAt?: Date
  experimental_attachments?: Attachment[]
  toolInvocations?: ToolInvocation[]
  parts?: MessagePart[]
  toolCalls?: ToolCall[]
  reasoningSteps?: ReasoningStep[]
  references?: ReferencesData[]
}

export interface ToolCall {
  id: string;
  toolName: string;
  toolArgs: any;
  status: 'started' | 'completed' | 'error';
  result?: any;
  error?: string;
  startTime?: number;
  endTime?: number;
}

interface ReasoningStep {
  title: string;
  reasoning: string;
  action?: string;
  result?: string;
  nextAction?: string;
  confidence?: number;
}

export interface ChatMessageProps extends Message {
  showTimeStamp?: boolean
  animation?: Animation
  actions?: React.ReactNode
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  role,
  content,
  createdAt,
  showTimeStamp = false,
  animation = "scale",
  actions,
  experimental_attachments,
  toolInvocations,
  parts,
  toolCalls,
  reasoningSteps,
  references,
}) => {
  const files = useMemo(() => {
    if (!experimental_attachments) return [];
    return experimental_attachments.map((attachment) => {
      // Only decode if it's a data URL
      if (attachment.url && attachment.url.startsWith('data:')) {
        try {
          const base64 = attachment.url.split(",")[1];
          if (!base64) return null;
          // Use atob for base64 decoding in browser
          const binary = atob(base64);
          const array = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            array[i] = binary.charCodeAt(i);
          }
          return new File([array], attachment.name ?? "Unknown", {
            type: attachment.contentType,
          });
        } catch (e) {
          return null;
        }
      } else if (attachment.url) {
        // If it's a plain URL, return a pseudo-File object with just the URL and metadata
        // (You may want to handle this differently in FilePreview)
        return {
          name: attachment.name ?? "Unknown",
          type: attachment.contentType ?? "application/octet-stream",
          url: attachment.url,
        };
      }
      return null;
    }).filter((file): file is File | { name: string; type: string; url: string } => file !== null);
  }, [experimental_attachments]);

  const isUser = role === "user"

  const formattedTime = createdAt?.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })

  if (isUser) {
    return (
      <div
        className={cn("flex flex-col", isUser ? "items-end" : "items-start")}
      >
        {files && files.length > 0 ? (
          <div className="mb-1 flex flex-wrap gap-2">
            {files.map((file, index) => {
              return <FilePreview file={file} key={index} />
            })}
          </div>
        ) : null}

        <div className={cn(chatBubbleVariants({ isUser, animation }))}>
          <div className="[&_a]:text-blue-300 [&_a]:hover:text-blue-100 [&_a]:underline [&_a]:underline-offset-4">
            <MarkdownRenderer>{content}</MarkdownRenderer>
          </div>
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
    )
  }

  // For assistant messages, show the thinking process and tool calls
  return (
    <div className="flex flex-col items-start space-y-3 w-full">
      {/* Agent Thinking Process - Moved above content */}
      {((toolCalls && toolCalls.length > 0) || (reasoningSteps && reasoningSteps.length > 0)) && (
        <AgentThinking 
          toolCalls={toolCalls} 
          reasoningSteps={reasoningSteps}
          isActive={false}
        />
      )}

      {/* Legacy parts support */}
      {parts && parts.length > 0 ? (
        parts.map((part, index) => {
          if (part.type === "text") {
            return (
              <div
                className={cn(
                  "flex flex-col w-full",
                  isUser ? "items-end" : "items-start"
                )}
                key={`text-${index}`}
              >
                <div className={cn(chatBubbleVariants({ isUser, animation }))}>
                  <MarkdownRenderer>{part.text}</MarkdownRenderer>
                  {actions ? (
                    <div className="absolute -bottom-8 left-2 flex space-x-1 rounded-lg border bg-background p-0.5 text-foreground opacity-0 transition-opacity group-hover/message:opacity-100 shadow-sm z-20">
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
            )
          } else if (part.type === "reasoning") {
            return <ReasoningBlock key={`reasoning-${index}`} part={part} fullWidth={!isUser} />
          } else if (part.type === "tool-invocation") {
            return (
              <ToolCall
                key={`tool-${index}`}
                toolInvocations={[part.toolInvocation]}
              />
            )
          }
          return null
        })
      ) : (
        // Main content message
        <div className={cn("flex flex-col w-full", isUser ? "items-end" : "items-start")}> 
          <div className={cn(chatBubbleVariants({ isUser, animation }))}>
            <MarkdownRenderer>{content}</MarkdownRenderer>
            {actions ? (
              <div className="absolute -bottom-8 left-2 flex space-x-1 rounded-lg border bg-background p-0.5 text-foreground opacity-0 transition-opacity group-hover/message:opacity-100 shadow-sm z-20">
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
      )}

      {/* Legacy tool invocations support */}
      {toolInvocations && toolInvocations.length > 0 && (
        <ToolCall toolInvocations={toolInvocations} />
      )}

      {/* References display */}
      {references && references.length > 0 && (
        <ReferencesDisplay references={references} />
      )}
    </div>
  )
}

function dataUrlToUint8Array(data: string) {
  const base64 = data.split(",")[1]
  const buf = Buffer.from(base64, "base64")
  return new Uint8Array(buf)
}

const ReferencesDisplay = ({ references }: { references: ReferencesData[] }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="w-full">
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="group w-full overflow-hidden rounded-lg border bg-muted/50"
      >
        <div className="flex items-center p-2">
          <CollapsibleTrigger asChild>
            <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
              <span>References ({references.reduce((acc, ref) => acc + ref.references.length, 0)})</span>
            </button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent forceMount>
          <motion.div
            initial={false}
            animate={isOpen ? "open" : "closed"}
            variants={{
              open: { height: "auto", opacity: 1 },
              closed: { height: 0, opacity: 0 },
            }}
            transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="border-t"
          >
            <div className="p-3 space-y-3">
              {references.map((refGroup, groupIndex) => (
                <div key={groupIndex} className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">
                    Query: "{refGroup.query}"
                  </div>
                  <div className="space-y-2">
                    {refGroup.references.map((ref, refIndex) => (
                      <div
                        key={refIndex}
                        className="rounded-md border bg-background p-3 text-sm"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">
                              {ref.meta_data.file_name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Page {ref.meta_data.page_label}
                            </span>
                          </div>
                          <a
                            href={ref.meta_data.file_path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800 underline"
                          >
                            View File
                          </a>
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">
                          <div>File Type: {ref.meta_data.file_type}</div>
                          <div>Size: {(ref.meta_data.file_size / 1024).toFixed(1)} KB</div>
                          <div>Modified: {new Date(ref.meta_data.last_modified_date).toLocaleDateString()}</div>
                        </div>
                        <blockquote className="border-l-4 border-blue-200 pl-4 py-2 my-2 bg-blue-50/50 rounded-r-md">
                          <div className="text-sm text-foreground whitespace-pre-wrap italic">
                            "{ref.content}"
                          </div>
                        </blockquote>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

const ReasoningBlock = ({ part, fullWidth = false }: { part: ReasoningPart, fullWidth?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={cn("mb-2 flex flex-col items-start", fullWidth ? "w-full" : "sm:max-w-[70%]")}> 
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="group w-full overflow-hidden rounded-lg border bg-muted/50"
      >
        <div className="flex items-center p-2">
          <CollapsibleTrigger asChild>
            <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
              <span>Thinking</span>
            </button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent forceMount>
          <motion.div
            initial={false}
            animate={isOpen ? "open" : "closed"}
            variants={{
              open: { height: "auto", opacity: 1 },
              closed: { height: 0, opacity: 0 },
            }}
            transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="border-t"
          >
            <div className="p-2">
              <div className="whitespace-pre-wrap text-xs">
                {part.reasoning}
              </div>
            </div>
          </motion.div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

function ToolCall({
  toolInvocations,
}: Pick<ChatMessageProps, "toolInvocations">) {
  if (!toolInvocations?.length) return null

  return (
    <div className="flex flex-col items-start gap-2">
      {toolInvocations.map((invocation, index) => {
        const isCancelled =
          invocation.state === "result" &&
          invocation.result.__cancelled === true

        if (isCancelled) {
          return (
            <div
              key={index}
              className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 text-sm text-muted-foreground"
            >
              <Ban className="h-4 w-4" />
              <span>
                Cancelled{" "}
                <span className="font-mono">
                  {"`"}
                  {invocation.toolName}
                  {"`"}
                </span>
              </span>
            </div>
          )
        }

        switch (invocation.state) {
          case "partial-call":
          case "call":
            return (
              <div
                key={index}
                className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 text-sm text-muted-foreground"
              >
                <Terminal className="h-4 w-4" />
                <span>
                  Calling{" "}
                  <span className="font-mono">
                    {"`"}
                    {invocation.toolName}
                    {"`"}
                  </span>
                  ...
                </span>
                <Loader2 className="h-3 w-3 animate-spin" />
              </div>
            )
          case "result":
            return (
              <div
                key={index}
                className="flex flex-col gap-1.5 rounded-lg border bg-muted/50 px-3 py-2 text-sm"
              >
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Code2 className="h-4 w-4" />
                  <span>
                    Result from{" "}
                    <span className="font-mono">
                      {"`"}
                      {invocation.toolName}
                      {"`"}
                    </span>
                  </span>
                </div>
                <pre className="overflow-x-auto whitespace-pre-wrap text-foreground">
                  {JSON.stringify(invocation.result, null, 2)}
                </pre>
              </div>
            )
          default:
            return null
        }
      })}
    </div>
  )
}
