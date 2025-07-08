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
  Database,
  FileText,
  Bot,
  Workflow,
  Shield,
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
import { chatStorage } from "@/lib/utils/chat-storage";


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
      >
    | (() => JSX.Element);
  url: string;
}

interface DividerItem {
  type: "divider";
}

type NavigationItem = ChatItem | DividerItem;

interface HistorySection {
  title: string;
  items: string[];
}

// Update the chats array to include a view property
const chats: ChatItem[] = [
  { name: "Reggie", icon: "🤖", url: "/chat" },
  // { name: "Explore Agents", icon: "🔍", url: "/agent" },
];


const navigationItems: NavigationItem[] = [
  { name: "Assistant", icon: Workflow, url: "/chat" },
  
  {
    name: "Vault",
    icon: FolderShieldIcon,
    url: "/vault",
  },
  { name: "Workflows", icon: Workflow, url: "/workflow" },
  { type: "divider" }, 
  { name: "Library", icon: BookOpen, url: "/library" },
  { name: "Documents", icon: FileText, url: "/documents" },
  {
    name: "Apps",
    icon: LayoutGrid,
    url: "/app-integration",
  },
  { type: "divider" },
  { name: "Knowledge Base (admin)", icon: Database, url: "/knowledge-base" },
];

// const navigationItems: ChatItem[] = [
//   { name: "Assistant", icon: Bot, url: "/chat" },
//   {
//     name: "Vaults",
//     icon: FolderCog,
//     url: "/vault",
//   },
//   { name: "Workflow", icon: GitMerge, url: "/workflow" },
//   { name: "Library", icon: BookOpen, url: "/library" },
//   { name: "Documents", icon: FileText, url: "/documents" },
 
//   {
//     name: "Apps",
//     icon: LayoutGrid,
//     url: "/app-integration",
//   },
//   {
//     name: "Base Knowledge (Admin)",
//     icon: Database,
//     url: "/base-knowledge",
//   },
// ];

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

  // Define navigationItems inside the component so it has access to setCreateProjectOpen
  // Update the navigationItems definition inside the component
  // Change the Projects item to navigate to the projects view instead of opening the dialog

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const handleNavItemClick = (url: string) => {
    // Check if this is the Agents navigation item
    if (url === "/chat") {
      const storedChat = chatStorage.getSelectedChat();
      if (storedChat && storedChat.id && storedChat.agentCode) {
        // Redirect to the stored chat session with agent code
        const params = new URLSearchParams({ agentId: storedChat.agentCode });
        router.push(`/chat/${storedChat.id}?${params.toString()}`);
        return;
      }
    }
    router.push(url);
  };

  const handleChatItemClick = (url: string) => {
    router.push(url);
  };

  const handleHistoryItemClick = (
  sessionId: string,
  agentCode?: string | null
) => {
  let url = `/chat/${sessionId}`;
  if (agentCode) {
    const params = new URLSearchParams({ agentId:agentCode });
    url += `?${params.toString()}`;
  }
  router.push(url);
};

  const renderIcon = (icon?: ChatItem["icon"]) => {
    if (!icon) return null;
    
    if (typeof icon === "string") {
      return icon;
    }
    
    // Handle FolderShieldIcon which is a function component
    if (icon === FolderShieldIcon) {
      return <FolderShieldIcon />;
    }
    
    // Handle Lucide icons which are ForwardRefExoticComponent
    const IconComponent = icon as ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
    return <IconComponent className="h-4 w-4" />;
  };

  const handleCreateProject = async (name: string, description: string) => {
    try {
      await createProject({
        name,
        description: description,
        owner: user?.id,
      });
      if (pathname === "/vault") {
        router.refresh();
      } else {
        router.push("/vault");
      }
      toast({
        title: "Success",
        description: "Project created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create vault. Please try again later.",
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

           

            {/* Navigation items */}
            <div className="space-y-1">
              {/* Update the expanded sidebar navigation items rendering
              // Change the onClick handler to properly handle navigation vs. dialog opening */}

              {navigationItems.map((item, index) => (
                'type' in item ? (
                  <div key={index} className="sidebar-divider"></div>
                ) : (
                  <div
                    key={index}
                    className={`flex items-center justify-between w-full p-2 rounded-md gap-2 font-normal cursor-pointer hover:bg-gray-100 ${pathname === item.url ? "bg-gray-200" : ""}`}
                    onClick={() => handleNavItemClick(item.url)}
                  >
                    <div className="flex items-center gap-2">
                      {renderIcon(item.icon)}
                      <span>{item.name}</span>
                    </div>
                    {item.name === "Vault" && (
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
                )
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-3 space-y-2">
              
            </div>
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
                'type' in item ? (
                  <div key={index} className="sidebar-divider sidebar-divider--collapsed"></div>
                ) : (
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
                    {item.name === "Vault" && (
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
                )
              ))}

              <div className="sidebar-divider sidebar-divider--collapsed"></div>

             
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
