import { Project } from "@/types/api"
import { Database, MessageSquare, Globe } from "lucide-react"

export const sampleVaults: Project[] = [
  {
    id: 1,
    name: "Databricks",
    description: "Machine learning and data analytics vault",
    lastUpdated: "Updated 2 days ago",
    chatCount: 12,
    tags: ["Data Science", "ML"],
    starred: true,
    teamSize: 5,
    color: "bg-blue-50",
    icon: Database,
    chatIcon: MessageSquare
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
    color: "bg-purple-50",
    icon: Globe,
    chatIcon: MessageSquare
  },
  // ... other vault objects
]

// Extract unique tags from vaults
export const allTags = Array.from(new Set(sampleVaults.flatMap((vault) => vault.tags)))
