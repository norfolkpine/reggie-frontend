"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getUserTokenSummary } from "@/api/token";
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

type UserTokenUsageRow = {
  id: string | number;
  user_email: string;
  team_name?: string | null;
  quota_tokens?: number | null;
  rollover_tokens?: number | null;
  total_tokens: number;
  created_at: string;
  updated_at: string;
};

interface TokenSummaryApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: UserTokenUsageRow[];
}

export function UserTokenSummary() {
  const { toast } = useToast();
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearchValue = useDebounce(searchValue, 500);
  const [isLoading, setIsLoading] = useState(true);
  const [tokenData, setTokenData] = useState<UserTokenUsageRow[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

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

  const calculateRemainingTokens = useCallback((row: UserTokenUsageRow) => {
    const quota = row.quota_tokens || 0;
    const rollover = row.rollover_tokens || 0;
    const totalUsed = row.total_tokens || 0;
    return quota + rollover - totalUsed;
  }, []);

  const columns = useMemo<ColumnDef<UserTokenUsageRow>[]>(
    () => [
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
        accessorKey: "quota_tokens",
        header: "Quota",
        cell: ({ row }) => row.original.quota_tokens?.toLocaleString() || '—'
      },
      {
        accessorKey: "rollover_tokens",
        header: "Rollover",
        cell: ({ row }) => row.original.rollover_tokens?.toLocaleString() || '—'
      },
      {
        accessorKey: "total_tokens",
        header: "Total Used",
        cell: ({ row }) => row.original.total_tokens.toLocaleString()
      },
      {
        id: "remain_tokens",
        header: "Remaining",
        cell: ({ row }) => {
          const remaining = calculateRemainingTokens(row.original);
          return remaining.toLocaleString();
        }
      },
      {
        accessorKey: "updated_at",
        header: "Last Updated",
        cell: ({ row }) => formatDate(row.original.updated_at)
      },
    ],
    [formatDate, calculateRemainingTokens]
  );

  useEffect(() => {
    fetchData();
  }, [currentPage, itemsPerPage, debouncedSearchValue]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await getUserTokenSummary(
        currentPage,
        itemsPerPage,
        debouncedSearchValue
      ) as TokenSummaryApiResponse;

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
      console.error('Failed to fetch token summary:', error);
      toast({
        title: "Error",
        description: "Failed to load token usage data",
        variant: "destructive"
      });
      setTokenData([]);
      setTotalItems(0);
      setHasNextPage(false);
    } finally {
      setIsLoading(false);
    }
  };

  const table = useReactTable<UserTokenUsageRow>({
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
        <h2 className="text-2xl font-bold">User Token Usage Summary</h2>
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
        <div className="relative">
          <Input
            type="text"
            placeholder="Search users or teams..."
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              table.getColumn('user_email')?.setFilterValue(e.target.value);
            }}
            className="pl-10"
          />
        </div>
      </div>

      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Quota</TableHead>
              <TableHead>Rollover</TableHead>
              <TableHead>Total Used</TableHead>
              <TableHead>Remaining</TableHead>
              <TableHead>Last Updated</TableHead>
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
                    ? "No users match your search"
                    : "No token usage data found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.user_email}</TableCell>
                  <TableCell>{row.team_name || '—'}</TableCell>
                  <TableCell className="text-center">
                    {row.quota_tokens?.toLocaleString() || '—'}
                  </TableCell>
                  <TableCell className="text-center">
                    {row.rollover_tokens?.toLocaleString() || '—'}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-semibold">
                      {row.total_tokens.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`font-semibold ${
                        calculateRemainingTokens(row) < 1000
                          ? 'text-red-600'
                          : calculateRemainingTokens(row) < 5000
                          ? 'text-yellow-600'
                          : 'text-green-600'
                      }`}
                    >
                      {calculateRemainingTokens(row).toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(row.updated_at)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalItems > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Total {totalItems} users
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