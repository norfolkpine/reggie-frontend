"use client"

import { useEffect, useState, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkflowList } from "./components/workflow-list";
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useHeader } from "@/contexts/header-context"
import { SearchFilter } from "./components/search-filter"
import { useWorkflows } from "./hooks/useWorkflows"

export default function ExploreWorkflows() {
  const { setHeaderActions, setHeaderCustomContent } = useHeader()
  const [searchQuery, setSearchQuery] = useState("")
  const { workflows, isLoading } = useWorkflows()

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

  const filteredWorkflows = useMemo(() => {
    if (!searchQuery) return workflows;
    return workflows.filter(workflow =>
      workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workflow.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [workflows, searchQuery]);

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
            <WorkflowList
              title="All Workflows"
              workflows={filteredWorkflows}
              isLoading={isLoading}
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

