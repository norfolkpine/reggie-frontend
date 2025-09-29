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
  isRightSectionOpen?: boolean;
  isDragOver?: boolean;
  onFileDragOver?: (e: React.DragEvent) => void;
  onFileDragLeave?: (e: React.DragEvent) => void;
  onFileDrop?: (e: React.DragEvent) => void;

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

  hasNextPage: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;

  uploadDialogOpen: boolean;
  setUploadDialogOpen: (open: boolean) => void;
  projectId: string;
  onUploadComplete: (uploadedFiles: any[]) => void;
}

export function FilesTabContent(props: FilesTabContentProps) {
  return (
    <TabsContent
      value="files"
      className="mt-4 relative"
      onDragOver={props.onFileDragOver}
      onDragLeave={props.onFileDragLeave}
      onDrop={props.onFileDrop}
    >
      {/* Drag overlay for file uploads */}
      {props.isDragOver && (
        <div className="absolute inset-0 bg-blue-500/10 border-2 border-dashed border-blue-400 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 shadow-lg border border-blue-200">
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-2 text-blue-500 flex items-center justify-center">
                📎
              </div>
              <p className="text-lg font-medium text-gray-900">Drop files here</p>
              <p className="text-sm text-gray-500">Release to upload</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="mb-4">
          {/* Toolbar with search and actions */}
          <div className={`flex items-stretch gap-3 ${
            props.isRightSectionOpen
              ? 'flex-col' // Mobile layout when side panel is open
              : 'flex-col sm:flex-row sm:items-center' // Default responsive layout
          }`}>
            <SearchInput
              placeholder="Search files..."
              value={props.searchQuery}
              onChange={props.onSearchChange}
              className={`flex-1 min-w-0 ${
                props.isRightSectionOpen
                  ? 'max-w-none' // Full width when side panel is open
                  : 'max-w-md sm:max-w-none' // Constrained on mobile, full width on desktop when panel is closed
              }`}
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
          hasNextPage={props.hasNextPage}
          isLoadingMore={props.isLoadingMore}
          onLoadMore={props.onLoadMore}
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

