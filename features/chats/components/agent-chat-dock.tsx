"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bot, Users, Workflow, X, ChevronDown, ChevronRight, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

type DockTab = "current" | "all" | "workflow"

interface ChatItem {
  id: string
  title: string
  timestamp: string
  agent: string
}

interface ChatSection {
  title: string
  items: ChatItem[]
  expanded: boolean
}

import { useEffect } from "react"
import { getChatSessions, ChatSession } from "@/api/chat-sessions"
import { useRouter } from "next/navigation"

export default function AgentChatDock({
  onSelectChat,
  onNewChat,
}: {
  onSelectChat?: (chatId: string, agentCode?: string | null) => void
  onNewChat?: () => void
}) {
  const [activeTab, setActiveTab] = useState<DockTab | null>("current")
  const [searchQuery, setSearchQuery] = useState("")
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sections, setSections] = useState<ChatSection[]>([])

  const router = useRouter()

  // Fetch chat sessions on mount
  useEffect(() => {
    const fetchChats = async () => {
      setIsLoading(true)
      try {
        const res = await getChatSessions()
        setChatSessions(res.results)
      } catch (e) {
        console.error("Error fetching chat sessions", e)
      }
      setIsLoading(false)
    }
    fetchChats()
  }, [])

  // Build sections based on search & date
  useEffect(() => {
    const filtered = searchQuery.trim()
      ? chatSessions.filter((s) => s.title.toLowerCase().includes(searchQuery.toLowerCase()))
      : chatSessions

    const today: ChatItem[] = []
    const history: ChatItem[] = []
    const nowStr = new Date().toDateString()

    filtered.forEach((s) => {
      const updated = new Date(s.updated_at)
      const chatItem: ChatItem = {
        id: s.session_id,
        title: s.title,
        timestamp:
          updated.toDateString() === nowStr
            ? updated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : updated.toLocaleDateString(),
        agent: s.agent_code || "",
      }
      if (updated.toDateString() === nowStr) {
        today.push(chatItem)
      } else {
        history.push(chatItem)
      }
    })

    const newSections: ChatSection[] = []
    if (today.length) newSections.push({ title: "Today", expanded: true, items: today })
    if (history.length) newSections.push({ title: "History", expanded: true, items: history })
    setSections(newSections)
  }, [chatSessions, searchQuery])

  const dockItems = [
    { id: "current" as DockTab, icon: Bot, label: "Current Agent" },
    { id: "all" as DockTab, icon: Users, label: "All Agents" },
    { id: "workflow" as DockTab, icon: Workflow, label: "Workflow History" },
  ]

  const toggleSection = (index: number) => {
    setSections((prev) =>
      prev.map((section, i) => (i === index ? { ...section, expanded: !section.expanded } : section)),
    )
  }

  const handleTabClick = (tab: DockTab) => {
    if (activeTab === tab) {
      setActiveTab(null) // Minimize
    } else {
      setActiveTab(tab)
    }
  }

  const getTabLabel = (tab: DockTab) => {
    switch (tab) {
      case "current":
        return "Current Agent"
      case "all":
        return "All Agents"
      case "workflow":
        return "Workflow History"
    }
  }

  return (
    <div className="flex bg-gray-50 sticky top-16 self-start h-[calc(100vh_-_64px)]">
      {/* Left Sidebar with Icons */}
      <div className="w-12 bg-white border-r border-gray-200 flex flex-col py-2 overflow-visible">
        {dockItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id

          return (
            <div key={item.id} className="relative group">
              <Button
                onClick={() => handleTabClick(item.id)}
                variant="ghost"
                size="sm"
                className={cn(
                  "w-10 h-10 mx-1 mb-1 rounded-lg flex items-center justify-center",
                  isActive
                    ? "bg-blue-100 text-blue-600 border border-blue-200"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100",
                )}
              >
                <Icon className="w-5 h-5" />
              </Button>

              {/* Tooltip */}
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 pointer-events-none whitespace-nowrap z-50">
                {item.label}
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Main Panel */}
      {activeTab && (
        <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                {(() => {
                  const activeItem = dockItems.find((item) => item.id === activeTab)
                  const Icon = activeItem?.icon || Bot
                  return <Icon className="w-4 h-4 text-blue-600" />
                })()}
              </div>
              <h2 className="font-semibold text-gray-900">{getTabLabel(activeTab)}</h2>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setActiveTab(null)}>
                <X className="w-4 h-4 text-gray-500" />
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-4 border-b border-gray-100">
            <Input
              placeholder="Type to search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Chat History Sections */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {sections.map((section, sectionIndex) => (
              <div key={section.title} className="mb-4">
                <button
                  onClick={() => toggleSection(sectionIndex)}
                  className="flex items-center gap-2 w-full text-left py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  {section.expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  {section.title}
                </button>

                {section.expanded && (
                  <div className="space-y-2 mt-2">
                    {(isLoading ? [] : section.items).map((item) => (
                        <div
                          key={item.id}
                          className="bg-gray-100 rounded-lg p-2 hover:bg-gray-200 cursor-pointer transition-colors duration-150"
                          onClick={() => {
                            if (onSelectChat) {
                              onSelectChat(item.id, item.agent)
                            } else {
                              let url = `/chat/${item.id}`
                              if (item.agent) {
                                const params = new URLSearchParams({ agentId: item.agent })
                                url += `?${params.toString()}`
                              }
                              router.push(url)
                            }
                          }}
                        >
                          <h4 className="font-medium text-sm text-gray-900 mb-1">
                            {item.id === "1"
                              ? "Help with React components"
                              : item.id === "2"
                                ? "Database query optimization"
                                : item.id === "3"
                                  ? "Component state management"
                                  : item.id === "4"
                                    ? "REST API documentation"
                                    : item.id === "5"
                                      ? "Legal contract review"
                                      : "DevOps pipeline setup"}
                          </h4>

                          <div className="mb-1">
                            <span className="inline-block bg-white text-gray-800 text-xs font-medium px-1.5 py-0.5 rounded-full border">
                              {item.title.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {item.timestamp}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      
    </div>
  )
}
