"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Bot, Users, Workflow, MessageSquare, Clock, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

type DockTab = "current" | "all" | "workflow"

interface ChatItem {
  id: string
  title: string
  timestamp: string
  agent: string
}

export default function VerticalAgentDock() {
  const [activeTab, setActiveTab] = useState<DockTab | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  const dockItems = [
    {
      id: "current" as DockTab,
      icon: Bot,
      label: "Current Agent",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      id: "all" as DockTab,
      icon: Users,
      label: "All Agent",
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      id: "workflow" as DockTab,
      icon: Workflow,
      label: "Workflow History",
      color: "bg-purple-500 hover:bg-purple-600",
    },
  ]

  const chatHistory = {
    current: [
      { id: "1", title: "Code Review Assistant", timestamp: "2 hours ago", agent: "GPT-4" },
      { id: "2", title: "Database Query Helper", timestamp: "4 hours ago", agent: "Claude" },
      { id: "3", title: "API Documentation", timestamp: "6 hours ago", agent: "GPT-4" },
    ],
    all: [
      { id: "4", title: "React Component Builder", timestamp: "Yesterday", agent: "GPT-4" },
      { id: "5", title: "Testing Strategy", timestamp: "Yesterday", agent: "Claude" },
      { id: "6", title: "Performance Optimization", timestamp: "2 days ago", agent: "Gemini" },
      { id: "7", title: "Security Audit", timestamp: "3 days ago", agent: "GPT-4" },
    ],
    workflow: [
      { id: "8", title: "Deployment Pipeline", timestamp: "Today", agent: "Workflow Bot" },
      { id: "9", title: "CI/CD Setup", timestamp: "Yesterday", agent: "DevOps Agent" },
      { id: "10", title: "Code Analysis", timestamp: "2 days ago", agent: "Analysis Bot" },
    ],
  }

  const handleDockItemClick = (tabId: DockTab) => {
    if (activeTab === tabId && isExpanded) {
      // Minimize if clicking the same active tab
      setIsExpanded(false)
      setActiveTab(null)
    } else {
      // Expand and set active tab
      setActiveTab(tabId)
      setIsExpanded(true)
    }
  }

  const getCurrentChatHistory = (): ChatItem[] => {
    if (!activeTab) return []
    return chatHistory[activeTab] || []
  }

  return (
    <div className="flex h-screen">
      {/* Vertical Dock */}
      <div className="w-12 bg-gray-900 flex flex-col items-center py-4 space-y-3">
        {dockItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id

          return (
            <div key={item.id} className="relative group">
              <Button
                onClick={() => handleDockItemClick(item.id)}
                className={cn(
                  "w-8 h-8 rounded-lg transition-all duration-200 flex items-center justify-center",
                  isActive ? `${item.color} scale-110 shadow-lg` : "bg-gray-700 hover:bg-gray-600 hover:scale-105",
                )}
                size="sm"
              >
                <Icon className="w-4 h-4 text-white" />
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

      {/* Expandable Panel */}
      <div
        className={cn(
          "bg-white border-r border-gray-200 transition-all duration-300 ease-in-out overflow-hidden",
          isExpanded ? "w-80" : "w-0",
        )}
      >
        {isExpanded && activeTab && (
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                {(() => {
                  const activeItem = dockItems.find((item) => item.id === activeTab)
                  const Icon = activeItem?.icon || Bot
                  return <Icon className="w-5 h-5 text-gray-600" />
                })()}
                <h2 className="font-semibold text-gray-900">
                  {dockItems.find((item) => item.id === activeTab)?.label}
                </h2>
              </div>
            </div>

            {/* Chat History List */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                {getCurrentChatHistory().map((chat) => (
                  <div
                    key={chat.id}
                    className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{chat.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {chat.timestamp}
                          </span>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {chat.agent}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </div>

              {getCurrentChatHistory().length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No chat history found</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <Bot className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <h2 className="text-xl font-semibold mb-2">Agent Chat History</h2>
          <p className="text-sm">Click on the dock icons to view chat history</p>
        </div>
      </div>
    </div>
  )
}
