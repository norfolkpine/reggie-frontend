"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { api } from "@/lib/api-client";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type TokenUsageRow = {
  id: string | number;
  user_email: string;
  team_name?: string | null;
  // operation_type?: string | null; // chat | embedding | rerank | tool
  model_provider?: string | null;
  model_name?: string | null;
  input_tokens?: number | null;
  output_tokens?: number | null;
  total_tokens: number;
  created_at: string;
};

type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export function TokenLogs() {
  const [rows, setRows] = useState<TokenUsageRow[]>([]);
  const [itemsCount, setItemsCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [ordering, setOrdering] = useState<string>("-created_at");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);

  const totalPages = Math.max(1, Math.ceil(itemsCount / itemsPerPage));

  useEffect(() => {
    console.log("This page is shown the token usage!");
    let isMounted = true;
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, string> = {
          page: String(currentPage),
          page_size: String(itemsPerPage),
        };
        if (ordering) params.ordering = ordering;
        const query = new URLSearchParams(params).toString();
        const data = (await api.get(`/reggie/api/v1/usage/tokens/?${query}`)) as PaginatedResponse<TokenUsageRow>;
        if (!isMounted) return;
        setRows(data.results ?? []);
        setItemsCount(data.count ?? 0);
        setHasNextPage(Boolean(data.next));
      } catch (e: any) {
        if (!isMounted) return;
        if (e?.name === "AbortError") return;
        setError(e?.message ?? "Failed to load token usage");
        setRows([]);
        setItemsCount(0);
        setHasNextPage(false);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    void load();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [currentPage, itemsPerPage, ordering]);

  function onSort(field: string) {
    setCurrentPage(1);
    setOrdering((prev) => {
      if (prev === field) return `-${field}`; 
      if (prev === `-${field}`) return field; 
      return `-${field}`; 
    });
  }

  function SortButton({ field, label }: { field: string; label: string }) {
    const isAsc = ordering === field;
    const isDesc = ordering === `-${field}`;
    return (
      <Button variant="ghost" size="sm" className="-ml-2 px-2" onClick={() => onSort(field)} title={`Sort by ${label}`}>
        <span className="mr-1">{label}</span>
        {isAsc ? <ChevronUp className="h-4 w-4" /> : isDesc ? <ChevronDown className="h-4 w-4" /> : null}
      </Button>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Token Usage</h2>
          <div className="text-sm text-muted-foreground">Total {itemsCount.toLocaleString()} records</div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead><SortButton field="created_at" label="Date" /></TableHead>
            <TableHead><SortButton field="user_email" label="User" /></TableHead>
            <TableHead><SortButton field="team_name" label="Team" /></TableHead>
            {/* <TableHead><SortButton field="operation_type" label="Operation" /></TableHead> */}
            <TableHead><SortButton field="model_provider" label="Provider" /></TableHead>
            <TableHead><SortButton field="model_name" label="Model" /></TableHead>
            <TableHead className="text-right"><SortButton field="input_tokens" label="Prompt" /></TableHead>
            <TableHead className="text-right"><SortButton field="output_tokens" label="Completion" /></TableHead>
            <TableHead className="text-right"><SortButton field="total_tokens" label="Total" /></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && (
            Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={`sk-${i}`}>
                <TableCell className="py-3"><Skeleton className="h-4 w-40" /></TableCell>
                <TableCell className="py-3"><Skeleton className="h-4 w-36" /></TableCell>
                <TableCell className="py-3"><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell className="py-3"><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell className="py-3"><Skeleton className="h-4 w-28" /></TableCell>
                <TableCell className="py-3"><Skeleton className="h-4 w-28" /></TableCell>
                <TableCell className="py-3 text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                <TableCell className="py-3 text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                <TableCell className="py-3 text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
              </TableRow>
            ))
          )}
          {!loading && error && (
            <TableRow>
              <TableCell colSpan={9} className="py-6 text-center text-sm text-red-600">{error}</TableCell>
            </TableRow>
          )}
          {!loading && !error && rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="py-6 text-center text-sm text-muted-foreground">No token usage found</TableCell>
            </TableRow>
          )}
          {!loading && !error && rows.map((r) => {
            const prompt = r.input_tokens ?? 0;
            const completion = r.output_tokens ?? 0;
            const total = r.total_tokens ?? prompt + completion;
            const date = new Date(r.created_at);
            return (
              <TableRow key={r.id}>
                <TableCell className="whitespace-nowrap">{date.toLocaleString()}</TableCell>
                <TableCell className="whitespace-nowrap">{r.user_email}</TableCell>
                <TableCell className="whitespace-nowrap">{r.team_name ?? "—"}</TableCell>
                {/* <TableCell className="whitespace-nowrap capitalize">{r.operation_type ?? "—"}</TableCell> */}
                <TableCell className="whitespace-nowrap">{r.model_provider ?? "—"}</TableCell>
                <TableCell className="whitespace-nowrap">{r.model_name ?? "—"}</TableCell>
                <TableCell className="text-right tabular-nums">{prompt.toLocaleString()}</TableCell>
                <TableCell className="text-right tabular-nums">{completion.toLocaleString()}</TableCell>
                <TableCell className="text-right tabular-nums font-medium">{total.toLocaleString()}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {itemsCount >= 0 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</div>
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
              {(() => {
                const pages = Math.max(1, Math.ceil(itemsCount / itemsPerPage));
                return Array.from({ length: Math.min(pages, 5) }).map((_, i) => {
                  let pageNum = i + 1;
                  if (pages > 5 && currentPage > 3) {
                    pageNum = currentPage - 3 + i;
                    if (pageNum > pages) {
                      pageNum = pages - (4 - i);
                    }
                  }
                  if (pageNum <= pages) {
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
                });
              })()}
              {(() => {
                const pages = Math.max(1, Math.ceil(itemsCount / itemsPerPage));
                return pages > 5 && currentPage < pages - 2 ? (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : null;
              })()}
              <PaginationItem>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.max(1, Math.ceil(itemsCount / itemsPerPage))))}
                  disabled={currentPage >= Math.ceil(itemsCount / itemsPerPage) || !hasNextPage}
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
    </div>
  );
}


