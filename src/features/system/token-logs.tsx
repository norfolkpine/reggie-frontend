"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// TanStack Table
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  type ColumnDef,
  type ColumnFiltersState,
} from "@tanstack/react-table";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

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

type TokenUsageRow = {
  id: string | number;
  user_email: string;
  team_name?: string | null;
  model_provider?: string | null;
  model_name?: string | null;
  input_tokens?: number | null;
  output_tokens?: number | null;
  total_tokens: number;
  created_at: string;
};

interface TokenLogsApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: TokenUsageRow[];
}

export function TokenLogs() {
  const { toast } = useToast();
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearchValue = useDebounce(searchValue, 500);
  const [tokenData, setTokenData] = useState<TokenUsageRow[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [ordering, setOrdering] = useState<string>("-created_at");
  const [isLoading, setIsLoading] = useState(true);

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  const columns = useMemo<ColumnDef<TokenUsageRow>[]>(
    () => [
      {
        accessorKey: "created_at",
        header: "Date",
        cell: ({ row }) => formatDate(row.original.created_at)
      },
      {
        accessorKey: "user_email",
        header: "User"
      },
      {
        accessorKey: "team_name",
        header: "Team",
        cell: ({ row }) => row.original.team_name || '—'
      },
      {
        accessorKey: "model_provider",
        header: "Provider",
        cell: ({ row }) => row.original.model_provider || '—'
      },
      {
        accessorKey: "model_name",
        header: "Model",
        cell: ({ row }) => row.original.model_name || '—'
      },
      {
        accessorKey: "input_tokens",
        header: "Prompt",
        cell: ({ row }) => (row.original.input_tokens || 0).toLocaleString()
      },
      {
        accessorKey: "output_tokens",
        header: "Completion",
        cell: ({ row }) => (row.original.output_tokens || 0).toLocaleString()
      },
      {
        accessorKey: "total_tokens",
        header: "Total",
        cell: ({ row }) => row.original.total_tokens.toLocaleString()
      },
    ],
    [formatDate]
  );

  useEffect(() => {
    fetchData();
  }, [currentPage, itemsPerPage, debouncedSearchValue, ordering]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = {
        page: String(currentPage),
        page_size: String(itemsPerPage),
      };

      if (ordering) params.ordering = ordering;
      if (debouncedSearchValue) params.search = debouncedSearchValue;

      const query = new URLSearchParams(params).toString();
      const response = await api.get(`/opie/api/v1/usage/tokens/?${query}`) as TokenLogsApiResponse;

      if (response && response.results) {
        setTokenData(response.results);
        setTotalItems(response.count || 0);
        setHasNextPage(!!response.next);
      } else {
        setTokenData([]);
        setTotalItems(0);
        setHasNextPage(false);
      }
    } catch (error) {
      console.error('Failed to fetch token logs:', error);
      toast({
        title: "Error",
        description: "Failed to load token usage logs",
        variant: "destructive"
      });
      setTokenData([]);
      setTotalItems(0);
      setHasNextPage(false);
    } finally {
      setIsLoading(false);
    }
  };

  const onSort = useCallback((field: string) => {
    setCurrentPage(1);
    setOrdering((prev) => {
      if (prev === field) return `-${field}`;
      if (prev === `-${field}`) return field;
      return `-${field}`;
    });
  }, []);

  const SortButton = useCallback(({ field, label }: { field: string; label: string }) => {
    const isAsc = ordering === field;
    const isDesc = ordering === `-${field}`;
    return (
      <Button variant="ghost" size="sm" className="-ml-2 px-2" onClick={() => onSort(field)} title={`Sort by ${label}`}>
        <span className="mr-1">{label}</span>
        {isAsc ? <ChevronUp className="h-4 w-4" /> : isDesc ? <ChevronDown className="h-4 w-4" /> : null}
      </Button>
    );
  }, [ordering, onSort]);

  const table = useReactTable<TokenUsageRow>({
    data: tokenData,
    columns,
    state: { columnFilters },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const filteredData = table.getRowModel().rows.map((r) => r.original);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Token Usage Logs</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchData}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 w-full max-w-md">
        <Input
          type="text"
          placeholder="Search users or teams..."
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value);
            table.getColumn('user_email')?.setFilterValue(e.target.value);
          }}
        />
      </div>

      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Prompt</TableHead>
              <TableHead>Completion</TableHead>
              <TableHead>Total Used</TableHead>
              <TableHead>Date</TableHead>
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
            ) : filteredData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-8 text-muted-foreground"
                >
                  {(table.getColumn('user_email')?.getFilterValue() as string)
                    ? "No token usage logs match your search"
                    : "No token usage logs found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((row) => {
                const prompt = row.input_tokens ?? 0;
                const completion = row.output_tokens ?? 0;
                const total = row.total_tokens ?? prompt + completion;

                return (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.user_email}</TableCell>
                    <TableCell>{row.team_name || '—'}</TableCell>
                    <TableCell>{row.model_provider || '—'}</TableCell>
                    <TableCell>{row.model_name || '—'}</TableCell>
                    <TableCell className="text-center tabular-nums">
                      {prompt.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center tabular-nums">
                      {completion.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center tabular-nums font-medium">
                      {total.toLocaleString()}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(row.created_at)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalItems > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Total {totalItems.toLocaleString()} logs
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
              </PaginationItem>

              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
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
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    </PaginationItem>
                  );
                }
                return null;
              })}

              {totalPages > 5 && currentPage < totalPages - 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              <PaginationItem>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage >= totalPages || !hasNextPage}
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
    </div>
  );
}