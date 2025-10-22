"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgentList } from "./components/agent-list";
import { Clock, Plus } from "lucide-react"
import { Agent, Instruction, ExpectedOutput } from "@/types/api"
import { useRouter } from "next/navigation"
import { useHeader } from "@/contexts/header-context"
import { SearchFilter } from "./components/search-filter"

export default function ExploreWorkflows() {
  const { setHeaderActions, setHeaderCustomContent } = useHeader()
  const [searchQuery, setSearchQuery] = useState("")
  
  const router = useRouter()
  
  const headerActions = useMemo(() => [
    {
      label: "Create Workflow",
      onClick: () => router.push("/workflow/create"),
      icon: <Plus className="h-4 w-4" />,
      variant: "default" as const,
      size: "sm" as const
    }
  ], [router]);
  const filteredAgents: Agent[] = [
    {
        id: 1,
        instructions: {} as Instruction,
        expected_output: {} as ExpectedOutput,
        name: "Workflow Agent 1",
        description: "Description for workflow agent 1",
        unique_code: "workflow_agent_1",
        agent_id: "agent_1",
        session_table: "session_table_1",
        search_knowledge: true,
        add_datetime_to_instructions: true,
        show_tool_calls: true,
        markdown_enabled: true,
        debug_mode: true,
        num_history_responses: 3,
        is_global: true,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        user: 10,
        model: 3,
        knowledge_base: "string",
        team: 1,
        subscriptions: [],
    }
  ];

  useEffect(() => {
    setHeaderActions(headerActions);

    setHeaderCustomContent(<span className="text-xl font-medium">Workflows</span>);
    return () => {
      setHeaderActions([]);
      setHeaderCustomContent(null);
    };
  }, [setHeaderActions, headerActions, setHeaderCustomContent]);

  return (
    <div className="flex-1 flex flex-col h-full">
      <Tabs defaultValue="workflows" className="flex-1 flex flex-col">
        <TabsList className="justify-start border-b mt-2">
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
        <TabsContent value="workflows" className="flex-1 flex flex-col">
          <SearchFilter
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
          <div className="flex-1 overflow-auto p-4">
            <AgentList
              title="All Workflows"
              agents={filteredAgents}
            />
          </div>
        </TabsContent>
        <TabsContent value="drafts" className="flex-1 overflow-auto p-4">
          Draft workflows will be shown here.
        </TabsContent>
        <TabsContent value="templates" className="flex-1 overflow-auto p-4">
          Here are some example workflows.
        </TabsContent>
      </Tabs>
    </div>
  )
}

