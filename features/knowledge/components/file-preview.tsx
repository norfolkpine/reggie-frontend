"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { FileText, FileSpreadsheet, FileCode, FileIcon, Download, Link, ExternalLink, ImageIcon } from "lucide-react"
import type { File as FileType, FilePreview as FilePreviewType } from "../types"

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

      if (file.type.startsWith("image/")) {
        previewType = "image"
        content = file.url
      } else if (file.type === "application/pdf") {
        previewType = "pdf"
        content = file.url
      } else if (file.type.includes("spreadsheet") || file.type.includes("excel")) {
        previewType = "spreadsheet"
        content = null // In a real app, this would be a rendered preview
      } else if (file.type.includes("text") || file.type.includes("markdown") || file.type.includes("word")) {
        previewType = "text"
        content =
          "This is a simulated text preview of the document content. In a real application, this would show the actual content of the document."
      }

      setPreview({
        fileId: file.id,
        fileType: file.type,
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
              alt={file?.name || "Preview"}
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
              title={file?.name || "PDF Preview"}
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
              <a href={file?.url || "#"} target="_blank" rel="noopener noreferrer">
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

    return (
      <div className="space-y-4 p-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="text-sm font-medium">Name</div>
          <div className="text-sm">{file.name}</div>

          <div className="text-sm font-medium">Type</div>
          <div className="text-sm">{file.type}</div>

          <div className="text-sm font-medium">Size</div>
          <div className="text-sm">{formatFileSize(file.size)}</div>

          <div className="text-sm font-medium">Uploaded</div>
          <div className="text-sm">{formatDate(file.uploadedAt)}</div>

          <div className="text-sm font-medium">Status</div>
          <div className="text-sm capitalize">{file.status}</div>

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

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
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
            {file && getFileIcon(file.type)}
            <span className="ml-2">{file?.name}</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="preview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
          </TabsList>
          <TabsContent value="preview" className="mt-4">
            {renderPreview()}
          </TabsContent>
          <TabsContent value="properties" className="mt-4">
            {renderProperties()}
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between items-center">
          <div>
            {file && (
              <Button variant="outline" onClick={() => onLinkToKnowledgeBase(file.id)}>
                <Link className="h-4 w-4 mr-2" />
                Link to Knowledge Base
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {file && (
              <Button variant="outline" asChild>
                <a href={file.url} download={file.name}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </a>
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
