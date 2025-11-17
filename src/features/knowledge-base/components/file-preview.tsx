"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { FileText, FileSpreadsheet, FileCode, FileIcon, Download, Link, ExternalLink, ImageIcon } from "lucide-react"
import type { FileWithUI as FileType, FilePreview as FilePreviewType } from "@/types/knowledge-base"

interface FilePreviewProps {
  file: FileType | null
  isOpen: boolean
  onClose: () => void
  onLinkToKnowledgeBase: (fileId: string) => void
}

export function FilePreview({ file, isOpen, onClose, onLinkToKnowledgeBase }: FilePreviewProps) {
  const [preview, setPreview] = useState<FilePreviewType | null>(null)
  const [activeTab, setActiveTab] = useState<string>("preview")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (file && isOpen) {
      loadPreview(file)
    } else {
      setPreview(null)
    }
  }, [file, isOpen])

  const loadPreview = async (file: FileType) => {
    setIsLoading(true)
    try {
      // In a real implementation, this would be an actual API call
      // const previewData = await knowledgeBaseService.getFilePreview(file.id)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      let previewType: FilePreviewType["previewType"] = "unsupported"
      let content: string | null = null

      if (file.file_type.startsWith("image/")) {
        previewType = "image"
        content = file.file
      } else if (file.file_type === "application/pdf") {
        previewType = "pdf"
        content = file.file
      } else if (file.file_type.includes("spreadsheet") || file.file_type.includes("excel")) {
        previewType = "spreadsheet"
        content = null // In a real app, this would be a rendered preview
      } else if (file.file_type.includes("text") || file.file_type.includes("markdown") || file.file_type.includes("word")) {
        previewType = "text"
        content =
          "This is a simulated text preview of the document content. In a real application, this would show the actual content of the document."
      }

      setPreview({
        fileId: file.uuid,
        fileType: file.file_type,
        previewType,
        content,
        thumbnailUrl: file.thumbnailUrl,
      })
    } catch (error) {
      console.error("Failed to load preview:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) {
      return <ImageIcon className="h-5 w-5" />
    } else if (fileType === "application/pdf") {
      return <FileText className="h-5 w-5" />
    } else if (fileType.includes("spreadsheet") || fileType.includes("excel")) {
      return <FileSpreadsheet className="h-5 w-5" />
    } else if (fileType.includes("text") || fileType.includes("markdown")) {
      return <FileCode className="h-5 w-5" />
    }
    return <FileIcon className="h-5 w-5" />
  }

  const renderPreview = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )
    }

    if (!preview) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
          <FileIcon className="h-16 w-16 mb-4" />
          <p>No preview available</p>
        </div>
      )
    }

    switch (preview.previewType) {
      case "image":
        return (
          <div className="flex items-center justify-center h-96 overflow-auto">
            <img
              src={preview.content || ""}
              alt={file?.title || "Preview"}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        )
      case "pdf":
        return (
          <div className="h-96">
            <iframe
              src={preview.content || ""}
              className="w-full h-full border-0"
              title={file?.title || "PDF Preview"}
            />
          </div>
        )
      case "text":
        return (
          <div className="h-96 overflow-auto p-4 bg-muted/20 rounded-md">
            <pre className="whitespace-pre-wrap text-sm">{preview.content}</pre>
          </div>
        )
      case "spreadsheet":
        return (
          <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
            <FileSpreadsheet className="h-16 w-16 mb-4" />
            <p>Spreadsheet preview not available</p>
            <Button variant="outline" className="mt-4" asChild>
              <a href={file?.file || "#"} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Externally
              </a>
            </Button>
          </div>
        )
      default:
        return (
          <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
            <FileIcon className="h-16 w-16 mb-4" />
            <p>Preview not available for this file type</p>
          </div>
        )
    }
  }

  const renderProperties = () => {
    if (!file) return null

    const fileSize = 0 // Size not available in new API

    return (
      <div className="space-y-4 p-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="text-sm font-medium">Name</div>
          <div className="text-sm">{file.title}</div>

          <div className="text-sm font-medium">Type</div>
          <div className="text-sm">{file.file_type}</div>

          <div className="text-sm font-medium">Created</div>
          <div className="text-sm">{formatDate(file.created_at)}</div>

          <div className="text-sm font-medium">Updated</div>
          <div className="text-sm">{formatDate(file.updated_at)}</div>

          <div className="text-sm font-medium">Status</div>
          <div className="text-sm capitalize">{file.status}</div>

          <div className="text-sm font-medium">Visibility</div>
          <div className="text-sm capitalize">{file.visibility}</div>

          <div className="text-sm font-medium">Linked Knowledge Bases</div>
          <div className="text-sm">
            {file.linkedKnowledgeBases && file.linkedKnowledgeBases.length > 0
              ? file.linkedKnowledgeBases.length
              : "None"}
          </div>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            {file && getFileIcon(file.file_type)}
            <span className="ml-2">{file?.title}</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="preview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
          </TabsList>
          <TabsContent value="preview" className="mt-4">
            <div className="h-64 sm:h-96 max-h-[60vh] overflow-auto">{renderPreview()}</div>
          </TabsContent>
          <TabsContent value="properties" className="mt-4">
            <div className="max-h-[40vh] overflow-auto">{renderProperties()}</div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex flex-col sm:flex-row justify-between items-center gap-2 mt-4">
          <div className="w-full sm:w-auto flex justify-start">
            {file && (
              <Button variant="outline" onClick={() => onLinkToKnowledgeBase(file.uuid)} className="w-full sm:w-auto">
                <Link className="h-4 w-4 mr-2" />
                Link to Knowledge Base
              </Button>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto justify-end">
            {file && (
              <Button variant="outline" asChild className="w-full sm:w-auto">
                <a href={file.file} download={file.title}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </a>
              </Button>
            )}
            <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
