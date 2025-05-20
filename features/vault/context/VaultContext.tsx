import { createContext, useContext, useState, ReactNode } from 'react'
import { Project } from '@/types/api'

// Sample data until the actual data file is used
const sampleVaults: Project[] = [
  {
    id: 1,
    name: "Databricks",
    description: "Machine learning and data analytics vault",
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
    description: "Company website redesign vault",
    lastUpdated: "Updated yesterday",
    chatCount: 8,
    tags: ["Design"],
    starred: false,
    teamSize: 3,
    color: "bg-purple-50"
  }
]

// Extract unique tags from vaults
const allTags = Array.from(new Set(sampleVaults.flatMap((vault) => vault.tags ?? [])));

type ViewMode = 'all' | 'starred'

interface VaultContextType {
  searchQuery: string
  setSearchQuery: (value: string) => void
  selectedTags: string[]
  toggleTag: (tag: string) => void
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  createVaultOpen: boolean
  setCreateVaultOpen: (open: boolean) => void
  handleCreateVault: (name: string) => void
  filteredVaults: Project[]
}

const VaultContext = createContext<VaultContextType>({} as VaultContextType)

export function VaultProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('all')
  const [createVaultOpen, setCreateVaultOpen] = useState(false)

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const handleCreateVault = (name: string) => {
    console.log('Creating vault:', name)
    setCreateVaultOpen(false)
  }

  const filteredVaults = sampleVaults.filter((vault: Project) => {
    const matchesSearch = vault.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vault.description?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tag => vault.tags?.includes(tag))

    const matchesViewMode = viewMode === 'all' || 
      (viewMode === 'starred' && vault.starred)

    return matchesSearch && matchesTags && matchesViewMode
  })

  return (
    <VaultContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        selectedTags,
        toggleTag,
        viewMode,
        setViewMode,
        createVaultOpen,
        setCreateVaultOpen,
        handleCreateVault,
        filteredVaults
      }}
    >
      {children}
    </VaultContext.Provider>
  )
}

export const useVaultContext = () => useContext(VaultContext)
