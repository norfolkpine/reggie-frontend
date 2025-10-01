"use client";

import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { FilesTabContent } from "./files-tab-content";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { useRightSection } from "@/hooks/use-right-section";
import { AiLayoutPanel } from "@/components/vault/ai-layout-panel";
import { isSafeUrl } from "@/lib/utils/url";
import { uploadFiles, getVaultFilesByProject, deleteVaultFile, createFolder, updateVaultFile, moveVaultFiles } from "@/api/vault";
import { VaultFile } from "../types/vault";
import { CreateFolderDialog } from "./create-folder-dialog";
import { RenameDialog } from "./rename-dialog";

interface FilesTabProps {
  projectId: string;
  projectName?: string;
  teamId?: number;
  requestedNavigation?: number | null;
  onBreadcrumbChange?: () => void;
}

interface UploadingFile {
  file: File;
  progress: number;
  error?: string;
}

export const FilesTab = React.forwardRef<{
  getBreadcrumbData: () => { currentFolderId: number; breadcrumbs: { id: number; name: string }[] };
  navigateToFolder: (folderId: number) => void;
}, FilesTabProps>(({ projectId, projectName, teamId, requestedNavigation, onBreadcrumbChange }, ref) => {
  const { toast } = useToast();
  const { user } = useAuth();

  // Ref to store the latest breadcrumb state for immediate access
  const breadcrumbRef = useRef<{ currentFolderId: number; breadcrumbs: { id: number; name: string }[] }>({
    currentFolderId: 0,
    breadcrumbs: []
  });

  // Initialize state variables first
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showAllFiles, setShowAllFiles] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20); // For infinite scroll
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [allFiles, setAllFiles] = useState<VaultFile[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState(0);
  const [folderBreadcrumbs, setFolderBreadcrumbs] = useState<{ id: number; name: string }[]>([]);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedFiles, setDraggedFiles] = useState<number[]>([]);
  const [dragOverFolderId, setDragOverFolderId] = useState<number | null>(null);
  const [files, setFiles] = useState<UploadingFile[]>([]);

  // Infinite scroll refs
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const [renameFileOpen, setRenameFileOpen] = useState(false);
  const [fileToRename, setFileToRename] = useState<VaultFile | null>(null);
  const [newFileName, setNewFileName] = useState("");
  const [isRenamingFile, setIsRenamingFile] = useState(false);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);

  // Initialize context state with proper initial values
  const [currentContext, setCurrentContext] = useState({
    title: projectName || 'Root Folder',
    files: allFiles,
    folderId: currentFolderId,
    projectId: projectId
  });

  // AI Panel configuration using right section hook
  const { showRightSection, hideRightSection, rightSection } = useRightSection();

  useEffect(() => {
    if (currentPage === 1) {
      fetchFiles();
    } else {
      fetchFiles(true);
    }
  }, [projectId, currentPage, itemsPerPage, currentFolderId]);

  // Initialize breadcrumb ref on mount
  useEffect(() => {
    breadcrumbRef.current = { currentFolderId, breadcrumbs: folderBreadcrumbs };
  }, []); // Only run once on mount

  // Update context when relevant data changes
  useEffect(() => {
    setCurrentContext({
      title: currentFolderId === 0 ? projectName || 'Root Folder' : folderBreadcrumbs[folderBreadcrumbs.length - 1]?.name || 'Current Folder',
      files: allFiles,
      folderId: currentFolderId,
      projectId: projectId
    });
  }, [projectName, allFiles, currentFolderId, projectId, folderBreadcrumbs]);


  useEffect(() => {
    const delay = setTimeout(() => {
      if (currentPage !== 1) setCurrentPage(1); else fetchFiles();
    }, 500);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  // Set up intersection observer for infinite scrolling
  useEffect(() => {
    if (!searchQuery) {
      // Don't use infinite scroll when searching
      const observer = new IntersectionObserver(
        (entries) => {
          if (
            entries[0].isIntersecting &&
            hasNextPage &&
            !isLoadingMore &&
            currentPage > 0
          ) {
            setCurrentPage((prevPage) => prevPage + 1);
          }
        },
        { threshold: 0.5 }
      );

      observerRef.current = observer;

      if (loadMoreRef.current) {
        observer.observe(loadMoreRef.current);
      }

      return () => {
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
      };
    }
  }, [hasNextPage, isLoadingMore, searchQuery, currentPage]);

  const fetchFiles = async (isLoadingMoreFiles = false) => {
    try {
      setIsLoadingMore(isLoadingMoreFiles);
      const response = await getVaultFilesByProject(
        projectId,
        currentPage,
        itemsPerPage,
        searchQuery,
        currentFolderId
      );

      if (isLoadingMoreFiles) {
        // Add new files to existing collection
        const newFiles: VaultFile[] = response.results.map((file: VaultFile) => {
          if (file.is_folder) return { ...file, file_type: 'folder' } as VaultFile;
          const mimeType = file.type;
          const mimeExtension = mimeType ? mimeType : '';
          const fileExtension = mimeExtension || file.filename || 'unknown';
          return { ...file, file_type: fileExtension } as VaultFile;
        });
        setAllFiles(prev => [...prev, ...newFiles]);
      } else {
        // Replace all files
        const filesWithType: VaultFile[] = response.results.map((file: VaultFile) => {
          if (file.is_folder) return { ...file, file_type: 'folder' } as VaultFile;
          const mimeType = file.type;
          const mimeExtension = mimeType ? mimeType : '';
          const fileExtension = mimeExtension || file.filename || 'unknown';
          return { ...file, file_type: fileExtension } as VaultFile;
        });
        setAllFiles(filesWithType);
      }

      setHasNextPage(!!response.next);
    } catch (error) {
      console.error('Error fetching vault files:', error);
      toast({ title: "Error", description: "Failed to load vault files", variant: "destructive" });
    } finally {
      setIsLoadingMore(false);
    }
  };

  const filteredFiles = useMemo(() => {
    return allFiles.filter(file => {
      const fileType = file.file_type || '';
      const matchesType = showAllFiles || (activeFilters.length === 0) || activeFilters.some((filter: string) => fileType.includes(filter));
      const matchesSearch = file.original_filename?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
      return matchesType && matchesSearch;
    });
  }, [allFiles, showAllFiles, activeFilters, searchQuery]);


  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleFilterChange = useCallback((filterType: string, checked: boolean) => {
    if (filterType === 'all') {
      setShowAllFiles(checked);
      if (checked) setActiveFilters([]);
    } else if (filterType === 'doc') {
      setShowAllFiles(false);
      const docFilters = ['doc', 'docx'];
      setActiveFilters(prev => checked ? [...prev.filter(f => !docFilters.includes(f)), ...docFilters] : prev.filter(f => !docFilters.includes(f)));
    } else if (filterType === 'xls') {
      setShowAllFiles(false);
      const excelFilters = ['xls', 'xlsx'];
      setActiveFilters(prev => checked ? [...prev.filter(f => !excelFilters.includes(f)), ...excelFilters] : prev.filter(f => !excelFilters.includes(f)));
    } else if (filterType === 'txt') {
      setShowAllFiles(false);
      const textFilters = ['txt', 'csv'];
      setActiveFilters(prev => checked ? [...prev.filter(f => !textFilters.includes(f)), ...textFilters] : prev.filter(f => !textFilters.includes(f)));
    } else if (filterType === 'jpg') {
      setShowAllFiles(false);
      const imageFilters = ['jpg', 'jpeg', 'png'];
      setActiveFilters(prev => checked ? [...prev.filter(f => !imageFilters.includes(f)), ...imageFilters] : prev.filter(f => !imageFilters.includes(f)));
    } else {
      setShowAllFiles(false);
      setActiveFilters(prev => checked ? [...prev.filter(f => f !== filterType), filterType] : prev.filter(f => f !== filterType));
    }
  }, []);

  const handleNextPage = useCallback(() => {
    if (hasNextPage && !isLoadingMore) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasNextPage, isLoadingMore]);

  const toggleSelectAll = useCallback((checked: boolean) => {
    if (checked) setSelectedFiles(filteredFiles.map(file => file.id)); else setSelectedFiles([]);
  }, [filteredFiles]);

  const toggleSelectFile = useCallback((fileId: number, checked: boolean) => {
    setSelectedFiles(prev => checked ? [...prev, fileId] : prev.filter(id => id !== fileId));
  }, []);

  const handleBulkDelete = useCallback(async () => {
    if (selectedFiles.length === 0) return;
    setIsDeleting(true);
    try {
      let successCount = 0; let errorCount = 0;
      for (const fileId of selectedFiles) {
        try { await deleteVaultFile(fileId); successCount++; } catch (e) { errorCount++; }
      }
      if (successCount > 0) toast({ title: "Success", description: `${successCount} file${successCount !== 1 ? 's' : ''} deleted successfully` });
      if (errorCount > 0) toast({ title: "Error", description: `Failed to delete ${errorCount} file${errorCount !== 1 ? 's' : ''}`, variant: "destructive" });
      fetchFiles();
      setSelectedFiles([]);
    } finally {
      setIsDeleting(false);
    }
  }, [selectedFiles]);

  const handleFolderClick = (folder: VaultFile) => {
    if (!folder.is_folder) return;
    const newBreadcrumbs = [...folderBreadcrumbs, { id: folder.id, name: folder.original_filename || 'New Folder' }];
    setCurrentFolderId(folder.id);
    setFolderBreadcrumbs(newBreadcrumbs);
    // Update ref
    breadcrumbRef.current = { currentFolderId: folder.id, breadcrumbs: newBreadcrumbs };
    onBreadcrumbChange?.();
  };

  const handleBreadcrumbClick = useCallback((folderId: number) => {
    let newBreadcrumbs: { id: number; name: string }[] = [];
    if (folderId === 0) {
      setCurrentFolderId(0);
      setFolderBreadcrumbs([]);
      newBreadcrumbs = [];
    } else {
      const folderIndex = folderBreadcrumbs.findIndex(f => f.id === folderId);
      if (folderIndex !== -1) {
        newBreadcrumbs = folderBreadcrumbs.slice(0, folderIndex + 1);
        setCurrentFolderId(folderId);
        setFolderBreadcrumbs(newBreadcrumbs);
      }
    }
    // Update ref
    breadcrumbRef.current = { currentFolderId: folderId, breadcrumbs: newBreadcrumbs };
    onBreadcrumbChange?.();
  }, [folderBreadcrumbs, onBreadcrumbChange]);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    getBreadcrumbData: () => breadcrumbRef.current,
    navigateToFolder: handleBreadcrumbClick,
  }), [handleBreadcrumbClick]);

  // Handle navigation requests from parent (breadcrumb clicks)
  useEffect(() => {
    if (requestedNavigation !== null && requestedNavigation !== undefined) {
      handleBreadcrumbClick(requestedNavigation);
    }
  }, [requestedNavigation, handleBreadcrumbClick]);

  const handleCreateFolder = async (name: string) => {
    try {
      await createFolder({
        folderName: name,
        project_uuid: projectId,
        uploaded_by: user?.id,
        parent_id: currentFolderId,
        team: teamId || undefined
      });
      toast({ title: "Success", description: "Folder created successfully" });
      setCreateFolderOpen(false);
      fetchFiles();
    } catch (error) {
      toast({ title: "Error", description: "Failed to create folder. Please try again later.", variant: "destructive" });
    }
  };

  const handleDragStart = useCallback((e: React.DragEvent, fileId: number) => {
    e.stopPropagation();
    const filesToDrag = selectedFiles.includes(fileId) ? selectedFiles : [fileId];
    setIsDragging(true);
    setDraggedFiles(filesToDrag);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify(filesToDrag));
  }, [selectedFiles]);

  const handleDragEnd = useCallback(() => { setIsDragging(false); setDraggedFiles([]); setDragOverFolderId(null); }, []);

  const handleDragOver = useCallback((e: React.DragEvent, folderId?: number) => {
    e.preventDefault(); e.stopPropagation(); e.dataTransfer.dropEffect = 'move'; if (folderId !== undefined) setDragOverFolderId(folderId);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!e.currentTarget.contains(relatedTarget)) setDragOverFolderId(null);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent, targetFolderId: number) => {
    e.preventDefault(); e.stopPropagation(); setDragOverFolderId(null); setIsDragging(false);
    const draggedFileIds = draggedFiles.length > 0 ? draggedFiles : JSON.parse(e.dataTransfer.getData('text/plain'));
    const draggedItems = allFiles.filter(f => draggedFileIds.includes(f.id));
    for (const item of draggedItems) {
      if (item.is_folder && item.id === targetFolderId) {
        toast({ title: "Invalid operation", description: "Cannot move a folder into itself", variant: "destructive" });
        return;
      }
    }
    try {
      await moveVaultFiles(draggedFileIds, targetFolderId);
      toast({ title: "Success", description: `Moved ${draggedFileIds.length} item(s) successfully` });
      fetchFiles(); setSelectedFiles([]);
    } catch (error) {
      toast({ title: "Error", description: "Failed to move files. Please try again.", variant: "destructive" });
    }
    setDraggedFiles([]);
  }, [draggedFiles, allFiles]);

  const handleFileDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); }, []);
  const handleFileDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragOver(false); }, []);
  const handleFileDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    const supportedFileTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.csv', '.png', '.jpg', '.jpeg'];
    const validFiles = droppedFiles.filter(file => { const extension = '.' + file.name.split('.').pop()?.toLowerCase(); return supportedFileTypes.includes(extension); });
    if (validFiles.length === 0) { toast({ title: "File Upload Failed", description: "No supported file types selected." }); return; }
    if (validFiles.length !== droppedFiles.length) { toast({ title: "File Upload Failed", description: `${droppedFiles.length - validFiles.length} unsupported file(s) were skipped.` }); }
    const updatedFiles = [...files, ...validFiles.map((file) => ({ file, progress: 0 }))]; setFiles(updatedFiles);
    if (!user) { toast({ title: "File Upload Failed", description: "You must be logged in to upload files." }); return; }

    const uploadedFiles: any[] = [];
    const failedFiles: { file: File; error: string }[] = [];

    for (const fileObj of updatedFiles) {
      try {
        const result = await uploadFiles({ file: fileObj.file, project_uuid: projectId, uploaded_by: user?.id || 0 });
        uploadedFiles.push(result);
      } catch (err: any) {
        console.error("Error uploading file:", fileObj.file.name, err);
        failedFiles.push({ file: fileObj.file, error: err?.message || 'Upload failed' });
        toast({
          title: "Upload Failed",
          description: `${fileObj.file.name}: ${err?.message || 'Upload failed'}`,
          variant: "destructive"
        });
      }
    }
    handleFileUpload(uploadedFiles, failedFiles);
  }, [files, uploadFiles]);

  const handleFileUpload = useCallback(async (uploadedFiles: any[], failedFiles?: { file: File; error: string }[]) => {
    if (!uploadedFiles || uploadedFiles.length === 0) {
      if (failedFiles && failedFiles.length > 0) {
        toast({
          title: "Upload Failed",
          description: `All ${failedFiles.length} file(s) failed to upload`,
          variant: "destructive"
        });
      }
      return;
    }

    setIsUploadDialogOpen(false);

    // Show success toast
    if (failedFiles && failedFiles.length > 0) {
      // Partial success - some files succeeded, some failed
      toast({
        title: "Upload Partially Successful",
        description: `${uploadedFiles.length} file(s) uploaded successfully, ${failedFiles.length} file(s) failed`,
        variant: "default"
      });
    } else {
      // All files succeeded
      toast({ title: "Success", description: `${uploadedFiles.length} file(s) uploaded successfully` });
    }

    fetchFiles();
  }, []);

  const handleFileDownload = (file: VaultFile) => {
    if (file.file && isSafeUrl(file.file)) {
      const a = document.createElement('a'); a.href = file.file; a.download = file.original_filename || 'download'; document.body.appendChild(a); a.click(); document.body.removeChild(a);
    } else { toast({ title: "Error", description: "Invalid or unsafe file URL.", variant: "destructive" }); }
  };

  const handleFilePreview = (file: VaultFile) => {
    if (file.file && isSafeUrl(file.file)) { window.open(file.file, '_blank'); }
    else { toast({ title: "Error", description: "Invalid or unsafe file URL.", variant: "destructive" }); }
  };

  const handleFileDelete = useCallback(async (fileId: number) => {
    try { await deleteVaultFile(fileId); toast({ title: "Success", description: "File deleted successfully" }); fetchFiles(); setSelectedFiles([]); }
    catch (error) { toast({ title: "Error", description: "Failed to delete file", variant: "destructive" }); }
  }, []);

  const openRenameDialog = (file: VaultFile) => { setFileToRename(file); setNewFileName(file.original_filename || ''); setRenameFileOpen(true); };

  const handleFileRename = async () => {
    if (!fileToRename || !newFileName.trim()) return;
    setIsRenamingFile(true);
    try {
      await updateVaultFile(fileToRename.id, { original_filename: newFileName.trim() });
      toast({ title: "File renamed", description: `File renamed to '${newFileName.trim()}'.` });
      setRenameFileOpen(false); setFileToRename(null); setNewFileName(""); fetchFiles();
    } catch (error) {
      toast({ title: "Error renaming file", description: "Please try again.", variant: "destructive" });
    } finally { setIsRenamingFile(false); }
  };

  return (
    <>
      <FilesTabContent
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        showAllFiles={showAllFiles}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        isRightSectionOpen={rightSection !== null}
        isDragOver={isDragOver}
        onFileDragOver={handleFileDragOver}
        onFileDragLeave={handleFileDragLeave}
        onFileDrop={handleFileDrop}
        selectedFiles={selectedFiles}
        isDeleting={isDeleting}
        onBulkDelete={handleBulkDelete}
        onCreateFolder={() => setCreateFolderOpen(true)}
        onUploadFile={() => setIsUploadDialogOpen(true)}
        onGoogleDriveClick={() => toast({ title: "Google Drive Integration", description: "Google Drive integration coming soon!", duration: 3000 })}
        files={filteredFiles}
        draggedFiles={draggedFiles}
        dragOverFolderId={dragOverFolderId}
        onSelectAll={toggleSelectAll}
        onSelectFile={toggleSelectFile}
        onFolderClick={handleFolderClick}
        onFilePreview={handleFilePreview}
        onFileDownload={handleFileDownload}
        onFileRename={openRenameDialog}
        onFileDelete={handleFileDelete}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        hasNextPage={hasNextPage}
        isLoadingMore={isLoadingMore}
        loadMoreRef={loadMoreRef}
        uploadDialogOpen={isUploadDialogOpen}
        setUploadDialogOpen={setIsUploadDialogOpen}
        projectId={projectId}
        onUploadComplete={handleFileUpload}
      />

      <RenameDialog
        open={renameFileOpen}
        onOpenChange={setRenameFileOpen}
        title="Rename File"
        description="Enter a new name for the file."
        currentName={fileToRename?.original_filename || ""}
        newName={newFileName}
        onNameChange={setNewFileName}
        onConfirm={handleFileRename}
        isLoading={isRenamingFile}
        placeholder="New file name"
      />

      <CreateFolderDialog
        open={createFolderOpen}
        onOpenChange={setCreateFolderOpen}
        onCreateFolder={handleCreateFolder}
      />
    </>
  );
});

FilesTab.displayName = 'FilesTab';