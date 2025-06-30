"use client"

import { useState, useMemo, memo, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bot, Users, Workflow, X, ChevronDown, ChevronRight, Clock, Loader2 } from "lucide-react"
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
  // const [activeTab, setActiveTab] = useState<DockTab | null>("current") // Keep for potential future filtering logic
  const [searchQuery, setSearchQuery] = useState("")
  const [sections, setSections] = useState<ChatSection[]>([])

  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  const router = useRouter()
  // Ensure useChatSessionContext is correctly providing these values
  const { chatSessions = [], isLoading = false, page = 1, hasMore = false, setPage = () => {} } = useChatSessionContext()

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
        agent: s.agent_code || "", // Ensure agent_code is available
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

  // Commenting out dockItems and related logic for now to simplify to always-visible
  // const dockItems = useMemo(() => [
  //   { id: "current" as DockTab, icon: Bot, label: "Current Agent" },
  //   { id: "all" as DockTab, icon: Users, label: "All Agents" },
  //   { id: "workflow" as DockTab, icon: Workflow, label: "Workflow History" },
  // ], []);

  const toggleSection = (index: number) => {
    setSections((prev) =>
      prev.map((section, i) => (i === index ? { ...section, expanded: !section.expanded } : section)),
    )
  }

  // const handleTabClick = (tab: DockTab) => {
  //   if (activeTab === tab) {
  //     setActiveTab(null) // Minimize
  //   } else {
  //     setActiveTab(tab)
  //   }
  // }

  // const getTabLabel = (tab: DockTab) => {
  //   // ...
  // }

  return (
    // Removed sticky positioning, height, and flex from the outermost div.
    // These will be controlled by ResizablePanel in the parent.
    // Added border-r to match chat interface styling
    <div className="bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header - Simplified for always-on history */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-600" /> {/* Default icon */}
          <h2 className="font-semibold text-gray-900">Chat History</h2>
        </div>
        {/* Optional: Add a button for new chat here if needed, or rely on parent */}
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-gray-100">
        <Input
          placeholder="Search history..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Chat History Sections */}
      {/* Added flex-1 to make this section scrollable and fill available space */}
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
                {(isLoading && page === 1 ? [] : section.items).map((item, itemIndex) => ( // Changed page == 1 to page === 1
                    <div
                      key={`chat ${item.id}-${itemIndex}`} // More unique key
                      className="bg-gray-100 rounded-lg p-3 hover:bg-gray-200 cursor-pointer transition-colors duration-150" // Increased padding
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
                      <h4 className="font-medium text-sm text-gray-900 mb-1 truncate"> {/* Added truncate */}
                      {item.title.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </h4>

                      {item.agent && ( // Display agent only if available
                        <div className="mb-1">
                          <span className="inline-block bg-white text-gray-800 text-xs font-medium px-1.5 py-0.5 rounded-full border">
                            {item.agent.split('-').pop()?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                          </span>
                        </div>
                      )}

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
         {isLoading && sections.length === 0 && page === 1 && ( // Show loader when initially loading and no sections yet
          Array.from({ length: 5 }).map((_, index) => (
            <div key={`skeleton-${index}`} className="bg-gray-100 rounded-lg p-3 mb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))
        )}
      </div>

      {isLoading && page > 1 && ( // Loader for infinite scroll
        <div className="flex justify-center items-center py-4">
          <Loader2 className="animate-spin text-gray-400 w-6 h-6" />
        </div>
      )}
    </div>
  )
});

export default AgentChatDock;
