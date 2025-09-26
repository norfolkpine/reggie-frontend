"use client";

import { useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Folder, FileText, MoreHorizontal, Eye, Download, Link, Edit, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { isSafeUrl } from "@/lib/utils/url";
import { useToast } from "@/components/ui/use-toast";
import { VaultFile } from "../types/vault";

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
    <div className="rounded-md border border-border bg-card text-foreground">
      <div className="flex-1 flex flex-col relative min-h-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectAllChecked}
                  onCheckedChange={onSelectAll}
                  aria-label="Select all files"
                />
              </TableHead>
              <TableHead className="w-[300px]">Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Last Modified</TableHead>
              <TableHead>Embedding</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.length > 0 ? (
              files.map((file) => (
                <TableRow
                  key={file.id}
                  draggable={!!onDragStart}
                  onDragStart={onDragStart ? (e) => onDragStart(e, file.id) : undefined}
                  onDragEnd={onDragEnd}
                  onDragOver={file.is_folder && onDragOver ? (e) => onDragOver(e, file.id) : undefined}
                  onDragLeave={onDragLeave}
                  onDrop={file.is_folder && onDrop ? (e) => onDrop(e, file.id) : undefined}
                  className={`
                    ${draggedFiles.includes(file.id) ? 'opacity-50' : ''}
                    ${dragOverFolderId === file.id && file.is_folder ? 'bg-primary/10' : ''}
                    ${onDragStart ? 'cursor-move' : ''}
                  `}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedFiles.includes(file.id)}
                      onCheckedChange={(checked) => onSelectFile(file.id, !!checked)}
                      aria-label={`Select ${file.original_filename || 'Unnamed File'}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {file.is_folder ?
                      <div
                        className="flex items-center space-x-2 cursor-pointer hover:text-primary"
                        onClick={() => onFolderClick(file)}
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
                    <Badge variant="outline">
                      {file.file_type ? file.file_type.toUpperCase() : 'UNKNOWN'}
                    </Badge>
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
                  <TableCell>
                    {file.is_folder?
                      <></> :
                      getStatusBadge(file.embedding_status || '')
                    }
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
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
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No files found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
