'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  FileText,
  Trash2,
  Filter,
  MoreHorizontal,
  Download,
  Eye,
  ChevronDown,
  Folder,
  FolderOpen,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Edit,
  Upload,
  ChevronRight,
  Home,
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
import { toast } from 'sonner';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
} from '@tanstack/react-table';
import { deleteVaultFile, updateVaultFile, moveVaultFiles, getAllVaultFiles } from '@/api/vault';
import { api } from '@/lib/api-client';
import { VaultFile } from '@/features/vault/types/vault';
import { getProjects } from '@/api/projects';
import { Project, PaginatedProjectList } from '@/types/api';

interface DraggableRowProps {
  file: VaultFile;
  children: React.ReactNode;
  draggedFiles: number[];
  dragOverFolderId: number | null;
  onDragStart: (e: React.DragEvent, fileId: number) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent, folderId?: number) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetFolderId: number) => void;
  onFolderClick: (folder: VaultFile) => void;
}

const DraggableRow: React.FC<DraggableRowProps> = ({
  file,
  children,
  draggedFiles,
  dragOverFolderId,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  onFolderClick,
}) => {
  const isDragging = draggedFiles.includes(file.id);
  const isDropTarget = file.is_folder && dragOverFolderId === file.id;

  return (
    <TableRow
      className={`
        ${isDragging ? 'opacity-50 bg-muted' : ''}
        ${isDropTarget ? 'bg-primary/10 border-2 border-primary/30' : ''}
        ${file.is_folder ? 'hover:bg-muted cursor-pointer' : ''}
        transition-all duration-200
      `}
      draggable
      onDragStart={(e) => onDragStart(e, file.id)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => file.is_folder ? onDragOver(e, file.id) : undefined}
      onDragLeave={onDragLeave}
      onDrop={(e) => file.is_folder ? onDrop(e, file.id) : undefined}
      onClick={() => file.is_folder && onFolderClick(file)}
    >
      {children}
    </TableRow>
  );
};

export function VaultManager() {
  const [vaultFiles, setVaultFiles] = useState<VaultFile[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'created_at', desc: true }
  ]);
  
  // Folder navigation
  const [currentFolderId, setCurrentFolderId] = useState(0);
  const [breadcrumbs, setBreadcrumbs] = useState<{ id: number; name: string; projectName?: string }[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');

  // Drag and drop state
  const [draggedFiles, setDraggedFiles] = useState<number[]>([]);
  const [dragOverFolderId, setDragOverFolderId] = useState<number | null>(null);

  // Dialogs
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<VaultFile | null>(null);
  const [renameName, setRenameName] = useState('');

  // Debounced search
  const [debouncedSearchValue, setDebouncedSearchValue] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchValue]);

  // Fetch projects and users on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [projectsResponse, usersResponse] = await Promise.all([
          getProjects(),
          api.get('/reggie/api/v1/users/') // Assuming this endpoint exists
        ]);
        
        setProjects((projectsResponse as PaginatedProjectList).results || []);
        setUsers((usersResponse as any)?.results || []);
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
        // Continue with empty arrays
      }
    };
    
    fetchInitialData();
  }, []);

  // Fetch vault files
  const fetchVaultFiles = useCallback(async () => {
    setIsLoading(true);
    try {
      if (selectedProjectId === 'all') {
        // For admin view, fetch all vault files using direct API call
        const params = new URLSearchParams({
          page: String(currentPage),
          page_size: String(itemsPerPage),
          parent_id: String(currentFolderId),
          ...(debouncedSearchValue && { search: debouncedSearchValue }),
        });

        const response = await api.get(`/reggie/api/v1/vault-files/?${params}`) as any;
        
        if (response && response.results) {
          setVaultFiles(response.results);
          setTotalCount(response.count || 0);
          setHasNextPage(!!response.next);
        }
      } else {
        // Fetch files for specific project
        const response = await getAllVaultFiles(
          currentPage,
          itemsPerPage,
          debouncedSearchValue
        );
        
        setVaultFiles(response.results);
        setTotalCount(response.count || 0);
        setHasNextPage(!!response.next);
      }
    } catch (error) {
      console.error('Failed to fetch vault files:', error);
      toast.error('Failed to load vault files');
      setVaultFiles([]);
      setTotalCount(0);
      setHasNextPage(false);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, debouncedSearchValue, currentFolderId, selectedProjectId]);

  useEffect(() => {
    fetchVaultFiles();
  }, [fetchVaultFiles]);

  // Drag and drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, fileId: number) => {
    e.dataTransfer.effectAllowed = 'move';
    const filesToDrag = selectedItems.includes(fileId) ? selectedItems : [fileId];
    setDraggedFiles(filesToDrag);
    e.dataTransfer.setData('text/plain', JSON.stringify(filesToDrag));
  }, [selectedItems]);

  const handleDragEnd = useCallback(() => {
    setDraggedFiles([]);
    setDragOverFolderId(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, folderId?: number) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    if (folderId !== undefined) {
      setDragOverFolderId(folderId);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolderId(null);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent, targetFolderId: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolderId(null);

    const draggedFileIds = draggedFiles.length > 0 ? draggedFiles : JSON.parse(e.dataTransfer.getData('text/plain'));
    
    try {
      await moveVaultFiles(draggedFileIds, targetFolderId);
      toast.success(`Moved ${draggedFileIds.length} item(s) successfully`);
      setDraggedFiles([]);
      fetchVaultFiles();
    } catch (error) {
      console.error('Move failed:', error);
      toast.error('Failed to move files');
    }
  }, [draggedFiles, fetchVaultFiles]);

  // Helper functions
  const getUserName = (userId?: number) => {
    if (!userId) return '--';
    const user = users.find(u => u.id === userId);
    return user ? `${user.first_name} ${user.last_name}`.trim() || user.email : `User ${userId}`;
  };

  const getProjectName = (projectUuid?: string) => {
    if (!projectUuid) return '--';
    const project = projects.find(p => p.uuid === projectUuid);
    return project?.name || projectUuid;
  };

  const handleDeleteFile = async (fileId: number) => {
    try {
      await deleteVaultFile(fileId);
      toast.success('File deleted successfully');
      fetchVaultFiles();
    } catch (error) {
      console.error('Failed to delete file:', error);
      toast.error('Failed to delete file');
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedItems.map(id => deleteVaultFile(id)));
      toast.success(`${selectedItems.length} files deleted successfully`);
      setSelectedItems([]);
      fetchVaultFiles();
    } catch (error) {
      console.error('Failed to delete files:', error);
      toast.error('Failed to delete selected files');
    }
  };

  const handleFolderClick = (folder: VaultFile) => {
    if (!folder.is_folder) return;
    
    setCurrentFolderId(folder.id);
    setCurrentPage(1);
    
    // Update breadcrumbs
    const newBreadcrumb = {
      id: folder.id,
      name: folder.original_filename || 'Unnamed Folder',
      projectName: getProjectName(folder.project_uuid)
    };
    setBreadcrumbs(prev => [...prev, newBreadcrumb]);
  };

  const navigateToBreadcrumb = (index: number) => {
    if (index === -1) {
      // Navigate to root
      setCurrentFolderId(0);
      setBreadcrumbs([]);
    } else {
      const targetBreadcrumb = breadcrumbs[index];
      setCurrentFolderId(targetBreadcrumb.id);
      setBreadcrumbs(prev => prev.slice(0, index + 1));
    }
    setCurrentPage(1);
  };

  const handleRename = async () => {
    if (!renameTarget || !renameName.trim()) return;
    
    try {
      await updateVaultFile(renameTarget.id, { original_filename: renameName.trim() });
      toast.success('File renamed successfully');
      setIsRenameDialogOpen(false);
      setRenameTarget(null);
      setRenameName('');
      fetchVaultFiles();
    } catch (error) {
      console.error('Failed to rename file:', error);
      toast.error('Failed to rename file');
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '--';
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '--';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getItemIcon = (item: VaultFile) => {
    if (item.is_folder) {
      return <Folder className="h-5 w-5 text-blue-500" />;
    }
    
    const fileType = item.original_filename?.toLowerCase();
    if (fileType?.includes('.pdf')) {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else if (fileType?.includes('.doc')) {
      return <FileText className="h-5 w-5 text-blue-500" />;
    } else {
      return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getFileType = (filename?: string) => {
    if (!filename) return 'Unknown';
    const extension = filename.split('.').pop()?.toUpperCase();
    return extension || 'Unknown';
  };

  const columns = useMemo<ColumnDef<VaultFile>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={selectedItems.includes(row.original.id)}
            onCheckedChange={(checked) => {
              if (checked) {
                setSelectedItems(prev => [...prev, row.original.id]);
              } else {
                setSelectedItems(prev => prev.filter(id => id !== row.original.id));
              }
            }}
            aria-label="Select row"
            onClick={(e) => e.stopPropagation()} // Prevent row click when selecting
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'original_filename',
        header: 'Name',
        cell: ({ row }) => (
          <div className="flex items-center">
            {getItemIcon(row.original)}
            <span 
              className={`ml-2 font-medium ${
                row.original.is_folder ? 'text-blue-600 hover:text-blue-800 cursor-pointer' : ''
              }`}
            >
              {row.original.original_filename || 'Unnamed'}
            </span>
          </div>
        ),
      },
      {
        id: 'type',
        header: 'Type',
        accessorFn: (row) => row.is_folder ? 'Folder' : getFileType(row.original_filename),
      },
      {
        id: 'size',
        header: 'Size',
        accessorFn: (row) => row.size || 0,
        cell: ({ row }) => formatFileSize(row.original.size),
      },
      {
        id: 'project',
        header: 'Project',
        accessorFn: (row) => getProjectName(row.project_uuid),
      },
      {
        id: 'uploaded_by',
        header: 'Uploaded By',
        accessorFn: (row) => getUserName(row.uploaded_by),
      },
      {
        id: 'created_at',
        header: 'Created',
        accessorFn: (row) => row.created_at,
        cell: ({ row }) => formatDate(row.original.created_at),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {row.original.is_folder ? (
                  <>
                    <DropdownMenuItem onClick={() => handleFolderClick(row.original)}>
                      <FolderOpen className="h-4 w-4 mr-2" />
                      Open Folder
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      setRenameTarget(row.original);
                      setRenameName(row.original.original_filename || '');
                      setIsRenameDialogOpen(true);
                    }}>
                      <Edit className="h-4 w-4 mr-2" />
                      Rename
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      setRenameTarget(row.original);
                      setRenameName(row.original.original_filename || '');
                      setIsRenameDialogOpen(true);
                    }}>
                      <Edit className="h-4 w-4 mr-2" />
                      Rename
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => handleDeleteFile(row.original.id)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
        enableSorting: false,
      },
    ],
    [projects, users, selectedItems]
  );

  const table = useReactTable({
    data: vaultFiles,
    columns,
    state: {
      columnFilters,
      sorting,
      rowSelection: selectedItems.reduce((acc, id) => ({ ...acc, [id]: true }), {}),
    },
    enableRowSelection: true,
    onRowSelectionChange: (updater) => {
      if (typeof updater === 'function') {
        const newSelection = updater(
          selectedItems.reduce((acc, id) => ({ ...acc, [id]: true }), {})
        );
        setSelectedItems(Object.keys(newSelection).filter(key => newSelection[key]).map(Number));
      }
    },
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => String(row.id),
  });

  const typeOptions = ['all', 'folders', 'files'];

  return (
    <div className="space-y-4">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm">
        <Home 
          className="h-4 w-4 text-primary cursor-pointer hover:text-primary/80"
          onClick={() => navigateToBreadcrumb(-1)}
        />
        <span 
          className={`${currentFolderId === 0 ? 'text-foreground font-semibold' : 'text-primary hover:text-primary/80 cursor-pointer'}`}
          onClick={() => navigateToBreadcrumb(-1)}
        >
          All Vault Files
        </span>
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.id}>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span 
              className={`text-primary hover:text-primary/80 cursor-pointer ${
                index === breadcrumbs.length - 1 ? 'font-semibold' : ''
              }`}
              onClick={() => navigateToBreadcrumb(index)}
            >
              {crumb.name}
              {crumb.projectName && (
                <span className="text-muted-foreground ml-1">({crumb.projectName})</span>
              )}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Search, Filters, and Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Input
            type="text"
            placeholder="Search vault files..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />

          {/* Project Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-1" /> 
                {selectedProjectId === 'all' ? 'All Projects' : getProjectName(selectedProjectId)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem onClick={() => setSelectedProjectId('all')}>
                All Projects
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {projects.map((project) => (
                <DropdownMenuItem 
                  key={project.uuid} 
                  onClick={() => setSelectedProjectId(project.uuid!)}
                >
                  {project.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Type Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-1" /> Type
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {typeOptions.map((type) => {
                const currentType = table.getColumn('type')?.getFilterValue() as string | undefined;
                const checked = currentType === type || (!currentType && type === 'all');
                return (
                  <DropdownMenuCheckboxItem
                    key={type}
                    checked={checked}
                    onCheckedChange={(chk) => {
                      const col = table.getColumn('type');
                      col?.setFilterValue(chk && type !== 'all' ? type : undefined);
                    }}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </DropdownMenuCheckboxItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => toast.info('Folder creation feature coming soon!')}
          >
            <Folder className="h-4 w-4 mr-2" />
            New Folder
          </Button>
          <Button onClick={() => toast.info('File upload feature coming soon!')}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Files
          </Button>
        </div>
      </div>

      {/* Bulk actions bar */}
      {selectedItems.length > 0 && (
        <div className="flex items-center justify-between bg-muted p-2 rounded-md">
          <span className="text-sm">{selectedItems.length} items selected</span>
          <div className="space-x-2">
            <Button variant="outline" size="sm" onClick={() => setSelectedItems([])}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      {/* Table with Drag and Drop */}
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className={header.id === 'select' ? 'w-12' : ''}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? 'cursor-pointer select-none flex items-center gap-2 hover:text-primary'
                            : ''
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {typeof header.column.columnDef.header === 'function'
                          ? header.column.columnDef.header(header.getContext() as any)
                          : header.column.columnDef.header}
                        {header.column.getCanSort() && (
                          header.column.getIsSorted() === 'asc' ? (
                            <ArrowUp className="h-4 w-4" />
                          ) : header.column.getIsSorted() === 'desc' ? (
                            <ArrowDown className="h-4 w-4" />
                          ) : (
                            <ArrowUpDown className="h-4 w-4 opacity-50" />
                          )
                        )}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
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
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                  {searchValue ? 'No vault files match your search' : 'No vault files found'}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <DraggableRow
                  key={row.id}
                  file={row.original}
                  draggedFiles={draggedFiles}
                  dragOverFolderId={dragOverFolderId}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onFolderClick={handleFolderClick}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {cell.column.columnDef.cell
                        ? (cell.column.columnDef.cell as any)(cell.getContext())
                        : cell.getValue()}
                    </TableCell>
                  ))}
                </DraggableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalCount > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Total {totalCount} items
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
              </PaginationItem>
              {(() => {
                const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));
                return Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
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
              {Math.ceil(totalCount / itemsPerPage) > 5 && currentPage < Math.ceil(totalCount / itemsPerPage) - 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              <PaginationItem>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalCount / itemsPerPage)))}
                  disabled={currentPage >= Math.ceil(totalCount / itemsPerPage) || !hasNextPage}
                >
                  Next
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Items per page:</span>
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

      {/* Rename Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Rename {renameTarget?.is_folder ? 'Folder' : 'File'}
            </DialogTitle>
            <DialogDescription>
              Enter a new name for the {renameTarget?.is_folder ? 'folder' : 'file'}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={renameName}
              onChange={(e) => setRenameName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              autoFocus
              placeholder={renameTarget?.original_filename || ''}
            />
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsRenameDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleRename} 
                disabled={!renameName.trim()}
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}