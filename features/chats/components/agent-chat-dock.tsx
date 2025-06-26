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

export default function AgentChatDock() {
  const [activeTab, setActiveTab] = useState<DockTab | null>("current")
  const [searchQuery, setSearchQuery] = useState("")
  const [sections, setSections] = useState<ChatSection[]>([
    {
      title: "Today",
      expanded: true,
      items: [
        { id: "1", title: "Code Helper", timestamp: "Just now", agent: "GPT-4" },
        { id: "2", title: "Database Assistant", timestamp: "2 hours ago", agent: "Claude" },
      ],
    },
    {
      title: "History",
      expanded: true,
      items: [
        { id: "3", title: "React Expert", timestamp: "Yesterday", agent: "GPT-4" },
        { id: "4", title: "API Documentation", timestamp: "2 days ago", agent: "Claude" },
        { id: "5", title: "Legal Assistant", timestamp: "3 days ago", agent: "Workflow Bot" },
        { id: "6", title: "DevOps Helper", timestamp: "1 week ago", agent: "DevOps Agent" },
      ],
    },
  ])

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
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar with Icons */}
      <div className="w-12 bg-white border-r border-gray-200 flex flex-col py-2">
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
              <div className="absolute left-12 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                {item.label}
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-800 rotate-45"></div>
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
                    {section.items
                      .filter((item) =>
                        searchQuery ? item.title.toLowerCase().includes(searchQuery.toLowerCase()) : true,
                      )
                      .map((item) => (
                        <div
                          key={item.id}
                          className="bg-gray-100 rounded-lg p-2 hover:bg-gray-200 cursor-pointer transition-colors duration-150"
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
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <Bot className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <h2 className="text-xl font-semibold mb-2">Agent Chat History</h2>
          <p className="text-sm">Select an option from the sidebar to view chat history</p>
        </div>
      </div>
    </div>
  )
}
