import { createContext, useContext, useState, ReactNode } from 'react'
import { Project } from '@/types/api'

// Sample data until the actual data file is used
const sampleProjects: Project[] = [
  {
    id: 1,
    name: "Databricks",
    description: "Machine learning and data analytics project",
    lastUpdated: "Updated 2 days ago",
    chatCount: 12,
    tags: ["Data Science", "ML"],
    starred: true,
    teamSize: 5,
    color: "bg-blue-50"
  },
  {
    id: 2,
    name: "Website Redesign",
    description: "Company website redesign project",
    lastUpdated: "Updated yesterday",
    chatCount: 8,
    tags: ["Design"],
    starred: false,
    teamSize: 3,
    color: "bg-purple-50"
  }
]

// Extract unique tags from projects
const allTags = Array.from(new Set(sampleProjects.flatMap((project) => project.tags ?? [])));

type ViewMode = 'all' | 'starred'

interface ProjectContextType {
  searchQuery: string
  setSearchQuery: (value: string) => void
  selectedTags: string[]
  toggleTag: (tag: string) => void
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  createProjectOpen: boolean
  setCreateProjectOpen: (open: boolean) => void
  handleCreateProject: (name: string) => void
  filteredProjects: Project[]
}

const ProjectContext = createContext<ProjectContextType>({} as ProjectContextType)

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('all')
  const [createProjectOpen, setCreateProjectOpen] = useState(false)

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const handleCreateProject = (name: string) => {
    console.log('Creating project:', name)
    setCreateProjectOpen(false)
  }

  const filteredProjects = sampleProjects.filter((project: Project) => {
    const matchesSearch = project.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tag => project.tags?.includes(tag))

    const matchesViewMode = viewMode === 'all' || 
      (viewMode === 'starred' && project.starred)

    return matchesSearch && matchesTags && matchesViewMode
  })

  return (
    <ProjectContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        selectedTags,
        toggleTag,
        viewMode,
        setViewMode,
        createProjectOpen,
        setCreateProjectOpen,
        handleCreateProject,
        filteredProjects
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}

export const useProjectContext = () => useContext(ProjectContext)
