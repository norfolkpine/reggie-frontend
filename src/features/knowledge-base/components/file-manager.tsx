'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
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
  Cloud,
  Edit,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
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
  getSortedRowModel,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type ColumnSort,
} from '@tanstack/react-table';
import {
  deleteFile,
  listFiles,
  listFilesWithKbs,
  ingestSelectedFiles,
  patchFile,
  getFiles,
  moveFilesToCollection,
} from '@/api/files';
import { listCollections, deleteCollection, updateCollection, moveCollection } from '@/api/collections';

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

const DRAG_TYPE = 'FILE_OR_FOLDER';

interface DragItem {
  id: string;
  type: 'file' | 'folder';
  item: FileOrFolder;
}

interface DraggableTableRowProps {
  item: FileOrFolder;
  children: React.ReactNode;
  onMoveItem: (draggedItem: FileOrFolder, targetFolder: FileOrFolder | null) => void;
  selectedItems: string[];
  handleSelectItem: (itemId: string, checked: boolean) => void;
  handleItemClick: (item: FileOrFolder) => void;
}

// Root drop zone component
interface RootDropZoneProps {
  onMoveItem: (draggedItem: FileOrFolder, targetFolder: FileOrFolder | null) => void;
  children: React.ReactNode;
}

const RootDropZone: React.FC<RootDropZoneProps> = ({ onMoveItem, children }) => {
  const [{ isOver }, drop] = useDrop<DragItem, void, { isOver: boolean }>(() => ({
    accept: DRAG_TYPE,
    drop: (draggedItem: DragItem) => {
      // Move to root (no parent)
      onMoveItem(draggedItem.item, null);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const attachRef = (el: HTMLDivElement | null) => {
    drop(el);
  };

  return (
    <div 
      ref={attachRef}
      className={`
        ${isOver ? 'bg-primary/10 border-2 border-dashed border-primary/30 rounded-lg' : ''}
        transition-all duration-200
      `}
    >
      {children}
      {isOver && (
        <div className="text-center py-4 text-primary bg-primary/10 border-2 border-dashed border-primary/30 rounded-lg mt-2">
          Drop here to move to root directory
        </div>
      )}
    </div>
  );
};

const DraggableTableRow: React.FC<DraggableTableRowProps> = ({
  item,
  children,
  onMoveItem,
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: DRAG_TYPE,
    item: { id: item.id, type: item.type, item },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [{ isOver }, drop] = useDrop<DragItem, void, { isOver: boolean }>(() => ({
    accept: DRAG_TYPE,
    drop: (draggedItem: DragItem) => {
      // Only allow dropping into folders
      if (item.type === 'folder' && draggedItem.id !== item.id) {
        onMoveItem(draggedItem.item, item);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver() && item.type === 'folder',
    }),
  }));

  const attachRef = (el: HTMLTableRowElement | null) => {
    drag(drop(el));
  };

  return (
    <TableRow
      ref={attachRef}
      className={`
        ${isDragging ? 'opacity-50 bg-muted border-2 border-dashed border-border' : ''}
        ${isOver ? 'bg-primary/10 border-2 border-primary/30 shadow-md' : ''}
        ${item.type === 'folder' && !isDragging && !isOver ? 'hover:bg-muted' : ''}
        transition-all duration-200 ease-in-out
      `}
      style={{ 
        cursor: isDragging ? 'grabbing' : (item.id !== 'go-up' ? 'grab' : 'pointer'),
        transform: isDragging ? 'scale(1.02)' : 'scale(1)'
      }}
      title={
        item.type === 'folder' 
          ? `Drop items here to move them into ${item.name}` 
          : item.type === 'file'
            ? `Drag to move ${item.name}`
            : ''
      }
    >
      {children}
    </TableRow>
  );
};

export function FileManager() {
  const [currentLocation, setCurrentLocation] = useState<any[] | null>(null);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  // Improved collection cache with better key management
  const [collectionCache, setCollectionCache] = useState<Map<string, Collection>>(new Map());
  
  // Cache helper functions
  const cacheCollection = useCallback((collection: Collection) => {
    if (collection.uuid) {
      setCollectionCache(prev => new Map(prev).set(collection.uuid!, collection));
    }
  }, []);
  
  const getCachedCollection = useCallback((uuid: string): Collection | undefined => {
    return collectionCache.get(uuid);
  }, [collectionCache]);
  
  const clearCache = useCallback(() => {
    setCollectionCache(new Map());
  }, []);
  
  // Cache invalidation logic
  const invalidateCollectionCache = useCallback((uuid?: string) => {
    if (uuid) {
      // Remove specific collection from cache
      setCollectionCache(prev => {
        const newCache = new Map(prev);
        newCache.delete(uuid);
        return newCache;
      });
      console.log('Invalidated cache for collection:', uuid);
    } else {
      // Clear entire cache
      clearCache();
      console.log('Cleared entire collection cache');
    }
  }, [clearCache]);

  // Consolidated navigation state
  const [navigationState, setNavigationState] = useState({
    currentCollectionUuid: undefined as string | undefined,
    breadcrumbs: [] as Collection[],
    navigationPath: [] as string[]
  });
  
  // Destructure for easier access
  const { currentCollectionUuid, breadcrumbs, navigationPath } = navigationState;
  
  // Helper function to update navigation state
  const updateNavigationState = useCallback((updates: Partial<typeof navigationState>) => {
    setNavigationState(prev => ({ ...prev, ...updates }));
  }, []);

  // Request deduplication - prevent duplicate API calls
  const [pendingRequests, setPendingRequests] = useState<Map<string, Promise<any>>>(new Map());
  
  // Helper function to deduplicate API requests
  const deduplicatedRequest = useCallback(async (key: string, requestFn: () => Promise<any>): Promise<any> => {
    // Check if there's already a pending request with this key
    const existingRequest = pendingRequests.get(key);
    if (existingRequest) {
      console.log('Deduplicating request:', key);
      return existingRequest;
    }
    
    // Create new request
    const newRequest = requestFn();
    setPendingRequests((prev: Map<string, Promise<any>>) => new Map(prev).set(key, newRequest));
    
    try {
      const result = await newRequest;
      return result;
    } finally {
      // Remove the request from pending requests
      setPendingRequests((prev: Map<string, Promise<any>>) => {
        const newMap = new Map(prev);
        newMap.delete(key);
        return newMap;
      });
    }
  }, [pendingRequests]);
  
  // Cancel all pending requests (useful when navigating)
  const cancelPendingRequests = useCallback(() => {
    setPendingRequests(new Map());
    console.log('Cancelled all pending requests');
  }, []);
  
  // Debounced search hook
  const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    
    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      
      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);
    
    return debouncedValue;
  };
  
  // TanStack column filters
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([
    { id: 'type', value: 'all' }
  ]);

  // TanStack sorting state
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'created_at', desc: true }
  ]);
  
  // Debounced search state
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearchValue = useDebounce(searchValue, 500); // 500ms delay

  const statusOptions = ['ready', 'processing', 'error'];
  const typeOptions = ['all', 'folders', 'files'];
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
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<{ id: string; name: string; type: 'file' | 'folder' } | null>(null);
  const [renameName, setRenameName] = useState('');

  // Combined items for display
  const combinedItems = useMemo<FileOrFolder[]>(() => {
    if (!currentLocation) return [];

    // Handle the new API response format where currentLocation is an array of results
    const results = Array.isArray(currentLocation) ? currentLocation : [currentLocation];
    if (!results.length) return [];

    // Process each item and distinguish between files and collections
    const items: FileOrFolder[] = results.map((item: any) => {
      // Collections have: name, collection_type, uuid (no file_type, no title)
      // Files have: title, file_type, uuid (no collection_type, no name)
      if (item.collection_type !== undefined || (item.name && !item.title)) {
        return {
          id: `folder-${item.uuid}`,
          name: item.name || 'Untitled Folder',
          type: 'folder' as const,
          file: undefined,
          folder: {
            uuid: item.uuid,
            id: undefined,
            name: item.name || 'Untitled Folder',
            description: item.description,
            collection_type: item.collection_type || 'folder',
            jurisdiction: undefined,
            regulation_number: undefined,
            effective_date: undefined,
            sort_order: 0,
            children: [],
            files: [],
            full_path: '',
            created_at: item.created_at,
          } as Collection,
          created_at: item.created_at,
          updated_at: item.updated_at || item.created_at,
          file_size: undefined,
          file_type: undefined,
          collection: undefined,
          status: undefined,
        };
      } else {
        // It's a file (has title, file_type)
        return {
          id: `file-${item.uuid}`,
          name: item.title || 'Untitled File',
          type: 'file' as const,
          file: {
            uuid: item.uuid,
            title: item.title,
            file_type: item.file_type,
            collection: undefined,
            status: 'ready', // Default status
          } as FileWithUI,
          folder: undefined,
          created_at: item.created_at,
          updated_at: item.updated_at,
          file_size: item.file_size || item.filesize || 0,
          file_type: item.file_type,
          collection: undefined,
          status: 'ready',
        };
      }
    });

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

    // Sort items by name (folders first, then files)
    const sortedItems = items.sort((a, b) => {
      // Sort folders first, then files
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    // Add go up item at the beginning if it exists
    return goUpItem ? [goUpItem, ...sortedItems] : sortedItems;
  }, [currentLocation, currentCollectionUuid]);

  // Extract current filter values from columnFilters
  const currentFilters = useMemo(() => {
    const statusFilters = columnFilters.find(f => f.id === 'status')?.value as string[] | undefined;
    const collectionFilters = columnFilters.find(f => f.id === 'collection')?.value as string[] | undefined;
    const typeFilter = columnFilters.find(f => f.id === 'type')?.value as string | undefined;

    // Convert type filter value to API format
    let typeValue: string | undefined;
    if (typeFilter) {
      switch (typeFilter) {
        case 'folders':
          typeValue = 'folder';
          break;
        case 'files':
          typeValue = 'file';
          break;
        case 'all':
        default:
          typeValue = undefined; // "all" means no type filter
          break;
      }
    }

    return {
      status: statusFilters && statusFilters.length > 0 ? statusFilters.join(',') : undefined,
      collection: collectionFilters && collectionFilters.length > 0 ? collectionFilters.join(',') : undefined,
      type: typeValue,
    };
  }, [columnFilters]);

  useEffect(() => {
    fetchData();
  }, [currentCollectionUuid, currentPage, itemsPerPage, debouncedSearchValue, currentFilters, sorting]);

  // Rebuild breadcrumbs when navigation path changes
  useEffect(() => {
    console.log('useEffect triggered:', { navigationPathLength: navigationPath.length, currentCollectionUuid });

    // Don't run breadcrumb logic if we're at root level
    if (!currentCollectionUuid) {
      if (breadcrumbs.length > 0) {
        console.log('At root level, clearing breadcrumbs');
        updateNavigationState({ breadcrumbs: [] });
      }
      return;
    }

    if (navigationPath.length > 0 && currentCollectionUuid) {
      console.log('Calling rebuildBreadcrumbsFromPath');
      rebuildBreadcrumbsFromPath();
    } else if (navigationPath.length === 0 && breadcrumbs.length > 0) {
      // Only clear breadcrumbs if they're not already empty
      console.log('Clearing breadcrumbs in useEffect');
      updateNavigationState({ breadcrumbs: [] });
    }
  }, [navigationPath, currentCollectionUuid, breadcrumbs.length]);



  const fetchData = async () => {
    console.log('fetchData called with:', {
      currentCollectionUuid,
      currentPage,
      itemsPerPage,
      debouncedSearchValue,
      searchValue,
      navigationPath: navigationPath.length,
      columnFilters
    });

    // Add stack trace to see where fetchData is being called from
    console.trace('fetchData call stack');
    setIsLoading(true);
    try {
      // Use debounced search value to prevent rapid API calls
      const searchFilter = debouncedSearchValue;

      console.log('Current filters:', currentFilters);

      // Use the file manager endpoint with deduplication
      const requestKey = `fetchData-${JSON.stringify({
        currentCollectionUuid,
        currentPage,
        itemsPerPage,
        searchFilter,
        ...currentFilters
      })}`;
      const response = await deduplicatedRequest(requestKey, () =>
        getFiles({
          file_manager: true,
          page: currentPage,
          page_size: itemsPerPage,
          collection_uuid: currentCollectionUuid || undefined,
          search: searchFilter,
          // Apply filters from currentFilters
          status: currentFilters.status,
          type: currentFilters.type,
          collection: currentFilters.collection,
          // Apply sorting from table state
          sort: sorting.length > 0 ? sorting[0].id : 'created_at',
          sort_order: sorting.length > 0 && sorting[0].desc ? 'desc' : 'asc'
        })
      );
      
      if (response && typeof response === 'object' && 'results' in response) {
        // File manager response with pagination and collection details
        const data = response as {
          count: number;
          next: string | null;
          previous: string | null;
          current_collection?: {
            uuid: string;
            name: string;
            description: string;
            collection_type: string;
            created_at: string;
          };
          breadcrumb_path?: Array<{
            uuid: string;
            name: string;
          }>;
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

        console.log('Received data:', { count: data.count, resultsCount: data.results.length });

        setCurrentLocation(data.results);
        setItemsCount(data.count || 0);
        setHasNextPage(!!data.next);
        
        // Populate cache with collections for future breadcrumb use
        if (data.results && data.results.length > 0) {
          const collections = data.results.filter((item: any) => item.type === 'collection');
          collections.forEach((col: any) => {
            if (col.uuid) {
              const collectionObj = {
                uuid: col.uuid,
                name: col.name,
                description: col.description,
                collection_type: col.collection_type,
                sort_order: col.sort_order || 0,
                children: col.children || [],
                files: col.files || [],
                full_path: col.full_path || '',
                created_at: col.created_at,
              } as Collection;
              
              // Cache by UUID for easy lookup
              cacheCollection(collectionObj);
            }
          });
          console.log('Populated collection cache with', collections.length, 'collections');
        }
        
        // Cache the current collection details from the response
        if (data.current_collection) {
          const currentCollection = {
            uuid: data.current_collection.uuid,
            name: data.current_collection.name,
            description: data.current_collection.description,
            collection_type: data.current_collection.collection_type,
            sort_order: 0,
            children: [],
            files: [],
            full_path: '',
            created_at: data.current_collection.created_at,
          } as Collection;
          
          cacheCollection(currentCollection);
          console.log('Cached current collection:', currentCollection.name);
        }
        
        // Cache breadcrumb path collections
        if (data.breadcrumb_path && data.breadcrumb_path.length > 0) {
          data.breadcrumb_path.forEach((breadcrumbItem, index) => {
            const breadcrumbCollection = {
              uuid: breadcrumbItem.uuid,
              name: breadcrumbItem.name,
              description: '',
              collection_type: 'folder' as any,
              sort_order: index,
              children: [],
              files: [],
              full_path: '',
              created_at: '',
            } as Collection;
            
            cacheCollection(breadcrumbCollection);
          });
          console.log('Cached breadcrumb path with', data.breadcrumb_path.length, 'collections');
        }
        
        // Handle breadcrumbs based on current location
        if (currentCollectionUuid) {
          console.log('Inside collection, breadcrumbs will be built from navigation path');
          
          // If we have breadcrumb path from the backend, use it directly
          if (data.breadcrumb_path && data.breadcrumb_path.length > 0) {
            console.log('Using breadcrumb path from backend response');
            // Convert breadcrumb path to Collection objects for breadcrumb display
            const breadcrumbCollections = data.breadcrumb_path.map((item, index) => ({
              uuid: item.uuid,
              name: item.name,
              description: '',
              collection_type: 'folder' as any,
              sort_order: index,
              children: [],
              files: [],
              full_path: '',
              created_at: '',
            } as Collection));
            
            updateBreadcrumbs(breadcrumbCollections);
          } else {
            // Fallback to rebuilding breadcrumbs from navigation path
            console.log('No breadcrumb path from backend, rebuilding from navigation path');
          }
        } else {
          // At root level, clear breadcrumbs and navigation path
          console.log('At root level, clearing breadcrumbs and navigation path');
          updateNavigationState({ 
            breadcrumbs: [],
            navigationPath: []
          });
        }
      } else {
        // Fallback to empty state
        setCurrentLocation([]);
        setItemsCount(0);
        setHasNextPage(false);
        updateNavigationState({ breadcrumbs: [] });
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
    if (Array.isArray(collection)) {
      console.log('updateBreadcrumbs called with array:', collection.map(c => ({ name: c.name, uuid: c.uuid })));
      
      // Don't update breadcrumbs if we're at root level
      if (!currentCollectionUuid && navigationPath.length === 0) {
        console.log('Skipping breadcrumb update due to root level');
        return;
      }
      
      updateNavigationState({ breadcrumbs: collection });
    } else {
      console.log('updateBreadcrumbs called with single:', { name: collection.name, uuid: collection.uuid });
      
      // Don't update breadcrumbs if we're at root level
      if (!currentCollectionUuid && navigationPath.length === 0) {
        console.log('Skipping breadcrumb update due to root level');
        return;
      }
      
      updateNavigationState({ breadcrumbs: [collection] });
    }
  };





  // Simplified breadcrumb building using navigation path instead of API calls
  const buildBreadcrumbTrail = async (collection: Collection): Promise<Collection[]> => {
    console.log('Building breadcrumb trail for collection:', collection.name);
    
    // If we have a navigation path, use it to build breadcrumbs
    if (navigationPath.length > 0) {
      console.log('Using navigation path to build breadcrumbs:', navigationPath);
      
      // Build breadcrumbs from the navigation path
      const breadcrumbTrail: Collection[] = [];
      
      // Add each collection from the navigation path
      for (let i = 0; i < navigationPath.length; i++) {
        const uuid = navigationPath[i];
        
        // Check cache first
        const cachedCollection = getCachedCollection(uuid);
        if (cachedCollection) {
          console.log('Found collection in cache:', cachedCollection.name);
          breadcrumbTrail.push(cachedCollection);
        } else {
          // If not in cache, create a minimal collection object
          // We'll populate it with more details when needed
          breadcrumbTrail.push({
            uuid: uuid,
            name: `Collection ${i + 1}`, // Will be updated with real name
            description: '',
            collection_type: 'folder' as any,
            sort_order: 0,
            children: [],
            files: [],
            full_path: '',
            created_at: '',
          } as Collection);
        }
      }
      
      // Add the current collection at the end
      breadcrumbTrail.push(collection);
      
      console.log('Built breadcrumb trail from navigation path:', breadcrumbTrail.map(c => c.name));
      return breadcrumbTrail;
    }
    
    // Fallback: if no navigation path, just return the current collection
    console.log('No navigation path, returning single collection');
    return [collection];
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
      // Invalidate cache for deleted collection
      invalidateCollectionCache(collectionUuid);
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
      const filesToDelete = selectedItems.filter(id => !id.startsWith('folder-')).map(id => id.replace('file-', ''));
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

  const handleGoogleDriveClick = () => {
    // TODO: Implement Google Drive integration
    toast.info('Google Drive integration coming soon!');
  };

  const handleStartRename = (item: FileOrFolder) => {
    if (item.id === 'go-up') return;
    setRenameTarget({ id: item.id, name: item.name, type: item.type });
    setRenameName(item.name);
    setIsRenameDialogOpen(true);
  };

  const handleCancelRename = () => {
    setIsRenameDialogOpen(false);
    setRenameTarget(null);
    setRenameName('');
  };

  const handleConfirmRename = async () => {
    if (!renameTarget || !renameName.trim()) return;
    try {
      if (renameTarget.type === 'file') {
        const fileUuid = renameTarget.id.replace('file-', '');
        await patchFile(fileUuid, { title: renameName.trim() });
        toast.success('File renamed successfully');
      } else if (renameTarget.type === 'folder') {
        const folderUuid = renameTarget.id.replace('folder-', '');
        await updateCollection(folderUuid, { name: renameName.trim() });
        toast.success('Folder renamed successfully');
      }
      setIsRenameDialogOpen(false);
      setRenameTarget(null);
      setRenameName('');
      fetchData();
    } catch (error) {
      console.error('Failed to rename item:', error);
      toast.error('Failed to rename item');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleConfirmRename();
    else if (e.key === 'Escape') handleCancelRename();
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
        header: 'Name',
        enableSorting: true,
      },
      // File Size column
      {
        id: "file_size",
        header: "File Size",
        accessorFn: (row) => row.file_size || 0,
        enableSorting: true,
        sortingFn: 'basic',
      },
      // Type column
      {
        id: "type",
        header: 'Type',
        accessorFn: (row) => row.type === 'folder' ? (row.folder?.collection_type || 'Folder') : (row.file_type || 'Unknown'),
        enableSorting: true,
      },
      // Upload Date column
      {
        id: "created_at",
        header: "Created Date",
        accessorFn: (row) => row.created_at,
        enableSorting: true,
        sortingFn: 'datetime',
      },
      // Status column
      {
        accessorKey: 'status',
        header: 'Status',
        filterFn: multiSelectFilter,
        enableSorting: true,
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
    state: {
      columnFilters,
      sorting
    },
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });


  const formatFileSize = useCallback((bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  }, []);

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }, []);

  const getItemIcon = useCallback((item: FileOrFolder) => {
    if (item.type === 'folder') {
      return <Folder className="h-5 w-5 text-blue-500" />;
    }
    
    // Return different icons based on file type
    const fileType = item.file_type?.toLowerCase();
    if (fileType?.includes('pdf')) {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else if (fileType?.includes('image') || ['jpg', 'jpeg', 'png', 'gif'].includes(fileType || '')) {
      return <FileText className="h-5 w-5 text-green-500" />;
    } else if (fileType?.includes('doc') || fileType?.includes('docx')) {
      return <FileText className="h-5 w-5 text-blue-500" />;
    } else {
      return <FileText className="h-5 w-5 text-gray-500" />;
    }
  }, []);

  const getStatusBadge = useCallback((status: FileOrFolder['status']) => {
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
  }, []);

  // Function to navigate to a specific collection
  const navigateToCollection = useCallback(async (collectionUuid: string, breadcrumbIndex?: number) => {
    try {
      console.log('navigateToCollection called with:', { collectionUuid, breadcrumbIndex, currentNavigationPath: navigationPath });
      
      // Cancel any pending requests when navigating
      cancelPendingRequests();
      
      updateNavigationState({ currentCollectionUuid: collectionUuid });
      setCurrentPage(1); // Reset to first page when navigating
      
      // Note: fetchData will be called automatically by useEffect when currentCollectionUuid changes
      // This prevents duplicate API calls
      
      // The collection details will be cached when fetchData runs and populates the cache
      // No need to make a separate API call here - backend will provide current collection details
        
        // Simple navigation stack management
        if (breadcrumbIndex !== undefined) {
          // If navigating via breadcrumb, truncate the path to that level
          const newPath = navigationPath.slice(0, breadcrumbIndex + 1);
          console.log('Truncating navigation path from', navigationPath, 'to', newPath);
          updateNavigationState({ navigationPath: newPath });
        } else {
          // If navigating into a new collection, add to the path
          if (!navigationPath.includes(collectionUuid)) {
            const newPath = [...navigationPath, collectionUuid];
            console.log('Adding to navigation path:', newPath);
            updateNavigationState({ navigationPath: newPath });
          }
        }
        
        console.log('Navigation complete. Navigation path:', navigationPath);
      } catch (error) {
        console.error('Failed to navigate to collection:', error);
        toast.error('Failed to navigate to collection');
      }
    }, [navigationPath, cancelPendingRequests, updateNavigationState]);

  // Function to navigate back to root
  const navigateToRoot = useCallback(() => {
    console.log('navigateToRoot called. Resetting navigation path from:', navigationPath);
    console.log('Current breadcrumbs before reset:', breadcrumbs);
    
    // Clear cache when navigating to root to free up memory
    clearCache();
    
    // Cancel any pending requests when navigating to root
    cancelPendingRequests();
    
    // Clear search value to prevent debounced search from triggering additional API calls
    setSearchValue('');
    
    // Update all navigation state at once to prevent useEffect from running multiple times
    updateNavigationState({ 
      currentCollectionUuid: undefined,
      navigationPath: [],
      breadcrumbs: []
    });
    
    console.log('Navigation state reset, search cleared, fetchData will be triggered by useEffect');
    
    // Remove the manual fetchData call - let useEffect handle it
    // The useEffect will automatically trigger when currentCollectionUuid changes to undefined
  }, [navigationPath, breadcrumbs, clearCache, cancelPendingRequests, updateNavigationState]);

  // Function to rebuild breadcrumbs from navigation path
  const rebuildBreadcrumbsFromPath = async () => {
    console.log('rebuildBreadcrumbsFromPath called with:', { navigationPath, currentCollectionUuid });
    
    // Don't rebuild breadcrumbs if we're at root level
    if (navigationPath.length === 0 || !currentCollectionUuid) {
      console.log('Not rebuilding breadcrumbs - at root level');
      updateNavigationState({ breadcrumbs: [] });
      return;
    }
    
    // Additional safety check - if we're at root, don't proceed
    if (!currentCollectionUuid) {
      console.log('Safety check: currentCollectionUuid is undefined, aborting breadcrumb rebuild');
      return;
    }

    console.log('Rebuilding breadcrumbs from navigation path:', navigationPath);
    
    // Build breadcrumbs from navigation path using cached data
    const breadcrumbTrail: Collection[] = [];
    
    for (let i = 0; i < navigationPath.length; i++) {
      const uuid = navigationPath[i];
      
      // Check cache first
      let collection: Collection | undefined = getCachedCollection(uuid);
      if (!collection) {
        // If not in cache, create a minimal collection object
        // The file manager API will populate the cache with real data when available
        collection = {
          uuid: uuid,
          name: `Collection ${i + 1}`,
          description: '',
          collection_type: 'folder' as any,
          sort_order: 0,
          children: [],
          files: [],
          full_path: '',
          created_at: '',
        } as Collection;
        
        // Cache the minimal collection to avoid recreating it
        cacheCollection(collection);
      }
      
      // At this point, collection is guaranteed to be defined
      breadcrumbTrail.push(collection);
    }
    
    console.log('Rebuilt breadcrumb trail:', breadcrumbTrail.map(c => c.name));
    updateBreadcrumbs(breadcrumbTrail);
  };

  // Memoized event handlers for table interactions
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedItems(table.getRowModel().rows.map((row) => row.original.id));
    } else {
      setSelectedItems([]);
    }
  }, [table]);

  const handleSelectItem = useCallback((itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, itemId]);
    } else {
      setSelectedItems(prev => prev.filter((id) => id !== itemId));
    }
  }, []);

  const handleItemClick = useCallback((item: FileOrFolder) => {
    if (item.id === 'go-up') {
      // Go up to parent directory
      navigateToRoot();
    } else if (item.type === 'folder' && item.folder?.uuid) {
      // Navigate into folder
      navigateToCollection(item.folder.uuid);
    } else if (item.type === 'file' && item.file) {
      // Preview file
      setPreviewFile(item.file);
    }
  }, [navigateToRoot, navigateToCollection]);

  // Move item function for drag and drop
  const handleMoveItem = useCallback(async (draggedItem: FileOrFolder, targetFolder: FileOrFolder | null) => {
    try {
      if (draggedItem.type === 'file' && draggedItem.file) {
        // Move file to new collection
        const targetCollectionUuid = targetFolder?.folder?.uuid || null;

        await moveFilesToCollection([draggedItem.file.uuid], targetCollectionUuid);

        toast.success(`File "${draggedItem.name}" moved successfully`);
        fetchData(); // Refresh the list
      } else if (draggedItem.type === 'folder' && draggedItem.folder && draggedItem.folder.uuid) {
        // Move collection to new parent
        const targetParentUuid = targetFolder?.folder?.uuid || null;

        await moveCollection(draggedItem.folder.uuid, targetParentUuid);

        toast.success(`Folder "${draggedItem.name}" moved successfully`);
        fetchData(); // Refresh the list
      }
    } catch (error) {
      console.error('Move failed:', error);
      toast.error(`Failed to move "${draggedItem.name}"`);
    }
  }, [fetchData]);

  return (
    <DndProvider backend={HTML5Backend}>
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
                <DropdownMenuItem onClick={() => handleGoogleDriveClick()}>
                  <Cloud className="h-4 w-4 mr-2" />
                  Google Drive
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
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                // Trigger immediate search on Enter key
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
                {typeOptions.map((type) => {
                  const currentType = table.getColumn('type')?.getFilterValue() as string | undefined;
                  const checked = currentType === type;
                  return (
                    <DropdownMenuCheckboxItem
                      key={type}
                      checked={checked}
                      onCheckedChange={(chk) => {
                        const col = table.getColumn('type');
                        // For single selection: set the value if checked, clear if unchecked
                        col?.setFilterValue(chk ? type : undefined);
                      }}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </DropdownMenuCheckboxItem>
                  );
                })}
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
                  setColumnFilters([]);
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
          className={`${!currentCollectionUuid ? 'text-foreground font-semibold' : 'text-primary hover:text-primary/80 cursor-pointer font-medium'}`}
          onClick={!currentCollectionUuid ? undefined : navigateToRoot}
        >
          Root
        </span>
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.uuid || index}>
            <span className="text-muted-foreground">/</span>
            <span 
              className={`text-primary hover:text-primary/80 cursor-pointer font-medium ${
                index === breadcrumbs.length - 1 ? 'font-semibold' : ''
              }`}
              onClick={async () => {
                // Navigate to the clicked breadcrumb
                if (crumb.uuid && !crumb.uuid.startsWith('placeholder-')) {
                  console.log('Navigating to breadcrumb:', crumb.name, 'with UUID:', crumb.uuid, 'at index:', index);
                  console.log('Current navigation path:', navigationPath);
                  console.log('Current breadcrumbs:', breadcrumbs.map(c => ({ name: c.name, uuid: c.uuid })));
                  await navigateToCollection(crumb.uuid, index);
                } else {
                  // This is a placeholder, we can't navigate to it
                  console.warn('Cannot navigate to placeholder breadcrumb:', crumb);
                  return;
                }
              }}
            >
              {crumb.name}
            </span>
          </React.Fragment>
        ))}
        {/* Debug info - remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="ml-4 text-xs text-gray-500">
            <div>Nav Path: [{navigationPath.join(' → ')}]</div>
            <div>Breadcrumbs: [{breadcrumbs.map(c => c.uuid || 'placeholder').join(' → ')}]</div>
            <div>Current Collection UUID: {currentCollectionUuid || 'undefined'}</div>
          </div>
        )}
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

      <RootDropZone onMoveItem={handleMoveItem}>
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
                        {header.column.columnDef.header as string}
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
                    {header.id === 'select' && (
                      <Checkbox
                        checked={
                          selectedItems.length === table.getRowModel().rows.length &&
                          table.getRowModel().rows.length > 0
                        }
                        onCheckedChange={(checked) => handleSelectAll(checked === true)}
                      />
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={table.getVisibleFlatColumns().length} className="text-center py-8">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={table.getVisibleFlatColumns().length}
                  className="text-center py-8 text-muted-foreground"
                >
                  {(table.getColumn('name')?.getFilterValue() as string)
                    ? 'No files or folders match your search'
                    : 'No files or folders found'}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <DraggableTableRow
                  key={row.original.id}
                  item={row.original}
                  onMoveItem={handleMoveItem}
                  selectedItems={selectedItems}
                  handleSelectItem={handleSelectItem}
                  handleItemClick={handleItemClick}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedItems.includes(row.original.id)}
                      onCheckedChange={(checked) => handleSelectItem(row.original.id, checked === true)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {getItemIcon(row.original)}
                      {(
                        <span
                          className={`font-medium ml-2 ${
                            row.original.id === 'go-up'
                              ? 'text-muted-foreground hover:text-foreground cursor-pointer italic'
                              : row.original.type === 'folder'
                                ? 'text-primary hover:text-primary/80 cursor-pointer'
                                : row.original.type === 'file'
                                  ? 'text-foreground hover:text-primary cursor-pointer'
                                  : ''
                          }`}
                          onClick={() => handleItemClick(row.original)}
                        >
                          {row.original.name}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {row.original.file_size ? formatFileSize(row.original.file_size) : '--'}
                  </TableCell>
                  <TableCell className="text-xs uppercase text-muted-foreground">
                    {row.original.type === 'folder' ? (row.original.folder?.collection_type || 'Folder') : (row.original.file_type || 'Unknown')}
                  </TableCell>
                  <TableCell>{formatDate(row.original.created_at)}</TableCell>
                  <TableCell>{getStatusBadge(row.original.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      {row.original.type === 'file' && row.original.file && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={() => handleOpenLinkModal(row.original.file!.uuid)}
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
                                onClick={() => handleStartRename(row.original)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handlePreviewFile(row.original.file!)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Preview
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <a
                                  href={row.original.file!.file}
                                  download={row.original.file!.title}
                                  className="flex items-center"
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </a>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleOpenLinkModal(row.original.file!.uuid)}
                              >
                                <Link className="h-4 w-4 mr-2" />
                                Link to KB
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteFile(row.original.file!.uuid)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </>
                      )}
                      {row.original.type === 'folder' && row.original.folder && row.original.id !== 'go-up' && (
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
                              onClick={() => handleStartRename(row.original)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                if (row.original.id === 'go-up') {
                                  // Go up to parent directory
                                  navigateToRoot();
                                } else if (row.original.folder?.uuid) {
                                  // Navigate into folder
                                  navigateToCollection(row.original.folder.uuid);
                                }
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Open Folder
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingCollection(row.original.folder!);
                                setIsEditCollectionOpen(true);
                              }}
                            >
                              <Folder className="h-4 w-4 mr-2" />
                              Manage
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleOpenLinkModal(row.original.folder!.uuid)}
                            >
                              <Link className="h-4 w-4 mr-2" />
                              Link to KB
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                if (row.original.folder?.uuid) {
                                  handleDeleteFolder(row.original.folder.uuid);
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
                </DraggableTableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>
      </RootDropZone>

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
            currentCollectionUuid={currentCollectionUuid}
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
          fileToLink === null 
            ? selectedItems.map(id => {
                if (id.startsWith('file-')) return id.replace('file-', '');
                if (id.startsWith('folder-')) return id.replace('folder-', '');
                return id;
              })
            : fileToLink ? [fileToLink] : []
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
      {/* Rename Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={(v) => (v ? setIsRenameDialogOpen(true) : handleCancelRename())}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename {renameTarget?.type === 'folder' ? 'Folder' : 'File'}</DialogTitle>
            <DialogDescription>
              Enter a new name for the selected {renameTarget?.type === 'folder' ? 'folder' : 'file'}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={renameName}
              onChange={(e) => setRenameName(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              placeholder={renameTarget?.name || ''}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancelRename}>Cancel</Button>
              <Button onClick={handleConfirmRename} disabled={!renameName.trim()}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </DndProvider>
  );
}
