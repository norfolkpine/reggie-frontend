"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { getTokenUsagebyUser } from "@/api/token";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  type ColumnDef,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { getTokenSummarybyUser } from "@/api/token";
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
  EyeIcon,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { ChatPreviewDialog } from "./chat-preview-dialog";

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
  agent_name?: string | null;
  chat_name?: string | null;
  model_provider?: string | null;
  model_name?: string | null;
  input_tokens?: number | null;
  output_tokens?: number | null;
  total_tokens: number;
  created_at: string;
  user_msg: string;
  assistant_msg: string;
  cost: number;
};

type UserTokenUsage = {
  id: string | number;
  user_email: string;
  team_name?: string | null;
  quota_tokens?: number | null;
  rollover_tokens?: number | null;
  total_tokens: number;
  created_at: string;
  updated_at: string;
};

interface TokenLogsApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: TokenUsageRow[];
}

export function UserTokenUsage() {
  const { toast } = useToast();
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearchValue = useDebounce(searchValue, 500);
  const [tokenData, setTokenData] = useState<TokenUsageRow[]>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [ordering, setOrdering] = useState<string>("-created_at");
  const [isLoading, setIsLoading] = useState(true);
	const [progress, setProgress] = useState(0);
	const [usedToken, setUsed] = useState(0);
	const [reaminToken, setRemain] = useState(0);
	const [totalToken, setTotal] = useState(0);
  const [tokenUsageData, setTokenUsage] = useState<UserTokenUsage>();
  const [isOpenPreview, setOpenPreview] = useState(false);
  const [userMsg, setUserMsg] = useState("");
  const [assistantMsg, setAssistantMsg] = useState("");

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
        accessorKey: "agent_name",
        header: "Model",
        cell: ({ row }) => row.original.agent_name || '—'
      },
      {
        accessorKey: "chat_name",
        header: "Model",
        cell: ({ row }) => row.original.chat_name || '—'
      },
      {
        accessorKey: "total_tokens",
        header: "Total",
        cell: ({ row }) => row.original.total_tokens.toLocaleString()
      },
      {
        accessorKey: "cost",
        header: "Total",
        cell: ({ row }) => row.original.cost.toLocaleString()
      },
      {
        accessorKey: "user_msg",
        header: "User Message",
      },
      {
        accessorKey: "assistant_msg",
        header: "Assistant Message",
      },
      {
        accessorKey: "actions",
        header: "Action",
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

      const response = await getTokenUsagebyUser() as TokenLogsApiResponse;
			const usageData = await getTokenSummarybyUser() as UserTokenUsage;

      if (response && response.results) {
        setTokenData(response.results);
      } else {
        setTokenData([]);
      }

			if (usageData) {
				setUsed(usageData.total_tokens);
				setTotal((usageData.quota_tokens || 0)+(usageData.rollover_tokens || 0));
				setRemain((usageData.quota_tokens || 0)+(usageData.rollover_tokens || 0)-usageData.total_tokens);
				setProgress((usageData.total_tokens/((usageData.quota_tokens || 0)+(usageData.rollover_tokens || 0)))* 100);
				setTokenUsage(usageData);
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

  const handlePreview = (row : TokenUsageRow) => {
    setOpenPreview(true);
    setUserMsg(row.user_msg);
    setAssistantMsg(row.assistant_msg);
  }

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center gap-2 w-full max-w-md">
				<></>
      </div>
			<div className="grid gap-2 md:grid-cols-1">
				<Card>
					<CardHeader>
						<CardTitle>Monthly Token Usage</CardTitle>
						<CardDescription>Token usage and remianing...</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<span className="text-lg fond-semibold">{usedToken.toLocaleString()}/{totalToken.toLocaleString()} Tokens.</span>
								<Badge variant="default" className="text-sm font-medium">{reaminToken.toLocaleString()} Remianing</Badge>
							</div>
							<div className="w-full bg-gray-200 rounded-full h-2">
								{/* <div className="bg-primary h-2 rounded-full" style={{ width: '45%' }}></div> */}
								<Progress value={progress} />
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">You have used {progress.toFixed(2)} % of your monthly Token.</span>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

      <div className="border rounded-md overflow-hidden">
				<div className="flex items-center justify-between p-4">
					<span className="text-sm font-bold">Token Usage Breakdown</span>
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Agent Name</TableHead>
              <TableHead>Chat Name</TableHead>
              <TableHead>Total Used</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Preview Chat</TableHead>
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
                  {columnFilters.length > 0
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
                    <TableCell>{row.agent_name || '—'}</TableCell>
                    <TableCell>{row.chat_name || '—'}</TableCell>
                    <TableCell>
                      {total.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {row.cost != null ? `$ ${Number(row.cost).toFixed(6)}` : '-'}
                    </TableCell>
                    <TableCell>
                      <Button size={"sm"} onClick={() => {handlePreview(row)}}><EyeIcon /></Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      <ChatPreviewDialog
        open={isOpenPreview}
        onOpenChange={setOpenPreview}
        user_message={userMsg}
        assistant_message={assistantMsg}
      />
    </div>
  );
}