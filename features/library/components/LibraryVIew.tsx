import { useState, useEffect } from "react"
import { LibraryHeader } from "./LibraryHeader"
import { LibraryTabs } from "./LibraryTabs"
import { Document, Collection, Team } from "../types"
import { useHeader } from "@/contexts/header-context"

interface LibraryProps {
  publicDocuments: Document[]
  privateDocuments: Document[]
  publicCollections: Collection[]
  privateCollections: Collection[]
  teams: Team[]
}

export function LibraryView({
  publicDocuments,
  privateDocuments,
  publicCollections,
  privateCollections,
  teams,
}: LibraryProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [documentType, setDocumentType] = useState("all") // "all", "public", or "private"
  const [teamFilter, setTeamFilter] = useState("all")
  const { setHeaderCustomContent } = useHeader()

  // Set custom header content
  useEffect(() => {
    setHeaderCustomContent(
      <div className="text-lg font-medium text-gray-900">
        Australian Corporate & Tax Library
      </div>
    );

    // Cleanup when component unmounts
    return () => setHeaderCustomContent(null);
  }, [setHeaderCustomContent]);

  // Combine documents based on the selected document type
  let documents: Document[] = []
  if (documentType === "all") documents = [...publicDocuments, ...privateDocuments]
  else if (documentType === "public") documents = publicDocuments
  else if (documentType === "private") documents = privateDocuments

  // Combine collections based on the selected document type
  let collections: Collection[] = []
  if (documentType === "all") collections = [...publicCollections, ...privateCollections]
  else if (documentType === "public") collections = publicCollections
  else if (documentType === "private") collections = privateCollections

  // Filter documents based on search query, tab, and team filter
  const filteredDocuments = documents.filter((doc) => {
    // Search filter
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchQuery.toLowerCase())

    // Tab filter for legislation and taxation
    let matchesTab = true
    if (activeTab === "legislation" && doc.type !== "Legislation") matchesTab = false
    if (activeTab === "taxation" && doc.category !== "Taxation") matchesTab = false

    // Team filter (only for private documents)
    let matchesTeam = true
    if (doc.access !== "public" && teamFilter !== "all") {
      if (teamFilter === "personal" && doc.access !== "private") matchesTeam = false
      else if (teamFilter !== "personal" && (doc as any).team !== teamFilter) matchesTeam = false
    }

    return matchesSearch && matchesTab && matchesTeam
  })

  // Filter collections based on team filter
  const filteredCollections = collections.filter((collection) => {
    if (collection.access === "public") return true
    if (teamFilter === "all") return true
    if (teamFilter === "personal" && collection.access === "private") return true
    if (collection.team === teamFilter) return true
    return false
  })

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header removed - now handled by layout */}

      <LibraryHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        documentType={documentType}
        teamFilter={teamFilter}
        setTeamFilter={setTeamFilter}
        teams={teams}
      />

      {/* Main content */}
      <div className="flex-1 overflow-auto p-4">
        <LibraryTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          documentType={documentType}
          setDocumentType={setDocumentType}
          filteredDocuments={filteredDocuments}
          filteredCollections={filteredCollections}
        />
      </div>
    </div>
  )
}