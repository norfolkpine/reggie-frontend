"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
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
  User,
  Folder,
} from "lucide-react"
import { CreateProjectDialog } from "./components/create-project-dialog"
import { getProjects, createProject } from "@/api/projects"
import { ProjectCard } from "./components/project-card"
import { Project, getProjectId } from "@/types/api"
import { formatDateVariants } from "@/lib/utils/date-formatter"
import { useAuth } from "@/contexts/auth-context"
import { useHeader } from "@/contexts/header-context"
import Link from "next/link"
import SearchInput from "@/components/ui/search-input"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

export default function Vaults() {
  const { toast } = useToast()
  const { setHeaderActions, setHeaderCustomContent } = useHeader()
  const [vaults, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [createProjectOpen, setCreateProjectOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<"starred" | "user" | "userProjects">("user")
  const auth = useAuth()
  const router = useRouter()

  // Set header actions and custom content
  useEffect(() => {
    // Set the "New Vault" button as a header action
    setHeaderActions([
      {
        label: "New Vault",
        onClick: () => setCreateProjectOpen(true),
        icon: <Plus className="h-4 w-4" />,
        variant: "default",
        size: "sm"
      }
    ]);

    // Don't override the header content during loading - let the default title show
    setHeaderCustomContent(null);

    return () => {
      setHeaderActions([]);
      setHeaderCustomContent(null);
    };
  }, [setHeaderActions, setHeaderCustomContent]);

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await getProjects()
      console.log('API Response:', response);
      console.log('First vault:', response.results[0]);
      console.log('First vault ID field:', response.results[0]?.id);
      console.log('First vault UUID field:', response.results[0]?.uuid);
      console.log('First vault project_id field:', response.results[0]?.project_id);
      console.log('First vault project_uuid field:', response.results[0]?.project_uuid);
      
      setProjects(response.results.map(vault => ({
        ...vault,
        icon: getProjectIcon(vault.name ?? ''),
        color: getProjectColor(vault.name ?? ''),
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
        description: "Failed to load vaults. Please try again later.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = async (name: string, description: string) => {
    try {
      const newProject = await createProject({
        name,
        description: description,
        owner: auth.user?.id
      })
      
      setProjects(prevProjects => [...prevProjects, {
        ...newProject,
        icon: getProjectIcon(newProject.name ?? ''),
        color: getProjectColor(newProject.name ?? ''),
        starred: false,
        tags: [],
        lastUpdated: `Updated ${newProject.updated_at && formatDateVariants.dateAgo(newProject.updated_at)}`,
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

  // Handle vault deletion without page refresh
  const handleProjectDeleted = useCallback((projectId: string) => {
    setProjects(prevProjects => prevProjects.filter(vault => {
      const id = getProjectId(vault);
      return id !== projectId;
    }));
  }, []);

  // Handle vault renaming without page refresh
  const handleProjectRenamed = useCallback((projectId: string, newName: string) => {
    setProjects(prevProjects => prevProjects.map(vault => {
      const id = getProjectId(vault);
      if (id === projectId) {
        return {
          ...vault,
          name: newName,
          lastUpdated: `Updated ${vault.updated_at && formatDateVariants.dateAgo(vault.updated_at)}`
        };
      }
      return vault;
    }));
  }, []);

  const getProjectIcon = (name: string) => {
    const icons = [Database, Globe, BarChart, Code, Zap, FileText]
    // Use deterministic selection based on name hash to avoid hydration mismatch
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      const char = name.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return icons[Math.abs(hash) % icons.length]
  }

  const getProjectColor = (name: string) => {
    const colors = ["bg-blue-50", "bg-purple-50", "bg-green-50", "bg-yellow-50", "bg-red-50", "bg-indigo-50"]
    // Use deterministic selection based on name hash to avoid hydration mismatch
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      const char = name.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return colors[Math.abs(hash) % colors.length]
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
  const filteredProjects = useMemo(() => {
    return vaults.filter((vault) => {
      // Filter by search query
      const matchesSearch =
        vault.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vault.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (vault.tags && vault.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())))

      // Filter by selected tags
      const matchesTags = selectedTags.length === 0 || (vault.tags && selectedTags.every((tag) => vault.tags?.includes(tag)))

      // Filter by view mode
      const matchesViewMode =
        (viewMode === "starred" && vault.starred) ||
        (viewMode === "user" && vault.owner === auth.user?.id) ||
        (viewMode === "userProjects" && vault.owner !== auth.user?.id)

      return matchesSearch && matchesTags && matchesViewMode
    })
  }, [vaults, searchQuery, selectedTags, viewMode, auth.user?.id])



  // Otherwise, show the vaults list
  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header removed - now handled by layout */}

      {/* Search and filters */}
      <div className="p-4 border-b">
        <div className="flex gap-2 mb-4">
          <SearchInput 
          placeholder="Search vaults..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
          {/* <Button onClick={() => setCreateProjectOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Vault
          </Button> */}
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
            variant={viewMode === "user" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("user")}
            className="rounded-none flex items-center gap-1"
          >
            <Folder className="h-3.5 w-3.5" /> All Vaults
          </Button>
          {auth.user?.is_superuser && (
            <Button
              variant={viewMode === "userProjects" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("userProjects")}
              className="rounded-none flex items-center gap-1"
            >
              <User className="h-3.5 w-3.5" /> User Vaults
            </Button>
          )}
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
        {loading ? (
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        ) : filteredProjects.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-8 w-8 text-muted-foreground" />}
            title="No vaults found"
            description={searchQuery || selectedTags.length > 0
              ? "Try adjusting your search or filters"
              : "Create your first vault to get started"}
            action={
              <Button onClick={() => setCreateProjectOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Vault
              </Button>
            }
            onRefresh={fetchProjects}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((vault) => {
              console.log('Raw vault object:', vault);
              console.log('Vault.id:', vault.id);
              console.log('Vault.uuid:', vault.uuid);
              console.log('Vault.project_id:', vault.project_id);
              console.log('Vault.project_uuid:', vault.project_uuid);
              
              const projectId = getProjectId(vault);
              console.log('getProjectId result:', projectId);
              console.log('Vault:', vault.name, 'Vault ID:', projectId, 'Full vault object:', vault);
              
              if (!projectId) {
                console.error('No vault ID found in:', vault);
                return null;
              }
              
              return (
                <ProjectCard
                  key={projectId}
                  project={vault}
                  onSelect={(projectName) => {
                    // Navigate to the vault page
                    // window.location.href = `/vault/${projectId}`;
                    router.push(`/vault/${projectId}`);
                  }}
                  onProjectDeleted={handleProjectDeleted}
                  onProjectRenamed={handleProjectRenamed}
                />
              );
            })}
          </div>
        )}
      </div>

      <CreateProjectDialog
        open={createProjectOpen}
        onOpenChange={setCreateProjectOpen}
        onCreateProject={handleCreateProject}
      />
    </div>
  )
}
