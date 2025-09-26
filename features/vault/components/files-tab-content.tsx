"use client";

import { TabsContent } from "@/components/ui/tabs";
import SearchInput from "@/components/ui/search-input";
import { FileFilters } from "./file-filters";
import { AskAIButton } from "./ask-ai-button";
import { BulkActions } from "./bulk-actions";
import { FolderActions } from "./folder-actions";
import { BreadcrumbNavigation } from "./breadcrumb-navigation";
import { FileTable } from "./file-table";
import { PaginationControls } from "./pagination-controls";
import { FileUploadDialog } from "./file-upload-dialog";
import { VaultFile } from "../types/vault";

interface FilesTabContentProps {
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showAllFiles: boolean;
  activeFilters: string[];
  onFilterChange: (filterType: string, checked: boolean) => void;

  onAskAI: () => void;

  selectedFiles: number[];
  isDeleting: boolean;
  onBulkDelete: () => void | Promise<void>;

  onCreateFolder: () => void;
  onUploadFile: () => void;
  onGoogleDriveClick: () => void;

  currentFolderId: number;
  breadcrumbs: { id: number; name: string }[];
  onBreadcrumbClick: (folderId: number) => void;

  files: VaultFile[];
  draggedFiles: number[];
  dragOverFolderId: number | null;
  onSelectAll: (checked: boolean) => void;
  onSelectFile: (fileId: number, checked: boolean) => void;
  onFolderClick: (folder: VaultFile) => void;
  onFilePreview: (file: VaultFile) => void;
  onFileDownload: (file: VaultFile) => void;
  onFileRename: (file: VaultFile) => void;
  onFileDelete: (fileId: number) => void;
  onDragStart?: (e: React.DragEvent, fileId: number) => void;
  onDragEnd?: () => void;
  onDragOver?: (e: React.DragEvent, folderId?: number) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, targetFolderId: number) => void;

  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  pageNums: number[];
  onPageChange: (pageNum: number) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onItemsPerPageChange: (value: number) => void;

  uploadDialogOpen: boolean;
  setUploadDialogOpen: (open: boolean) => void;
  projectId: string;
  onUploadComplete: (uploadedFiles: any[]) => void;
}

export function FilesTabContent(props: FilesTabContentProps) {
  return (
    <TabsContent value="files" className="mt-4">
      <div className="space-y-4">
        <div className="mb-4">
          {/* Toolbar with search and actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <SearchInput
              placeholder="Search files..."
              value={props.searchQuery}
              onChange={props.onSearchChange}
              className="flex-1 min-w-0 max-w-md sm:max-w-none"
            />

            <div className="flex items-center gap-2 flex-shrink-0">
              <FileFilters
                searchQuery={props.searchQuery}
                showAllFiles={props.showAllFiles}
                activeFilters={props.activeFilters}
                onSearchChange={props.onSearchChange}
                onFilterChange={props.onFilterChange}
              />
              <AskAIButton onClick={props.onAskAI} />
              <BulkActions
                selectedFilesCount={props.selectedFiles.length}
                isDeleting={props.isDeleting}
                onBulkDelete={props.onBulkDelete}
              />
              <FolderActions
                onCreateFolder={props.onCreateFolder}
                onUploadFile={props.onUploadFile}
                onGoogleDriveClick={props.onGoogleDriveClick}
              />
            </div>
          </div>
        </div>

        <BreadcrumbNavigation
          currentFolderId={props.currentFolderId}
          breadcrumbs={props.breadcrumbs}
          onBreadcrumbClick={props.onBreadcrumbClick}
        />

        <FileTable
          files={props.files}
          selectedFiles={props.selectedFiles}
          draggedFiles={props.draggedFiles}
          dragOverFolderId={props.dragOverFolderId}
          onSelectAll={props.onSelectAll}
          onSelectFile={props.onSelectFile}
          onFolderClick={props.onFolderClick}
          onFilePreview={props.onFilePreview}
          onFileDownload={props.onFileDownload}
          onFileRename={props.onFileRename}
          onFileDelete={props.onFileDelete}
          onDragStart={props.onDragStart}
          onDragEnd={props.onDragEnd}
          onDragOver={props.onDragOver}
          onDragLeave={props.onDragLeave}
          onDrop={props.onDrop}
        />

        <PaginationControls
          currentPage={props.currentPage}
          totalPages={props.totalPages}
          itemsPerPage={props.itemsPerPage}
          hasNextPage={props.hasNextPage}
          hasPreviousPage={props.hasPreviousPage}
          pageNums={props.pageNums}
          onPageChange={props.onPageChange}
          onPreviousPage={props.onPreviousPage}
          onNextPage={props.onNextPage}
          onItemsPerPageChange={props.onItemsPerPageChange}
        />

        <FileUploadDialog
          open={props.uploadDialogOpen}
          onOpenChange={props.setUploadDialogOpen}
          projectId={props.projectId}
          onUploadComplete={props.onUploadComplete}
        />
      </div>
    </TabsContent>
  );
}

