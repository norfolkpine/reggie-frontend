"use client";

import { useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Folder, FileText, MoreHorizontal, Eye, Download, Link, Edit, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { isSafeUrl } from "@/lib/utils/url";
import { useToast } from "@/components/ui/use-toast";
import { VaultFile } from "../types/vault";
import { Separator } from "@/components/ui/separator";

interface FileTableProps {
  files: VaultFile[];
  selectedFiles: number[];
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
}

export function FileTable({
  files,
  selectedFiles,
  draggedFiles,
  dragOverFolderId,
  onSelectAll,
  onSelectFile,
  onFolderClick,
  onFilePreview,
  onFileDownload,
  onFileRename,
  onFileDelete,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop
}: FileTableProps) {
  const { toast } = useToast();

  const getStatusBadge = useCallback((status: string) => {
    if (!status) return null;

    switch (status) {
      case 'pending':
        return (
          <Badge
            variant="outline"
            className="bg-gray-50 text-gray-700 border-gray-200"
          >
            <div className="h-3 w-3 mr-1 rounded-full bg-yellow-400" />
            {status}
          </Badge>
        );
      case 'completed':
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            <div className="h-3 w-3 mr-1 rounded-full bg-green-400" />
            {status}
          </Badge>
        );
      case 'processing':
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            <div className="h-3 w-3 mr-1 rounded-full bg-blue-400" />
            {status}
          </Badge>
        );
      case 'failed':
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            <div className="h-3 w-3 mr-1 rounded-full bg-red-400" />
            Error
          </Badge>
        );
      case 'error':
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            <div className="h-3 w-3 mr-1 rounded-full bg-red-400" />
            Error
          </Badge>
        );
      default:
        return null;
    }
  }, []);

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

  const selectAllChecked = selectedFiles.length > 0 && selectedFiles.length === files.length;

  return (
    <Card className="mt-4">
      {/* Header */}
      <div className="grid grid-cols-12 py-2 px-4 bg-muted/50 text-sm font-medium text-muted-foreground">
        <div className="col-span-1">
          <Checkbox
            checked={selectAllChecked}
            onCheckedChange={onSelectAll}
            aria-label="Select all files"
          />
        </div>
        <div className="col-span-3">Name</div>
        <div className="col-span-2">Type</div>
        <div className="col-span-2">Size</div>
        <div className="col-span-2">Last Modified</div>
        <div className="col-span-1">Status</div>
        <div className="col-span-1">Actions</div>
      </div>
      <Separator />

      {/* Files List */}
      <div className="max-h-[600px] overflow-y-auto">
        {files.length > 0 ? (
          files.map((file, index) => (
            <div
              key={file.id}
              className={`
                grid grid-cols-12 py-3 px-4 items-center group hover:bg-muted/30
                ${draggedFiles.includes(file.id) ? 'opacity-50' : ''}
                ${dragOverFolderId === file.id && file.is_folder ? 'bg-primary/10' : ''}
                ${onDragStart ? 'cursor-move' : ''}
              `}
              draggable={!!onDragStart}
              onDragStart={onDragStart ? (e) => onDragStart(e, file.id) : undefined}
              onDragEnd={onDragEnd}
              onDragOver={file.is_folder && onDragOver ? (e) => onDragOver(e, file.id) : undefined}
              onDragLeave={onDragLeave}
              onDrop={file.is_folder && onDrop ? (e) => onDrop(e, file.id) : undefined}
            >
              <div className="col-span-1">
                <Checkbox
                  checked={selectedFiles.includes(file.id)}
                  onCheckedChange={(checked) => onSelectFile(file.id, !!checked)}
                  aria-label={`Select ${file.original_filename || 'Unnamed File'}`}
                />
              </div>
              <div className="col-span-3">
                {file.is_folder ? (
                  <div
                    className="flex items-center space-x-2 cursor-pointer hover:text-primary"
                    onClick={() => onFolderClick(file)}
                  >
                    <Folder className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium truncate">
                      {file.original_filename || 'New Folder'}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium truncate">
                      {file.original_filename || 'Unnamed File'}
                    </span>
                  </div>
                )}
              </div>
              <div className="col-span-2">
                <Badge variant="outline">
                  {file.file_type ? file.file_type.toUpperCase() : 'UNKNOWN'}
                </Badge>
              </div>
              <div className="col-span-2 text-sm text-muted-foreground">
                {file.size
                  ? file.size < 1024 * 1024
                    ? `${(file.size / 1024).toFixed(1)} KB`
                    : `${(file.size / (1024 * 1024)).toFixed(2)} MB`
                  : 'N/A'}
              </div>
              <div className="col-span-2 text-sm text-muted-foreground">
                {file.created_at ?
                  formatDistanceToNow(new Date(file.created_at), { addSuffix: true }) :
                  'N/A'}
              </div>
              <div className="col-span-1">
                {file.is_folder ? null : getStatusBadge(file.embedding_status || '')}
              </div>
              <div className="col-span-1 flex justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">More options</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onFilePreview(file)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onFileDownload(file)}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link className="mr-2 h-4 w-4" />
                      Copy Link
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onFileRename(file)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => onFileDelete(file.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            No files found.
          </div>
        )}
      </div>
    </Card>
  );
}
