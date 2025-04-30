"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  FileText,
  Search,
  MoreHorizontal,
  ChevronDown,
  Plus,
  ArrowLeft,
  RefreshCw,
  Trash2,
  Download,
  Edit,
} from "lucide-react"
import type { KnowledgeBase, File as FileType, FileKnowledgeBaseLink } from "../types"
// Keep the imports and add Tabs components if not already imported
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface KnowledgeBaseDetailProps {
  knowledgeBaseId: string
  knowledgeBase: KnowledgeBase | null
  onBack: () => void
  onEdit: () => void
}

// Update the component to include a state for active tab
export function KnowledgeBaseDetail({ knowledgeBaseId, knowledgeBase, onBack, onEdit }: KnowledgeBaseDetailProps) {
  const [linkedFiles, setLinkedFiles] = useState<(FileType & { link: FileKnowledgeBaseLink })[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [activeTab, setActiveTab] = useState("files")

  useEffect(() => {
    fetchLinkedFiles()
  }, [knowledgeBaseId])

  const fetchLinkedFiles = async () => {
    setIsLoading(true)
    try {
      // In a real implementation, these would be actual API calls
      // const links = await knowledgeBaseService.getFileKnowledgeBaseLinks(knowledgeBaseId)
      // const fileIds = links.map(link => link.fileId)
      // const files = await knowledgeBaseService.getFilesByIds(fileIds)

      // Simulate API calls
      await Promise.all([
        new Promise((resolve) => setTimeout(resolve, 1000)),
        new Promise((resolve) => setTimeout(resolve, 1000)),
      ])

      // Mock linked files with their ingestion status
      const mockLinkedFiles: (FileType & { link: FileKnowledgeBaseLink })[] = [
        {
          id: "file-1",
          name: "product-requirements.pdf",
          type: "application/pdf",
          size: 2500000,
          url: "#",
          uploadedAt: new Date(Date.now() - 3600000).toISOString(),
          status: "ready",
          folderId: "folder-3",
          thumbnailUrl: "/pdf-icon-stack.png",
          linkedKnowledgeBases: [knowledgeBaseId],
          link: {
            id: "link-1",
            fileId: "file-1",
            knowledgeBaseId: knowledgeBaseId,
            status: "completed",
            createdAt: new Date(Date.now() - 3500000).toISOString(),
            updatedAt: new Date(Date.now() - 3400000).toISOString(),
          },
        },
        {
          id: "file-2",
          name: "market-research.docx",
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          size: 1800000,
          url: "#",
          uploadedAt: new Date(Date.now() - 86400000).toISOString(),
          status: "ready",
          folderId: "folder-5",
          thumbnailUrl: "/document-stack.png",
          linkedKnowledgeBases: [knowledgeBaseId],
          link: {
            id: "link-2",
            fileId: "file-2",
            knowledgeBaseId: knowledgeBaseId,
            status: "processing",
            createdAt: new Date(Date.now() - 85000000).toISOString(),
            updatedAt: new Date(Date.now() - 84000000).toISOString(),
          },
        },
        {
          id: "file-3",
          name: "customer-feedback.csv",
          type: "text/csv",
          size: 950000,
          url: "#",
          uploadedAt: new Date(Date.now() - 172800000).toISOString(),
          status: "ready",
          folderId: "folder-5",
          thumbnailUrl: "/spreadsheet.png",
          linkedKnowledgeBases: [knowledgeBaseId],
          link: {
            id: "link-3",
            fileId: "file-3",
            knowledgeBaseId: knowledgeBaseId,
            status: "failed",
            createdAt: new Date(Date.now() - 170000000).toISOString(),
            updatedAt: new Date(Date.now() - 169000000).toISOString(),
            errorMessage: "Failed to parse CSV format",
          },
        },
        {
          id: "file-5",
          name: "user-manual.pdf",
          type: "application/pdf",
          size: 3200000,
          url: "#",
          uploadedAt: new Date(Date.now() - 345600000).toISOString(),
          status: "ready",
          folderId: "folder-4",
          thumbnailUrl: "/pdf-icon-stack.png",
          linkedKnowledgeBases: [knowledgeBaseId],
          link: {
            id: "link-5",
            fileId: "file-5",
            knowledgeBaseId: knowledgeBaseId,
            status: "completed",
            createdAt: new Date(Date.now() - 340000000).toISOString(),
            updatedAt: new Date(Date.now() - 339000000).toISOString(),
          },
        },
        {
          id: "file-6",
          name: "technical-whitepaper.pdf",
          type: "application/pdf",
          size: 4100000,
          url: "#",
          uploadedAt: new Date(Date.now() - 432000000).toISOString(),
          status: "ready",
          folderId: null,
          thumbnailUrl: "/pdf-icon-stack.png",
          linkedKnowledgeBases: [knowledgeBaseId],
          link: {
            id: "link-6",
            fileId: "file-6",
            knowledgeBaseId: knowledgeBaseId,
            status: "pending",
            createdAt: new Date(Date.now() - 430000000).toISOString(),
            updatedAt: new Date(Date.now() - 430000000).toISOString(),
          },
        },
      ]

      setLinkedFiles(mockLinkedFiles)
    } catch (error) {
      console.error("Failed to fetch linked files:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchLinkedFiles()
  }

  const handleToggleFileEnabled = (fileId: string, enabled: boolean) => {
    setLinkedFiles((prevFiles) =>
      prevFiles.map((file) =>
        file.id === fileId ? { ...file, link: { ...file.link, status: enabled ? "processing" : "disabled" } } : file,
      ),
    )
  }

  const handleDeleteLink = async (fileId: string) => {
    try {
      // In a real implementation, this would be an actual API call
      // await knowledgeBaseService.unlinkFile(fileId, knowledgeBaseId)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      setLinkedFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId))
    } catch (error) {
      console.error("Failed to unlink file:", error)
    }
  }

  const handleBulkDelete = async () => {
    try {
      // In a real implementation, this would be an actual API call
      // await Promise.all(selectedFiles.map(fileId => knowledgeBaseService.unlinkFile(fileId, knowledgeBaseId)))

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      setLinkedFiles((prevFiles) => prevFiles.filter((file) => !selectedFiles.includes(file.id)))
      setSelectedFiles([])
    } catch (error) {
      console.error("Failed to unlink files:", error)
    }
  }

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles((prevSelected) =>
      prevSelected.includes(fileId) ? prevSelected.filter((id) => id !== fileId) : [...prevSelected, fileId],
    )
  }

  // Filter files based on search query
  const filteredFiles = linkedFiles.filter((file) => file.name.toLowerCase().includes(searchQuery.toLowerCase()))

  // Pagination
  const totalPages = Math.ceil(filteredFiles.length / itemsPerPage)
  const paginatedFiles = filteredFiles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }

  const getStatusBadge = (status: FileKnowledgeBaseLink["status"]) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>
      case "processing":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200 animate-pulse">Processing</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Failed</Badge>
      case "disabled":
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Disabled
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getFileIcon = (fileType: string) => {
    return <FileText className="h-5 w-5" />
  }

  // Get embedding model and chunk method display names
  const getEmbeddingModelName = (modelId: string) => {
    const modelMap = {
      "openai-ada-002": "OpenAI Ada 002",
      "openai-3-small": "OpenAI 3 Small",
      "openai-3-large": "OpenAI 3 Large",
      "cohere-embed-english": "Cohere Embed English",
      "local-minilm": "Local MiniLM",
    }
    return modelMap[modelId as keyof typeof modelMap] || modelId
  }

  const getChunkMethodName = (methodId: string) => {
    const methodMap = {
      "fixed-size": "Fixed Size",
      paragraph: "Paragraph",
      sentence: "Sentence",
      semantic: "Semantic",
    }
    return methodMap[methodId as keyof typeof methodMap] || methodId
  }

  if (isLoading && !knowledgeBase) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!knowledgeBase) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-lg text-muted-foreground">Knowledge base not found</p>
        <Button variant="outline" className="mt-4" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Knowledge Bases
        </Button>
      </div>
    )
  }

  // Update the return statement to include tabs for files and configuration
  return (
    <div className="space-y-4">
      {/* Breadcrumb and header */}
      <div className="flex items-center justify-between">
        <div>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink onClick={onBack} className="cursor-pointer">
                  Knowledge Bases
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink>{knowledgeBase.name}</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex items-center gap-4 mt-2">
            <h2 className="text-2xl font-bold">{knowledgeBase.name}</h2>
            <Button variant="outline" size="icon" onClick={onEdit} className="h-8 w-8">
              <Edit className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-muted-foreground">{knowledgeBase.description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Files
          </Button>
        </div>
      </div>

      {/* Alert message */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 flex items-center">
        <span className="text-yellow-800">
          😊 Please wait for your files to finish parsing before starting an AI-powered chat.
        </span>
      </div>

      {/* Tabs for files and configuration */}

      <div className="space-y-4 pt-4">
          {/* Search and filters */}
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Bulk
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>

          {/* Selected files actions */}
          {selectedFiles.length > 0 && (
            <div className="flex items-center justify-between bg-muted p-2 rounded-md">
              <span className="text-sm">{selectedFiles.length} files selected</span>
              <div className="space-x-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedFiles([])}>
                  Cancel
                </Button>
                <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                  Remove Selected
                </Button>
              </div>
            </div>
          )}

          {/* Files table */}
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedFiles.length === filteredFiles.length && filteredFiles.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedFiles(filteredFiles.map((file) => file.id))
                        } else {
                          setSelectedFiles([])
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Chunk Number</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead>Chunk Method</TableHead>
                  <TableHead>Enable</TableHead>
                  <TableHead>Parsing Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedFiles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {searchQuery ? "No files match your search" : "No files in this knowledge base"}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedFiles.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedFiles.includes(file.id)}
                          onCheckedChange={() => toggleFileSelection(file.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getFileIcon(file.type)}
                          <span className="ml-2 font-medium">{file.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {Math.floor(Math.random() * 200) + 1} {/* Mock chunk number */}
                      </TableCell>
                      <TableCell>{formatDate(file.uploadedAt)}</TableCell>
                      <TableCell>{getChunkMethodName(knowledgeBase.chunkMethod)}</TableCell>
                      <TableCell>
                        <Switch
                          checked={file.link.status !== "disabled"}
                          onCheckedChange={(checked) => handleToggleFileEnabled(file.id, checked)}
                        />
                      </TableCell>
                      <TableCell>{getStatusBadge(file.link.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <a href={file.url} download={file.name}>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </a>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteLink(file.id)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove from KB
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {filteredFiles.length > 0 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Total {filteredFiles.length}</div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    />
                  </PaginationItem>

                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                    let pageNum = i + 1

                    // If we have more than 5 pages and we're not at the beginning
                    if (totalPages > 5 && currentPage > 3) {
                      pageNum = currentPage - 3 + i

                      // Don't go beyond the total pages
                      if (pageNum > totalPages) {
                        pageNum = totalPages - (4 - i)
                      }
                    }

                    // Don't show page numbers beyond the total
                    if (pageNum <= totalPages) {
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink isActive={currentPage === pageNum} onClick={() => setCurrentPage(pageNum)}>
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    }
                    return null
                  })}

                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Items per page:</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      {itemsPerPage}
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {[5, 10, 20, 50].map((value) => (
                      <DropdownMenuItem
                        key={value}
                        onClick={() => {
                          setItemsPerPage(value)
                          setCurrentPage(1)
                        }}
                      >
                        {value}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )}
        </div>

    </div>
  )
}
