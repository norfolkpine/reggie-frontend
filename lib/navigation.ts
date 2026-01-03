import {
  BadgeCheck,
  BarChart3,
  BookOpen,
  Calendar,
  Database,
  FileText,
  FolderGit2,
  Inbox,
  LayoutGrid,
  ListChecks,
  MessageSquare,
  Search,
  Shield,
  Workflow,
  Zap,
} from "lucide-react"

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
  // Compliance routes (commented out - might use later)
  // compliance: {
  //   name: "Compliance",
  //   path: "/compliance",
  //   icon: BadgeCheck,
  //   description: "Compliance tools and reporting"
  // },
  // complianceInbox: {
  //   name: "Inbox",
  //   path: "/compliance/inbox",
  //   icon: Inbox,
  //   description: "Compliance inbox"
  // },
  // complianceSchedule: {
  //   name: "Schedule",
  //   path: "/compliance/schedule",
  //   icon: Calendar,
  //   description: "Compliance schedule"
  // },
  // complianceAllTasks: {
  //   name: "All Tasks",
  //   path: "/compliance/all-tasks",
  //   icon: ListChecks,
  //   description: "All compliance tasks"
  // },
  // complianceReports: {
  //   name: "Reports",
  //   path: "/compliance/reports",
  //   icon: BarChart3,
  //   description: "Compliance reporting"
  // },
  // complianceAutomations: {
  //   name: "Automations",
  //   path: "/compliance/automations",
  //   icon: Zap,
  //   description: "Compliance automations"
  // },
  appIntegration: {
    name: "Apps",
    path: "/settings/integrations",
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