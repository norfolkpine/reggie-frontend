import { RouteKey } from "@/lib/navigation"
import { LucideIcon } from "lucide-react"

export interface NavigationItem {
  name: string
  icon: LucideIcon
  view: RouteKey
}

export interface ChatItem {
  name: string
  icon: string
  view: RouteKey
}

export interface HistorySection {
  title: string
  items: string[]
}

export interface SidebarHeaderProps {
  isExpanded: boolean
  onToggle: () => void
  onNewChat: () => void
}

export interface SidebarNavProps {
  navigationItems: NavigationItem[]
  activeView: string
  isExpanded: boolean
  onNavItemClick: (route: RouteKey) => void
  onCreateProjectClick: () => void
}

export interface SidebarChatsProps {
  chats: ChatItem[]
  activeView: string
  isExpanded: boolean
  onChatItemClick: (route: RouteKey) => void
}