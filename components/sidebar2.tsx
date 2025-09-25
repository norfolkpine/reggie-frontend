"use client";

import {
  ForwardRefExoticComponent,
  JSX,
  RefAttributes,
  useEffect,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  FolderGit2,
  Folder,
  Plus,
  MoreHorizontal,
  Star,
  Trash,
  Share2,
  Edit,
  MessageSquare,
  LucideProps,
  LayoutGrid,
  FileText,
  Database,
  Shield,
  Workflow,
  Bot
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Import the TeamSwitcher component at the top of the file
import { TeamSwitcher } from "@/components/team/team-switcher";
import { CreateProjectDialog } from "@/features/vault/components/create-project-dialog";
import { usePathname, useRouter } from "next/navigation";
import { createProject } from "@/api/projects";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "./ui/use-toast";
import { ChatSession, getChatSessions } from "@/api/chat-sessions";
import { IconBubble, IconMenu } from "@tabler/icons-react";
import { useChatSessionContext } from "@/features/chats/ChatSessionContext";
import { Input } from "@/components/ui/input";


const FolderShieldIcon = () => (
  // If larger, all icons should be made larger (larger looks better)
  <div className="relative w-4 h-4">
    <Folder className="text-muted-foreground w-4 h-4" />
    <Shield className="absolute bottom-0 right-0 w-2 h-2 text-green-600 bg-white rounded-full" />
  </div>
);

interface ChatItem {
  name: string;
  icon?:
    | string
    | ForwardRefExoticComponent<
        Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
      >;
  url: string;
}

interface HistorySection {
  title: string;
  items: string[];
}

// Update the chats array to include a view property
const chats: ChatItem[] = [
  { name: "Remove chat history from here", icon: "🤖", url: "/chat" },
];

const navigationItems: (ChatItem | { type: "divider" })[] = [
  {
    name: "Vault",
    icon: FolderShieldIcon,
    url: "/project",
  },
  { name: "Workflows", icon: Workflow, url: "/agent" },
  { type: "divider" }, 
  { name: "Library", icon: BookOpen, url: "/library" },
  { name: "Documents", icon: FileText, url: "/documents" },

  { type: "divider" }, 
  { name: "Knowledge Base (admin)", icon: Database, url: "/knowledge-base" },
];


// Update the sidebar component to handle chat item clicks
export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(true);

  const [hoveredHistoryItem, setHoveredHistoryItem] = useState<string | null>(
    null
  );
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  // Use ChatSessionContext instead of manual fetching
  const { chatSessions, deleteSession, renameSession } = useChatSessionContext();

  // Define navigationItems inside the component so it has access to setCreateProjectOpen
  // Update the navigationItems definition inside the component
  // Change the Projects item to navigate to the projects view instead of opening the dialog

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const handleNavItemClick = (url: string) => {
    router.push(url);
  };

  const handleChatItemClick = (url: string) => {
    router.push(url);
  };

  const handleHistoryItemClick = (sessionId: string) => {
    router.push(`/chat/${sessionId}`);
  };

  const handleRename = (sessionId: string, currentTitle: string) => {
    setEditingSessionId(sessionId);
    setEditingTitle(currentTitle);
  };

  const handleRenameSave = async () => {
    if (editingSessionId && editingTitle.trim()) {
      await renameSession(editingSessionId, editingTitle.trim());
      setEditingSessionId(null);
      setEditingTitle("");
    }
  };

  const handleRenameCancel = () => {
    setEditingSessionId(null);
    setEditingTitle("");
  };

  const handleDelete = async (sessionId: string) => {
    await deleteSession(sessionId);
  };

  const renderIcon = (icon: ChatItem["icon"]) => {
    if (typeof icon === "string") {
      return icon;
    }
    const IconComponent = icon;
    return IconComponent ? <IconComponent className="h-4 w-4" /> : null;
  };

  const handleCreateProject = async (name: string, description: string) => {
    try {
      await createProject({
        name,
        description: description,
        owner: user?.id,
      });
      if (pathname === "/project") {
        router.refresh();
      } else {
        router.push("/project");
      }
      toast({
        title: "Success",
        description: "Project created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create project. Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <div
      className={cn(
        "h-full border-r border-border flex flex-col bg-gray-50 transition-all duration-300",
        isExpanded ? "w-64" : "w-16"
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
              onClick={() => router.push("/chat")}
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
                  className={`flex items-center justify-between w-full p-2 rounded-md gap-2 font-normal cursor-pointer hover:bg-gray-100 ${pathname === item.url ? "bg-gray-200" : ""}`}
                  onClick={() => handleNavItemClick(item.url)}
                >
                  <div className="flex items-center gap-2">
                    {renderIcon(item.icon)}
                    <span>{item.name}</span>
                  </div>
                  {item.name === "Projects" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-full hover:bg-gray-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCreateProjectOpen(true);
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
                  className={`flex items-center gap-3 p-2 rounded-lg hover:bg-gray-200 cursor-pointer ${pathname === chat.url ? "bg-gray-200" : ""}`}
                  onClick={() => handleChatItemClick(chat.url)}
                >
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-300 text-xs">
                    {renderIcon(chat.icon)}
                  </div>
                  <span className="text-sm">{chat.name}</span>
                </div>
              ))}
            </div>

            {/* {historySections.map((section, sectionIndex) => ( */}
            <div className="px-3 py-2">
              {chatSessions.length > 0 && (
                <h3 className="text-xs font-medium mb-2">History</h3>
              )}
              {chatSessions.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  className={`flex items-center justify-between p-2 rounded-lg hover:bg-gray-200 cursor-pointer ${pathname === `/chat/${item.session_id}` ? "bg-gray-200" : ""}`}
                  onClick={() => handleHistoryItemClick(item.session_id)}
                  onMouseEnter={() => setHoveredHistoryItem(item.session_id)}
                  onMouseLeave={() => setHoveredHistoryItem(null)}
                >
                  {editingSessionId === item.session_id ? (
                    <Input
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleRenameSave();
                        } else if (e.key === 'Escape') {
                          handleRenameCancel();
                        }
                      }}
                      onBlur={handleRenameSave}
                      className="text-sm flex-1 mr-2"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span className="text-sm truncate flex-1">{item.title}</span>
                  )}

                  {hoveredHistoryItem === item.session_id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem 
                          className="cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleHistoryItemClick(item.session_id);
                          }}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          <span>Continue Chat</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRename(item.session_id, item.title);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          <span>Rename</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="cursor-pointer text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.session_id);
                          }}
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          <span>Delete from History</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ))}
            </div>
            {/* ))} */}
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

            {/* Plus button (New Chat) in collapsed view */}
            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-10 h-10"
              title="New Chat"
              onClick={() => router.push("/chat")}
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
                    className={`rounded-full w-10 h-10 ${
                      pathname.includes(item.url) ? "bg-gray-200" : ""
                    }`}
                    title={item.name}
                    onClick={() => handleNavItemClick(item.url)}
                  >
                    {renderIcon(item.icon)}
                  </Button>
                  {item.name === "Projects" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-gray-100 hover:bg-gray-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCreateProjectOpen(true);
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
              {chatSessions.map((chat, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-center w-10 h-10 rounded-full bg-gray-300 text-lg cursor-pointer hover:bg-gray-400 ${pathname === chat.session_id ? "ring-2 ring-primary" : ""}`}
                  title={chat.title}
                  onClick={() => handleChatItemClick(chat.session_id ?? "")}
                >
                  {/* {renderIcon(chat.icon)} */}
                  <IconBubble size={16} />
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
  );
}
