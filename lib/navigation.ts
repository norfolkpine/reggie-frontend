import { BookOpen, FolderGit2, MessageSquare, Search } from "lucide-react"

export type Route = {
  name: string
  path: string
  icon?: any
  description?: string
}

export const routes = {
  chat: {
    name: "Chat",
    path: "/",
    icon: MessageSquare,
    description: "Start a new chat session"
  },
  library: {
    name: "Library",
    path: "/library",
    icon: BookOpen,
    description: "Browse your saved resources"
  },
  projects: {
    name: "Projects",
    path: "/project",
    icon: FolderGit2,
    description: "Manage your projects"
  },
  exploreAgents: {
    name: "Explore Agents",
    path: "/explore-agents",
    icon: Search,
    description: "Discover AI agents"
  }
} as const

export type RouteKey = keyof typeof routes