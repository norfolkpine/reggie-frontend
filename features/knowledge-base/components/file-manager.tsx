'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Plus,
  Folder,
  FolderOpen,
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
import { CreateFolderDialog } from './create-folder-dialog';
import { CreateCollectionDialog } from './create-collection-dialog';
import { toast } from 'sonner';
import { LinkFilesModal } from './link-files-modal';
import { File, FileWithUI, KnowledgeBase } from '@/types/knowledge-base';
import { Collection, PaginatedCollectionResponse } from '@/api/collections';
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
import { listCollections, deleteCollection, getCollectionByUuid } from '@/api/collections';
import { api } from '@/lib/api-client';

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

// Unified interface for both files and folders
interface FileOrFolder {
  id: string;
  name: string;
  type: 'file' | 'folder';
  file?: FileWithUI;
  folder?: Collection;
  created_at: string;
  updated_at: string;
  file_size?: number;
  file_type?: string;
  collection?: Collection;
  status?: 'ready' | 'processing' | 'error';
}

export function FileManager() {
  const [currentLocation, setCurrentLocation] = useState<any[] | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Collection[]>([]);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);

  const [currentCollectionUuid, setCurrentCollectionUuid] = useState<string | undefined>(undefined);
  // TanStack column filters
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const statusOptions = ['ready', 'processing', 'error'];
  const typeOptions = ['pdf', 'docx', 'csv', 'xlsx', 'txt', 'jpeg', 'png'];
  const collectionOptions = useMemo(
    () => {
      if (!currentLocation) return [];
      const location = Array.isArray(currentLocation) ? currentLocation[0] : currentLocation;
      return Array.from(new Set(location?.children?.map((c: Collection) => c.name) || [])) as string[];
    },
    [currentLocation]
  );
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [previewFile, setPreviewFile] = useState<FileWithUI | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [fileToLink, setFileToLink] = useState<string | null>(null);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isCreateCollectionOpen, setIsCreateCollectionOpen] = useState(false);
  const [isEditCollectionOpen, setIsEditCollectionOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [itemsCount, setItemsCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);

  // Combined items for display
  const combinedItems = useMemo<FileOrFolder[]>(() => {
    if (!currentLocation) return [];

    // Handle the new API response format where currentLocation is an array of results
    const results = Array.isArray(currentLocation) ? currentLocation : [currentLocation];
    if (!results.length) return [];

    // Since the API response only contains collections/folders for now,
    // we'll treat all items as folders. In the future, when files are included,
    // we can distinguish them by checking for file-specific properties
    const folderItems: FileOrFolder[] = results.map((collection: any) => ({
        id: `folder-${collection.uuid}`,
        name: collection.name || collection.title || 'Untitled',
        type: 'folder' as const,
        file: undefined,
        folder: {
          uuid: collection.uuid,
          id: undefined,
          name: collection.name || collection.title || 'Untitled',
          description: collection.description,
          collection_type: collection.collection_type || 'folder',
          jurisdiction: undefined,
          regulation_number: undefined,
          effective_date: undefined,
          sort_order: 0,
          children: [],
          files: [],
          full_path: '',
          created_at: collection.created_at,
        } as Collection,
        created_at: collection.created_at,
        updated_at: collection.created_at, // collections don't have updated_at
        file_size: undefined,
        file_type: undefined,
        collection: undefined,
        status: undefined,
      }));

    // Add "Go Up" entry if we're inside a collection
    const goUpItem: FileOrFolder | null = currentCollectionUuid ? {
      id: 'go-up',
      name: '..',
      type: 'folder' as const,
      file: undefined,
      folder: undefined,
      created_at: '',
      updated_at: '',
      file_size: undefined,
      file_type: undefined,
      collection: undefined,
      status: undefined,
    } : null;

    // Sort folders by name
    const sortedItems = folderItems.sort((a, b) => a.name.localeCompare(b.name));

    // Add go up item at the beginning if it exists
    return goUpItem ? [goUpItem, ...sortedItems] : sortedItems;
  }, [currentLocation, currentCollectionUuid]);

  useEffect(() => {
    fetchData();
  }, [currentCollectionUuid, currentPage, itemsPerPage]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Get search query from table column filter
      const searchFilter = table.getColumn('name')?.getFilterValue() as string;
      
      // Build query parameters for the file manager endpoint
      const params: Record<string, string> = {
        file_manager: 'true',
        page: currentPage.toString(),
        page_size: itemsPerPage.toString(),
      };

      // Add collection UUID if we're inside a collection
      if (currentCollectionUuid) {
        params.collection_uuid = currentCollectionUuid;
      }

      // Add search if provided
      if (searchFilter) {
        params.search = searchFilter;
      }

      // Use the new file manager endpoint
      const response = await api.get(`/reggie/api/v1/files/?${new URLSearchParams(params)}`);
      
      if (response && typeof response === 'object' && 'results' in response) {
        // File manager response with pagination
        const data = response as {
          count: number;
          next: string | null;
          previous: string | null;
          results: Array<{
            type: 'collection' | 'file';
            uuid: string;
            name?: string;
            title?: string;
            description?: string;
            collection_type?: string;
            file_type?: string;
            created_at: string;
            file_size?: number;
          }>;
        };

        setCurrentLocation(data.results);
        setItemsCount(data.count || 0);
        setHasNextPage(!!data.next);
        
        // Update breadcrumbs if we're inside a collection
        if (currentCollectionUuid) {
          // For now, we'll need to fetch the collection details to get the name
          try {
            const collection = await getCollectionByUuid(currentCollectionUuid);
            updateBreadcrumbs([collection]);
          } catch (error) {
            console.error('Failed to fetch collection details for breadcrumbs:', error);
            updateBreadcrumbs([]);
          }
        } else {
          setBreadcrumbs([]);
        }
      } else {
        // Fallback to empty state
        setCurrentLocation([]);
        setItemsCount(0);
        setHasNextPage(false);
        setBreadcrumbs([]);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load files and folders');
      setCurrentLocation([]);
      setItemsCount(0);
      setHasNextPage(false);
    } finally {
      setIsLoading(false);
    }
  };

  const updateBreadcrumbs = (collection: Collection | Collection[]) => {
    // For now, we'll just show the current collection
    // In the future, you can implement a proper breadcrumb trail
    if (Array.isArray(collection)) {
      setBreadcrumbs(collection);
    } else {
      setBreadcrumbs([collection]);
    }
  };

  const handleUploadComplete = (uploadedFiles: FileWithUI[]) => {
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
      toast.success('File deleted successfully');
      fetchData(); // Refresh the list
    } catch (error) {
      console.error('Failed to delete file:', error);
      toast.error('Failed to delete file');
    }
  };

  const handleDeleteFolder = async (collectionUuid: string) => {
    try {
      await deleteCollection(collectionUuid);
      toast.success('Folder deleted successfully');
      fetchData(); // Refresh the list
    } catch (error) {
      console.error('Failed to delete folder:', error);
      toast.error('Failed to delete folder');
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
      const filesToDelete = selectedItems.filter(id => !id.startsWith('folder-'));
      const foldersToDelete = selectedItems.filter(id => id.startsWith('folder-')).map(id => id.replace('folder-', ''));

      // Delete files
      await Promise.all(filesToDelete.map((fileId) => deleteFile(fileId)));
      
      // Delete folders
      await Promise.all(foldersToDelete.map((folderUuid) => handleDeleteFolder(folderUuid)));

      toast.success(`${selectedItems.length} items deleted successfully`);
      setSelectedItems([]);
      fetchData();
    } catch (error) {
      console.error('Failed to delete items:', error);
      toast.error('Failed to delete selected items');
    }
  };

  // TanStack table setup
  const multiSelectFilter: ColumnDef<FileOrFolder>["filterFn"] = (row, id, value) => {
    if (!Array.isArray(value) || value.length === 0) return true;
    const cellValue = row.getValue<string>(id);
    return value.includes(cellValue);
  };

  const columns = useMemo<ColumnDef<FileOrFolder>[]>(
    () => [
      // Checkbox column
      {
        id: "select",
        header: "",
        enableSorting: false,
        enableHiding: false,
      },
      // Name column
      { 
        accessorKey: 'name',
        header: 'Name'
      },
      // File Size column
      {
        id: "file_size",
        header: "File Size",
        accessorFn: (row) => row.file_size,
      },
      // Type column
      {
        id: "type",
        header: 'Type',
        accessorFn: (row) => row.type === 'folder' ? 'Folder' : (row.file_type || 'Unknown'),
      },
      // Collection column
      {
        id: "collection",
        header: 'Collection',
        accessorFn: (row) => row.collection?.name ?? '',
        filterFn: multiSelectFilter,
      },
      // Upload Date column
      {
        id: "created_at",
        header: "Created Date",
        accessorFn: (row) => row.created_at,
      },
      // Status column
      { 
        accessorKey: 'status', 
        header: 'Status',
        filterFn: multiSelectFilter 
      },
      // Actions column
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        enableHiding: false,
      },
    ],
    []
  );

  const table = useReactTable<FileOrFolder>({
    data: combinedItems,
    columns,
    state: { columnFilters },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const filteredItems = table.getRowModel().rows.map((r) => r.original);

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

  const getItemIcon = (item: FileOrFolder) => {
    if (item.type === 'folder') {
      return <Folder className="h-5 w-5 text-blue-500" />;
    }
    return <FileText className="h-5 w-5" />;
  };

  const getStatusBadge = (status: FileOrFolder['status']) => {
    if (!status) return null;
    
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
    <div className="flex-1 flex flex-col h-full">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">File Manager</h2>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  New
                  <Plus className="h-4 w-4 mr-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsUploadDialogOpen(true)}>
                  <FileText className="h-4 w-4 mr-2" />
                  File
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsCreateCollectionOpen(true)}>
                  <Folder className="h-4 w-4 mr-2" />
                  Collection
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsCreateFolderOpen(true)}>
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Folder
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 w-full max-w-md">
          <Input
            type="text"
            placeholder="Search files and folders..."
            value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
            onChange={(e) =>
              table.getColumn('name')?.setFilterValue(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                fetchData();
              }
            }}
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
              {/* Type filter */}
              <div className="px-3 py-2">
                <p className="text-xs font-medium text-muted-foreground mb-1">Type</p>
                <DropdownMenuCheckboxItem
                  checked={true}
                  onCheckedChange={() => {}}
                >
                  All
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={true}
                  onCheckedChange={() => {}}
                >
                  Folders
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={true}
                  onCheckedChange={() => {}}
                >
                  Files
                </DropdownMenuCheckboxItem>
              </div>
              <DropdownMenuSeparator />
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
                    (table.getColumn('collection')?.getFilterValue() as string[]) ?? [];
                  const checked = current.includes(col);
                  return (
                    <DropdownMenuCheckboxItem
                      key={col}
                      checked={checked}
                      onCheckedChange={(chk) => {
                        const column = table.getColumn('collection');
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
                  table.getColumn('collection')?.setFilterValue(undefined);
                }}
              >
                Clear All Filters
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 mb-4 text-sm">
        <span 
          className={`${!currentCollectionUuid ? 'text-gray-900 font-semibold' : 'text-blue-600 hover:text-blue-800 cursor-pointer font-medium'}`}
          onClick={!currentCollectionUuid ? undefined : () => {
            setCurrentCollectionUuid(undefined);
            fetchData();
          }}
        >
          Root
        </span>
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.uuid || index}>
            <span className="text-gray-400">/</span>
            <span 
              className="text-blue-600 hover:text-blue-800 cursor-pointer font-medium"
              onClick={() => {
                setCurrentCollectionUuid(crumb.uuid);
                fetchData();
              }}
            >
              {crumb.name}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Bulk actions bar for selected items */}
      {selectedItems.length > 0 && (
        <div className="flex items-center justify-between bg-muted p-2 rounded-md mb-2">
          <span className="text-sm">{selectedItems.length} items selected</span>
          <div className="space-x-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                setFileToLink(null); // distinguish from single
                setIsLinkModalOpen(true);
              }}
              disabled={selectedItems.every(id => id.startsWith('folder-'))}
            >
              Bulk Link to KB
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setSelectedItems([])}
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
                    selectedItems.length === filteredItems.length &&
                    filteredItems.length > 0
                  }
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedItems(filteredItems.map((item) => item.id));
                    } else {
                      setSelectedItems([]);
                    }
                  }}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>File Size</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Collection</TableHead>
              <TableHead>Created Date</TableHead>
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
            ) : filteredItems.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-8 text-muted-foreground"
                >
                  {(table.getColumn('name')?.getFilterValue() as string)
                    ? 'No files or folders match your search'
                    : 'No files or folders found'}
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedItems.includes(item.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedItems([...selectedItems, item.id]);
                        } else {
                          setSelectedItems(
                            selectedItems.filter((id) => id !== item.id)
                          );
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {getItemIcon(item)}
                      <span 
                        className={`font-medium ml-2 ${
                          item.id === 'go-up' 
                            ? 'text-gray-500 hover:text-gray-700 cursor-pointer italic' 
                            : item.type === 'folder' 
                              ? 'text-blue-600 hover:text-blue-800 cursor-pointer' 
                              : ''
                        }`}
                        onClick={item.type === 'folder' ? () => {
                          if (item.id === 'go-up') {
                            // Go up to parent directory
                            setCurrentCollectionUuid(undefined);
                          } else {
                            // Navigate into folder
                            setCurrentCollectionUuid(item.folder!.uuid);
                          }
                          fetchData();
                        } : undefined}
                      >
                        {item.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.file_size ? formatFileSize(item.file_size) : '--'}
                  </TableCell>
                  <TableCell className="text-xs uppercase text-muted-foreground">
                    {item.type === 'folder' ? 'Folder' : (item.file_type || 'Unknown')}
                  </TableCell>
                  <TableCell>{item.collection?.name || '-'}</TableCell>
                  <TableCell>{formatDate(item.created_at)}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      {item.type === 'file' && item.file && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={() => handleOpenLinkModal(item.file!.uuid)}
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
                                onClick={() => handlePreviewFile(item.file!)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Preview
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <a
                                  href={item.file!.file}
                                  download={item.file!.title}
                                  className="flex items-center"
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </a>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleOpenLinkModal(item.file!.uuid)}
                              >
                                <Link className="h-4 w-4 mr-2" />
                                Link to KB
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteFile(item.file!.uuid)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </>
                      )}
                      {item.type === 'folder' && item.folder && item.id !== 'go-up' && (
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
                              onClick={() => {
                                if (item.id === 'go-up') {
                                  // Go up to parent directory
                                  setCurrentCollectionUuid(undefined);
                                } else {
                                  // Navigate into folder
                                  setCurrentCollectionUuid(item.folder!.uuid);
                                }
                                fetchData();
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Open Folder
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingCollection(item.folder!);
                                setIsEditCollectionOpen(true);
                              }}
                            >
                              <Folder className="h-4 w-4 mr-2" />
                              Manage
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                if (item.folder?.uuid) {
                                  handleDeleteFolder(item.folder.uuid);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

            {/* Pagination */}
      {itemsCount > 0 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Total {itemsCount} items
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
                  Math.ceil(itemsCount / itemsPerPage)
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
                  Math.ceil(itemsCount / itemsPerPage)
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
                        Math.max(1, Math.ceil(itemsCount / itemsPerPage))
                      )
                    )
                  }
                  disabled={
                    currentPage >= Math.ceil(itemsCount / itemsPerPage) ||
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
          fileToLink === null ? selectedItems.filter(id => !id.startsWith('folder-')) : fileToLink ? [fileToLink] : []
        }
        onLinkFiles={handleLinkFilesToKnowledgeBase}
        existingLinks={
          fileToLink
            ? combinedItems.find((item) => item.id === fileToLink)?.file?.linkedKnowledgeBases ||
              []
            : []
        }
      />

      {/* Create Folder Dialog */}
      <CreateFolderDialog
        isOpen={isCreateFolderOpen}
        onClose={() => setIsCreateFolderOpen(false)}
        onFolderCreated={() => {
          // Refresh the data to show the new folder
          fetchData();
        }}
        parentCollectionUuid={currentCollectionUuid}
      />

      {/* Create Collection Dialog */}
      <CreateCollectionDialog
        isOpen={isCreateCollectionOpen}
        onClose={() => setIsCreateCollectionOpen(false)}
        onCollectionCreated={() => {
          // Refresh the data to show the new collection
          fetchData();
        }}
        parentCollectionUuid={currentCollectionUuid}
      />

      {/* Edit Collection Dialog */}
      <CreateCollectionDialog
        isOpen={isEditCollectionOpen}
        onClose={() => {
          setIsEditCollectionOpen(false);
          setEditingCollection(null);
        }}
        onCollectionCreated={() => {
          // Refresh the data to show the updated collection
          fetchData();
        }}
        mode="edit"
        collection={editingCollection || undefined}
      />
    </div>
  );
}
