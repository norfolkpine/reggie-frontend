import { BookOpen, FolderGit2, MessageSquare, Search, FileText, LayoutGrid, Shield, Workflow, Database } from "lucide-react"

export type Route = {
  name: string
  path: string
  icon?: any
  description?: string
}

export const routes = {
  chat: {
    name: "Assistant",
    path: "/chat",
    icon: MessageSquare,
    description: "Start a new chat session"
  },
  library: {
    name: "Library",
    path: "/library",
    icon: BookOpen,
    description: "Browse your saved resources"
  },
  vaults: {
    name: "Vault",
    path: "/vault",
    icon: FolderGit2,
    description: "Manage your vaults"
  },
  workflows: {
    name: "Workflows",
    path: "/workflow",
    icon: Workflow,
    description: "Create and manage workflows"
  },
  documents: {
    name: "Documents",
    path: "/documents",
    icon: FileText,
    description: "Create and manage documents"
  },
  appIntegration: {
    name: "Apps",
    path: "/app-integration",
    icon: LayoutGrid,
    description: "Manage app integrations"
  },
  knowledgeBase: {
    name: "Knowledge Base",
    path: "/knowledge-base",
    icon: Database,
    description: "Manage knowledge base"
  },
  admin: {
    name: "Admin",
    path: "/admin",
    icon: Shield,
    description: "Administrative settings"
  },
  exploreAgents: {
    name: "Explore Agents",
    path: "/explore-agents",
    icon: Search,
    description: "Discover AI agents"
  }
} as const

export type RouteKey = keyof typeof routes

// Helper function to get page title from pathname
export function getPageTitle(pathname: string): string {
  // Handle root path
  if (pathname === "/") return "Dashboard"
  
  // Handle dynamic routes - return empty for routes with custom headers
  if (pathname.startsWith("/chat/")) return "Chat Session"
  if (pathname.startsWith("/documents/")) return "Documents"
  if (pathname.startsWith("/vault/")) return "" // Empty for project pages with custom breadcrumbs
  
  // Handle exact matches
  for (const route of Object.values(routes)) {
    if (pathname === route.path) {
      return route.name
    }
  }
  
  // Handle partial matches for nested routes
  for (const route of Object.values(routes)) {
    if (pathname.startsWith(route.path)) {
      return route.name
    }
  }
  
  // Default fallback
  return "Page"
}