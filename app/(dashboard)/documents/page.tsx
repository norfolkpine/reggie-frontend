"use client";

import { useState } from "react";
import {
  Plus,
  FileText,
  Star,
  MoreHorizontal,
  Edit,
  Link2,
  Trash,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import SearchInput from "@/components/ui/search-input";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation"

interface DocumentRow {
  title: string;
  updated: string;
  by: string;
  byColor: string;
  byInitial: string;
  starred: boolean;
}

const mockDocuments: DocumentRow[] = [
  {
    title: "Project Requirements Document",
    updated: "2 hours ago",
    by: "J",
    byColor: "bg-blue-700",
    byInitial: "J",
    starred: true,
  },
  {
    title: "Meeting Notes: Sprint Planning",
    updated: "1 day ago",
    by: "S",
    byColor: "bg-green-700",
    byInitial: "S",
    starred: false,
  },
  {
    title: "Research Findings: User Testing",
    updated: "3 days ago",
    by: "A",
    byColor: "bg-orange-600",
    byInitial: "A",
    starred: false,
  },
  {
    title: "Marketing Strategy Q3",
    updated: "1 week ago",
    by: "E",
    byColor: "bg-purple-700",
    byInitial: "E",
    starred: true,
  },
  {
    title: "Product Roadmap 2025",
    updated: "2 weeks ago",
    by: "M",
    byColor: "bg-yellow-600",
    byInitial: "M",
    starred: false,
  },
];

const columns: ColumnDef<DocumentRow>[] = [
  {
    accessorKey: "title",
    header: "Title",
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
    accessorKey: "updated",
    header: "Updated",
    cell: ({ row }) => row.original.updated,
  },
  {
    accessorKey: "by",
    header: "By",
    cell: ({ row }) => (
      <span
        className={`inline-flex items-center justify-center h-7 w-7 rounded-full text-white text-xs font-bold ${row.original.byColor}`}
      >
        {row.original.byInitial}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
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
          <DropdownMenuItem className="text-red-600">
            <Trash className="h-4 w-4 mr-2" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

export default function DocumentsPage() {
  const [search, setSearch] = useState("");
  const [docs, setDocs] = useState<DocumentRow[]>(mockDocuments);

  const filteredDocs = docs.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase())
  );

  const router = useRouter();

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between">
        <h1 className="text-xl font-medium">Documents</h1>
        <Button className="gap-2" onClick={() => router.push('/documents/new')}>
          <Plus className="h-5 w-5" />
          Create
        </Button>
      </div>

      <div className="p-4 flex flex-col gap-4">
        <SearchInput
          placeholder="Search documents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {filteredDocs.length === 0 ? (
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
          <div className="[&_tr]:h-8 [&_td]:p-2 [&_th]:py-2">
            <DataTable columns={columns} data={filteredDocs} />
          </div>
        )}
      </div>
    </div>
  );
}
