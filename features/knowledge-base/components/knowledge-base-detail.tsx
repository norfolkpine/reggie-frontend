"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  FileText,
  MoreHorizontal,
  ChevronDown,
  Plus,
  ArrowLeft,
  RefreshCw,
  Trash2,
  Download,
  Edit,
  Loader,
  AlertCircle,
  Folder as FolderIcon,
  MoreVertical,
  Upload,
} from "lucide-react";
import type {
  KnowledgeBase,
  File as FileType,
  FileKnowledgeBaseLink,
  Folder,
  FileWithUI,
} from "@/types/knowledge-base";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getKnowledgeBase } from "@/api/knowledge-bases";
import {
  KnowledgeBase as ApiKnowledgeBase,
  File as ApiFile,
} from "@/types/api";
import { useToast } from "@/components/ui/use-toast";
import { getModelProviders, ModelProvider } from "@/api/agent-providers";
import { getKnowledgeBaseFiles } from "@/api/knowledge-bases";
import { KnowledgeTypeEnum, KnowledgeBaseFile } from "@/types/knowledge-base";
import { unlinkFilesFromKb, patchFile, reingestFile } from "@/api/files";
import { useDebounce } from "@/hooks/use-debounce";
import { FileUpload } from "@/features/knowledge-base/components/file-upload"
import { uploadFiles } from "@/api/files"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface KnowledgeBaseDetailProps {
  knowledgeBaseId: string;
  knowledgeBase: KnowledgeBase | null;
  onBack: () => void;
  onEdit: () => void;
}

// Helper function to convert API KnowledgeBase to local KnowledgeBase format
const apiToLocalKnowledgeBase = (apiKB: ApiKnowledgeBase): KnowledgeBase => {
  return {
    id: apiKB.id,
    name: apiKB.name,
    description: apiKB.description || "",
    knowledge_type: apiKB.knowledge_type as KnowledgeTypeEnum,
    path: apiKB.path,
    unique_code: apiKB.unique_code,
    knowledgebase_id: apiKB.knowledgebase_id,
    vector_table_name: apiKB.vector_table_name,
    chunk_size: apiKB.chunk_size,
    chunk_overlap: apiKB.chunk_overlap,
    created_at: apiKB.created_at,
    updated_at: apiKB.updated_at,
    model_provider: apiKB.model_provider,
  };
};

export function KnowledgeBaseDetail({
  knowledgeBaseId,
  knowledgeBase,
  onBack,
  onEdit,
}: KnowledgeBaseDetailProps) {
  const { toast } = useToast();
  const [linkedFiles, setLinkedFiles] = useState<KnowledgeBaseFile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingKB, setIsLoadingKB] = useState(knowledgeBase === null);
  const [loadedKnowledgeBase, setLoadedKnowledgeBase] =
    useState<KnowledgeBase | null>(knowledgeBase);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState("files");
  const [modelProviders, setModelProviders] = useState<ModelProvider[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [totalFiles, setTotalFiles] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [reingestingFiles, setReingestingFiles] = useState<
    Record<string, boolean>
  >({});
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [folders, setFolders] = useState<Folder[]>([])

  // Fetch knowledge base details if not provided
  useEffect(() => {
    const fetchKnowledgeBase = async () => {
      if (knowledgeBase) {
        setLoadedKnowledgeBase(knowledgeBase);
        return;
      }

      setIsLoadingKB(true);
      try {
        const numericId = parseInt(knowledgeBaseId, 10);
        const response = await getKnowledgeBase(numericId);
        const localKB = apiToLocalKnowledgeBase(response);
        setLoadedKnowledgeBase(localKB);
      } catch (error) {
        console.error("Failed to fetch knowledge base details:", error);
        toast({
          title: "Error",
          description: "Failed to load knowledge base details",
          variant: "destructive",
        });
      } finally {
        setIsLoadingKB(false);
      }
    };

    fetchKnowledgeBase();
  }, [knowledgeBaseId, knowledgeBase, toast]);

  // Fetch model providers for displaying model names
  useEffect(() => {
    const fetchModelProviders = async () => {
      setIsLoadingModels(true);
      try {
        const response = await getModelProviders();
        setModelProviders(response.results);
      } catch (error) {
        console.error("Failed to fetch model providers:", error);
      } finally {
        setIsLoadingModels(false);
      }
    };

    if (activeTab === "configuration") {
      fetchModelProviders();
    }
  }, [activeTab]);

  // Fetch files when page changes or search query updates
  useEffect(() => {
    const fetchFiles = async () => {
      if (!knowledgeBaseId) return;

      setIsLoading(true);
      try {
        const numericId = parseInt(knowledgeBaseId, 10);
        const response = await getKnowledgeBaseFiles(numericId, {
          page: currentPage.toString(),
          page_size: itemsPerPage.toString(),
          search: debouncedSearchQuery,
        });

        setLinkedFiles(response.results);
        setTotalFiles(response.count);
        setHasNextPage(!!response.next);
      } catch (error) {
        console.error("Failed to fetch files:", error);
        toast({
          title: "Error",
          description: "Failed to load knowledge base files",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchFiles();
  }, [knowledgeBaseId, currentPage, itemsPerPage, debouncedSearchQuery, toast]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setCurrentPage(1);
    try {
      const numericId = parseInt(knowledgeBaseId, 10);
      const response = await getKnowledgeBaseFiles(numericId, {
        page: "1",
        page_size: itemsPerPage.toString(),
        search: debouncedSearchQuery,
      });
      setLinkedFiles(response.results);
      setTotalFiles(response.count);
      setHasNextPage(!!response.next);
      toast({
        title: "Success",
        description: "File list refreshed successfully",
      });
    } catch (error) {
      console.error("Failed to refresh files:", error);
      toast({
        title: "Error",
        description: "Failed to refresh file list",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [knowledgeBaseId, itemsPerPage, debouncedSearchQuery, toast]);

  const handleDeleteLink = async (fileId: string) => {
    try {
      await unlinkFilesFromKb({ uuid: fileId });
      toast({
        title: "Success",
        description: "File unlinked successfully",
      });
      handleRefresh();
    } catch (error) {
      console.error("Failed to unlink file:", error);
      toast({
        title: "Error",
        description: "Failed to unlink file",
        variant: "destructive",
      });
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(
        selectedFiles.map((fileId) => unlinkFilesFromKb({ uuid: fileId }))
      );

      toast({
        title: "Success",
        description: `${selectedFiles.length} files unlinked successfully`,
      });

      setSelectedFiles([]);
      handleRefresh();
    } catch (error) {
      console.error("Failed to unlink files:", error);
      toast({
        title: "Error",
        description: "Failed to unlink selected files",
        variant: "destructive",
      });
    }
  };

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles((prevSelected) =>
      prevSelected.includes(fileId)
        ? prevSelected.filter((id) => id !== fileId)
        : [...prevSelected, fileId]
    );
  };

  const handleReingestFile = async (fileId: string) => {
    setReingestingFiles((prev) => ({ ...prev, [fileId]: true }));
    try {
      await reingestFile(fileId, {});
      toast({
        title: "Success",
        description: "File reingestion started successfully",
      });
      // Refresh the list after a short delay to allow the backend to process
      setTimeout(() => {
        handleRefresh();
      }, 1000);
    } catch (error) {
      console.error("Failed to reingest file:", error);
      toast({
        title: "Error",
        description: "Failed to start file reingestion",
        variant: "destructive",
      });
    } finally {
      setReingestingFiles((prev) => ({ ...prev, [fileId]: false }));
    }
  };

  const handleFilesSelected = async (files: FileWithUI[]) => {
    try {
      toast({
        title: "Success",
        description: "Files uploaded successfully",
      });
      
      // Refresh the list after a short delay to allow the backend to process
      setIsUploadModalOpen(false);
      setTimeout(() => {
        handleRefresh();
      }, 1000);
    } catch (error) {
      console.error("Failed to upload files:", error);
      toast({
        title: "Error",
        description: "Failed to upload files",
        variant: "destructive",
      });
    }
  };

  // Filter files based on search query - no need for local filtering since we're using API search
  const filteredFiles = linkedFiles;
  const totalPages = Math.ceil(totalFiles / itemsPerPage);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  if (isLoadingKB) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">
            Loading knowledge base details...
          </p>
        </div>
      </div>
    );
  }

  if (!loadedKnowledgeBase) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-lg text-muted-foreground">
          Knowledge base not found
        </p>
        <Button variant="outline" className="mt-4" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Knowledge Bases
        </Button>
      </div>
    );
  }

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
                <BreadcrumbLink>{loadedKnowledgeBase.name}</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex items-center gap-4 mt-2">
            <h2 className="text-2xl font-bold">{loadedKnowledgeBase.name}</h2>
            <Button
              variant="outline"
              size="icon"
              onClick={onEdit}
              className="h-8 w-8"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-muted-foreground">
            {loadedKnowledgeBase.description}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <Button onClick={() => setIsUploadModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Files
          </Button>
        </div>
      </div>

      {/* File Upload Modal */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Files</DialogTitle>
            <DialogDescription>
              Upload files to your knowledge base. Supported formats include PDF, DOCX, XLSX, TXT, CSV, MD, JPEG, and PNG.
            </DialogDescription>
          </DialogHeader>
          <FileUpload
            onUploadComplete={handleFilesSelected}
            folders={folders}
            currentFolderId={null}
            knowledgeBaseId={loadedKnowledgeBase.knowledgebase_id}
          />
        </DialogContent>
      </Dialog>

      {/* Alert message */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 flex items-center">
        <span className="text-yellow-800">
          😊 Please wait for your files to finish parsing before starting an
          AI-powered chat.
        </span>
      </div>

      {/* Tabs for files and configuration */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="files" className="space-y-4 pt-4">
          {/* Search and filters */}
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Selected files actions */}
          {selectedFiles.length > 0 && (
            <div className="flex items-center justify-between bg-muted p-2 rounded-md">
              <span className="text-sm">
                {selectedFiles.length} files selected
              </span>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedFiles([])}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                >
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
                      checked={
                        selectedFiles.length === filteredFiles.length &&
                        filteredFiles.length > 0
                      }
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedFiles(
                            filteredFiles.map((file) => file.file_id)
                          );
                        } else {
                          setSelectedFiles([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>File Size</TableHead>
                  <TableHead>Chunk Size</TableHead>
                  <TableHead>Uploaded At</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow key="loading">
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredFiles.length === 0 ? (
                  <TableRow key="empty">
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      {searchQuery
                        ? "No files match your search"
                        : "No files in this knowledge base"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFiles.map((file) => (
                    <TableRow key={file.file_id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedFiles.includes(file.file_id)}
                          onCheckedChange={() =>
                            toggleFileSelection(file.file_id)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2" />
                          <span className="font-medium">{file.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>{file.file_size} bytes</TableCell>
                      <TableCell>{file.chunk_size} tokens</TableCell>
                      <TableCell>{formatDate(file.created_at)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            file.status === "completed"
                              ? "success"
                              : file.status === "processing"
                              ? "default"
                              : file.status === "failed"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {file.status.charAt(0).toUpperCase() +
                            file.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {file.status === "failed" ? (
                            <div className="flex items-center text-destructive">
                              <AlertCircle className="h-4 w-4 mr-1" />
                              <span className="text-sm">Error</span>
                            </div>
                          ) : (
                            <div className="w-full bg-secondary h-2 rounded-full">
                              <div
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{ width: `${file.progress * 100}%` }}
                              />
                            </div>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleReingestFile(file.file_id)}
                            disabled={reingestingFiles[file.file_id]}
                          >
                            <RefreshCw
                              className={`h-4 w-4 ${
                                reingestingFiles[file.file_id]
                                  ? "animate-spin"
                                  : ""
                              }`}
                            />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {file.error && (
                              <DropdownMenuItem
                                onClick={() => {
                                  toast({
                                    title: "Processing Error",
                                    description: file.error,
                                    variant: "destructive",
                                  });
                                }}
                              >
                                <AlertCircle className="h-4 w-4 mr-2" />
                                View Error
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleDeleteLink(file.file_id)}
                            >
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
              <div className="text-sm text-muted-foreground">
                Total {totalFiles} files
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                  </PaginationItem>

                  {Array.from({ length: Math.min(totalPages, 5) }).map(
                    (_, i) => {
                      let pageNum = i + 1;

                      // If we have more than 5 pages and we're not at the beginning
                      if (totalPages > 5 && currentPage > 3) {
                        pageNum = currentPage - 3 + i;

                        // Don't go beyond the total pages
                        if (pageNum > totalPages) {
                          pageNum = totalPages - (4 - i);
                        }
                      }

                      // Don't show page numbers beyond the total
                      if (pageNum <= totalPages) {
                        return (
                          <PaginationItem key={pageNum}>
                            <Button
                              variant={
                                currentPage === pageNum ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          </PaginationItem>
                        );
                      }
                      return null;
                    }
                  )}

                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={!hasNextPage}
                    >
                      Next
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Items per page:
                </span>
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
                          setItemsPerPage(value);
                          setCurrentPage(1);
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
        </TabsContent>

        <TabsContent value="configuration" className="space-y-6 pt-4">
          <div className="grid gap-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Embedding Model</h3>
              <div className="flex items-center justify-between border rounded-md p-4">
                {isLoadingModels ? (
                  <div className="flex items-center space-x-2">
                    <Loader className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Loading model details...</span>
                  </div>
                ) : (
                  <>
                    <div>
                      <div className="font-medium">
                        {loadedKnowledgeBase.model_provider
                          ? modelProviders.find(
                              (p) => p.id === loadedKnowledgeBase.model_provider
                            )?.model_name || "Unknown Model"
                          : "No model selected"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {loadedKnowledgeBase.model_provider
                          ? modelProviders.find(
                              (p) => p.id === loadedKnowledgeBase.model_provider
                            )?.provider || "Unknown Provider"
                          : "No provider selected"}{" "}
                        embedding model
                      </div>
                    </div>
                    <Badge variant="outline">
                      {modelProviders.find(
                        (p) => p.id === loadedKnowledgeBase.model_provider
                      )?.is_enabled
                        ? "Active"
                        : "Inactive"}
                    </Badge>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-medium">Chunking Configuration</h3>
              <div className="flex items-center justify-between border rounded-md p-4">
                <div>
                  <div className="font-medium">Chunk Settings</div>
                  <div className="text-sm text-muted-foreground">
                    {loadedKnowledgeBase.chunk_size &&
                      `Chunk size: ${loadedKnowledgeBase.chunk_size} tokens`}
                    {loadedKnowledgeBase.chunk_size &&
                      loadedKnowledgeBase.chunk_overlap &&
                      ", "}
                    {loadedKnowledgeBase.chunk_overlap &&
                      `Overlap: ${loadedKnowledgeBase.chunk_overlap} tokens`}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-medium">API Details</h3>
              <div className="border rounded-md p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Knowledge Base ID:
                  </span>
                  <span className="text-sm font-mono">
                    {loadedKnowledgeBase.id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Created At:
                  </span>
                  <span className="text-sm">
                    {formatDate(loadedKnowledgeBase.created_at)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Last Updated:
                  </span>
                  <span className="text-sm">
                    {formatDate(loadedKnowledgeBase.updated_at)}
                  </span>
                </div>
              </div>
            </div>

            <Button variant="outline" onClick={onEdit} className="w-full">
              <Edit className="h-4 w-4 mr-2" />
              Edit Configuration
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
