"use client"

import { useEffect } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Button } from "@/components/ui/button"
import { X, History, Undo2, Redo2, FileText, Download } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface TipTapEditorProps {
  content: string
  onSave: (content: string) => void
  onClose: () => void
}

export default function TipTapEditor({ content, onSave, onClose }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[500px] p-6 prose prose-lg max-w-none",
      },
    },
  })

  // Auto-save when closing
  const handleClose = () => {
    if (editor) {
      onSave(editor.getHTML())
    }
    onClose()
  }

  const handleSendToDocuments = () => {
    if (editor) {
      // In a real app, this would send the content to the documents system
      console.log("Sending to documents:", editor.getHTML())
      toast({
        title: "Sent to Documents",
        description: "Your content has been saved to documents.",
        duration: 3000,
      })
    }
  }

  // Also save when component unmounts
  useEffect(() => {
    return () => {
      if (editor) {
        onSave(editor.getHTML())
      }
    }
  }, [editor, onSave])

  if (!editor) {
    return null
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with minimal design */}
      <div className="flex items-center px-3 h-12 border-b">
        {/* Left: Close button */}
        <Button variant="ghost" size="icon" onClick={handleClose} className="rounded-full mr-3">
          <X className="h-4 w-4" />
        </Button>

        {/* Center: Title */}
        <h2 className="text-sm font-medium flex-1 text-center">Canvas Editor</h2>

        {/* Right: Action buttons */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => editor.commands.undo()}>
            <History className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => editor.commands.undo()}>
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => editor.commands.redo()}>
            <Redo2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full" onClick={handleSendToDocuments}>
            <FileText className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Simple editor container */}
      <div className="flex-1 overflow-auto bg-background">
        <EditorContent editor={editor} className="w-full h-full" />
      </div>
    </div>
  )
}

