"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getProject } from "@/api/projects";
import { uploadFiles, getVaultFilesByProject, deleteVaultFile, VaultFilesResponse, createFolder, moveVaultFiles } from "@/api/vault";
import { Project, VaultFile as BaseVaultFile } from "@/types/api";
import { handleApiError } from "@/lib/utils/handle-api-error";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { Loader2, Settings, Activity, ArrowLeft, Edit, FolderPlus, Folder, Plus, FileText, Filter, ChevronDown, Eye, Download, Link, Trash2, MoreHorizontal, UploadCloud, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import SearchInput from "@/components/ui/search-input";
import { formatDistanceToNow } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import { isSafeUrl } from '@/lib/utils/url';
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useHeader } from "@/contexts/header-context";
import { useAiPanel } from "@/contexts/ai-panel-context";
import { InstructionsDialog } from "./instructions-dialog";
import { CreateFolderDialog } from "./create-folder-dialog";

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
  const { setHeaderActions, setHeaderCustomContent } = useHeader();
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
  const projectId = params?.uuid as string;
  const [renameOpen, setRenameOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  // const [deleteProjectOpen, setDeleteProjectOpen] = useState(false);
  const { openPanel: openAiPanel, setCurrentContext } = useAiPanel();
  const [currentFolderId, setCurrentFolderId] = useState(0) // 0 means root level
  const [folderBreadcrumbs, setFolderBreadcrumbs] = useState<{id: number, name: string}[]>([])
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [showInstructionsDialog, setShowInstructionsDialog] = useState(false);
  const [instructions, setInstructions] = useState("");

  const [isDragging, setIsDragging] = useState(false)
  const [draggedFiles, setDraggedFiles] = useState<number[]>([])
  const [dragOverFolderId, setDragOverFolderId] = useState<number | null>(null)
  // Set header actions and custom content
  useEffect(() => {
    if (loading) {
      // Show loading state
      setHeaderActions([]);
      setHeaderCustomContent(
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-gray-600">
            <span 
              className="hover:text-gray-900 cursor-pointer"
              onClick={() => router.push("/vault")}
            >
              Vault
            </span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">Loading project...</span>
          </div>
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      );
    } else if (project) {
      // Set the back button and project name with edit functionality
      setHeaderActions([
        {
          label: "",
          onClick: () => {
            setShowInstructionsDialog(true);
          },
          variant: "ghost",
          size: "icon",
          icon: <Settings className="h-4 w-4" />
        },
        // {
        //   label: "Delete Project",
        //   onClick: () => setDeleteProjectOpen(true),
        //   variant: "outline",
        //   size: "sm",
        //   icon: <Trash2 className="h-4 w-4" />
        // }
      ]);

      // Set project name with edit button as custom content
      setHeaderCustomContent(
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-gray-600">
            <span 
              className="hover:text-gray-900 cursor-pointer"
              onClick={() => router.push("/vault")}
            >
              Vault
            </span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">{project.name}</span>
          </div>
          <button
            type="button"
            className="p-1 rounded hover:bg-gray-200 focus:outline-none"
            title="Edit project name"
            onClick={() => { setRenameOpen(true); setNewName(project.name || ""); }}
          >
            <Edit className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      );
    }

    // Cleanup when component unmounts
    return () => {
      setHeaderActions([]);
      setHeaderCustomContent(null);
    };
  }, [setHeaderActions, setHeaderCustomContent, project, loading, router]);

  // Define table columns for colspan calculation
  const columns = [
    { id: 'select', header: 'Select' },
    { id: 'name', header: 'Name' },
    { id: 'type', header: 'Type' },
    { id: 'size', header: 'Size' },
    { id: 'modified', header: 'Last Modified' },
    { id: 'actions', header: 'Actions' }
  ];

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
      const data = await getProject(projectId);
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
        projectId,
        currentPage,
        itemsPerPage,
        searchQuery
      );
      
      setFilesCount(response.count);
      setHasNextPage(!!response.next);
      setHasPreviousPage(!!response.previous);
      
      // Add file_type property based on filename extension or MIME type
      const filesWithType: VaultFile[] = response.results.map((file: VaultFile) => {
        // Use the MIME type if available (e.g., 'application/pdf' -> 'pdf')
        const mimeType = (file as any).type;
        const mimeExtension = mimeType ? mimeType.split('/')[1] : '';
                // Or extract extension from filename
        const fileExtension = file.original_filename?.split('.').pop()?.toLowerCase() || mimeExtension || '';
        
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

  // Memoize filtered files to prevent unnecessary re-computations
  const filteredFiles = useMemo(() => {
    return vaultFiles.filter(file => {
      // Apply file type filters
      const fileType = file.file_type || '';
      const matchesType = showAllFiles || 
        (activeFilters.length === 0) || 
        activeFilters.some((filter: string) => fileType.includes(filter));
      const matchesSearch = file.original_filename?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        file.original_filename?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        false;
      
      return matchesType && matchesSearch;
    });
  }, [vaultFiles, showAllFiles, activeFilters, searchQuery]);

  // Memoize the select all checkbox state
  const selectAllChecked = useMemo(() => {
    return selectedFiles.length > 0 && selectedFiles.length === filteredFiles.length;
  }, [selectedFiles.length, filteredFiles.length]);

  // Remove the indeterminate state since Checkbox doesn't support it
  // const selectAllIndeterminate = useMemo(() => {
  //   return selectedFiles.length > 0 && selectedFiles.length < filteredFiles.length;
  // }, [selectedFiles.length, filteredFiles.length]);

  // Memoize pagination calculations
  const paginationData = useMemo(() => {
    const totalPages = Math.max(1, Math.ceil(filesCount / itemsPerPage));
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);
    
    if (currentPage <= 3) {
      endPage = Math.min(5, totalPages);
    } else if (currentPage >= totalPages - 2) {
      startPage = Math.max(1, totalPages - 4);
    }
    
    const pageNums = [];
    for (let i = startPage; i <= endPage; i++) {
      pageNums.push(i);
    }
    
    return { totalPages, startPage, endPage, pageNums };
  }, [filesCount, itemsPerPage, currentPage]);

  const handleFileUpload = useCallback(async (uploadedFiles: any[]) => {
    if (!uploadedFiles || uploadedFiles.length === 0) return;
    
    // Close the upload dialog
    setIsUploadDialogOpen(false);
    
    toast({
      title: "Success",
      description: `${uploadedFiles.length} file(s) uploaded successfully`,
    });
    fetchFiles(); // Refresh the file list
  }, [toast]);

  const handleGoogleDriveClick = () => {
    // TODO: Implement Google Drive integration
    toast({
      title: "Google Drive Integration",
      description: "Google Drive integration coming soon!",
      duration: 3000,
    });
  };

  const handleFileDownload = (file: VaultFile) => {
    // Direct download through URL
    if (file.file && isSafeUrl(file.file)) {
      const a = document.createElement('a');
      a.href = file.file;
      a.download = file.original_filename || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      toast({
        title: "Error",
        description: "Invalid or unsafe file URL.",
        variant: "destructive",
      });
    }
  };

  const handleFilePreview = (file: VaultFile) => {
    // Open file in new tab for preview
    if (file.file && isSafeUrl(file.file)) {
      window.open(file.file, '_blank');
    } else {
      toast({
        title: "Error",
        description: "Invalid or unsafe file URL.",
        variant: "destructive",
      });
    }
  };

  const handleFileDelete = useCallback(async (fileId: number) => {
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
  }, [toast]);
  
  const handleBulkDelete = useCallback(async () => {
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
      
      fetchFiles();
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
  }, [selectedFiles, toast]);
  
  const toggleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedFiles(filteredFiles.map(file => file.id));
    } else {
      setSelectedFiles([]);
    }
  }, [filteredFiles]);
  
  const toggleSelectFile = useCallback((fileId: number, checked: boolean) => {
    setSelectedFiles(prev => 
      checked 
        ? [...prev, fileId] 
        : prev.filter(id => id !== fileId)
    );
  }, []);

  // Memoize search input change handler
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  // Memoize filter change handlers
  const handleFilterChange = useCallback((filterType: string, checked: boolean) => {
    if (filterType === 'all') {
      setShowAllFiles(checked);
      if (checked) setActiveFilters([]);
    } else if (filterType === 'doc') {
      // Handle Word documents (doc, docx)
      setShowAllFiles(false);
      const docFilters = ['doc', 'docx'];
      setActiveFilters(prev => 
        checked 
          ? [...prev.filter(f => !docFilters.includes(f)), ...docFilters] 
          : prev.filter(f => !docFilters.includes(f))
      );
    } else if (filterType === 'xls') {
      // Handle Excel spreadsheets (xls, xlsx)
      setShowAllFiles(false);
      const excelFilters = ['xls', 'xlsx'];
      setActiveFilters(prev => 
        checked 
          ? [...prev.filter(f => !excelFilters.includes(f)), ...excelFilters] 
          : prev.filter(f => !excelFilters.includes(f))
      );
    } else if (filterType === 'txt') {
      // Handle text files (txt, csv)
      setShowAllFiles(false);
      const textFilters = ['txt', 'csv'];
      setActiveFilters(prev => 
        checked 
          ? [...prev.filter(f => !textFilters.includes(f)), ...textFilters] 
          : prev.filter(f => !textFilters.includes(f))
      );
    } else if (filterType === 'jpg') {
      // Handle images (jpg, jpeg, png)
      setShowAllFiles(false);
      const imageFilters = ['jpg', 'jpeg', 'png'];
      setActiveFilters(prev => 
        checked 
          ? [...prev.filter(f => !imageFilters.includes(f)), ...imageFilters] 
          : prev.filter(f => !imageFilters.includes(f))
      );
    } else {
      // Handle single filters (pdf)
      setShowAllFiles(false);
      setActiveFilters(prev => checked 
        ? [...prev.filter(f => f !== filterType), filterType] 
        : prev.filter(f => f !== filterType)
      );
    }
  }, []);

  // Memoize items per page change handler
  const handleItemsPerPageChange = useCallback((value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  }, []);

  // Memoize page change handlers
  const handlePageChange = useCallback((pageNum: number) => {
    setCurrentPage(pageNum);
  }, []);

  const handlePreviousPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, paginationData.totalPages));
  }, [paginationData.totalPages]);

  // Add a function to handle rename
  const handleRename = async () => {
    if (!project || !project.id) return;
    setIsRenaming(true);
    try {
      await import("@/api/projects").then(({ updateProject }) => updateProject(project.id!, { ...project, name: newName }));
      toast({ title: "Project renamed", description: `Project renamed to '${newName}'.` });
      setRenameOpen(false);
      setNewName("");
      // Refresh project name
      fetchProject();
    } catch (e) {
      toast({ title: "Error renaming project", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsRenaming(false);
    }
  };  
  
  const handleFolderClick = (folder: VaultFile) => {
    if (!folder.is_folder) return;
    
    setCurrentFolderId(folder.id);
    setFolderBreadcrumbs(prev => [...prev, { id: folder.id, name: folder.original_filename || 'New Folder' }]);
  };

  const handleBreadcrumbClick = (folderId: number) => {
    if (folderId === 0) {
      // Go to root
      setCurrentFolderId(0);
      setFolderBreadcrumbs([]);
    } else {
      // Go to specific folder in breadcrumb
      const folderIndex = folderBreadcrumbs.findIndex(f => f.id === folderId);
      if (folderIndex !== -1) {
        setCurrentFolderId(folderId);
        setFolderBreadcrumbs(folderBreadcrumbs.slice(0, folderIndex + 1));
      }
    }
  };

  const handleCreateFolder = async (name: string) => {
    try {
      await createFolder({
        folderName: name,
        project_uuid: projectId,
        uploaded_by: user?.id,
        parent_id: currentFolderId,
        team: (project?.team as any)?.id || undefined
      });
      
      toast({
        title: "Success",
        description: "Folder created successfully"
      });
      
      setCreateFolderOpen(false);
      fetchFiles();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create folder. Please try again later.",
        variant: "destructive"
      });
    }
    console.log("Creating Folder:", name)
  }

  const handleDragStart = useCallback((e: React.DragEvent, fileId: number) => {
    e.stopPropagation();
    
    // If the dragged file is selected, drag all selected files
    // Otherwise, just drag the single file
    const filesToDrag = selectedFiles.includes(fileId) ? selectedFiles : [fileId];
    
    setIsDragging(true);
    setDraggedFiles(filesToDrag);
    
    // Set drag effect
    e.dataTransfer.effectAllowed = 'move';
    
    // Store the dragged file IDs in dataTransfer
    e.dataTransfer.setData('text/plain', JSON.stringify(filesToDrag));
  }, [selectedFiles]);
  
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setDraggedFiles([]);
    setDragOverFolderId(null);
  }, []);
  
  const handleDragOver = useCallback((e: React.DragEvent, folderId?: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Set drag effect
    e.dataTransfer.dropEffect = 'move';
    
    // Only allow dropping on folders or root
    if (folderId !== undefined) {
      setDragOverFolderId(folderId);
    }
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if we're leaving the drop zone entirely
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!e.currentTarget.contains(relatedTarget)) {
      setDragOverFolderId(null);
    }
  }, []);
  
  const handleDrop = useCallback(async (e: React.DragEvent, targetFolderId: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDragOverFolderId(null);
    setIsDragging(false);
    
    // Get the dragged file IDs
    const draggedFileIds = draggedFiles.length > 0 ? draggedFiles : JSON.parse(e.dataTransfer.getData('text/plain'));
    
    // Prevent dropping a folder into itself or its children
    const draggedItems = vaultFiles.filter(f => draggedFileIds.includes(f.id));
    for (const item of draggedItems) {
      if (item.is_folder && item.id === targetFolderId) {
        toast({
          title: "Invalid operation",
          description: "Cannot move a folder into itself",
          variant: "destructive",
        });
        return;
      }
    }
    
    // Move the files to the target folder
    try {
      await moveVaultFiles(draggedFileIds, targetFolderId);
      
      toast({
        title: "Success",
        description: `Moved ${draggedFileIds.length} item(s) successfully`,
      });
      
      // Refresh the file list
      fetchFiles();
      
      // Clear selection
      setSelectedFiles([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to move files. Please try again.",
        variant: "destructive",
      });
    }
    
    setDraggedFiles([]);
  }, [draggedFiles, vaultFiles, toast]);

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
      {/* Header removed - now handled by layout */}

      <div className="flex-1 overflow-auto p-4 mt-4">
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
                          onChange={handleSearchChange}
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
                              onCheckedChange={(checked) => handleFilterChange('all', checked)}
                            >
                              All Files
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuCheckboxItem 
                              checked={activeFilters.includes('pdf') || showAllFiles}
                              onCheckedChange={(checked) => handleFilterChange('pdf', checked)}
                            >
                              PDF Documents
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem 
                              checked={activeFilters.includes('doc') || activeFilters.includes('docx') || showAllFiles}
                              onCheckedChange={(checked) => handleFilterChange('doc', checked)}
                            >
                              Word Documents
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem 
                              checked={activeFilters.includes('xls') || activeFilters.includes('xlsx') || showAllFiles}
                              onCheckedChange={(checked) => handleFilterChange('xls', checked)}
                            >
                              Excel Spreadsheets
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem 
                              checked={activeFilters.includes('txt') || activeFilters.includes('csv') || showAllFiles}
                              onCheckedChange={(checked) => handleFilterChange('txt', checked)}
                            >
                              Text Files
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem 
                              checked={activeFilters.includes('jpg') || activeFilters.includes('jpeg') || activeFilters.includes('png') || showAllFiles}
                              onCheckedChange={(checked) => handleFilterChange('jpg', checked)}
                            >
                              Images
                            </DropdownMenuCheckboxItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        // Set context for AI panel
                        setCurrentContext({
                          title: currentFolderId === 0 
                            ? project?.name || 'Root Folder' 
                            : folderBreadcrumbs[folderBreadcrumbs.length - 1]?.name || 'Current Folder',
                          files: vaultFiles,
                          folderId: currentFolderId,
                          projectId: projectId
                        });
                        openAiPanel();
                      }}
                      className="flex items-center gap-2"
                    >
                      <Sparkles className="h-4 w-4" />
                      Ask AI
                    </Button>
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
                      <Button onClick={() => setCreateFolderOpen(true)}>
                        New Folder
                        <FolderPlus className="h-4 w-4 mr2" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button>
                            Upload
                            <Plus className="h-4 w-4 mr-2" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setIsUploadDialogOpen(true)}>
                            <FileText className="h-4 w-4 mr-2" />
                            File
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleGoogleDriveClick()}>
                            <UploadCloud className="h-4 w-4 mr-2" />
                            Google Drive
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>

                <div 
                  className={`
                    flex items-center space-x-2 text-sm text-muted-foreground mb-4 p-2 rounded
                  `}
                >
                  {(currentFolderId > 0 || folderBreadcrumbs.length > 0) ? (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleBreadcrumbClick(0)}
                        className="h-auto p-1 text-primary hover:text-primary/80"
                      >
                        Root
                      </Button>
                      {folderBreadcrumbs.map((folder) => (
                        <div key={folder.id} className="flex items-center">
                          <span className="mx-1">/</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleBreadcrumbClick(folder.id)}
                            className="h-auto p-1 text-primary hover:text-primary/80"
                          >
                            {folder.name}
                          </Button>
                        </div>
                      ))}
                    </>
                  ) : (
                    <span className="text-gray-500">Root folder</span>
                  )}
                </div>
                
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">
                            <Checkbox 
                            checked={selectAllChecked}
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
                      {filteredFiles.length > 0 ? (
                        filteredFiles.map((file) => (
                          <TableRow
                            key={file.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, file.id)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => file.is_folder && handleDragOver(e, file.id)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => file.is_folder && handleDrop(e, file.id)}
                            className={`
                              ${draggedFiles.includes(file.id) ? 'opacity-50' : ''}
                              ${dragOverFolderId === file.id && file.is_folder ? 'bg-primary/10' : ''}
                              cursor-move
                            `}
                          >
                            <TableCell>
                              <Checkbox 
                                checked={selectedFiles.includes(file.id)}
                                onCheckedChange={(checked) => toggleSelectFile(file.id, !!checked)}
                                aria-label={`Select ${file.original_filename || 'Unnamed File'}`}
                              />
                            </TableCell>
                            <TableCell className="font-medium">
                              {file.file_type === "folder" ? 
                                <div 
                                  className="flex items-center space-x-2 cursor-pointer hover:text-primary"
                                  onClick={() => handleFolderClick(file)}
                                >
                                  <Folder className="h-5 w-5 text-muted-foreground" />
                                  <span>
                                    {file.original_filename || 'New Folder'}
                                  </span>
                                </div> : 
                                <div className="flex items-center space-x-2">
                                  <FileText className="h-5 w-5 text-muted-foreground" />
                                  <span>
                                    {file.original_filename || 'Unnamed File'}
                                  </span>
                                </div>
                              }
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
                          <TableCell colSpan={columns.length} className="h-24 text-center">
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
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1 || !hasPreviousPage}
                      >
                        Previous
                      </Button>
                    </PaginationItem>
                    
                    {/* Show ellipsis before page numbers if needed */}
                    {paginationData.totalPages > 5 && currentPage > 3 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                    
                    {/* Page numbers */}
                    {paginationData.pageNums.map((pageNum) => (
                      <PaginationItem key={pageNum}>
                        <Button
                          variant={currentPage === pageNum ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      </PaginationItem>
                    ))}
                    
                    {/* Show ellipsis after page numbers if needed */}
                    {paginationData.totalPages > 5 && currentPage < paginationData.totalPages - 2 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                    
                    <PaginationItem>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={currentPage >= paginationData.totalPages || !hasNextPage}
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
                          onClick={() => handleItemsPerPageChange(value)}
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
                    projectId={projectId || ''}
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
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent onClick={e => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Rename Project</DialogTitle>
          </DialogHeader>
          <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="New project name" />
          <DialogFooter>
            <Button onClick={() => setRenameOpen(false)} variant="outline">Cancel</Button>
            <Button onClick={handleRename} disabled={isRenaming || !newName.trim()}>{isRenaming ? "Renaming..." : "Rename"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <InstructionsDialog
        open={showInstructionsDialog}
        onOpenChange={setShowInstructionsDialog}
        instructions={instructions}
        setInstructions={setInstructions}
      />
{/* 
      <DeleteProjectDialog
        open={deleteProjectOpen}
        onOpenChange={setDeleteProjectOpen}
        project={project ? { id: project.id?.toString() || '', name: project.name || '' } : null}
      /> */}
      <CreateFolderDialog
        open={createFolderOpen}
        onOpenChange={setCreateFolderOpen}
        onCreateFolder={handleCreateFolder}
      />

    </div>
  );
}
