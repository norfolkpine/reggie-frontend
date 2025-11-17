import {  LibraryView } from "./components"

// Mock data for demonstration
const publicDocuments = [
  {
    id: 1,
    title: "Corporate Tax Act 2023",
    description: "Latest updates to corporate tax legislation including new provisions for digital businesses",
    date: "2023-06-15",
    category: "Taxation",
    type: "Legislation",
    starred: true,
    access: "public" as const,
    source: "Australian Taxation Office"
  },
  {
    id: 2,
    title: "Business Registration Guidelines",
    description: "Complete guide for business registration and compliance requirements",
    date: "2023-05-20",
    category: "Business",
    type: "Guide",
    starred: false,
    access: "public" as const,
    source: "Department of Industry"
  }
]

const privateDocuments = [
  {
    id: 3,
    title: "Q2 Tax Planning",
    description: "Internal tax planning strategy for Q2 2023",
    date: "2023-04-10",
    category: "Taxation",
    type: "Planning",
    starred: true,
    access: "private" as const,
    owner: "John Smith",
    team: "Finance",
    sharedWith: ["Alice Johnson", "Bob Wilson"]
  },
  {
    id: 4,
    title: "Compliance Checklist",
    description: "Team compliance checklist for regulatory requirements",
    date: "2023-03-25",
    category: "Compliance",
    type: "Checklist",
    starred: false,
    access: "team" as const,
    owner: "Sarah Brown",
    team: "Legal",
    sharedWith: ["Legal Team", "Compliance Team"]
  }
]

const publicCollections = [
  {
    id: 1,
    name: "Tax Legislation",
    count: 15,
    icon: "📚",
    access: "public" as const,
  },
  {
    id: 2,
    name: "Business Guides",
    count: 8,
    icon: "📖",
    access: "public" as const
  }
]

const privateCollections = [
  {
    id: 3,
    name: "Team Documents",
    count: 12,
    icon: "📁",
    access: "team" as const,
    team: "Finance"
  },
  {
    id: 4,
    name: "Personal Files",
    count: 5,
    icon: "📂",
    access: "private" as const,
    owner: "John Smith"
  }
]

const teams = [
  {
    id: 1,
    name: "Finance",
    members: 8,
    icon: "💰"
  },
  {
    id: 2,
    name: "Legal",
    members: 5,
    icon: "⚖️"
  },
  {
    id: 3,
    name: "Compliance",
    members: 4,
    icon: "✅"
  }
]

export default function Library() {
  return (
    <LibraryView
      publicDocuments={publicDocuments}
      privateDocuments={privateDocuments}
      publicCollections={publicCollections}
      privateCollections={privateCollections}
      teams={teams}
    />
  )
}

export * from "./components"
export * from "./types"

