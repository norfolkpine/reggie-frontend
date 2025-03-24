"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Clock,
  Star,
  Folder,
  FileText,
  MoreHorizontal,
  Plus,
  Download,
  Share2,
  Lock,
  Globe,
  Users,
  User,
  Building,
  Filter,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

// Sample data for public Australian corporate legislation and taxation documents
const publicDocuments = [
  {
    id: 1,
    title: "Corporations Act 2001",
    description: "Principal legislation for companies in Australia",
    date: "Updated: March 2023",
    category: "Corporate Law",
    type: "Legislation",
    starred: true,
    source: "Australian Government",
    access: "public",
  },
  {
    id: 2,
    title: "Income Tax Assessment Act 1997",
    description: "Primary legislation for income taxation in Australia",
    date: "Updated: July 2023",
    category: "Taxation",
    type: "Legislation",
    starred: true,
    source: "Australian Taxation Office",
    access: "public",
  },
  {
    id: 3,
    title: "GST Ruling GSTR 2000/31",
    description: "Goods and services tax: supplies connected with Australia",
    date: "Updated: January 2023",
    category: "Taxation",
    type: "Ruling",
    starred: false,
    source: "Australian Taxation Office",
    access: "public",
  },
  {
    id: 4,
    title: "TR 2021/2 Income Tax",
    description: "Taxation Ruling on business tax deductions",
    date: "Updated: February 2023",
    category: "Taxation",
    type: "Ruling",
    starred: false,
    source: "Australian Taxation Office",
    access: "public",
  },
  {
    id: 5,
    title: "ASIC Regulatory Guide 259",
    description: "Risk management systems for responsible entities",
    date: "Updated: September 2022",
    category: "Corporate Governance",
    type: "Guidance",
    starred: false,
    source: "ASIC",
    access: "public",
  },
  {
    id: 6,
    title: "Fair Work Act 2009",
    description: "Legislation governing employment relationships in Australia",
    date: "Updated: December 2022",
    category: "Employment Law",
    type: "Legislation",
    starred: true,
    source: "Fair Work Commission",
    access: "public",
  },
]

// Sample data for private user/team documents
const privateDocuments = [
  {
    id: 101,
    title: "Q3 Tax Planning Strategy",
    description: "Internal tax planning document for FY2023-24",
    date: "Created: August 2023",
    category: "Taxation",
    type: "Strategy",
    starred: true,
    owner: "Sarah Chen",
    team: "Finance",
    access: "team",
    sharedWith: ["Finance Team", "Executive Team"],
  },
  {
    id: 102,
    title: "Corporate Restructuring Plan",
    description: "Confidential restructuring proposal for Australian operations",
    date: "Created: May 2023",
    category: "Corporate Strategy",
    type: "Plan",
    starred: true,
    owner: "Michael Wong",
    team: "Executive",
    access: "private",
    sharedWith: ["CEO", "CFO"],
  },
  {
    id: 103,
    title: "ASIC Compliance Checklist",
    description: "Internal checklist for ASIC reporting requirements",
    date: "Updated: April 2023",
    category: "Compliance",
    type: "Checklist",
    starred: false,
    owner: "Jessica Taylor",
    team: "Legal",
    access: "team",
    sharedWith: ["Legal Team", "Compliance Team"],
  },
  {
    id: 104,
    title: "Employee Share Scheme Draft",
    description: "Draft proposal for new employee share scheme",
    date: "Created: June 2023",
    category: "HR",
    type: "Draft",
    starred: false,
    owner: "David Smith",
    team: "HR",
    access: "team",
    sharedWith: ["HR Team", "Finance Team"],
  },
  {
    id: 105,
    title: "Tax Audit Response",
    description: "Confidential response to ATO audit queries",
    date: "Updated: July 2023",
    category: "Taxation",
    type: "Response",
    starred: true,
    owner: "Sarah Chen",
    team: "Finance",
    access: "private",
    sharedWith: ["CFO"],
  },
  {
    id: 106,
    title: "Board Meeting Minutes - July 2023",
    description: "Confidential minutes from July board meeting",
    date: "Created: July 2023",
    category: "Governance",
    type: "Minutes",
    starred: false,
    owner: "Robert Johnson",
    team: "Executive",
    access: "team",
    sharedWith: ["Board Members", "Executive Team"],
  },
  {
    id: 107,
    title: "Property Acquisition Analysis",
    description: "Financial analysis for Sydney office acquisition",
    date: "Created: March 2023",
    category: "Real Estate",
    type: "Analysis",
    starred: false,
    owner: "Michael Wong",
    team: "Finance",
    access: "team",
    sharedWith: ["Finance Team", "Executive Team"],
  },
]

// Sample data for collections
const publicCollections = [
  { id: 1, name: "Corporate Compliance", count: 15, icon: "📊", access: "public" },
  { id: 2, name: "Tax Regulations", count: 23, icon: "📝", access: "public" },
  { id: 3, name: "ASIC Guidance", count: 8, icon: "📋", access: "public" },
]

const privateCollections = [
  { id: 101, name: "Tax Planning 2023", count: 7, icon: "💼", access: "team", team: "Finance" },
  { id: 102, name: "Compliance Checklists", count: 5, icon: "✅", access: "team", team: "Legal" },
  { id: 103, name: "Executive Documents", count: 12, icon: "🔒", access: "private", owner: "You" },
  { id: 104, name: "HR Policies", count: 9, icon: "👥", access: "team", team: "HR" },
]

// Sample teams
const teams = [
  { id: 1, name: "Finance Team", members: 8, icon: "💰" },
  { id: 2, name: "Legal Team", members: 5, icon: "⚖️" },
  { id: 3, name: "Executive Team", members: 4, icon: "👑" },
  { id: 4, name: "HR Team", members: 6, icon: "👥" },
  { id: 5, name: "Compliance Team", members: 3, icon: "🛡️" },
]

export default function Library() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [documentType, setDocumentType] = useState("all") // "all", "public", or "private"
  const [teamFilter, setTeamFilter] = useState("all")

  // Combine documents based on the selected document type
  let documents = []
  if (documentType === "all") documents = [...publicDocuments, ...privateDocuments]
  else if (documentType === "public") documents = publicDocuments
  else if (documentType === "private") documents = privateDocuments

  // Combine collections based on the selected document type
  let collections = []
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
      else if (teamFilter !== "personal" && doc.team !== teamFilter) matchesTeam = false
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
      {/* Header */}
      <div className="p-4 border-b">
        <h1 className="text-xl font-medium">Australian Corporate & Tax Library</h1>
      </div>

      {/* Search and filters */}
      <div className="p-4 border-b">
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents, legislation, or tax information..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            {documentType === "public" ? "Add to My Library" : "Upload Document"}
          </Button>
        </div>

        {/* Team filter for private documents */}
        {(documentType === "private" || documentType === "all") && (
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Team Filter:</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  {teamFilter === "all" ? "All Teams" : teamFilter === "personal" ? "Personal Documents" : teamFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTeamFilter("all")}>
                  <Users className="h-4 w-4 mr-2" />
                  All Teams
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTeamFilter("personal")}>
                  <User className="h-4 w-4 mr-2" />
                  Personal Documents
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {teams.map((team) => (
                  <DropdownMenuItem key={team.id} onClick={() => setTeamFilter(team.name)}>
                    <span className="mr-2">{team.icon}</span>
                    {team.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto p-4">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="all">All Documents</TabsTrigger>
              <TabsTrigger value="legislation">Legislation</TabsTrigger>
              <TabsTrigger value="taxation">Taxation</TabsTrigger>
              <TabsTrigger value="starred">Starred</TabsTrigger>
              <TabsTrigger value="collections">Collections</TabsTrigger>
            </TabsList>

            {/* Document type selector */}
            <div className="flex rounded-md overflow-hidden border">
              <Button
                variant={documentType === "all" ? "default" : "ghost"}
                size="sm"
                onClick={() => setDocumentType("all")}
                className="rounded-none"
              >
                All
              </Button>
              <Button
                variant={documentType === "public" ? "default" : "ghost"}
                size="sm"
                onClick={() => setDocumentType("public")}
                className="rounded-none flex items-center gap-1"
              >
                <Globe className="h-3.5 w-3.5" /> Public
              </Button>
              <Button
                variant={documentType === "private" ? "default" : "ghost"}
                size="sm"
                onClick={() => setDocumentType("private")}
                className="rounded-none flex items-center gap-1"
              >
                <Lock className="h-3.5 w-3.5" /> Private
              </Button>
            </div>
          </div>

          <TabsContent value="all" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocuments.map((doc) => (
                <DocumentCard key={doc.id} document={doc} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="legislation" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocuments
                .filter((doc) => doc.type === "Legislation")
                .map((doc) => (
                  <DocumentCard key={doc.id} document={doc} />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="taxation" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocuments
                .filter((doc) => doc.category === "Taxation")
                .map((doc) => (
                  <DocumentCard key={doc.id} document={doc} />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="starred" className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Starred Documents</h2>
                <span className="text-sm text-muted-foreground">
                  {filteredDocuments.filter((doc) => doc.starred).length} documents
                </span>
              </div>

              {/* Quick filter bar for starred documents */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Button
                  variant={documentType === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDocumentType("all")}
                  className="rounded-full"
                >
                  All
                </Button>
                <Button
                  variant={documentType === "public" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDocumentType("public")}
                  className="rounded-full flex items-center gap-1"
                >
                  <Globe className="h-3.5 w-3.5" /> Public
                </Button>
                <Button
                  variant={documentType === "private" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDocumentType("private")}
                  className="rounded-full flex items-center gap-1"
                >
                  <Lock className="h-3.5 w-3.5" /> Private
                </Button>

                {/* Category filters */}
                <div className="h-6 border-l mx-1"></div>
                <Button variant="outline" size="sm" className="rounded-full">
                  Legislation
                </Button>
                <Button variant="outline" size="sm" className="rounded-full">
                  Taxation
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDocuments
                  .filter((doc) => doc.starred)
                  .map((doc) => (
                    <DocumentCard key={doc.id} document={doc} />
                  ))}
              </div>
            </div>

            {/* Recently starred section */}
            {filteredDocuments.filter((doc) => doc.starred).length > 0 && (
              <div>
                <h3 className="text-md font-medium mb-3">Recently Starred</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredDocuments
                    .filter((doc) => doc.starred)
                    .sort(
                      (a, b) => new Date(b.date.split(": ")[1]).getTime() - new Date(a.date.split(": ")[1]).getTime(),
                    )
                    .slice(0, 3)
                    .map((doc) => (
                      <DocumentCard key={doc.id} document={doc} />
                    ))}
                </div>
              </div>
            )}

            {/* Suggested documents to star */}
            {documentType !== "private" && (
              <div>
                <h3 className="text-md font-medium mb-3">Suggested Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {publicDocuments
                    .filter((doc) => !doc.starred)
                    .slice(0, 3)
                    .map((doc) => (
                      <DocumentCard key={doc.id} document={doc} />
                    ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="collections" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCollections.map((collection) => (
                <CollectionCard key={collection.id} collection={collection} />
              ))}
            </div>

            {/* Teams section when viewing all or private documents */}
            {(documentType === "private" || documentType === "all") && teamFilter === "all" && (
              <div className="mt-8">
                <h2 className="text-lg font-medium mb-4">Your Teams</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teams.map((team) => (
                    <TeamCard key={team.id} team={team} onSelect={() => setTeamFilter(team.name)} />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function DocumentCard({ document }) {
  const isPublic = document.access === "public"
  const [isStarred, setIsStarred] = useState(document.starred)

  const toggleStar = (e) => {
    e.stopPropagation()
    setIsStarred(!isStarred)
    // In a real app, this would call an API to update the star status
  }

  return (
    <Card className={`overflow-hidden ${isStarred ? "border-yellow-300" : ""} hover:shadow-md transition-all`}>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{document.title}</CardTitle>
          <div className="flex items-center gap-1">
            {isPublic ? (
              <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                <Globe className="h-3 w-3 mr-1" /> Public
              </Badge>
            ) : document.access === "private" ? (
              <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                <Lock className="h-3 w-3 mr-1" /> Private
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                <Users className="h-3 w-3 mr-1" /> Team
              </Badge>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription className="line-clamp-2">{document.description}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="bg-blue-50">
            {document.type}
          </Badge>
          <Badge variant="outline" className="bg-gray-50">
            {document.category}
          </Badge>
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>{document.date}</span>
          </div>
          {isPublic ? (
            <div className="flex items-center">
              <Building className="h-4 w-4 mr-1" />
              <span>{document.source}</span>
            </div>
          ) : (
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              <span>{document.owner}</span>
            </div>
          )}
        </div>

        {/* Shared with section for private documents */}
        {!isPublic && document.sharedWith && (
          <div className="mt-3 flex items-center gap-1">
            <span className="text-xs text-muted-foreground">Shared with:</span>
            <div className="flex -space-x-2">
              {document.sharedWith.slice(0, 3).map((shared, index) => (
                <Avatar key={index} className="h-6 w-6 border-2 border-background">
                  <AvatarFallback className="text-[10px]">
                    {shared
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              ))}
              {document.sharedWith.length > 3 && (
                <Avatar className="h-6 w-6 border-2 border-background">
                  <AvatarFallback className="text-[10px]">+{document.sharedWith.length - 3}</AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-2 bg-muted/50 flex justify-between">
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <FileText className="h-4 w-4 mr-1" />
            <span className="text-xs">View</span>
          </Button>
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <Download className="h-4 w-4 mr-1" />
            <span className="text-xs">Download</span>
          </Button>
        </div>
        <div className="flex gap-1">
          {!isPublic && (
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <Share2 className="h-4 w-4 mr-1" />
              <span className="text-xs">Share</span>
            </Button>
          )}
          <Button
            variant={isStarred ? "default" : "ghost"}
            size="icon"
            className={`h-8 w-8 ${isStarred ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" : ""}`}
            onClick={toggleStar}
          >
            <Star className={`h-4 w-4 ${isStarred ? "fill-yellow-500 text-yellow-500" : ""}`} />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

function CollectionCard({ collection }) {
  const isPublic = collection.access === "public"

  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <span className="text-xl">{collection.icon}</span>
            <CardTitle className="text-lg">{collection.name}</CardTitle>
          </div>
          {isPublic ? (
            <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
              Public
            </Badge>
          ) : collection.access === "private" ? (
            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
              Private
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
              Team
            </Badge>
          )}
        </div>
        <CardDescription>
          {collection.count} documents
          {!isPublic && collection.team && ` • ${collection.team}`}
          {!isPublic && collection.owner && ` • ${collection.owner}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex items-center text-sm text-muted-foreground">
          <Folder className="h-4 w-4 mr-1" />
          <span>Collection</span>
        </div>
      </CardContent>
      <CardFooter className="p-2 bg-muted/50 flex justify-between">
        <Button variant="ghost" size="sm" className="h-8 px-2">
          <FileText className="h-4 w-4 mr-1" />
          <span className="text-xs">Open</span>
        </Button>
        {!isPublic && (
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <Share2 className="h-4 w-4 mr-1" />
            <span className="text-xs">Share</span>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

function TeamCard({ team, onSelect }) {
  return (
    <Card className="overflow-hidden hover:border-primary/50 transition-colors cursor-pointer" onClick={onSelect}>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-xl">
            {team.icon}
          </div>
          <div>
            <CardTitle className="text-lg">{team.name}</CardTitle>
            <CardDescription>{team.members} members</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="flex -space-x-2">
          {Array(Math.min(team.members, 5))
            .fill(0)
            .map((_, index) => (
              <Avatar key={index} className="border-2 border-background">
                <AvatarFallback>{String.fromCharCode(65 + index)}</AvatarFallback>
              </Avatar>
            ))}
          {team.members > 5 && (
            <Avatar className="border-2 border-background">
              <AvatarFallback>+{team.members - 5}</AvatarFallback>
            </Avatar>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-2 bg-muted/50">
        <Button variant="ghost" size="sm" className="w-full gap-2">
          <Folder className="h-4 w-4" />
          <span>View Team Documents</span>
        </Button>
      </CardFooter>
    </Card>
  )
}

