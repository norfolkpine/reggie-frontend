'use client';

import { useEffect, useState } from 'react';
import {
  Plus,
  FileText,
  Star,
  MoreHorizontal,
  Edit,
  Link2,
  Trash,
  Pencil,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import SearchInput from '@/components/ui/search-input';
import { DataTable } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ColumnDef } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import {
  createDocumentWithTitleOnly,
  getPaginatedDocuments,
  deleteDocument,
} from '@/api/documents';
import DeleteDocumentDialog from '@/components/doc/DeleteDocumentDialog';
import { useTranslation } from 'react-i18next';

interface DocumentRow {
  id: string;
  title: string;
  updated: string;
  by: string;
  byColor: string;
  byInitial: string;
  starred: boolean;
}

export default function DocumentsPage() {
  const [search, setSearch] = useState('');
  const [docs, setDocs] = useState<DocumentRow[]>([]);
  const [isPaginatedLoading, setIsPaginatedLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();
  const router = useRouter();

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    title: string;
  } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const columns: ColumnDef<DocumentRow>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-blue-500" />
          <span className="font-medium truncate max-w-[180px] sm:max-w-[240px] md:max-w-[300px] lg:max-w-[360px]">
            {row.original.title}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'updated',
      header: 'Updated',
      cell: ({ row }) => row.original.updated,
    },
    {
      accessorKey: 'by',
      header: 'By',
      cell: ({ row }) => (
        <span
          className={`inline-flex items-center justify-center h-7 w-7 rounded-full text-white text-xs font-bold ${row.original.byColor}`}
        >
          {row.original.byInitial}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => router.push(`/documents/${row.original.id}`)}
            >
              <Edit className="h-4 w-4 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Pencil className="h-4 w-4 mr-2" /> Rename
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link2 className="h-4 w-4 mr-2" /> Copy link
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Star className="h-4 w-4 mr-2" /> Star
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => handleDeleteClick(row)}
            >
              <Trash className="h-4 w-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  // Utility to fetch and map documents
  const fetchDocuments = async (page: number, pageSize: number) => {
    setIsPaginatedLoading(true);
    try {
      const result = await getPaginatedDocuments({ page, page_size: pageSize });
      setTotalCount(result.count || 0);
      const mappedDocs = result.results.map((doc: any) => ({
        id: doc.id,
        title: doc.title,
        updated: doc.updated_at
          ? new Date(doc.updated_at).toLocaleString()
          : '',
        by: '',
        byColor: 'bg-blue-700',
        byInitial: '',
        starred: !!doc.is_favorite,
      }));
      setDocs(mappedDocs);
    } finally {
      setIsPaginatedLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetchDocuments(page, pageSize).then(() => {
      if (!isMounted) return;
    });
    return () => {
      isMounted = false;
    };
  }, [page, pageSize]);

  const handleDeleteClick = (row: any) => {
    setDeleteTarget({ id: row.original.id, title: row.original.title });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteDocument(deleteTarget.id);
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      // Refresh documents
      await fetchDocuments(page, pageSize);
    } finally {
      setDeleteLoading(false);
      setIsPaginatedLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  const saveDocument = async () => {
    setIsLoading(true);
    const savedDoc = await createDocumentWithTitleOnly(t('New Document'));

    if (savedDoc) {
      router.push(`/documents/${savedDoc.id}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between">
        <h1 className="text-xl font-medium">Documents</h1>
        <Button className="gap-2" onClick={() => saveDocument()}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? (
            'Loading...'
          ) : (
            <>
              <Plus className="h-5 w-5" />
              Create
            </>
          )}
        </Button>
      </div>

      <div className="p-4 flex flex-col gap-4">
        <SearchInput
          placeholder="Search documents..."
          onChange={(e) => setSearch(e.target.value)}
        />
        {isPaginatedLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
            <span className="ml-2">Loading documents...</span>
          </div>
        ) : docs.length === 0 ? (
          <EmptyState
            title="No documents found"
            description="You have no documents yet. Create your first document to get started."
            icon={<FileText className="h-8 w-8 text-muted-foreground" />}
            action={
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Document
              </Button>
            }
          />
        ) : (
          <>
            <div className="[&_tr]:h-8 [&_td]:p-2 [&_th]:py-2">
              <DataTable
                page={page}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                totalCount={totalCount}
                searchQuery={search}
                onSearchChange={setSearch}
                columns={columns}
                data={docs}
              />
            </div>
          </>
        )}
      </div>
      {/* Delete Document Dialog */}
      <DeleteDocumentDialog
        open={deleteDialogOpen}
        title={deleteTarget?.title || ''}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        loading={deleteLoading}
      />
    </div>
  );
}
