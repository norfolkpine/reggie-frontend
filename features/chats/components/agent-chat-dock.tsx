"use client"

import { useState, useMemo, memo, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Bot, Users, Workflow, X, ChevronDown, ChevronRight, Clock, Loader2, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useChatSessionContext } from "../ChatSessionContext"

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

import { useRouter } from "next/navigation"

const AgentChatDock = memo(function AgentChatDock({
  onSelectChat,
  onNewChat,
}: {
  onSelectChat?: (chatId: string, agentCode?: string | null) => void
  onNewChat?: () => void
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sections, setSections] = useState<ChatSection[]>([])

  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  const router = useRouter()
  const { chatSessions, isLoading, page, hasMore,setPage } = useChatSessionContext()

  // Load dock state from localStorage on mount
  const [activeTab, setActiveTab] = useState<DockTab | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chat-dock-state')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          return parsed.activeTab || null
        } catch (e) {
          console.error('Error parsing saved dock state:', e)
        }
      }
    }
    return null
  })

  // Save dock state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chat-dock-state', JSON.stringify({ activeTab }))
    }
  }, [activeTab])

  // Handler for infinite scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const threshold = 24; // px
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
  
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }
  
    scrollTimeout.current = setTimeout(() => {
      if (scrollTop + clientHeight >= scrollHeight - threshold && !isLoading && hasMore) {
        setPage(page + 1);
      }
    }, 200); 
  };

  // Memoize sections based on search & date
  const memoizedSections = useMemo(() => {
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
    return newSections
  }, [chatSessions, searchQuery])

  // Update sections state when memoizedSections changes
  useEffect(() => {
    setSections(memoizedSections)
  }, [memoizedSections])

  const dockItems = useMemo(() => [
    { id: "current" as DockTab, icon: Bot, label: "Current Agent" },
    { id: "all" as DockTab, icon: Users, label: "All Agents" },
    { id: "workflow" as DockTab, icon: Workflow, label: "Workflow History" },
  ], []);

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
            <div key={`button ${item.id}`} className="relative group">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
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
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-50 border-gray-200 text-gray-700 text-xs px-2 py-1 shadow-sm">
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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

          {/* New Chat Button & Search Bar */}
          <div className="p-4 border-b border-gray-100">
            <Button
              onClick={() => {
                console.log("New Chat button clicked");
                if (onNewChat) {
                  onNewChat();
                } else {
                  console.log("onNewChat function not provided");
                }
              }}
              className="w-full bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 justify-start mb-4 h-9 font-medium shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 rounded-lg"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2 text-gray-500" />
              New Chat
            </Button>
            <Input
              placeholder="Type to search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Chat History Sections */}
          <div className="flex-1 overflow-y-auto px-4 pb-4" onScroll={handleScroll}>
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
                    {(isLoading && page == 1 ? [] : section.items).map((item, itemIndex) => (
                        <div
                          key={`chat ${item.id} ${itemIndex}`}
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
                          {item.title.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                          </h4>

                          <div className="mb-1">
                            <span className="inline-block bg-white text-gray-800 text-xs font-medium px-1.5 py-0.5 rounded-full border">
                              {item.agent && item.agent.split('-').pop()?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
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

          {isLoading && page > 1 && (
            <div className="flex justify-center items-center py-4">
              <Loader2 className="animate-spin text-gray-400 w-6 h-6" />
            </div>
          )}
        </div>
      )}

      {/* Main Content Area */}
     
      
    </div>
  )
});

export default AgentChatDock;
