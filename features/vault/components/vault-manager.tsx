"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getProject } from "@/api/projects";
import { uploadFiles, getVaultFilesByProject, deleteVaultFile, VaultFilesResponse } from "@/api/vault";
import { Project, VaultFile as BaseVaultFile } from "@/types/api";
import { handleApiError } from "@/lib/utils/handle-api-error";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { Loader2, Settings, Activity, ArrowLeft } from "__barrel_optimize__?names=Activity,ArrowLeft,Loader2,Settings!=!lucide-react";
import { Plus, FileText, Filter, ChevronDown, Eye, Download, Link, Trash2, MoreHorizontal, UploadCloud } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import SearchInput from "@/components/ui/search-input";
import { formatDistanceToNow } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileUpload } from "./file-upload";
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator 
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
  PaginationItem,
  PaginationEllipsis,
} from "@/components/ui/pagination";

// Extended VaultFile interface with additional properties from the API response
interface VaultFile extends BaseVaultFile {
  filename?: string;
  original_filename?: string;
  size?: number;
  // type is not included in the interface as we're accessing it with (file as any).type
  file_type?: string; // This is derived from the filename extension or MIME type for filtering
}

export function VaultManager() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [vaultFiles, setVaultFiles] = useState<VaultFile[]>([]);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showAllFiles, setShowAllFiles] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filesCount, setFilesCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('vault_active_tab') || 'files';
    }
    return 'files';
  });
  const projectId = params?.id as string;

  useEffect(() => {
    fetchProject();
    fetchFiles();
  }, [projectId, currentPage, itemsPerPage]);

  // Reset to first page when search query or filters change
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchFiles();
      }
    }, 500);
    
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Persist activeTab in localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vault_active_tab', activeTab);
    }
  }, [activeTab]);
  
  const fetchProject = async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      const data = await getProject(Number(projectId));
      setProject(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load project",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFiles = async () => {
    try {
      const response = await getVaultFilesByProject(
        Number(projectId),
        currentPage,
        itemsPerPage,
        searchQuery
      );
      
      setFilesCount(response.count);
      setHasNextPage(!!response.next);
      setHasPreviousPage(!!response.previous);
      
      // Add file_type property based on filename extension or MIME type
      const filesWithType: VaultFile[] = response.results.map(file => {
        // Use the MIME type if available (e.g., 'application/pdf' -> 'pdf')
        const mimeType = (file as any).type;
        const mimeExtension = mimeType ? mimeType.split('/')[1] : '';
                // Or extract extension from filename
        const fileExtension = file.filename?.split('.').pop()?.toLowerCase() || mimeExtension || '';
        
        return {
          ...file,
          file_type: fileExtension
        };
      });
      setVaultFiles(filesWithType);
    } catch (error) {
      console.error('Error fetching vault files:', error);
      toast({
        title: "Error",
        description: "Failed to load vault files",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (uploadedFiles: any[]) => {
    if (!uploadedFiles || uploadedFiles.length === 0) return;
    
    // Close the upload dialog
    setIsUploadDialogOpen(false);
    
    toast({
      title: "Success",
      description: `${uploadedFiles.length} file(s) uploaded successfully`,
    });
    fetchFiles(); // Refresh the file list
  };

  const handleFileDownload = (file: VaultFile) => {
    // Direct download through URL
    if (file.file) {
      const a = document.createElement('a');
      a.href = file.file;
      a.download = file.filename || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleFilePreview = (file: VaultFile) => {
    // Open file in new tab for preview
    if (file.file) {
      window.open(file.file, '_blank');
    }
  };

  const handleFileDelete = async (fileId: number) => {
    try {
      await deleteVaultFile(fileId);
      toast({
        title: "Success",
        description: "File deleted successfully",
      });
      fetchFiles(); // Refresh the file list
      // Clear selected files after deletion
      setSelectedFiles([]);
    } catch (error) {
      const { message } = handleApiError(error);
      toast({
        title: "Error",
        description: message || "Failed to delete file",
        variant: "destructive",
      });
    }
  };
  
  const handleBulkDelete = async () => {
    if (selectedFiles.length === 0) return;
    
    setIsDeleting(true);
    try {
      let successCount = 0;
      let errorCount = 0;
      
      // Process deletion one by one
      for (const fileId of selectedFiles) {
        try {
          await deleteVaultFile(fileId);
          successCount++;
        } catch (error) {
          console.error(`Failed to delete file ID ${fileId}:`, error);
          errorCount++;
        }
      }
      
      // Notify user about the results
      if (successCount > 0) {
        toast({
          title: "Success",
          description: `${successCount} file${successCount !== 1 ? 's' : ''} deleted successfully`,
        });
      }
      
      if (errorCount > 0) {
        toast({
          title: "Error",
          description: `Failed to delete ${errorCount} file${errorCount !== 1 ? 's' : ''}`,
          variant: "destructive",
        });
      }
      
      // Refresh the file list
      fetchFiles();
      // Clear selected files
      setSelectedFiles([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred during bulk deletion",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      const filteredFiles = vaultFiles
        .filter(file => {
          const fileType = file.file_type || '';
          const matchesType = showAllFiles || 
            (activeFilters.length === 0) || 
            activeFilters.some((filter: string) => fileType.includes(filter));
            
          const matchesSearch = file.filename?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            file.original_filename?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            false;
          return matchesType && matchesSearch;
        });
      setSelectedFiles(filteredFiles.map(file => file.id));
    } else {
      setSelectedFiles([]);
    }
  };
  
  const toggleSelectFile = (fileId: number, checked: boolean) => {
    setSelectedFiles(prev => 
      checked 
        ? [...prev, fileId] 
        : prev.filter(id => id !== fileId)
    );
  };

  if (!project && !loading) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Project not found</h2>
        <p className="text-muted-foreground mt-2">The requested project could not be found.</p>
        <Button className="mt-4" onClick={() => router.push("/vault")}>
          Back to Vault
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/vault")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-medium">
            {loading ? "Loading project..." : project?.name}
          </h1>
          {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs 
            defaultValue="files" 
            value={activeTab} 
            onValueChange={(value) => {
              setActiveTab(value);
            }}
          >
            <TabsList>
              <TabsTrigger value="files">Files</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="files" className="mt-4">
              {/* Replace with custom file manager UI since shared component doesn't support our vault-specific API needs */}
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center py-4 gap-3 justify-between">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative w-full sm:max-w-sm">
                        <SearchInput 
                          placeholder="Search files..." 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full" 
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9">
                              <Filter className="mr-2 h-4 w-4" />
                              Filter
                              <ChevronDown className="ml-1 h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-56">
                            <DropdownMenuCheckboxItem 
                              checked={showAllFiles}
                              onCheckedChange={(checked) => {
                                setShowAllFiles(checked);
                                if (checked) setActiveFilters([]);
                              }}
                            >
                              All Files
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuCheckboxItem 
                              checked={activeFilters.includes('pdf') || showAllFiles}
                              onCheckedChange={(checked) => {
                                setShowAllFiles(false);
                                setActiveFilters(prev => checked 
                                  ? [...prev.filter(f => f !== 'pdf'), 'pdf'] 
                                  : prev.filter(f => f !== 'pdf'))
                              }}
                            >
                              PDF Documents
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem 
                              checked={activeFilters.includes('doc') || activeFilters.includes('docx') || showAllFiles}
                              onCheckedChange={(checked) => {
                                setShowAllFiles(false);
                                const docFilters = ['doc', 'docx'];
                                setActiveFilters(prev => 
                                  checked 
                                    ? [...prev.filter(f => !docFilters.includes(f)), ...docFilters] 
                                    : prev.filter(f => !docFilters.includes(f))
                                );
                              }}
                            >
                              Word Documents
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem 
                              checked={activeFilters.includes('xls') || activeFilters.includes('xlsx') || showAllFiles}
                              onCheckedChange={(checked) => {
                                setShowAllFiles(false);
                                const excelFilters = ['xls', 'xlsx'];
                                setActiveFilters(prev => 
                                  checked 
                                    ? [...prev.filter(f => !excelFilters.includes(f)), ...excelFilters] 
                                    : prev.filter(f => !excelFilters.includes(f))
                                );
                              }}
                            >
                              Excel Spreadsheets
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem 
                              checked={activeFilters.includes('txt') || activeFilters.includes('csv') || showAllFiles}
                              onCheckedChange={(checked) => {
                                setShowAllFiles(false);
                                const textFilters = ['txt', 'csv'];
                                setActiveFilters(prev => 
                                  checked 
                                    ? [...prev.filter(f => !textFilters.includes(f)), ...textFilters] 
                                    : prev.filter(f => !textFilters.includes(f))
                                );
                              }}
                            >
                              Text Files
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem 
                              checked={activeFilters.includes('jpg') || activeFilters.includes('jpeg') || activeFilters.includes('png') || showAllFiles}
                              onCheckedChange={(checked) => {
                                setShowAllFiles(false);
                                const imageFilters = ['jpg', 'jpeg', 'png'];
                                setActiveFilters(prev => 
                                  checked 
                                    ? [...prev.filter(f => !imageFilters.includes(f)), ...imageFilters] 
                                    : prev.filter(f => !imageFilters.includes(f))
                                );
                              }}
                            >
                              Images
                            </DropdownMenuCheckboxItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {selectedFiles.length > 0 && (
                        <Button 
                          variant="destructive" 
                          onClick={handleBulkDelete}
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Selected ({selectedFiles.length})
                            </>
                          )}
                        </Button>
                      )}
                      <Button onClick={() => setIsUploadDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Upload Files
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">
                            <Checkbox 
                            checked={selectedFiles.length > 0 && selectedFiles.length === vaultFiles.filter((file) => {
                              const fileType = file.file_type || '';
                              const matchesType = showAllFiles || 
                                (activeFilters.length === 0) || 
                                activeFilters.some((filter: string) => fileType.includes(filter));
                                
                              const matchesSearch = file.filename?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                                file.original_filename?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                                false;
                              return matchesType && matchesSearch;
                            }).length}
                            onCheckedChange={toggleSelectAll}
                            aria-label="Select all files"
                          />
                        </TableHead>
                        <TableHead className="w-[350px]">Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Last Modified</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vaultFiles.length > 0 ? (
                        vaultFiles
                          .filter(file => {
                            // Apply file type filters
                            const fileType = file.file_type || '';
                            const matchesType = showAllFiles || 
                              (activeFilters.length === 0) || 
                              activeFilters.some((filter: string) => fileType.includes(filter));
                            
                            // Apply search filter
                            const matchesSearch = file.filename?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                              file.original_filename?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                              false;
                            
                            return matchesType && matchesSearch;
                          })
                          .map((file) => (
                          <TableRow key={file.id}>
                            <TableCell>
                              <Checkbox 
                                checked={selectedFiles.includes(file.id)}
                                onCheckedChange={(checked) => toggleSelectFile(file.id, !!checked)}
                                aria-label={`Select ${file.original_filename || file.filename}`}
                              />
                            </TableCell>
                             <TableCell className="font-medium">
                              <div className="flex items-center space-x-2">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                                <span>
                                  {/* Display original filename if available, otherwise the filename */}
                                  {file.original_filename || file.filename || 'Unnamed File'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{file.file_type ? file.file_type.toUpperCase() : 'UNKNOWN'}</Badge>
                            </TableCell>
                            <TableCell>
                              {/* Display file size in KB or MB */}
                              {file.size 
                                ? file.size < 1024 * 1024 
                                  ? `${(file.size / 1024).toFixed(1)} KB` 
                                  : `${(file.size / (1024 * 1024)).toFixed(2)} MB`
                                : 'N/A'}
                            </TableCell>
                            <TableCell>
                              {file.created_at ? 
                                formatDistanceToNow(new Date(file.created_at), { addSuffix: true }) : 
                                'N/A'}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleFilePreview(file)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Preview
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleFileDownload(file)}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Link className="mr-2 h-4 w-4" />
                                    Copy Link
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => handleFileDelete(file.id)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            No files found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              {/* Pagination - moved outside the box */}
              <div className="flex items-center justify-between mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1 || !hasPreviousPage}
                      >
                        Previous
                      </Button>
                    </PaginationItem>
                    {(() => {
                      const totalPages = Math.max(1, Math.ceil(filesCount / itemsPerPage));
                      return totalPages > 5 && currentPage > 3 ? (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      ) : null;
                    })()}
                    {(() => {
                      const totalPages = Math.max(1, Math.ceil(filesCount / itemsPerPage));
                      const pageNums = [];
                      let startPage = Math.max(1, currentPage - 2);
                      let endPage = Math.min(totalPages, currentPage + 2);
                      
                      if (currentPage <= 3) {
                        endPage = Math.min(5, totalPages);
                      } else if (currentPage >= totalPages - 2) {
                        startPage = Math.max(1, totalPages - 4);
                      }
                      
                      for (let i = startPage; i <= endPage; i++) {
                        pageNums.push(i);
                      }
                      
                      return pageNums.map((pageNum) => {
                        if (pageNum >= 1 && pageNum <= totalPages) {
                          return (
                            <PaginationItem key={pageNum}>
                              <Button
                                variant={currentPage === pageNum ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setCurrentPage(pageNum)}
                              >
                                {pageNum}
                              </Button>
                            </PaginationItem>
                          );
                        }
                        return null;
                      });
                    })()}
                    {(() => {
                      const totalPages = Math.max(1, Math.ceil(filesCount / itemsPerPage));
                      return totalPages > 5 && currentPage < totalPages - 2 ? (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      ) : null;
                    })()}
                    <PaginationItem>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => 
                          setCurrentPage((prev) => 
                            Math.min(prev + 1, Math.max(1, Math.ceil(filesCount / itemsPerPage)))
                          )
                        }
                        disabled={currentPage >= Math.ceil(filesCount / itemsPerPage) || !hasNextPage}
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
              
              {/* File Upload Dialog */}
              <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Upload Files to Vault</DialogTitle>
                    <DialogDescription>
                      Upload files to your vault. Supported formats include PDF, DOCX, XLSX, TXT, CSV, JPEG, and PNG.
                    </DialogDescription>
                  </DialogHeader>
                  <FileUpload
                    onUploadComplete={handleFileUpload}
                    projectId={Number(projectId)}
                  />
                </DialogContent>
              </Dialog>
            </TabsContent>
            
            <TabsContent value="activity" className="mt-4">
              <div className="bg-white rounded-md border shadow-sm p-6">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Activity</h3>
                </div>
                <p className="text-muted-foreground mt-4">Activity feed will be displayed here.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="mt-4">
              <div className="bg-white rounded-md border shadow-sm p-6">
                <div className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Settings</h3>
                </div>
                
                {project?.description && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium">Description</h4>
                    <p className="text-muted-foreground mt-1">{project.description}</p>
                  </div>
                )}
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium">Project ID</h4>
                  <p className="text-muted-foreground mt-1 font-mono">{projectId}</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
