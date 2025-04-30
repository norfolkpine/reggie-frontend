"use client"

import { useState, useEffect } from "react"
import {
  FileText,
  Trash2,
  Search,
  Filter,
  MoreHorizontal,
  Download,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  Link,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { FileUpload } from "./file-upload"
import { FilePreview } from "./file-preview"
import { LinkFilesModal } from "./link-files-modal"
import { useToast } from "@/components/ui/use-toast"
import type { File as FileType, KnowledgeBase } from "../types"

export function FileManager() {
  const [files, setFiles] = useState<FileType[]>([])
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [previewFile, setPreviewFile] = useState<FileType | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)
  const [fileToLink, setFileToLink] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      // In a real implementation, these would be actual API calls
      // const fetchedFiles = await knowledgeBaseService.getFiles()
      // const fetchedKbs = await knowledgeBaseService.getKnowledgeBases()

      // Simulate API calls
      await Promise.all([
        new Promise((resolve) => setTimeout(resolve, 1000)),
        new Promise((resolve) => setTimeout(resolve, 1000)),
      ])

      const fetchedFiles: FileType[] = [
        {
          id: "file-1",
          name: "product-requirements.pdf",
          type: "application/pdf",
          size: 2500000,
          url: "#",
          uploadedAt: new Date(Date.now() - 3600000).toISOString(),
          status: "ready",
          folderId: null,
          thumbnailUrl: "/pdf-icon-stack.png",
          linkedKnowledgeBases: ["kb-1"],
        },
        {
          id: "file-2",
          name: "market-research.docx",
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          size: 1800000,
          url: "#",
          uploadedAt: new Date(Date.now() - 86400000).toISOString(),
          status: "ready",
          folderId: null,
          thumbnailUrl: "/document-stack.png",
          linkedKnowledgeBases: ["kb-2"],
        },
        {
          id: "file-3",
          name: "customer-feedback.csv",
          type: "text/csv",
          size: 950000,
          url: "#",
          uploadedAt: new Date(Date.now() - 172800000).toISOString(),
          status: "processing",
          folderId: null,
          thumbnailUrl: "/spreadsheet.png",
          linkedKnowledgeBases: [],
        },
        {
          id: "file-4",
          name: "technical-specs.md",
          type: "text/markdown",
          size: 450000,
          url: "#",
          uploadedAt: new Date(Date.now() - 259200000).toISOString(),
          status: "error",
          folderId: null,
          thumbnailUrl: "/stylized-text.png",
          errorMessage: "File format not supported",
          linkedKnowledgeBases: [],
        },
        {
          id: "file-5",
          name: "user-manual.pdf",
          type: "application/pdf",
          size: 3200000,
          url: "#",
          uploadedAt: new Date(Date.now() - 345600000).toISOString(),
          status: "ready",
          folderId: null,
          thumbnailUrl: "/pdf-icon-stack.png",
          linkedKnowledgeBases: ["kb-1", "kb-3"],
        },
      ]

      const fetchedKbs: KnowledgeBase[] = [
        {
          id: "kb-1",
          name: "Product Documentation",
          description: "All product documentation including user guides and technical specifications",
          documentCount: 24,
          createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
          embeddingModel: "openai-ada-002",
          chunkMethod: "fixed-size",
          chunkSize: 1000,
          chunkOverlap: 200,
          permissions: [
            {
              id: "perm-1",
              userId: "current-user",
              role: "owner",
            },
          ],
        },
        {
          id: "kb-2",
          name: "Customer Support",
          description: "Knowledge base for customer support agents with FAQs and troubleshooting guides",
          documentCount: 42,
          createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
          embeddingModel: "openai-3-small",
          chunkMethod: "paragraph",
          permissions: [
            {
              id: "perm-3",
              userId: "current-user",
              role: "owner",
            },
          ],
        },
        {
          id: "kb-3",
          name: "Research Papers",
          description: "Collection of research papers and academic articles",
          documentCount: 18,
          createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
          embeddingModel: "cohere-embed-english",
          chunkMethod: "semantic",
          chunkSize: 800,
          chunkOverlap: 100,
          permissions: [
            {
              id: "perm-4",
              userId: "user-3",
              role: "owner",
            },
          ],
        },
      ]

      setFiles(fetchedFiles)
      setKnowledgeBases(fetchedKbs)
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUploadComplete = (uploadedFiles: FileType[]) => {
    setFiles((prevFiles) => [...uploadedFiles, ...prevFiles])
    setIsUploadDialogOpen(false)
  }

  const handleDeleteFile = async (fileId: string) => {
    try {
      // In a real implementation, this would be an actual API call
      // await knowledgeBaseService.deleteFile(fileId)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId))
      setSelectedFiles((prevSelected) => prevSelected.filter((id) => id !== fileId))

      toast({
        title: "File deleted",
        description: "The file has been successfully deleted.",
      })
    } catch (error) {
      console.error("Failed to delete file:", error)
      toast({
        title: "Error",
        description: "Failed to delete file.",
        variant: "destructive",
      })
    }
  }

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles((prevSelected) =>
      prevSelected.includes(fileId) ? prevSelected.filter((id) => id !== fileId) : [...prevSelected, fileId],
    )
  }

  const handleBulkDelete = async () => {
    try {
      for (const fileId of selectedFiles) {
        // In a real implementation, this would be an actual API call
        // await knowledgeBaseService.deleteFile(fileId)
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      setFiles((prevFiles) => prevFiles.filter((file) => !selectedFiles.includes(file.id)))
      setSelectedFiles([])

      toast({
        title: "Files deleted",
        description: `${selectedFiles.length} files have been successfully deleted.`,
      })
    } catch (error) {
      console.error("Failed to delete files:", error)
      toast({
        title: "Error",
        description: "Failed to delete files.",
        variant: "destructive",
      })
    }
  }

  const handlePreviewFile = (file: FileType) => {
    setPreviewFile(file)
    setIsPreviewOpen(true)
  }

  const handleOpenLinkModal = (fileId?: string) => {
    if (fileId) {
      setFileToLink(fileId)
    } else if (selectedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to link.",
        variant: "destructive",
      })
      return
    }
    setIsLinkModalOpen(true)
  }

  const handleLinkFilesToKnowledgeBase = async (fileIds: string[], knowledgeBaseId: string) => {
    try {
      // In a real implementation, this would be an actual API call
      // await knowledgeBaseService.linkFilesToKnowledgeBase(fileIds, knowledgeBaseId)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update the files with the new knowledge base link
      setFiles((prevFiles) =>
        prevFiles.map((file) => {
          if (fileIds.includes(file.id)) {
            const linkedKbs = file.linkedKnowledgeBases || []
            if (!linkedKbs.includes(knowledgeBaseId)) {
              return {
                ...file,
                linkedKnowledgeBases: [...linkedKbs, knowledgeBaseId],
              }
            }
          }
          return file
        }),
      )

      return true
    } catch (error) {
      console.error("Failed to link files:", error)
      throw error
    }
  }

  // Filter files based on search query
  const filteredFiles = files.filter((file) => {
    return file.name.toLowerCase().includes(searchQuery.toLowerCase())
  })

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

  const getFileIcon = (fileType: string) => {
    // You could expand this to show different icons for different file types
    return <FileText className="h-5 w-5" />
  }

  const getStatusBadge = (status: FileType["status"]) => {
    switch (status) {
      case "ready":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Ready
          </Badge>
        )
      case "processing":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Clock className="h-3 w-3 mr-1" />
            Processing
          </Badge>
        )
      case "error":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">File Manager</h2>
        <div className="flex gap-2">
          <Button onClick={() => setIsUploadDialogOpen(true)}>Upload Files</Button>
          <Button variant="outline" onClick={() => handleOpenLinkModal()} disabled={selectedFiles.length === 0}>
            <Link className="h-4 w-4 mr-2" />
            Link to KB
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">All Files</h3>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {selectedFiles.length > 0 && (
          <div className="flex items-center justify-between bg-muted p-2 rounded-md mb-4">
            <span className="text-sm">{selectedFiles.length} files selected</span>
            <div className="space-x-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedFiles([])}>
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                Delete Selected
              </Button>
            </div>
          </div>
        )}

        <div className="border rounded-md overflow-hidden">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th className="w-12 px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    checked={selectedFiles.length === filteredFiles.length && filteredFiles.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedFiles(filteredFiles.map((file) => file.id))
                      } else {
                        setSelectedFiles([])
                      }
                    }}
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Size
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Uploaded
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Linked KBs
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-background divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-4 text-center text-sm text-muted-foreground">
                    Loading files...
                  </td>
                </tr>
              ) : filteredFiles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-4 text-center text-sm text-muted-foreground">
                    {searchQuery ? "No files match your search" : "No files available"}
                  </td>
                </tr>
              ) : (
                filteredFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                        checked={selectedFiles.includes(file.id)}
                        onChange={() => toggleFileSelection(file.id)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        {getFileIcon(file.type)}
                        <span className="ml-2 text-sm font-medium">{file.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{formatFileSize(file.size)}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(file.uploadedAt)}</td>
                    <td className="px-4 py-3">{getStatusBadge(file.status)}</td>
                    <td className="px-4 py-3">
                      {file.linkedKnowledgeBases && file.linkedKnowledgeBases.length > 0 ? (
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="bg-primary/10 text-primary">
                            {file.linkedKnowledgeBases.length}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={() => handleOpenLinkModal(file.id)}
                          >
                            <Link className="h-3 w-3 mr-1" />
                            Manage
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-muted-foreground">None</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={() => handleOpenLinkModal(file.id)}
                          >
                            <Link className="h-3 w-3 mr-1" />
                            Link
                          </Button>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handlePreviewFile(file)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <a href={file.url} download={file.name}>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenLinkModal(file.id)}>
                            <Link className="h-4 w-4 mr-2" />
                            Link to KB
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteFile(file.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Files</DialogTitle>
            <DialogDescription>
              Upload files to your file manager. Supported formats include PDF, DOCX, XLSX, TXT, CSV, MD, JPEG, and PNG.
            </DialogDescription>
          </DialogHeader>
          <FileUpload onUploadComplete={handleUploadComplete} folders={[]} currentFolderId={null} />
        </DialogContent>
      </Dialog>

      {/* File Preview */}
      <FilePreview
        file={previewFile}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onLinkToKnowledgeBase={(fileId) => handleOpenLinkModal(fileId)}
      />

      {/* Link Files Modal */}
      <LinkFilesModal
        isOpen={isLinkModalOpen}
        onClose={() => {
          setIsLinkModalOpen(false)
          setFileToLink(null)
        }}
        fileIds={fileToLink ? [fileToLink] : selectedFiles}
        knowledgeBases={knowledgeBases}
        onLinkFiles={handleLinkFilesToKnowledgeBase}
        existingLinks={fileToLink ? files.find((f) => f.id === fileToLink)?.linkedKnowledgeBases || [] : []}
      />
    </div>
  )
}
