"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
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
  Pencil,
} from "lucide-react"
import { useChat } from "ai/react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import { toast } from "@/components/ui/use-toast"
import CryptoChart from "./components/crypto-chart"
import { EditorPanel } from "./components/tiptap-editor"

// Define markdown components for better styling
const MarkdownComponents = {
  h1: ({ node, ...props }: any) => <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />,
  h2: ({ node, ...props }: any) => <h2 className="text-xl font-bold mt-6 mb-4" {...props} />,
  h3: ({ node, ...props }: any) => <h3 className="text-lg font-bold mt-6 mb-4" {...props} />,
  p: ({ node, ...props }: any) => <p className="mb-4" {...props} />,
  ul: ({ node, ...props }: any) => <ul className="list-disc pl-5 mb-4" {...props} />,
  ol: ({ node, ...props }: any) => <ol className="list-decimal pl-5 mb-4" {...props} />,
  li: ({ node, ...props }: any) => <li className="mb-1" {...props} />,
  pre: ({ node, ...props }: any) => <pre className="rounded-md p-4 mb-4 overflow-x-auto bg-gray-800" {...props} />,
  code: ({ node, inline, className, children, ...props }: any) => {
    if (inline) {
      return (
        <code className="font-mono text-sm rounded px-1 bg-gray-100" {...props}>
          {children}
        </code>
      )
    }
    return (
      <code className="block font-mono text-sm p-0 bg-transparent text-gray-200" {...props}>
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
  onOpenCanvas: (messageId: string) => void
}

function MessageActions({
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
        {copiedMessageId === messageId ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
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
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [splitPosition, setSplitPosition] = useState(50) // percentage
  const isDragging = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true
    document.body.style.userSelect = "none"
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return

    const container = containerRef.current
    const containerRect = container.getBoundingClientRect()
    const percentage = ((e.clientX - containerRect.left) / containerRect.width) * 100

    // Limit the split position between 30% and 70%
    const limitedPercentage = Math.min(Math.max(percentage, 30), 70)
    setSplitPosition(limitedPercentage)
  }, [])

  const handleMouseUp = useCallback(() => {
    isDragging.current = false
    document.body.style.userSelect = ""
    document.removeEventListener("mousemove", handleMouseMove)
    document.removeEventListener("mouseup", handleMouseUp)
  }, [handleMouseMove])

  useEffect(() => {
    if (messages.length > 0) {
      setShowWelcome(false)
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedMessageId(messageId)
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const sendToJournal = (text: string, messageId: string) => {
    console.log(`Sending message ${messageId} to journal`)
    toast({
      title: "Sent to Journal",
      description: "This message has been saved to your journal.",
      duration: 3000,
    })
  }

  const handleSaveEdit = (content: string) => {
    if (!editingMessageId) return
    console.log(`Saving edited content for message ${editingMessageId}:`, content)
    toast({
      title: "Changes Saved",
      description: "Your edits have been saved.",
      duration: 3000,
    })
  }

  // Find the message being edited
  const editingMessage = messages.find((message) => message.id === editingMessageId)

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Main content area with flexbox layout */}
      <div className="flex flex-1 overflow-hidden" ref={containerRef}>
        {/* Chat area */}
        <div
          className="flex flex-col h-full transition-all duration-300 ease-in-out"
          style={{ width: editingMessageId ? `${splitPosition}%` : "100%" }}
        >
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between">
            <h1 className="text-xl font-medium">ChatGPT 4o</h1>
          </div>

          {showWelcome ? (
            // Welcome screen with centered content
            <div className="flex-1 flex flex-col items-center justify-center px-4">
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
                  <span>ChatGPT can make mistakes. Check important info.</span>
                  <span>?</span>
                </div>
              </div>
            </div>
          ) : (
            // Chat screen with messages
            <>
              <div className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto w-full space-y-6 p-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
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
                              onOpenCanvas={setEditingMessageId}
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
              <div className="p-4 bg-gradient-to-t from-background via-background to-transparent">
                <div className="max-w-3xl mx-auto">
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
                        <span className="text-xs text-muted-foreground px-2 border-x border-gray-200">
                          Deep research
                        </span>
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
                  </Card>

                  <div className="flex justify-between items-center mt-4 text-xs text-muted-foreground px-2">
                    <span>ChatGPT can make mistakes. Check important info.</span>
                    <span>?</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Resizable divider */}
        {editingMessageId && (
          <div
            className="w-1 hover:w-2 bg-gradient-to-r from-transparent via-gray-300 to-transparent cursor-col-resize relative group transition-all"
            onMouseDown={handleMouseDown}
          >
            <div className="absolute inset-0 shadow-[0_0_15px_rgba(0,0,0,0.1)] pointer-events-none" />
            <div className="absolute inset-y-0 left-1/2 w-4 -translate-x-1/2 group-hover:bg-gray-300/10" />
          </div>
        )}

        {/* Canvas editor area */}
        {editingMessageId && (
          <div
            className="flex flex-col h-full transition-all duration-300 ease-in-out"
            style={{ width: `${100 - splitPosition}%` }}
          >
            {editingMessage && (
              <EditorPanel
                content={{
                  content: editingMessage.content,
                  role: editingMessage.role as "user" | "assistant",
                  id: editingMessage.id,
                }}
                show
                onSave={handleSaveEdit}
                onClose={() => setEditingMessageId(null)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

