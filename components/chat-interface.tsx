"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import {
  Mic,
  Plus,
  Search,
  Send,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Volume2,
  RefreshCw,
  MoreHorizontal,
  BookOpen,
  Square,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent
} from "@/components/ui/dropdown-menu"
import { useChat } from "ai/react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import { toast } from "@/components/ui/use-toast"
import CryptoChart from "@/features/chats/components/crypto-chart"
import { ActionButton } from "@/features/chats/components/action-button"
import { CopyButton } from "@/components/ui/copy-button"
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis"

// Define markdown components for better styling
const MarkdownComponents = {
  h1: ({ node, ...props }: any) => <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />,
  h2: ({ node, ...props }: any) => <h2 className="text-xl font-bold mt-6 mb-4" {...props} />,
  h3: ({ node, ...props }: any) => <h3 className="text-lg font-bold mt-6 mb-4" {...props} />,
  p: ({ node, ...props }: any) => <p className="mb-4" {...props} />,
  ul: ({ node, ...props }: any) => <ul className="list-disc pl-5 mb-4" {...props} />,
  ol: ({ node, ...props }: any) => <ol className="list-decimal pl-5 mb-4" {...props} />,
  li: ({ node, ...props }: any) => <li className="mb-1" {...props} />,
  pre: ({ node, ...props }: any) => {
    let codeText = "";
    if (props && props.children) {
      const child: any = (props as any).children[0];
      if (child && child.props && child.props.children) {
        if (Array.isArray(child.props.children)) {
          codeText = child.props.children.join("");
        } else {
          codeText = child.props.children as string;
        }
      }
    }
    return (
      <pre className="code-block relative" {...props}>
        <div className="absolute right-4 top-4">
          <CopyButton content={codeText} copyMessage="Code copied to clipboard!" />
        </div>
        {props.children}
      </pre>
    );
  },
  code: ({ node, inline, className, children, ...props }: any) => {
    if (inline) {
      return (
        <code className={`${className ?? ''} font-mono text-sm rounded px-1 bg-gray-100`} {...props}>
          {children}
        </code>
      )
    }
    return (
      <code className={`${className ?? ''} block font-mono text-sm p-0 bg-transparent text-gray-200`} {...props}>
        {children}
      </code>
    )
  },
  blockquote: ({ node, ...props }: any) => (
    <blockquote className="pl-4 border-l-4 border-gray-300 italic my-4" {...props} />
  ),
  a: ({ node, ...props }: any) => <a className="text-blue-600 hover:underline" {...props} />,
  table: ({ node, ...props }: any) => <table className="w-full border-collapse mb-4" {...props} />,
  th: ({ node, ...props }: any) => <th className="border border-gray-300 px-3 py-2 bg-gray-100" {...props} />,
  td: ({ node, ...props }: any) => <td className="border border-gray-300 px-3 py-2" {...props} />,
}

interface MessageActionsProps {
  messageId: string
  content: string
  onCopy: (text: string, messageId: string) => Promise<void>
  copiedMessageId: string | null
  onSendToJournal: (text: string, messageId: string) => void
}

function MessageActions({ messageId, content, onCopy, copiedMessageId, onSendToJournal }: MessageActionsProps) {
  const { isPlaying, play, stop } = useSpeechSynthesis({});

  const handleReadAloud = () => {
    if (isPlaying) {
      stop();
    } else {
      play(content);
    }
  };

  return (
    <div className="flex items-center gap-2 mt-2 -mb-1 relative z-10">
      <ActionButton
        icon={Copy}
        activeIcon={Check}
        isActive={copiedMessageId === messageId}
        onClick={() => onCopy(content, messageId)}
        title="Copy to clipboard"
      />
      <ActionButton
        icon={ThumbsUp}
        title="Good response"
      />
      <ActionButton
        icon={ThumbsDown}
        title="Bad response"
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
      <ActionButton
        icon={BookOpen}
        onClick={() => onSendToJournal(content, messageId)}
        title="Send to journal"
      />
      <ActionButton
        icon={MoreHorizontal}
        title="More actions"
      />
    </div>
  )
}

// Function to check if a string is valid JSON with crypto data structure
function isCryptoData(content: string): boolean {
  try {
    const data = JSON.parse(content)
    if (!Array.isArray(data)) return false
    if (data.length === 0) return false

    // Check if the data has the expected structure
    const firstItem = data[0]
    return (
      typeof firstItem === "object" &&
      "date" in firstItem &&
      "price" in firstItem &&
      "market_cap" in firstItem &&
      "total_volume" in firstItem
    )
  } catch (e) {
    return false
  }
}

export default function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showWelcome, setShowWelcome] = useState(true)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)

  useEffect(() => {
    if (messages.length > 0) {
      setShowWelcome(false)
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const copyToClipboard = async (text: string, messageId: string) => {
    const copyToClipboard = async (text: string) => {
      // Try the modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(text)
          return true
        } catch (err) {
          console.warn('Clipboard API failed, trying fallback method:', err)
        }
      }

      // Fallback method using a temporary textarea
      try {
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        
        const successful = document.execCommand('copy')
        document.body.removeChild(textArea)
        
        if (successful) {
          return true
        } else {
          throw new Error('execCommand copy failed')
        }
      } catch (err) {
        console.error('Fallback copy method failed:', err)
        return false
      }
    }

    try {
      const success = await copyToClipboard(text)
      
      if (success) {
        setCopiedMessageId(messageId)
        toast({
          title: "Copied to clipboard!",
          duration: 2000,
        })
        setTimeout(() => setCopiedMessageId(null), 2000)
      } else {
        throw new Error('Copy failed')
      }
    } catch (err) {
      console.error("Failed to copy text: ", err)
      toast({
        title: "Failed to copy to clipboard",
        description: "Please try selecting and copying the text manually",
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  const sendToJournal = (text: string, messageId: string) => {
    // This is a placeholder function that would be implemented to save to a journal
    console.log(`Sending message ${messageId} to journal`)

    // Show a toast notification - use a more direct approach
    toast({
      title: "Sent to Journal",
      description: "This message has been saved to your journal.",
      duration: 3000, // Auto dismiss after 3 seconds
    })
  }

  return (
    <div className="flex-1 flex flex-col h-full relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 border-b flex items-center justify-between">
        <h1 className="text-xl font-medium">ChatGPT 4o</h1>
      </div>

      {showWelcome ? (
        // Welcome screen with centered content
        <div className="flex-1 flex flex-col items-center justify-center px-4 mt-16">
          <h2 className="text-3xl font-medium text-gray-800 mb-8">What can I help with?</h2>
          <div className="w-full max-w-2xl">
            <Card className="p-2 shadow-lg border-gray-200 rounded-2xl">
              <form onSubmit={handleSubmit} className="flex items-center">
                <Button type="button" variant="ghost" size="icon" className="rounded-full">
                  <Plus className="h-5 w-5" />
                </Button>

                <Input
                  className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                  placeholder="Ask anything"
                  value={input}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />

                <div className="flex items-center gap-2 px-2">
                  <Button type="button" variant="ghost" size="icon" className="rounded-full">
                    <Search className="h-5 w-5" />
                  </Button>

                  <Button type="button" variant="ghost" size="icon" className="rounded-full">
                    <Mic className="h-5 w-5" />
                  </Button>
                </div>
              </form>
            </Card>

            <div className="flex justify-between items-center mt-4 text-xs text-muted-foreground px-2">
              <span>Reggie can make mistakes. Check important info.</span>
              <span>?</span>
            </div>
          </div>
        </div>
      ) : (
        // Chat screen with messages
        <>
          <div className="flex-1 overflow-y-auto pt-16 pb-32">
            <div className="max-w-3xl mx-auto w-full space-y-6 p-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} relative z-10`}>
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 relative z-10 ${
                      message.role === "user"
                        ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        : "bg-muted"
                    }`}
                  >
                    {message.role === "user" ? (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    ) : (
                      <>
                        {isCryptoData(message.content as string) ? (
                          // Render chart for crypto data
                          <div className="my-4">
                            <CryptoChart
                              data={JSON.parse(message.content as string)}
                              title="Cryptocurrency Data"
                              description="Price, Market Cap, and Volume"
                            />
                          </div>
                        ) : (
                          // Render normal markdown content
                          <div className="markdown">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              rehypePlugins={[rehypeHighlight]}
                              components={MarkdownComponents}
                            >
                              {message.content as string}
                            </ReactMarkdown>
                          </div>
                        )}
                        <MessageActions
                          messageId={message.id}
                          content={message.content as string}
                          onCopy={copyToClipboard}
                          copiedMessageId={copiedMessageId}
                          onSendToJournal={sendToJournal}
                        />
                      </>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Fixed input at bottom when chatting */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
            <div className="max-w-3xl mx-auto">
              <Card className="p-2 shadow-lg border-gray-200 rounded-2xl">
  <div className="flex items-center">
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon" className="rounded-full">
          <Plus className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem
          onSelect={() => {
            document.getElementById('chat-file-upload')?.click();
          }}
        >
          Upload from files
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Upload from app</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem
              onSelect={() => {
                alert('Upload from Drive clicked (placeholder)');
              }}
            >
              Upload from drive
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
    <input
      id="chat-file-upload"
      type="file"
      className="hidden"
      onChange={e => {
        // handle file selection here
      }}
      accept="*"
    />
    <form onSubmit={handleSubmit} className="flex-1 flex items-center">
      <Input
        className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
        placeholder="Ask anything"
        value={input}
        onChange={handleInputChange}
        disabled={isLoading}
      />
      <div className="flex items-center gap-2 px-2">
        <Button type="button" variant="ghost" size="icon" className="rounded-full">
          <Search className="h-5 w-5" />
        </Button>
        <span className="text-xs text-muted-foreground px-2 border-x border-gray-200">Deep research</span>
        <Button type="button" variant="ghost" size="icon" className="rounded-full">
          <Mic className="h-5 w-5" />
        </Button>
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          className="rounded-full"
          disabled={isLoading || !input.trim()}
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </form>
  </div>
              </Card>

              <div className="flex justify-between items-center mt-4 text-xs text-muted-foreground px-2">
                <span>Reggie can make mistakes. Check important info.</span>
                <span>?</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

