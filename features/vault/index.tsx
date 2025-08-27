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

export default function Projects() {
  const { toast } = useToast()
  const { setHeaderActions, setHeaderCustomContent } = useHeader()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [createProjectOpen, setCreateProjectOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<"starred" | "user" | "userProjects">("user")
  const auth = useAuth()

  // Set header actions and custom content
  useEffect(() => {
    // Set the "New Project" button as a header action
    setHeaderActions([
      {
        label: "New Project",
        onClick: () => setCreateProjectOpen(true),
        icon: <Plus className="h-4 w-4" />,
        variant: "default",
        size: "sm"
      }
    ]);

    // Set loading indicator as custom content next to the title
    setHeaderCustomContent(
      loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null
    );

    // Cleanup when component unmounts
    return () => {
      setHeaderActions([]);
      setHeaderCustomContent(null);
    };
  }, [setHeaderActions, setHeaderCustomContent, loading]);

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await getProjects()
      console.log('API Response:', response);
      console.log('First project:', response.results[0]);
      console.log('First project ID field:', response.results[0]?.id);
      console.log('First project UUID field:', response.results[0]?.uuid);
      console.log('First project project_id field:', response.results[0]?.project_id);
      console.log('First project project_uuid field:', response.results[0]?.project_uuid);
      
      setProjects(response.results.map(project => ({
        ...project,
        icon: getProjectIcon(project.name ?? ''),
        color: getProjectColor(project.name ?? ''),
        starred: false,
        tags: [],
        lastUpdated: `Updated ${ project.updated_at && formatDateVariants.dateAgo(project.updated_at)}`,
        teamSize: 1,
        chatCount: 0,
        chatIcon: MessageSquare
      })))
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load projects. Please try again later.",
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
        description: "Project created successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create project. Please try again later.",
        variant: "destructive"
      })
    }
  }

  // Handle project deletion without page refresh
  const handleProjectDeleted = useCallback((projectId: string) => {
    setProjects(prevProjects => prevProjects.filter(project => {
      const id = getProjectId(project);
      return id !== projectId;
    }));
  }, []);

  // Handle project renaming without page refresh
  const handleProjectRenamed = useCallback((projectId: string, newName: string) => {
    setProjects(prevProjects => prevProjects.map(project => {
      const id = getProjectId(project);
      if (id === projectId) {
        return {
          ...project,
          name: newName,
          lastUpdated: `Updated ${project.updated_at && formatDateVariants.dateAgo(project.updated_at)}`
        };
      }
      return project;
    }));
  }, []);

  const getProjectIcon = (name: string) => {
    const icons = [Database, Globe, BarChart, Code, Zap, FileText]
    return icons[Math.floor(Math.random() * icons.length)]
  }

  const getProjectColor = (name: string) => {
    const colors = ["bg-blue-50", "bg-purple-50", "bg-green-50", "bg-yellow-50", "bg-red-50", "bg-indigo-50"]
    return colors[Math.floor(Math.random() * colors.length)]
  }


  // Extract unique tags from projects
  const allTags = Array.from(new Set(projects.flatMap((project) => project.tags || [])))

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  // Filter projects based on search query and selected tags
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      // Filter by search query
      const matchesSearch =
        project.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.tags && project.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())))

      // Filter by selected tags
      const matchesTags = selectedTags.length === 0 || (project.tags && selectedTags.every((tag) => project.tags?.includes(tag)))

      // Filter by view mode
      const matchesViewMode =
        (viewMode === "starred" && project.starred) ||
        (viewMode === "user" && project.owner === auth.user?.id) ||
        (viewMode === "userProjects" && project.owner !== auth.user?.id)

      return matchesSearch && matchesTags && matchesViewMode
    })
  }, [projects, searchQuery, selectedTags, viewMode, auth.user?.id])



  // Otherwise, show the projects list
  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header removed - now handled by layout */}

      {/* Search and filters */}
      <div className="p-4 border-b">
        <div className="flex gap-2 mb-4">
          <SearchInput 
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
          {/* <Button onClick={() => setCreateProjectOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
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
            <Folder className="h-3.5 w-3.5" /> All Projects
          </Button>
          {auth.user?.is_superuser && (
            <Button
              variant={viewMode === "userProjects" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("userProjects")}
              className="rounded-none flex items-center gap-1"
            >
              <User className="h-3.5 w-3.5" /> User Projects
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
        {filteredProjects.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-8 w-8 text-muted-foreground" />}
            title="No projects found"
            description={searchQuery || selectedTags.length > 0
              ? "Try adjusting your search or filters"
              : "Create your first project to get started"}
            action={
              <Button onClick={() => setCreateProjectOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            }
            onRefresh={fetchProjects}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project) => {
              console.log('Raw project object:', project);
              console.log('Project.id:', project.id);
              console.log('Project.uuid:', project.uuid);
              console.log('Project.project_id:', project.project_id);
              console.log('Project.project_uuid:', project.project_uuid);
              
              const projectId = getProjectId(project);
              console.log('getProjectId result:', projectId);
              console.log('Project:', project.name, 'Project ID:', projectId, 'Full project object:', project);
              
              if (!projectId) {
                console.error('No project ID found in:', project);
                return null;
              }
              
              const vaultUrl = `/vault/${projectId}`;
              console.log('Generated vault URL:', vaultUrl);
              
              return (
                <Link
                  key={projectId}
                  href={vaultUrl}
                >
                  <ProjectCard
                    key={projectId}
                    project={project}
                    onSelect={() => {}}
                    onProjectDeleted={handleProjectDeleted}
                    onProjectRenamed={handleProjectRenamed}
                  />
                </Link>
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
