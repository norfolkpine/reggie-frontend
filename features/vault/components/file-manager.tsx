'use client';

import { useState, useEffect, useMemo } from 'react';
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
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { FileUpload } from './file-upload';
import { FilePreview } from './file-preview';
import { toast } from 'sonner';
import { LinkFilesModal } from './link-files-modal';
import { File, FileWithUI, KnowledgeBase } from '@/types/knowledge-base';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import { Checkbox } from '@/components/ui/checkbox';
// TanStack Table
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  type ColumnDef,
  type ColumnFiltersState,
} from '@tanstack/react-table';
import {
  deleteFile,
  listFiles,
  listFilesWithKbs,
  ingestSelectedFiles,
} from '@/api/files';

interface ApiResponse {
  uuid: string;
  title: string;
  description: string | null;
  file_type: string;
  file: string;
  storage_bucket: number | null;
  storage_path: string;
  original_path: string | null;
  uploaded_by: number | null;
  team: number | null;
  source: string | null;
  visibility: 'public' | 'private';
  is_global: boolean;
  created_at: string;
  updated_at: string;
}

interface ApiListResponse {
  results: ApiResponse[];
  count: number;
  next: string | null;
  previous: string | null;
}

/* Existing Knowledge-Base FileManager kept for reference above */

export function KBFileManager() {
  const [files, setFiles] = useState<FileWithUI[]>([]);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  // TanStack column filters
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const statusOptions = ['ready', 'processing', 'error'];
  const typeOptions = ['pdf', 'docx', 'csv', 'xlsx', 'txt', 'jpeg', 'png'];
  const collectionOptions = useMemo(
    () => Array.from(new Set(files.map((f) => f.collection?.name).filter(Boolean))) as string[],
    [files]
  );
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [previewFile, setPreviewFile] = useState<FileWithUI | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [fileToLink, setFileToLink] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [filesCount, setFilesCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);

  useEffect(() => {
    fetchData();
  }, [currentPage, itemsPerPage, searchQuery]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = {
        page: currentPage.toString(),
        page_size: itemsPerPage.toString(),
      };

      if (searchQuery) {
        params.search = searchQuery;
      }

      // NOTE: If getFiles does not support page_size, update the API call accordingly
      const response = await listFiles(params);

      // Convert API response to FileWithUI format
      const convertedFiles: FileWithUI[] = response.results.map(
        (apiResponse) => {
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
            visibility: apiResponse.visibility || 'private',
            is_global: !!apiResponse.is_global,
            created_at: apiResponse.created_at,
            updated_at: apiResponse.updated_at,
            collection: apiResponse.collection || undefined,
            file_size: apiResponse.filesize || undefined,
          };
          return {
            ...file,
            status: 'ready' as const,
            folderId: null,
            thumbnailUrl: getThumbnailUrl(file.file_type),
            linkedKnowledgeBases: [],
          };
        }
      );

      setFiles(convertedFiles);
      setFilesCount(response.count || 0);
      setHasNextPage(!!response.next);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load files');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadComplete = (uploadedFiles: FileWithUI[]) => {
    setFiles((prevFiles) => [...uploadedFiles, ...prevFiles]);
    setIsUploadDialogOpen(false);
    toast.success(
      `${uploadedFiles.length} file${
        uploadedFiles.length > 1 ? 's' : ''
      } uploaded successfully`
    );
    fetchData(); // Refresh the list
  };

  const handleDeleteFile = async (uuid: string) => {
    try {
      await deleteFile(uuid);
      setFiles((prevFiles) => prevFiles.filter((file) => file.uuid !== uuid));
      toast.success('File deleted successfully');
    } catch (error) {
      console.error('Failed to delete file:', error);
      toast.error('Failed to delete file');
    }
  };

  const handleLinkFilesToKnowledgeBase = async (
    fileId: string,
    knowledgeBaseId: string
  ) => {
    try {
      await ingestSelectedFiles({
        file_ids: [fileId],
        knowledgebase_ids: [knowledgeBaseId],
      });

      toast.success('Files linked successfully');
      fetchData(); // Refresh the list to get updated links
    } catch (error) {
      console.error('Failed to link files:', error);
      toast.error('Failed to link files to knowledge base');
    }
  };

  const getThumbnailUrl = (fileType: string): string => {
    switch (fileType) {
      case 'pdf':
        return '/pdf-icon-stack.png';
      case 'docx':
        return '/document-stack.png';
      case 'csv':
      case 'xlsx':
        return '/spreadsheet.png';
      default:
        return '/document-stack.png';
    }
  };

  const handlePreviewFile = (file: FileWithUI) => {
    setPreviewFile(file);
    setIsPreviewOpen(true);
  };

  const handleOpenLinkModal = (fileId?: string) => {
    if (fileId) {
      setFileToLink(fileId);
    }
    setIsLinkModalOpen(true);
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedFiles.map((fileId) => deleteFile(fileId)));
      toast.success(`${selectedFiles.length} files deleted successfully`);
      setSelectedFiles([]);
      fetchData();
    } catch (error) {
      console.error('Failed to delete files:', error);
      toast.error('Failed to delete selected files');
    }
  };

  // TanStack table setup
  const multiSelectFilter: ColumnDef<FileWithUI>["filterFn"] = (row, id, value) => {
    if (!Array.isArray(value) || value.length === 0) return true;
    const cellValue = row.getValue<string>(id);
    return value.includes(cellValue);
  };

  const columns = useMemo<ColumnDef<FileWithUI>[]>(
    () => [
      { accessorKey: 'title' },
      { accessorKey: 'status', filterFn: multiSelectFilter },
      { accessorKey: 'file_type' },
      {
        accessorKey: 'collection_name',
        header: 'Collection',
        accessorFn: (row) => row.collection?.name ?? '',
        filterFn: multiSelectFilter,
      },
    ],
    []
  );

  const table = useReactTable<FileWithUI>({
    data: files,
    columns,
    state: { columnFilters },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const filteredFiles = table.getRowModel().rows.map((r) => r.original);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getFileIcon = (fileType: string) => {
    // You could expand this to show different icons for different file types
    return <FileText className="h-5 w-5" />;
  };

  const getStatusBadge = (status: FileWithUI['status']) => {
    switch (status) {
      case 'ready':
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Ready
          </Badge>
        );
      case 'processing':
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            <Clock className="h-3 w-3 mr-1" />
            Processing
          </Badge>
        );
      case 'error':
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            <AlertCircle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">File Manager</h2>
        <div className="flex gap-2">
          <Button onClick={() => setIsUploadDialogOpen(true)}>
            Upload Files
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 w-full max-w-md">
          <Input
            type="text"
            placeholder="Search files..."
            value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
            onChange={(e) =>
              table.getColumn('title')?.setFilterValue(e.target.value)
            }
            className="pl-10"
          />

          {/* Filter dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-1" /> Filters
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {/* Status filter */}
              <div className="px-3 py-2">
                <p className="text-xs font-medium text-muted-foreground mb-1">Status</p>
                {statusOptions.map((status) => {
                  const current: string[] =
                    (table.getColumn('status')?.getFilterValue() as string[]) ?? [];
                  const checked = current.includes(status);
                  return (
                    <DropdownMenuCheckboxItem
                      key={status}
                      checked={checked}
                      onCheckedChange={(chk) => {
                        const col = table.getColumn('status');
                        const prev: string[] = (col?.getFilterValue() as string[]) ?? [];
                        col?.setFilterValue(
                          chk ? [...prev, status] : prev.filter((s) => s !== status)
                        );
                      }}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </DropdownMenuCheckboxItem>
                  );
                })}
              </div>
              <DropdownMenuSeparator />
              {/* Collection filter */}
              <div className="px-3 py-2">
                <p className="text-xs font-medium text-muted-foreground mb-1">Collection</p>
                {collectionOptions.map((col) => {
                  const current: string[] =
                    (table.getColumn('collection_name')?.getFilterValue() as string[]) ?? [];
                  const checked = current.includes(col);
                  return (
                    <DropdownMenuCheckboxItem
                      key={col}
                      checked={checked}
                      onCheckedChange={(chk) => {
                        const column = table.getColumn('collection_name');
                        const prev: string[] = (column?.getFilterValue() as string[]) ?? [];
                        const updated = chk ? [...prev, col] : prev.filter((c) => c !== col);
                        column?.setFilterValue(updated.length ? updated : undefined);
                      }}
                    >
                      {col}
                    </DropdownMenuCheckboxItem>
                  );
                })}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  table.getColumn('status')?.setFilterValue(undefined);
                  table.getColumn('collection_name')?.setFilterValue(undefined);
                }}
              >
                Clear Filters
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Bulk actions bar for selected files */}
      {selectedFiles.length > 0 && (
        <div className="flex items-center justify-between bg-muted p-2 rounded-md mb-2">
          <span className="text-sm">{selectedFiles.length} files selected</span>
          <div className="space-x-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                setFileToLink(null); // distinguish from single
                setIsLinkModalOpen(true);
              }}
            >
              Bulk Link to KB
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setSelectedFiles([])}
            >
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              Delete Selected
            </Button>
          </div>
        </div>
      )}

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
                      setSelectedFiles(filteredFiles.map((file) => file.uuid));
                    } else {
                      setSelectedFiles([]);
                    }
                  }}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>File Size</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Collection</TableHead>
              <TableHead>Upload Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredFiles.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-8 text-muted-foreground"
                >
                  {searchQuery
                    ? 'No files match your search'
                    : 'No files found'}
                </TableCell>
              </TableRow>
            ) : (
              filteredFiles.map((file) => (
                <TableRow key={file.uuid}>
                  <TableCell>
                    <Checkbox
                      checked={selectedFiles.includes(file.uuid)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedFiles([...selectedFiles, file.uuid]);
                        } else {
                          setSelectedFiles(
                            selectedFiles.filter((id) => id !== file.uuid)
                          );
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="font-medium">{file.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {file.file_size ? formatFileSize(file.file_size) : '--'}
                  </TableCell>
                  <TableCell className="text-xs uppercase text-muted-foreground">
                    {file.file_type}
                  </TableCell>
                  <TableCell>{file.collection?.name || '-'}</TableCell>
                  <TableCell>{formatDate(file.created_at)}</TableCell>
                  <TableCell>{getStatusBadge(file.status)}</TableCell>
                  <TableCell>
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
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handlePreviewFile(file)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <a
                              href={file.file}
                              download={file.title}
                              className="flex items-center"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleOpenLinkModal(file.uuid)}
                          >
                            <Link className="h-4 w-4 mr-2" />
                            Link to KB
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteFile(file.uuid)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination - match knowledge-base-detail.tsx exactly */}
      {filesCount > 0 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Total {filesCount} files
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
              {(() => {
                const totalPages = Math.max(
                  1,
                  Math.ceil(filesCount / itemsPerPage)
                );
                return Array.from({ length: Math.min(totalPages, 5) }).map(
                  (_, i) => {
                    let pageNum = i + 1;
                    if (totalPages > 5 && currentPage > 3) {
                      pageNum = currentPage - 3 + i;
                      if (pageNum > totalPages) {
                        pageNum = totalPages - (4 - i);
                      }
                    }
                    if (pageNum <= totalPages) {
                      return (
                        <PaginationItem key={pageNum}>
                          <Button
                            variant={
                              currentPage === pageNum ? 'default' : 'outline'
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
                );
              })()}
              {(() => {
                const totalPages = Math.max(
                  1,
                  Math.ceil(filesCount / itemsPerPage)
                );
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
                      Math.min(
                        prev + 1,
                        Math.max(1, Math.ceil(filesCount / itemsPerPage))
                      )
                    )
                  }
                  disabled={
                    currentPage >= Math.ceil(filesCount / itemsPerPage) ||
                    !hasNextPage
                  }
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

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Files</DialogTitle>
            <DialogDescription>
              Upload files to your file manager. Supported formats include PDF,
              DOCX, XLSX, TXT, CSV, MD, JPEG, and PNG.
            </DialogDescription>
          </DialogHeader>
          <FileUpload
            onUploadComplete={handleUploadComplete}
            folders={[]}
            currentFolderId={null}
          />
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
          setIsLinkModalOpen(false);
          setFileToLink(null);
        }}
        fileId={fileToLink}
        fileIds={
          fileToLink === null ? selectedFiles : fileToLink ? [fileToLink] : []
        }
        onLinkFiles={handleLinkFilesToKnowledgeBase}
        existingLinks={
          fileToLink
            ? files.find((f) => f.uuid === fileToLink)?.linkedKnowledgeBases ||
              []
            : []
        }
      />
    </div>
  );
}
