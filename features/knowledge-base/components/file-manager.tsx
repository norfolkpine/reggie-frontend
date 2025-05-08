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
import { toast } from "sonner"
import { LinkFilesModal } from "./link-files-modal"
import { File, FileWithUI, KnowledgeBase } from "@/types/knowledge-base"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { getFiles, deleteFile, listFiles, listFilesWithKbs, ingestSelectedFiles } from "@/api/files"

interface ApiResponse {
  uuid: string
  title: string
  description: string | null
  file_type: string
  file: string
  storage_bucket: number | null
  storage_path: string
  original_path: string | null
  uploaded_by: number | null
  team: number | null
  source: string | null
  visibility: "public" | "private"
  is_global: boolean
  created_at: string
  updated_at: string
}

interface ApiListResponse {
  results: ApiResponse[]
  count: number
  next: string | null
  previous: string | null
}

export function FileManager() {
  const [files, setFiles] = useState<FileWithUI[]>([])
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [previewFile, setPreviewFile] = useState<FileWithUI | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)
  const [fileToLink, setFileToLink] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchData()
  }, [currentPage, searchQuery])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const params: Record<string, string> = {
        page: currentPage.toString(),
        page_size: "10",
      }
      
      if (searchQuery) {
        params.search = searchQuery
      }

      const response = await getFiles(currentPage)
      
      // Convert API response to FileWithUI format
      const convertedFiles: FileWithUI[] = response.results.map(apiResponse => {
        // First convert the API response to match our File type
        const file: File = {
          uuid: apiResponse.uuid,
          title: apiResponse.title,
          description: apiResponse.description || undefined,
          file_type: apiResponse.file_type,
          file: apiResponse.file,
          storage_bucket: apiResponse.storage_bucket || undefined,
          storage_path: apiResponse.storage_path,
          original_path: apiResponse.original_path || undefined,
          uploaded_by: apiResponse.uploaded_by || undefined,
          team: apiResponse.team || undefined,
          source: apiResponse.source || undefined,
          visibility: apiResponse.visibility || "private",
          is_global: !!apiResponse.is_global,
          created_at: apiResponse.created_at,
          updated_at: apiResponse.updated_at,
        }

        // Then extend it with UI-specific fields
        return {
          ...file,
          status: "ready" as const,
          folderId: null,
          thumbnailUrl: getThumbnailUrl(file.file_type),
          linkedKnowledgeBases: [],
        }
      })

      setFiles(convertedFiles)
    } catch (error) {
      console.error("Failed to fetch data:", error)
      toast.error("Failed to load files")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUploadComplete = (uploadedFiles: FileWithUI[]) => {
    setFiles((prevFiles) => [...uploadedFiles, ...prevFiles])
    setIsUploadDialogOpen(false)
    toast.success(`${uploadedFiles.length} file${uploadedFiles.length > 1 ? 's' : ''} uploaded successfully`)
    fetchData() // Refresh the list
  }

  const handleDeleteFile = async (uuid: string) => {
    try {
      await deleteFile(uuid)
      setFiles((prevFiles) => prevFiles.filter((file) => file.uuid !== uuid))
      toast.success("File deleted successfully")
    } catch (error) {
      console.error("Failed to delete file:", error)
      toast.error("Failed to delete file")
    }
  }


  const handleLinkFilesToKnowledgeBase = async (fileId: string, knowledgeBaseId: string) => {
    try {
      await ingestSelectedFiles({
        file_ids: [fileId],
        knowledgebase_ids: [knowledgeBaseId]
      })
      
      toast.success("Files linked successfully")
      fetchData() // Refresh the list to get updated links
    } catch (error) {
      console.error("Failed to link files:", error)
      toast.error("Failed to link files to knowledge base")
    }
  }

  const getThumbnailUrl = (fileType: string): string => {
    switch (fileType) {
      case 'pdf':
        return "/pdf-icon-stack.png"
      case 'docx':
        return "/document-stack.png"
      case 'csv':
      case 'xlsx':
        return "/spreadsheet.png"
      default:
        return "/document-stack.png"
    }
  }

  const handlePreviewFile = (file: FileWithUI) => {
    setPreviewFile(file)
    setIsPreviewOpen(true)
  }

  const handleOpenLinkModal = (fileId?: string) => {
    if (fileId) {
      setFileToLink(fileId)
    }
    setIsLinkModalOpen(true)
  }

  // Filter files based on search query
  const filteredFiles = files.filter((file) => {
    return file.title.toLowerCase().includes(searchQuery.toLowerCase())
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

  const getStatusBadge = (status: FileWithUI["status"]) => {
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

  const columns: ColumnDef<FileWithUI>[] = [
    {
      accessorKey: "title",
      header: "Name",
      cell: ({ row }) => {
        const file = row.original
        return (
          <div className="flex items-center">
            <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="font-medium">{file.title}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "file_type",
      header: "Type",
      cell: ({ row }) => {
        const file = row.original
        return (
          <div className="flex items-center">
            <span className="text-sm text-muted-foreground uppercase">{file.file_type}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "created_at",
      header: "Upload Date",
      cell: ({ row }) => {
        const file = row.original
        return <span className="text-sm text-muted-foreground">{formatDate(file.created_at)}</span>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const file = row.original
        return (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={() => handleOpenLinkModal(file.uuid)}
            >
              <Link className="h-3 w-3 mr-1" />
              Link
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handlePreviewFile(file)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <a href={file.file} download={file.title} className="flex items-center">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleOpenLinkModal(file.uuid)}>
                  <Link className="h-4 w-4 mr-2" />
                  Link to KB
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDeleteFile(file.uuid)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">File Manager</h2>
        <div className="flex gap-2">
          <Button onClick={() => setIsUploadDialogOpen(true)}>Upload Files</Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={files}
        searchKey="title"
        searchPlaceholder="Search files..."
      />

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
        fileId={fileToLink}
        onLinkFiles={handleLinkFilesToKnowledgeBase}
        existingLinks={fileToLink ? files.find((f) => f.uuid === fileToLink)?.linkedKnowledgeBases || [] : []}
      />
    </div>
  )
}
