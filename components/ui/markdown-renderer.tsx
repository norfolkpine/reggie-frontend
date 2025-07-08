import React, { Suspense } from "react"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"

import { cn } from "@/lib/utils"
import { CopyButton } from "@/components/ui/copy-button"
import { MarkdownComponents } from "@/features/chats/components/markdown-component"

interface MarkdownRendererProps {
  children: string
}

export function MarkdownRenderer({ children }: MarkdownRendererProps) {
  return (
    <div className="space-y-3 break-words">
      <Markdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
        {children}
      </Markdown>
    </div>
  )
}

export default MarkdownRenderer
