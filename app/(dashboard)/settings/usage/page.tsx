"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { getTokenUsagebyUser } from "@/api/token";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  type ColumnDef,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { DateRangePicker } from "@openfun/cunningham-react";

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

export default function UserTokenUsage() {
  const { toast } = useToast();
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearchValue = useDebounce(searchValue, 500);
  const [tokenData, setTokenData] = useState<TokenUsageRow[]>([]);
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
        accessorKey: "total_tokens",
        header: "Total",
        cell: ({ row }) => row.original.total_tokens.toLocaleString()
      },
    ],
    [formatDate]
  );

  useEffect(() => {
    fetchData();
  }, [debouncedSearchValue, ordering]);

  const fetchData = async () => {
    setIsLoading(true);
    try {

      const response = await getTokenUsagebyUser() as TokenLogsApiResponse

      if (response && response.results) {
        setTokenData(response.results);
      } else {
        setTokenData([]);
      }
    } catch (error) {
      console.error('Failed to fetch token logs:', error);
      toast({
        title: "Error",
        description: "Failed to load token usage logs",
        variant: "destructive"
      });
      setTokenData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const table = useReactTable<TokenUsageRow>({
    data: tokenData,
    columns,
    state: { columnFilters },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const filteredData = table.getRowModel().rows.map((r) => r.original);

  return (
    <div className="space-y-4 w-full">
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

      <div className="flex items-center gap-2 w-full max-w-md">
				<></>
      </div>

      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Total Used</TableHead>
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
                    <TableCell className="whitespace-nowrap">
                      {formatDate(row.created_at)}
                    </TableCell>
                    <TableCell>{row.model_provider || '—'}</TableCell>
                    <TableCell>{row.model_name || '—'}</TableCell>
                    <TableCell className="text-center tabular-nums font-medium">
                      {total.toLocaleString()}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}