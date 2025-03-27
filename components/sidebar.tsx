"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  FolderGit2,
  Plus,
  MoreHorizontal,
  Star,
  Trash,
  Share2,
  Edit,
  MessageSquare,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Import the TeamSwitcher component at the top of the file
import { TeamSwitcher } from "@/components/team-switcher"
import { CreateProjectDialog } from "@/components/create-project-dialog"

interface ChatItem {
  name: string
  icon?: string
  color?: string
  view?: string
}

interface HistorySection {
  title: string
  items: string[]
}

// Update the chats array to include a view property
const chats: ChatItem[] = [
  { name: "ChatGPT", icon: "🤖", view: "chat" },
  { name: "Explore Agents", icon: "🔍", view: "explore-agents" },
]

const projects = ["Databricks"]

const historySections: HistorySection[] = [
  {
    title: "Today",
    items: ["Machine Learning Basics", "Website Design Tips"],
  },
  {
    title: "Yesterday",
    items: ["JavaScript Frameworks", "Data Visualization Guide"],
  },
  {
    title: "Previous 7 Days",
    items: ["Python vs JavaScript", "Cloud Computing Overview", "UI/UX Design Principles"],
  },
]

// Update the sidebar component to handle chat item clicks
export default function Sidebar({ onViewChange, activeView } : {
  onViewChange: (view: string) => void,
  activeView: string,
}) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [activeHistoryItem, setActiveHistoryItem] = useState<string | null>(null)
  const [hoveredHistoryItem, setHoveredHistoryItem] = useState<string | null>(null)
  const [createProjectOpen, setCreateProjectOpen] = useState(false)

  // Define navigationItems inside the component so it has access to setCreateProjectOpen
  // Update the navigationItems definition inside the component
  // Change the Projects item to navigate to the projects view instead of opening the dialog

  const navigationItems = [
    { name: "Library", icon: BookOpen, view: "library" },
    {
      name: "Projects",
      icon: FolderGit2,
      view: "projects",
      // Remove the onClick handler here so clicking the item navigates to the view
    },
  ]

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded)
  }

  const handleNavItemClick = (view: string) => {
    onViewChange(view)
  }

  const handleChatItemClick = (view: string) => {
    onViewChange(view)
  }

  const handleHistoryItemClick = (item: string) => {
    setActiveHistoryItem(item)
    onViewChange("chat") // Switch to chat view when clicking a history item
  }

  const handleCreateProject = (name: string) => {
    // In a real app, this would make an API call
    console.log("Creating project:", name)
  }

  return (
    <div
      className={cn(
        "h-full border-r border-border flex flex-col bg-gray-50 transition-all duration-300",
        isExpanded ? "w-64" : "w-16",
      )}
    >
      {isExpanded ? (
        // Expanded sidebar content
        <div className="flex flex-col h-full">
          <div className="p-3 flex flex-col gap-3">
            {/* Header with logo and collapse button */}
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xl">Reggie</span>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                title="Minimize sidebar"
                onClick={toggleSidebar}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>

            {/* New Chat button */}
            <Button
              variant="outline"
              className="w-full justify-center font-medium"
              onClick={() => onViewChange("chat")}
            >
              New Chat
            </Button>

            {/* Navigation items */}
            <div className="space-y-1">
              {/* Update the expanded sidebar navigation items rendering
              // Change the onClick handler to properly handle navigation vs. dialog opening */}

              {navigationItems.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between w-full p-2 rounded-md gap-2 font-normal cursor-pointer hover:bg-gray-100 ${activeView === item.view ? "bg-gray-200" : ""}`}
                  onClick={() => handleNavItemClick(item.view)}
                >
                  <div className="flex items-center gap-2">
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </div>
                  {item.name === "Projects" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-full hover:bg-gray-300"
                      onClick={(e) => {
                        e.stopPropagation()
                        setCreateProjectOpen(true)
                      }}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-3 space-y-2">
              {/* In the expanded sidebar section, update the chat items rendering: */}
              {chats.map((chat, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-2 rounded-lg hover:bg-gray-200 cursor-pointer ${activeView === chat.view ? "bg-gray-200" : ""}`}
                  onClick={() => handleChatItemClick(chat.view ?? '')}
                >
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-300 text-xs">
                    {chat.icon}
                  </div>
                  <span className="text-sm">{chat.name}</span>
                </div>
              ))}
            </div>

            {historySections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="px-3 py-2">
                <h3 className="text-xs font-medium mb-2">{section.title}</h3>
                {section.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className={`flex items-center justify-between p-2 rounded-lg hover:bg-gray-200 cursor-pointer ${
                      activeHistoryItem === item ? "bg-gray-200" : ""
                    }`}
                    onClick={() => handleHistoryItemClick(item)}
                    onMouseEnter={() => setHoveredHistoryItem(item)}
                    onMouseLeave={() => setHoveredHistoryItem(null)}
                  >
                    <span className="text-sm truncate flex-1">{item}</span>

                    {/* Three dots menu for Machine Learning Basics */}
                    {item === "Machine Learning Basics" &&
                      (hoveredHistoryItem === item || activeHistoryItem === item) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem className="cursor-pointer">
                              <MessageSquare className="h-4 w-4 mr-2" />
                              <span>Continue Chat</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                              <Star className="h-4 w-4 mr-2" />
                              <span>Add to Favorites</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                              <Edit className="h-4 w-4 mr-2" />
                              <span>Rename</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                              <Share2 className="h-4 w-4 mr-2" />
                              <span>Share</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer text-red-600">
                              <Trash className="h-4 w-4 mr-2" />
                              <span>Delete from History</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-border">
            <TeamSwitcher />
          </div>
        </div>
      ) : (
        // Minimized sidebar content
        <div className="flex flex-col h-full">
          <div className="p-3 flex flex-col items-center gap-3">
            {/* Logo and collapse button */}
            <div className="flex items-center justify-between w-full">
              <span className="font-semibold">R</span>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                title="Expand sidebar"
                onClick={toggleSidebar}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Plus button (New Chat) */}
            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-10 h-10"
              title="New Chat"
              onClick={() => onViewChange("chat")}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto py-2">
            <div className="flex flex-col items-center space-y-4">
              {/* Navigation items */}
              {/* Update the collapsed sidebar navigation items rendering
              // Change the onClick handler to properly handle navigation */}

              {navigationItems.map((item, index) => (
                <div key={index} className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`rounded-full w-10 h-10 ${activeView === item.view ? "bg-gray-200" : ""}`}
                    title={item.name}
                    onClick={() => handleNavItemClick(item.view)}
                  >
                    <item.icon className="h-5 w-5" />
                  </Button>
                  {item.name === "Projects" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-gray-100 hover:bg-gray-300"
                      onClick={(e) => {
                        e.stopPropagation()
                        setCreateProjectOpen(true)
                      }}
                      title="Create new project"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}

              <div className="w-8 border-t border-gray-300 my-2"></div>

              {/* Chat items */}
              {chats.map((chat, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-center w-10 h-10 rounded-full bg-gray-300 text-lg cursor-pointer hover:bg-gray-400 ${activeView === chat.view ? "ring-2 ring-primary" : ""}`}
                  title={chat.name}
                  onClick={() => handleChatItemClick(chat.view ?? '')}
                >
                  {chat.icon}
                </div>
              ))}
            </div>

            {/* Add TeamSwitcher at the bottom of the sidebar */}
            <div className="flex justify-center mt-4">
              <TeamSwitcher isCollapsed={true} />
            </div>
          </div>
        </div>
      )}
      <CreateProjectDialog
        open={createProjectOpen}
        onOpenChange={setCreateProjectOpen}
        onCreateProject={handleCreateProject}
      />
    </div>
  )
}

