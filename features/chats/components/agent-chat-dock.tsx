"use client"

import { useState, useMemo, memo, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Bot, Users, Workflow, X, ChevronDown, ChevronRight, Clock, Loader2, Plus, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useChatSessionContext } from "../ChatSessionContext"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter, usePathname } from "next/navigation"

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

const AgentChatDock = memo(function AgentChatDock({
  onSelectChat,
  onNewChat,
  selectedSessionId: selectedSessionIdProp,
  isMobile = false,
  onClose,
  currentAgentId,
}: {
  onSelectChat?: (chatId: string, agentCode?: string | null) => void
  onNewChat?: () => void
  selectedSessionId?: string
  isMobile?: boolean
  onClose?: () => void
  currentAgentId?: string
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sections, setSections] = useState<ChatSection[]>([])
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")

  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  const router = useRouter()
  const pathname = usePathname()
  // Extract session id from URL if not provided as prop
  let selectedSessionId = selectedSessionIdProp
  if (!selectedSessionId) {
    const match = pathname.match(/\/chat\/(\w+)/)
    if (match) {
      selectedSessionId = match[1]
    }
  }
  const { chatSessions, isLoading, page, hasMore, setPage, deleteSession, renameSession } = useChatSessionContext()

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

  // Set default tab for mobile when dock opens
  useEffect(() => {
    if (isMobile && !activeTab) {
      setActiveTab("all")
    }
  }, [isMobile, activeTab])

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
    let filtered = chatSessions

    // Filter by current agent if activeTab is "current" and currentAgentId is provided
    if (activeTab === "current" && currentAgentId) {
      filtered = filtered.filter((s) => s.agent_code === currentAgentId)
    }

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((s) => s.title.toLowerCase().includes(searchQuery.toLowerCase()))
    }

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
  }, [chatSessions, searchQuery, activeTab, currentAgentId])

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

  const handleRename = (sessionId: string, currentTitle: string) => {
    setEditingSessionId(sessionId)
    setEditingTitle(currentTitle)
  }

  const handleRenameSave = async () => {
    if (editingSessionId && editingTitle.trim()) {
      await renameSession(editingSessionId, editingTitle.trim())
      setEditingSessionId(null)
      setEditingTitle("")
    }
  }

  const handleRenameCancel = () => {
    setEditingSessionId(null)
    setEditingTitle("")
  }

  const handleDelete = async (sessionId: string) => {
    await deleteSession(sessionId)
  }

  return (
    <div className={`${isMobile ? 'flex flex-col h-full' : 'flex bg-background sticky top-16 self-start h-full'}`}>
      {/* Left Sidebar with Icons - hidden on mobile */}
      {!isMobile && (
        <div className="w-12 bg-card border-r border-border flex flex-col py-2 overflow-visible">
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
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent",
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-popover border-border text-popover-foreground text-xs px-2 py-1 shadow-sm">
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )
        })}
        </div>
      )}

      {/* Main Panel */}
      {activeTab && (
        <div className={`${isMobile ? 'w-full flex-1' : 'w-96'} bg-card ${!isMobile ? 'border-r border-border' : ''} flex flex-col`}>
          {/* Header */}
          <div className="flex items-center justify-between p-2 border-b border-border">
            <div className="flex items-center gap-2">
              {/* <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                {(() => {
                  const activeItem = dockItems.find((item) => item.id === activeTab)
                  const Icon = activeItem?.icon || Bot
                  return <Icon className="w-4 h-4 text-blue-600" />
                })()}
              </div> */}
              <h2 className="font-semibold text-foreground">
                {activeTab ? getTabLabel(activeTab) : 'Chat History'}
              </h2>
            </div>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={() => isMobile ? onClose?.() : setActiveTab(null)}
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </Button>
            </div>
          </div>

          {/* Mobile Tab Navigation */}
          {isMobile && (
            <div className="w-full bg-card border-b border-border flex-shrink-0">
              <div className="flex overflow-x-auto">
                {dockItems.map((item) => {
                  const Icon = item.icon
                  const isActive = activeTab === item.id

                  return (
                    <button
                      key={`mobile-tab-${item.id}`}
                      onClick={() => handleTabClick(item.id)}
                      className={cn(
                        "flex-1 min-w-0 flex flex-col items-center justify-center py-3 px-1 sm:px-2 text-xs font-medium transition-colors whitespace-nowrap",
                        isActive
                          ? "bg-primary/10 text-primary border-b-2 border-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      )}
                    >
                      <Icon className="w-4 h-4 mb-1 flex-shrink-0" />
                      <span className="truncate text-center">{item.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* New Chat Button & Search Bar */}
          <div className="p-2 sm:p-3 border-b border-border">
            <Button
              onClick={() => {
                console.log("New Chat button clicked");
                if (onNewChat) {
                  onNewChat();
                } else {
                  console.log("onNewChat function not provided");
                }
                // Close mobile dock when new chat is created
                if (isMobile) {
                  onClose?.();
                }
              }}
              className="w-full bg-card hover:bg-accent text-foreground hover:text-foreground justify-start mb-2 h-9 sm:h-10 font-medium shadow-sm hover:shadow-md transition-all duration-200 border border-border rounded-lg"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2 text-muted-foreground" />
              <span className="truncate">New Chat</span>
            </Button>
            <Input
              placeholder="Type to search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 sm:h-10"
            />
          </div>

          {/* Chat History Sections */}
          <div className="flex-1 overflow-y-auto px-1 sm:px-2 pb-4" onScroll={handleScroll}>
            {sections.map((section, sectionIndex) => (
              <div key={section.title} className="mb-4">
                <button
                  onClick={() => toggleSection(sectionIndex)}
                  className="flex items-center gap-2 w-full text-left py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  {section.expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  {section.title}
                </button>

                {section.expanded && (
                  <div className="space-y-2 mt-2">
                    {(isLoading && page == 1 ? [] : section.items).map((item, itemIndex) => (
                        <div
                          key={`chat ${item.id} ${itemIndex}`}
                          className={cn(
                            "rounded-lg p-2 sm:p-3 transition-colors duration-150 group relative",
                            (selectedSessionId === item.id || editingSessionId === item.id) ? "bg-accent" : "",
                    "hover:bg-accent"
                          )}
                        >
                          {/* Main content area */}
                          <div
                            className="cursor-pointer"
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
                            {editingSessionId === item.id ? (
                              <div className="mb-1">
                                <Input
                                  value={editingTitle}
                                  onChange={(e) => setEditingTitle(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleRenameSave()
                                    } else if (e.key === 'Escape') {
                                      handleRenameCancel()
                                    }
                                  }}
                                  onBlur={handleRenameSave}
                                  className="text-sm font-medium text-foreground mb-1"
                                  autoFocus
                                />
                              </div>
                            ) : (
                              <h4 className="font-medium text-sm sm:text-base text-foreground mb-1 line-clamp-2">
                                {item.title.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                              </h4>
                            )}

                            <div className="mb-1">
                              <span className="inline-block bg-card text-foreground text-xs font-medium px-2 py-1 rounded-full border border-border">
                                {item.agent && item.agent.split('-').pop()?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{item.timestamp}</span>
                            </div>
                          </div>

                          {/* Three dots menu */}
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 hover:bg-accent"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleRename(item.id, item.title)
                                  }}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Rename
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDelete(item.id)
                                  }}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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
              <Loader2 className="animate-spin text-muted-foreground w-6 h-6" />
            </div>
          )}
        </div>
      )}

      {/* Main Content Area */}
     
      
    </div>
  )
});

export default AgentChatDock;
