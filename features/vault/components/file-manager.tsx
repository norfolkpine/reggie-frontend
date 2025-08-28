'use client';

import { useState, useEffect, useMemo, useCallback, memo } from 'react';
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

// Memoized file type icon component
const FileTypeIcon = memo(function FileTypeIcon({ fileType }: { fileType: string }) {
  const getIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="h-4 w-4 text-red-500" />;
    if (type.includes('doc') || type.includes('word')) return <FileText className="h-4 w-4 text-blue-500" />;
    if (type.includes('xls') || type.includes('excel')) return <FileText className="h-4 w-4 text-green-500" />;
    if (type.includes('txt') || type.includes('csv')) return <FileText className="h-4 w-4 text-gray-500" />;
    if (type.includes('jpg') || type.includes('jpeg') || type.includes('png')) return <FileText className="h-4 w-4 text-purple-500" />;
    return <FileText className="h-4 w-4 text-gray-500" />;
  };

  return getIcon(fileType);
});

// Memoized file status badge component
const FileStatusBadge = memo(function FileStatusBadge({ status }: { status: string }) {
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'processed':
        return 'default';
      case 'processing':
        return 'secondary';
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getIcon = (status: string) => {
    switch (status) {
      case 'processed':
        return <CheckCircle className="h-3 w-3" />;
      case 'processing':
        return <Clock className="h-3 w-3" />;
      case 'error':
        return <AlertCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  return (
    <Badge variant={getBadgeVariant(status)} className="flex items-center gap-1">
      {getIcon(status)}
      {status}
    </Badge>
  );
});

// Memoized file actions dropdown component
const FileActionsDropdown = memo(function FileActionsDropdown({ 
  file, 
  onPreview, 
  onDownload, 
  onDelete, 
  onLink 
}: { 
  file: FileWithUI;
  onPreview: (file: FileWithUI) => void;
  onDownload: (file: FileWithUI) => void;
  onDelete: (file: FileWithUI) => void;
  onLink: (file: FileWithUI) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onPreview(file)}>
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDownload(file)}>
          <Download className="h-4 w-4 mr-2" />
          Download
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onLink(file)}>
          <Link className="h-4 w-4 mr-2" />
          Link to KB
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onDelete(file)} 
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

/* Existing Knowledge-Base FileManager kept for reference above */

export function KBFileManager() {
  const [files, setFiles] = useState<FileWithUI[]>([]);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalFiles, setTotalFiles] = useState(0);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedFileForLink, setSelectedFileForLink] = useState<FileWithUI | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileWithUI | null>(null);

  // Memoized filtered files
  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return files;
    
    return files.filter(file =>
      file.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.file_type?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [files, searchQuery]);

  // Memoized pagination data
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(totalFiles / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentFiles = filteredFiles.slice(startIndex, endIndex);
    
    return {
      totalPages,
      startIndex,
      endIndex,
      currentFiles,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1
    };
  }, [filteredFiles, currentPage, itemsPerPage, totalFiles]);

  // Memoized select all state
  const selectAllChecked = useMemo(() => {
    return selectedFiles.length > 0 && selectedFiles.length === paginationData.currentFiles.length;
  }, [selectedFiles.length, paginationData.currentFiles.length]);

  // Memoized handlers
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  const handleFileSelect = useCallback((fileId: string, checked: boolean) => {
    setSelectedFiles(prev => 
      checked 
        ? [...prev, fileId] 
        : prev.filter(id => id !== fileId)
    );
  }, []);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedFiles(paginationData.currentFiles.map(file => file.uuid));
    } else {
      setSelectedFiles([]);
    }
  }, [paginationData.currentFiles]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleItemsPerPageChange = useCallback((value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  }, []);

  const handleFilePreview = useCallback((file: FileWithUI) => {
    setPreviewFile(file);
    setShowPreview(true);
  }, []);

  const handleFileDownload = useCallback((file: FileWithUI) => {
    if (file.file) {
      const link = document.createElement('a');
      link.href = file.file;
      link.download = file.title || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, []);

  const handleFileDelete = useCallback(async (file: FileWithUI) => {
    try {
      await deleteFile(file.uuid);
      setFiles(prev => prev.filter(f => f.uuid !== file.uuid));
      setSelectedFiles(prev => prev.filter(id => id !== file.uuid));
      toast.success('File deleted successfully');
    } catch (error) {
      toast.error('Failed to delete file');
    }
  }, []);

  const handleFileLink = useCallback((file: FileWithUI) => {
    setSelectedFileForLink(file);
    setShowLinkModal(true);
  }, []);

  const handleBulkDelete = useCallback(async () => {
    if (selectedFiles.length === 0) return;
    
    try {
      await Promise.all(selectedFiles.map(id => deleteFile(id)));
      setFiles(prev => prev.filter(f => !selectedFiles.includes(f.uuid)));
      setSelectedFiles([]);
      toast.success(`${selectedFiles.length} files deleted successfully`);
    } catch (error) {
      toast.error('Failed to delete some files');
    }
  }, [selectedFiles]);

  const handleBulkIngest = useCallback(async (kbId: string) => {
    if (selectedFiles.length === 0) return;
    
    try {
      await ingestSelectedFiles(selectedFiles, kbId);
      setSelectedFiles([]);
      toast.success('Files ingested successfully');
    } catch (error) {
      toast.error('Failed to ingest files');
    }
  }, [selectedFiles]);

  // Fetch files on mount
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setLoading(true);
        const response = await listFilesWithKbs();
        setFiles(response.results);
        setTotalFiles(response.count);
      } catch (error) {
        toast.error('Failed to load files');
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full"
          />
        </div>
        <div className="flex gap-2">
          {selectedFiles.length > 0 && (
            <>
              <Button variant="outline" onClick={handleBulkDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </Button>
              <Button onClick={() => setShowLinkModal(true)}>
                <Link className="h-4 w-4 mr-2" />
                Link to KB
              </Button>
            </>
          )}
          <FileUpload onUploadSuccess={() => {}} />
        </div>
      </div>

      {/* Files Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectAllChecked}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>File</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead className="w-12">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginationData.currentFiles.map((file) => (
              <TableRow key={file.uuid}>
                <TableCell>
                  <Checkbox
                    checked={selectedFiles.includes(file.uuid)}
                    onCheckedChange={(checked) => handleFileSelect(file.uuid, checked as boolean)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <FileTypeIcon fileType={file.file_type || ''} />
                    <div>
                      <div className="font-medium">{file.title}</div>
                      {file.description && (
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {file.description}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{file.file_type}</Badge>
                </TableCell>
                <TableCell>
                  <FileStatusBadge status={file.status || 'pending'} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'N/A'}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {file.created_at ? new Date(file.created_at).toLocaleDateString() : 'N/A'}
                </TableCell>
                <TableCell>
                  <FileActionsDropdown
                    file={file}
                    onPreview={handleFilePreview}
                    onDownload={handleFileDownload}
                    onDelete={handleFileDelete}
                    onLink={handleFileLink}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {paginationData.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {paginationData.startIndex + 1} to {Math.min(paginationData.endIndex, totalFiles)} of {totalFiles} files
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!paginationData.hasPreviousPage}
                >
                  Previous
                </Button>
              </PaginationItem>
              {Array.from({ length: paginationData.totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <Button
                    variant={page === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                </PaginationItem>
              ))}
              <PaginationItem>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!paginationData.hasNextPage}
                >
                  Next
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* File Preview Modal */}
      {showPreview && previewFile && (
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{previewFile.title}</DialogTitle>
              <DialogDescription>{previewFile.description}</DialogDescription>
            </DialogHeader>
            <FilePreview file={previewFile} />
          </DialogContent>
        </Dialog>
      )}

      {/* Link Files Modal */}
      {showLinkModal && (
        <LinkFilesModal
          open={showLinkModal}
          onOpenChange={setShowLinkModal}
          selectedFiles={selectedFiles}
          knowledgeBases={knowledgeBases}
          onLinkSuccess={handleBulkIngest}
        />
      )}
    </div>
  );
}
