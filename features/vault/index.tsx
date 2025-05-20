"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EmptyState } from "@/components/ui/empty-state"
import {
  Plus,
  MessageSquare,
  Search,
  Tag,
  Filter,
  Star,
  FileText,
  Code,
  BarChart,
  Database,
  Globe,
  Zap,
  Loader2,
} from "lucide-react"
import { CreateVaultDialog } from "./components/create-vault-dialog"
import { getProjects, createProject } from "@/api/projects"
import { VaultCard } from "./components/vault-card"
import { Project } from "@/types/api"
import { formatDateVariants } from "@/lib/utils/date-formatter"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import SearchInput from "@/components/ui/search-input"
import { useToast } from "@/components/ui/use-toast"

export default function Vaults() {
  const { toast } = useToast()
  const [vaults, setVaults] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [createVaultOpen, setCreateVaultOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<"all" | "starred">("all")
  const auth = useAuth()

  useEffect(() => {
    fetchVaults()
  }, [])

  const fetchVaults = async () => {
    try {
      setLoading(true)
      const response = await getProjects()
      setVaults(response.results.map(vault => ({
        ...vault,
        icon: getVaultIcon(vault.name ?? ''),
        color: getVaultColor(vault.name ?? ''),
        starred: false,
        tags: [],
        lastUpdated: `Updated ${ vault.updated_at && formatDateVariants.dateAgo(vault.updated_at)}`,
        teamSize: 1,
        chatCount: 0,
        chatIcon: MessageSquare
      })))
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch vaults. Please try again later.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateVault = async (name: string, description: string) => {
    try {
      const newVault = await createProject({
        name,
        description: description,
        owner: auth.user?.id
      })
      
      setVaults([...vaults, {
        ...newVault,
        icon: getVaultIcon(newVault.name ?? ''),
        color: getVaultColor(newVault.name ?? ''),
        starred: false,
        tags: [],
        lastUpdated: `Updated ${newVault.updated_at && formatDateVariants.dateAgo(newVault.updated_at)}`,
        teamSize: 1,
        chatCount: 0,
        chatIcon: MessageSquare
      }])

      toast({
        title: "Success",
        description: "Vault created successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create vault. Please try again later.",
        variant: "destructive"
      })
    }
  }

  const getVaultIcon = (name: string) => {
    const icons = [Database, Globe, BarChart, Code, Zap, FileText]
    return icons[Math.floor(Math.random() * icons.length)]
  }

  const getVaultColor = (name: string) => {
    const colors = ["bg-blue-50", "bg-purple-50", "bg-green-50", "bg-yellow-50", "bg-red-50", "bg-indigo-50"]
    return colors[Math.floor(Math.random() * colors.length)]
  }


  // Extract unique tags from vaults
  const allTags = Array.from(new Set(vaults.flatMap((vault) => vault.tags || [])))

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  // Filter vaults based on search query and selected tags
  const filteredVaults = vaults.filter((vault) => {
    // Filter by search query
    const matchesSearch =
      vault.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vault.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vault.tags && vault.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())))

    // Filter by selected tags
    const matchesTags = selectedTags.length === 0 || (vault.tags && selectedTags.every((tag) => vault.tags?.includes(tag)))

    // Filter by view mode
    const matchesViewMode = viewMode === "all" || (viewMode === "starred" && vault.starred)

    return matchesSearch && matchesTags && matchesViewMode
  })



  // Otherwise, show the vaults list
  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center">
        <h1 className="text-xl font-medium">Vaults</h1>
        {loading && <Loader2 className="h-5 w-5 animate-spin" />}
      </div>

      {/* Search and filters */}
      <div className="p-4 border-b">
        <div className="flex gap-2 mb-4">
          <SearchInput 
          placeholder="Search vaults..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
          <Button onClick={() => setCreateVaultOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Vault
          </Button>
        </div>

        {/* Tag filters */}
        <div className="flex items-center gap-2 mb-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filter by tags:</span>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {allTags.map((tag) => (
            <Button
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              size="sm"
              className="rounded-full"
              onClick={() => toggleTag(tag)}
            >
              <Tag className="h-3.5 w-3.5 mr-1" />
              {tag}
            </Button>
          ))}
        </div>

        {/* View mode selector */}
        <div className="flex rounded-md overflow-hidden border w-fit">
          <Button
            variant={viewMode === "all" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("all")}
            className="rounded-none"
          >
            All Vaults
          </Button>
          <Button
            variant={viewMode === "starred" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("starred")}
            className="rounded-none flex items-center gap-1"
          >
            <Star className="h-3.5 w-3.5" /> Starred
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto p-4">
        {filteredVaults.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-8 w-8 text-muted-foreground" />}
            title="No vaults found"
            description={searchQuery || selectedTags.length > 0
              ? "Try adjusting your search or filters"
              : "Create your first vault to get started"}
            action={
              <Button onClick={() => setCreateVaultOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Vault
              </Button>
            }
            onRefresh={fetchVaults}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVaults.map((vault) => (
              <Link
                key={vault.id}
                href={`/vault/${vault.id?.toString()}`}
              >
                <VaultCard
                  key={vault.id}
                  vault={vault}
                  onSelect={() => {}}
                />
              </Link>
            ))}
          </div>
        )}
      </div>

      <CreateVaultDialog
        open={createVaultOpen}
        onOpenChange={setCreateVaultOpen}
        onCreateVault={handleCreateVault}
      />
    </div>
  )
}
