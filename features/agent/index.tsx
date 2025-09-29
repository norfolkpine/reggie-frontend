"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { AlertCircle, Plus, Search } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import { SearchFilter } from "./components/search-filter"
import { AgentList } from "./components/agent-list"
import { getAgents } from "@/api/agents"
import { Agent } from "@/types/api"
import { handleApiError } from "@/lib/utils/handle-api-error"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import TypingIndicator from "../chats/components/typing-indicator"
import { useHeader } from "@/contexts/header-context"

const categories = ["All", "Sales", "Marketing", "Engineering", "Product"]

export default function ExploreAgents() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("All")
  const [agents, setAgents] = useState<Agent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const {toast} = useToast()
  const router = useRouter()
  const { setHeaderActions, setHeaderCustomContent } = useHeader()

  // Memoized header actions
  const headerActions = useMemo(() => [
    {
      label: "Create Agent",
      onClick: () => router.push('/agent/create'),
      icon: <Plus className="h-4 w-4" />,
      variant: "default" as const,
      size: "sm" as const
    }
  ], [router]);

  // Set header actions
  useEffect(() => {
    setHeaderActions(headerActions);

    setHeaderCustomContent(<h1 className="text-xl font-medium">Agents</h1>);

    // Cleanup when component unmounts
    return () => {
      setHeaderActions([]);
      setHeaderCustomContent(null);
    };
  }, [setHeaderActions, headerActions, setHeaderCustomContent]);

  const fetchAgents = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await getAgents()
      setAgents(response.results)
      setError(null)
    } catch (err) {
     const { message } = handleApiError(err)
     if(message) {
      toast({
        title: "Error fetching agents",
        description: message,
        variant: "destructive",
      })
     }
    } finally {
      setIsLoading(false)
    }
  }, [toast]);

  const handleDeleteAgent = useCallback(async () => {
    await fetchAgents();
  }, [fetchAgents]);

  useEffect(() => {
    fetchAgents()
  }, [fetchAgents])

  // Memoized filtered agents
  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      const matchesSearch =
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchQuery.toLowerCase())

      // Since we don't have category in the API response, we'll need to adjust this later
      const matchesCategory = activeCategory === "All"

      return matchesSearch && matchesCategory
    })
  }, [agents, searchQuery, activeCategory]);

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header removed - now handled by layout */}

      {/* Search and filters */}
      <SearchFilter
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        categories={categories}
      />

      {/* Main content */}
      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p>Loading agents...</p>
          </div>
        ) : error ? (
          <EmptyState
            title="Error loading agents"
            description={error}
            icon={<AlertCircle className="h-10 w-10 text-destructive" />}
          />
        ) : filteredAgents.length === 0 ? (
          <EmptyState
            title="No agents found"
            description="Try adjusting your search or filter to find what you're looking for."
            icon={<Search className="h-10 w-10" />}
            onRefresh={fetchAgents}
          />
        ) : (
          <>
            <AgentList
              title="All Agents"
              agents={filteredAgents}
              onDelete={handleDeleteAgent}
            />
          </>
        )}
      </div>
    </div>
  )
}

