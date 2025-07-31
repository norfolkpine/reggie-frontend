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
  ChevronDown,
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
import { ChatSession, getChatSessions, createChatSession, getChatSession } from "@/api/chat-sessions";
import { IconBubble, IconMenu } from "@tabler/icons-react";
import { chatStorage } from "@/lib/utils/chat-storage";
import { getProjects, updateProject, deleteProject, updateProjectSessionId } from "@/api/projects";
import { Project } from "@/types/api";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useDocs, useInfiniteDocs } from "@/features/docs/doc-management/api/useDocs";
import { useCreateDoc } from "@/features/docs/doc-management/api/useCreateDoc";
import { useUpdateDoc } from "@/features/docs/doc-management/api/useUpdateDoc";
import { useRemoveDoc } from "@/features/docs/doc-management/api/useRemoveDoc";
import { Doc } from "@/features/docs/doc-management/types";
import { useProjects } from "@/features/vault/api/useProjects";
import { useChatSessionContext } from "@/features/chats/ChatSessionContext";

// Default agent ID to use for new conversations
const DEFAULT_AGENT_ID = "o-9b9bdc247-reggie";

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
  // SuperUser Only. Future feature: Allow and restrict for Enterprise users 
  { name: "Knowledge Base", icon: Database, url: "/knowledge-base" },
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
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const { refresh } = useChatSessionContext();
  const [isExpanded, setIsExpanded] = useState(true);
  const [projectsExpanded, setProjectsExpanded] = useState(false);
  const [documentsExpanded, setDocumentsExpanded] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameProjectId, setRenameProjectId] = useState<number>(-1);
  const [newName, setNewName] = useState("");
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [renameDocOpen, setRenameDocOpen] = useState(false);
  const [renameDocId, setRenameDocId] = useState<string>("");
  const [renameDocTitle, setRenameDocTitle] = useState("");
  const [isDeletingDoc, setIsDeletingDoc] = useState<string | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [vaultExpanded, setVaultExpanded] = useState(false);
  const [hoveredVault, setHoveredVault] = useState(false);
  const [hoveredHistoryItem, setHoveredHistoryItem] = useState<string | null>(null);

  // Documents state
  const [hoveredDocuments, setHoveredDocuments] = useState(false);
  const [createDocOpen, setCreateDocOpen] = useState(false);

  // Infinite paginated fetch for documents (only user's own)
  const {
    data: docsPages,
    isLoading: loadingDocs,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteDocs({ page: 1, is_creator_me: true });

  // Flatten all loaded pages into a single array
  const documents = docsPages?.pages.flatMap(page => page.results) || [];
  // Only show the first 5 unless user has loaded more
  const visibleDocuments = documents.slice(0, documentsExpanded ? documents.length : 5);
  const showShowMore = !documentsExpanded && (documents.length > 5 || hasNextPage);

  // Projects query using React Query
  const {
    data: projectsData,
    isLoading: loadingProjects,
  } = useProjects({ owner: user?.id });

  const projects = projectsData?.results || [];

  // Create document
  const createDocMutation = useCreateDoc({
    onSuccess: (doc) => {
      setCreateDocOpen(false);
      handleNavItemClick(`/documents/${doc.id}`);
    },
  });

  // Rename document
  const updateDocMutation = useUpdateDoc({
    onSuccess: () => {
      setRenameDocOpen(false);
      setRenameDocId("");
      setRenameDocTitle("");
    },
  });

  // Delete document
  const removeDocMutation = useRemoveDoc({
    onSuccess: () => {
      setIsDeletingDoc(null);
      setRenameDocOpen(false);
      setRenameDocId("");
      setRenameDocTitle("");
    },
  });



  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const handleNavItemClick = (url: string) => {
    // Always navigate to /chat for new sessions when clicking Assistant
    if (url === "/chat") {
      router.push("/chat");
      return;
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

  const handleRename = async () => {
    if (renameProjectId === -1) return;
    setIsRenaming(true);
    try {
      await updateProject(renameProjectId, { name: newName });
      setRenameOpen(false);
      setRenameProjectId(-1);
      setNewName("");
      toast({
        title: "Success",
        description: "Project renamed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to rename project. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDelete = async (projectId: number, projectName: string) => {
    if (!window.confirm(`Are you sure you want to delete project '${projectName}'? This cannot be undone.`)) return;
    setIsDeleting(projectId);
    try {
      await deleteProject(projectId);
      toast({ title: "Project deleted", description: `Project '${projectName}' was deleted.` });
    } catch (e) {
      toast({ title: "Error deleting project", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleProjectClick = async (project: Project) => {
    try {
      // Generate a predictable session ID based on the project
      const projectChatTitle = `Chat for ${project.name}`;
      const sessionId = project.session_id || `vault-${project.id}`;
      
      // Check if a chat session already exists for this project by trying to get it
      try {
        await getChatSession(sessionId);
        // If session exists, just redirect to the vault page
        router.push(`/vault/${project.id?.toString()}`);
        return;
      } catch (error) {
        // Session doesn't exist, create a new one
        const session = await createChatSession({
          title: projectChatTitle,
          agent_id: DEFAULT_AGENT_ID,
          agent_code: DEFAULT_AGENT_ID,
        });
        
        // Save the session ID to the project
        if (project.id) {
          try {
            await updateProjectSessionId(project.id, session.session_id);
            // Note: We can't update the local state here since we're using React Query
            // The project list will be refreshed when the user navigates
          } catch (updateError) {
            console.error('Failed to update project with session ID:', updateError);
            // Continue with navigation even if update fails
          }
        }
        
        refresh();
        // Redirect to the vault page for the project
        router.push(`/vault/${project.id?.toString()}`);
      }
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to create chat session. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Filter navigation items to hide Knowledge Base for non-superusers
  const filteredNavigationItems = navigationItems.filter(item => {
    if (typeof item === 'object' && 'name' in item && item.name === "Knowledge Base") {
      return user?.is_superuser;
    }
    return true;
  });

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

              {filteredNavigationItems.map((item, index) => (
                'type' in item ? (
                  <div key={index} className="sidebar-divider"></div>
                ) : (
                  <div key={index} className="w-full">
                    {item.name === "Vault" ? (
                      <div
                        className={`flex items-center justify-between w-full p-2 rounded-md gap-2 font-normal cursor-pointer hover:bg-gray-100 ${pathname.startsWith(item.url) ? "bg-gray-200" : ""}`}
                        onMouseEnter={() => setHoveredVault(true)}
                        onMouseLeave={() => setHoveredVault(false)}
                      >
                        <div className="flex items-center gap-2">
                          {/* Fixed-width icon/arrow container to prevent text shift */}
                          <span style={{ width: 24, display: 'inline-flex', justifyContent: 'center' }}>
                            {hoveredVault ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 p-0 rounded-full hover:bg-gray-200"
                                onClick={e => {
                                  e.stopPropagation();
                                  setVaultExpanded((prev) => !prev);
                                }}
                                tabIndex={-1}
                                aria-label={vaultExpanded ? "Collapse" : "Expand"}
                              >
                                {vaultExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                              </Button>
                            ) : (
                              renderIcon(item.icon)
                            )}
                          </span>
                          <span
                            className="select-none"
                            onClick={e => {
                              e.stopPropagation();
                              handleNavItemClick(item.url);
                            }}
                          >
                            {item.name}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-full hover:bg-gray-300"
                          onClick={e => {
                            e.stopPropagation();
                            setCreateProjectOpen(true);
                          }}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : item.name === "Documents" ? (
                      <div
                        className={`flex items-center justify-between w-full p-2 rounded-md gap-2 font-normal cursor-pointer hover:bg-gray-100 ${pathname.startsWith(item.url) ? "bg-gray-200" : ""}`}
                        onMouseEnter={() => setHoveredDocuments(true)}
                        onMouseLeave={() => setHoveredDocuments(false)}
                      >
                        <div className="flex items-center gap-2">
                          <span style={{ width: 24, display: 'inline-flex', justifyContent: 'center' }}>
                            {hoveredDocuments ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 p-0 rounded-full hover:bg-gray-200"
                                onClick={e => {
                                  e.stopPropagation();
                                  setDocumentsExpanded((prev) => !prev);
                                }}
                                tabIndex={-1}
                                aria-label={documentsExpanded ? "Collapse" : "Expand"}
                              >
                                {documentsExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                              </Button>
                            ) : (
                              renderIcon(item.icon)
                            )}
                          </span>
                          <span
                            className="select-none"
                            onClick={e => {
                              e.stopPropagation();
                              handleNavItemClick(item.url);
                            }}
                          >
                            {item.name}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-full hover:bg-gray-300"
                          onClick={e => {
                            e.stopPropagation();
                            createDocMutation.mutate();
                          }}
                          disabled={createDocMutation.isPending}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <div
                        className={`flex items-center justify-between w-full p-2 rounded-md gap-2 font-normal cursor-pointer hover:bg-gray-100 ${pathname.startsWith(item.url) ? "bg-gray-200" : ""}`}
                        onClick={() => handleNavItemClick(item.url)}
                      >
                        <div className="flex items-center gap-2">
                          <span style={{ width: 24, display: 'inline-flex', justifyContent: 'center' }}>
                            {renderIcon(item.icon)}
                          </span>
                          <span>{item.name}</span>
                        </div>
                      </div>
                    )}
                    {/* Sub nav for Vault: dynamically render projects only if expanded */}
                    {item.name === "Vault" && vaultExpanded && (
                      <div className="ml-6 mt-1 flex flex-col gap-1">
                        {loadingProjects ? (
                          <span className="text-xs text-muted-foreground p-2">Loading...</span>
                        ) : (
                          projects.filter(project => project.owner === user?.id).map((project) => (
                            <div
                              key={project.id}
                              className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-gray-100 text-sm ${pathname === `/vault/${project.id}` ? "bg-gray-300 font-semibold" : ""}`}
                              onClick={e => {
                                e.stopPropagation();
                                handleProjectClick(project);
                              }}
                            >
                              <FolderGit2 className="h-4 w-4" />
                              <span className="flex-1 truncate">{project.name}</span>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-6 w-6 p-0" onClick={e => e.stopPropagation()}>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={e => { e.stopPropagation(); setRenameProjectId(typeof project.id === 'number' ? project.id : -1); setNewName(project.name || ""); setRenameOpen(true); }}>
                                    <Edit className="h-4 w-4 mr-2" />Rename
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={e => { e.stopPropagation(); handleDelete(typeof project.id === 'number' ? project.id : -1, project.name || ""); }} disabled={isDeleting === project.id} className="text-destructive focus:text-destructive">
                                    <Trash className="h-4 w-4 mr-2" />{isDeleting === project.id ? "Deleting..." : "Delete"}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                    {/* Sub nav for Documents: dynamically render documents only if expanded */}
                    {item.name === "Documents" && documentsExpanded && (
                      <div className="ml-6 mt-1 flex flex-col gap-1">
                        {loadingDocs ? (
                          <span className="text-xs text-muted-foreground p-2">Loading...</span>
                        ) : (
                          <>
                            {documents.map((doc: Doc) => (
                              <div
                                key={doc.id}
                                className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-gray-100 text-sm ${pathname === `/documents/${doc.id}` ? "bg-gray-300 font-semibold" : ""}`}
                                onClick={e => {
                                  e.stopPropagation();
                                  handleNavItemClick(`/documents/${doc.id}`);
                                }}
                              >
                                <FileText className="h-4 w-4" />
                                <span className="flex-1 truncate">{doc.title || "Untitled"}</span>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 p-0" onClick={e => e.stopPropagation()}>
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={e => { e.stopPropagation(); setRenameDocId(doc.id); setRenameDocTitle(doc.title || ""); setRenameDocOpen(true); }}>
                                      <Edit className="h-4 w-4 mr-2" />Rename
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={e => { e.stopPropagation(); setIsDeletingDoc(doc.id); removeDocMutation.mutate({ docId: doc.id }); }} disabled={isDeletingDoc === doc.id} className="text-destructive focus:text-destructive">
                                      <Trash className="h-4 w-4 mr-2" />{isDeletingDoc === doc.id ? "Deleting..." : "Delete"}
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            ))}
                          </>
                        )}
                      </div>
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

              {filteredNavigationItems.map((item, index) => (
                'type' in item ? (
                  <div key={index} className="sidebar-divider sidebar-divider--collapsed"></div>
                ) : (
                  <div key={index} className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`rounded-full w-10 h-10 ${pathname.startsWith(item.url) ? "bg-gray-200" : ""}`}
                      title={item.name}
                      onClick={() => handleNavItemClick(item.url)}
                    >
                      {renderIcon(item.icon)}
                    </Button>
                    {/* Vault popover (existing) */}
                    {item.name === "Vault" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-gray-100 hover:bg-gray-300"
                        onClick={e => {
                          e.stopPropagation();
                          setCreateProjectOpen(true);
                        }}
                        title="Create new project"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    )}
                    {/* Documents popover */}
                    {item.name === "Documents" && pathname.startsWith("/documents") && (
                      <div className="absolute left-12 top-0 z-10 bg-white border rounded shadow p-2 flex flex-col gap-1 min-w-[120px]">
                        {loadingDocs ? (
                          <span className="text-xs text-muted-foreground p-2">Loading...</span>
                        ) : (
                          <>
                            {visibleDocuments.map((doc: Doc) => (
                              <div
                                key={doc.id}
                                className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-gray-100 text-sm ${pathname === `/documents/${doc.id}` ? "bg-gray-300 font-semibold" : ""}`}
                                onClick={e => {
                                  e.stopPropagation();
                                  handleNavItemClick(`/documents/${doc.id}`);
                                }}
                              >
                                <FileText className="h-4 w-4" />
                                <span className="flex-1 truncate">{doc.title || "Untitled"}</span>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 p-0" onClick={e => e.stopPropagation()}>
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={e => { e.stopPropagation(); setRenameDocId(doc.id); setRenameDocTitle(doc.title || ""); setRenameDocOpen(true); }}>
                                      <Edit className="h-4 w-4 mr-2" />Rename
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={e => { e.stopPropagation(); setIsDeletingDoc(doc.id); removeDocMutation.mutate({ docId: doc.id }); }} disabled={isDeletingDoc === doc.id} className="text-destructive focus:text-destructive">
                                      <Trash className="h-4 w-4 mr-2" />{isDeletingDoc === doc.id ? "Deleting..." : "Delete"}
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            ))}
                            {showShowMore && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full mt-1"
                                onClick={e => {
                                  e.stopPropagation();
                                  if (hasNextPage) fetchNextPage();
                                  setDocumentsExpanded(true);
                                }}
                                disabled={isFetchingNextPage}
                              >
                                {isFetchingNextPage ? "Loading..." : "Show more"}
                              </Button>
                            )}
                          </>
                        )}
                      </div>
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
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent onClick={e => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Rename Project</DialogTitle>
          </DialogHeader>
          <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="New project name" />
          <DialogFooter>
            <Button onClick={() => setRenameOpen(false)} variant="outline">Cancel</Button>
            <Button onClick={handleRename} disabled={isRenaming || !newName.trim()}>{isRenaming ? "Renaming..." : "Rename"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Rename Document Dialog */}
      <Dialog open={renameDocOpen} onOpenChange={setRenameDocOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Document</DialogTitle>
          </DialogHeader>
          <Input
            value={renameDocTitle}
            onChange={e => setRenameDocTitle(e.target.value)}
            placeholder="Document title"
            disabled={updateDocMutation.isPending}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                updateDocMutation.mutate({ id: renameDocId, title: renameDocTitle });
              }
            }}
          />
          <DialogFooter>
            <Button
              variant="default"
              onClick={() => {
                updateDocMutation.mutate({ id: renameDocId, title: renameDocTitle });
              }}
              disabled={updateDocMutation.isPending || !renameDocTitle.trim()}
            >
              Save
            </Button>
            <Button
              variant="outline"
              onClick={() => setRenameDocOpen(false)}
              disabled={updateDocMutation.isPending}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
