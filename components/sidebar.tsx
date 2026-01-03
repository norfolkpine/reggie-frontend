"use client";

import {
  ForwardRefExoticComponent,
  JSX,
  RefAttributes,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { Button } from "@/components/ui/button";
import {
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
  BadgeCheck,
  Inbox,
  Calendar,
  ListChecks,
  BarChart3,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";

// Import the TeamSwitcher component at the top of the file
import { TeamSwitcher } from "@/components/team/team-switcher";
import { CreateProjectDialog } from "@/features/vault/components/create-project-dialog";

import { usePathname, useRouter } from "next/navigation";
import { createProject } from "@/api/projects";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "./ui/use-toast";
import { useMobileNav } from "@/contexts/mobile-nav-context";
import { getProjects, updateProject, deleteProject } from "@/api/projects";
import { Project, getProjectId } from "@/types/api";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useQueryClient } from '@tanstack/react-query';
import { useDocs, useInfiniteDocs, KEY_LIST_DOC } from "@/features/docs/doc-management/api/useDocs";
import { useCreateDoc } from "@/features/docs/doc-management/api/useCreateDoc";
import { useUpdateDoc } from "@/features/docs/doc-management/api/useUpdateDoc";
import { useRemoveDoc } from "@/features/docs/doc-management/api/useRemoveDoc";
import { Doc } from "@/features/docs/doc-management/types";
import { useProjects } from "@/features/vault/api/useProjects";
import { DeleteProjectDialog } from "@/features/vault/components/delete-project-dialog";
import { useSidebar } from "@/contexts/sidebar-context";
import { ChatHistory } from "@/components/chat-history";


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
  { name: "Opie", icon: "🤖", url: "/chat" },
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
  // { name: "Library", icon: BookOpen, url: "/library" },
  { name: "Documents", icon: FileText, url: "/documents" },
  // { name: "Compliance", icon: BadgeCheck, url: "/compliance" },
  { type: "divider" },
  // SuperUser/Staff Only. Future feature: Allow and restrict for Enterprise users
  { name: "Admin", icon: Shield, url: "/admin" },
];

// Compliance sub-items (commented out - might use later)
// const complianceSubItems = [
//   { name: "Inbox", icon: Inbox, url: "/compliance/inbox" },
//   { name: "Schedule", icon: Calendar, url: "/compliance/schedule" },
//   { name: "All Tasks", icon: ListChecks, url: "/compliance/all-tasks" },
//   { name: "Reports", icon: BarChart3, url: "/compliance/reports" },
//   { name: "Automations", icon: Zap, url: "/compliance/automations" },
// ] as const;

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
//     url: "/settings/integrations",
//   },
//   {
//     name: "Base Knowledge (Admin)",
//     icon: Database,
//     url: "/base-knowledge",
//   },
// ];

// Update the sidebar component to handle chat item clicks
export default function Sidebar({ isMobile }: { isMobile?: boolean } = {}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isExpanded } = useSidebar();
  const { close: closeMobileNav } = useMobileNav();

  const [hoveredHistoryItem, setHoveredHistoryItem] = useState<string | null>(
    null
  );
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [vaultExpanded, setVaultExpanded] = useState(false);
  const [hoveredVault, setHoveredVault] = useState(false);

  // Add state for rename dialog and project
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameProjectId, setRenameProjectId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Documents state
  const [documentsExpanded, setDocumentsExpanded] = useState(false);
  const [hoveredDocuments, setHoveredDocuments] = useState(false);
  const [createDocOpen, setCreateDocOpen] = useState(false);
  const [renameDocOpen, setRenameDocOpen] = useState(false);
  const [renameDocId, setRenameDocId] = useState<string | null>(null);
  const [renameDocTitle, setRenameDocTitle] = useState("");
  const [isRenamingDoc, setIsRenamingDoc] = useState(false);
  const [isDeletingDoc, setIsDeletingDoc] = useState<string | null>(null);
  const [deleteDocDialogOpen, setDeleteDocDialogOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<Doc | null>(null);
  const [deleteProjectOpen, setDeleteProjectOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<{ id: string; name: string } | null>(null);
  
  // Compliance state (commented out - might use later)
  // const [complianceExpanded, setComplianceExpanded] = useState(false);
  // const [hoveredCompliance, setHoveredCompliance] = useState(false);
  
  // Image loading states
  const [mainLogoError, setMainLogoError] = useState(false);
  const [markLogoError, setMarkLogoError] = useState(false);

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
    listInvalideQueries: [KEY_LIST_DOC],
    onSuccess: () => {
      setRenameDocOpen(false);
      setRenameDocId(null);
      setRenameDocTitle("");
    },
  });

  // Delete document mutation
  const removeDocMutation = useRemoveDoc({
    onSuccess: () => {
      setDeleteDocDialogOpen(false);
      setDocToDelete(null);
      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
      // Force refresh of documents data to sync with other components
      void queryClient.invalidateQueries({ queryKey: [KEY_LIST_DOC] });
    },
  });

  const handleDeleteDoc = (doc: Doc) => {
    setDocToDelete(doc);
    setDeleteDocDialogOpen(true);
  };

  const handleDeleteDocClose = () => {
    setDeleteDocDialogOpen(false);
    setDocToDelete(null);
  };

  const handleDeleteConfirm = () => {
    if (docToDelete) {
      removeDocMutation.mutate({ docId: docToDelete.id });
    }
  };




  const handleNavItemClick = useCallback((url: string) => {
    // Always navigate to /chat for new sessions when clicking Assistant
    if (url === "/chat") {
      router.push("/chat");
    } else {
      router.push(url);
    }
    
    // Close mobile navigation drawer if in mobile mode
    if (isMobile) {
      closeMobileNav();
    }
  }, [router, isMobile, closeMobileNav]);

  const handleChatItemClick = useCallback((url: string) => {
    router.push(url);
    
    // Close mobile navigation drawer if in mobile mode
    if (isMobile) {
      closeMobileNav();
    }
  }, [router, isMobile, closeMobileNav]);

  const handleHistoryItemClick = useCallback((
    sessionId: string,
    agentCode?: string | null
  ) => {
    let url = `/chat/${sessionId}`;
    if (agentCode) {
      const params = new URLSearchParams({ agentId: agentCode });
      url += `?${params.toString()}`;
    }
    router.push(url);
    
    // Close mobile navigation drawer if in mobile mode
    if (isMobile) {
      closeMobileNav();
    }
  }, [router, isMobile, closeMobileNav]);

  const renderIcon = useCallback((icon?: ChatItem["icon"]) => {
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
  }, []);

  const handleCreateProject = useCallback(async (name: string, description: string) => {
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
  }, [createProject, user?.id, pathname, router, toast]);

  const handleRename = useCallback(async () => {
    if (!renameProjectId) return;
    setIsRenaming(true);
    try {
      // Convert string ID to number for the API call
      const numericId = parseInt(renameProjectId, 10);
      if (isNaN(numericId)) {
        throw new Error('Invalid project ID');
      }
      await updateProject(numericId.toString(), { name: newName });
      toast({ title: "Project renamed", description: `Project renamed to '${newName}'.` });
      setRenameOpen(false);
      setRenameProjectId(null);
      setNewName("");
    } catch (e) {
      toast({ title: "Error renaming project", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsRenaming(false);
    }
  }, [renameProjectId, newName, updateProject, toast]);

  const handleDelete = useCallback(async (projectId: string, projectName: string) => {
    console.log('Sidebar handleDelete called:', { projectId, projectName });
    setProjectToDelete({ id: projectId, name: projectName });
    setDeleteProjectOpen(true);
  }, []);

  // Memoized filtered navigation items
  const filteredNavigationItems = useMemo(() => {
    return navigationItems.filter(item => {
      if (typeof item === 'object' && 'name' in item) {
        if (item.name === "Admin") {
          return user?.is_superuser || user?.is_staff;
        }
      }
      return true;
    });
  }, [navigationItems, user?.is_superuser, user?.is_staff]);

  return (
    <div
      className={cn(
        "h-full flex flex-col transition-all duration-300",
        isExpanded ? "w-full" : "w-full"
      )}
    >
      {isExpanded ? (
        // Expanded sidebar content
        <div className="flex flex-col h-full">
          <div className="p-3 flex flex-col gap-3">
            {/* Header with logo */}
            {!isMobile && (
              <div className="flex items-center justify-between">
                {mainLogoError ? (
                  <span className="font-semibold text-xl">Opie</span>
                ) : (
                  <Image
                    src="/opie-logo-dark-purple-rgb-teal.svg"
                    alt="Opie Logo"
                    width={120}
                    height={60}
                    className="h-10 w-auto"
                    onError={() => setMainLogoError(true)}
                  />
                )}
              </div>
            )}
            
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
                        className={`flex items-center justify-between w-full p-2 rounded-md gap-2 font-normal cursor-pointer hover:bg-sidebar-accent ${pathname.startsWith(item.url) ? "bg-sidebar-accent" : ""}`}
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
                                className="h-5 w-5 p-0 rounded-full hover:bg-sidebar-accent"
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
                          className="h-6 w-6 rounded-full hover:bg-sidebar-accent"
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
                        className={`flex items-center justify-between w-full p-2 rounded-md gap-2 font-normal cursor-pointer hover:bg-sidebar-accent ${pathname.startsWith(item.url) ? "bg-sidebar-accent" : ""}`}
                        onMouseEnter={() => setHoveredDocuments(true)}
                        onMouseLeave={() => setHoveredDocuments(false)}
                      >
                        <div className="flex items-center gap-2">
                          <span style={{ width: 24, display: 'inline-flex', justifyContent: 'center' }}>
                            {hoveredDocuments ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 p-0 rounded-full hover:bg-sidebar-accent"
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
                          className="h-6 w-6 rounded-full hover:bg-sidebar-accent"
                          onClick={e => {
                            e.stopPropagation();
                            createDocMutation.mutate({ title: "Untitled Document" });
                          }}
                          disabled={createDocMutation.isPending}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : (
                      // Compliance item (commented out - might use later)
                      // item.name === "Compliance" ? (
                      //   <div
                      //     className={`flex items-center justify-between w-full p-2 rounded-md gap-2 font-normal cursor-pointer hover:bg-sidebar-accent ${pathname.startsWith(item.url) ? "bg-sidebar-accent" : ""}`}
                      //     onMouseEnter={() => setHoveredCompliance(true)}
                      //     onMouseLeave={() => setHoveredCompliance(false)}
                      //   >
                      //     <div className="flex items-center gap-2">
                      //       <span style={{ width: 24, display: 'inline-flex', justifyContent: 'center' }}>
                      //         {hoveredCompliance ? (
                      //           <Button
                      //             variant="ghost"
                      //             size="icon"
                      //             className="h-5 w-5 p-0 rounded-full hover:bg-sidebar-accent"
                      //             onClick={e => {
                      //               e.stopPropagation();
                      //               setComplianceExpanded((prev) => !prev);
                      //             }}
                      //             tabIndex={-1}
                      //             aria-label={complianceExpanded ? "Collapse" : "Expand"}
                      //           >
                      //             {complianceExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      //           </Button>
                      //         ) : (
                      //           renderIcon(item.icon)
                      //         )}
                      //       </span>
                      //       <span
                      //         className="select-none"
                      //         onClick={e => {
                      //           e.stopPropagation();
                      //           handleNavItemClick(item.url);
                      //         }}
                      //       >
                      //         {item.name}
                      //       </span>
                      //     </div>
                      //   </div>
                      // ) : (
                      <div
                      <div
                        className={`flex items-center justify-between w-full p-2 rounded-md gap-2 font-normal cursor-pointer hover:bg-sidebar-accent ${pathname.startsWith(item.url) ? "bg-sidebar-accent" : ""}`}
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
                              key={getProjectId(project)}
                              className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-sidebar-accent text-sm ${pathname === `/vault/${getProjectId(project)}` ? "bg-sidebar-accent font-semibold" : ""}`}
                              onClick={e => {
                                e.stopPropagation();
                                handleNavItemClick(`/vault/${getProjectId(project)}`);
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
                                  <DropdownMenuItem onClick={e => { e.stopPropagation(); setRenameProjectId(getProjectId(project) || ''); setNewName(project.name || ""); setRenameOpen(true); }}>
                                    <Edit className="h-4 w-4 mr-2" />Rename
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={e => { e.stopPropagation(); handleDelete(getProjectId(project) || '', project.name || ""); }} disabled={isDeleting === getProjectId(project)} className="text-destructive focus:text-destructive">
                                    <Trash className="h-4 w-4 mr-2" />{isDeleting === getProjectId(project) ? "Deleting..." : "Delete"}
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
                                className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-sidebar-accent text-sm ${pathname === `/documents/${doc.id}` ? "bg-sidebar-accent font-semibold" : ""}`}
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
                                    <DropdownMenuItem onClick={e => { e.stopPropagation(); handleDeleteDoc(doc); }} className="text-destructive focus:text-destructive">
                                      <Trash className="h-4 w-4 mr-2" />Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    )}
                    {/* Sub nav for Compliance (commented out - might use later) */}
                    {/* {item.name === "Compliance" && complianceExpanded && (
                      <div className="ml-6 mt-1 flex flex-col gap-1">
                        {complianceSubItems.map((subItem) => (
                          <div
                            key={subItem.url}
                            className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-sidebar-accent text-sm ${pathname === subItem.url ? "bg-sidebar-accent font-semibold" : ""}`}
                            onClick={e => {
                              e.stopPropagation();
                              handleNavItemClick(subItem.url);
                            }}
                          >
                            {renderIcon(subItem.icon)}
                            <span className="flex-1 truncate">{subItem.name}</span>
                          </div>
                        ))}
                      </div>
                    )} */}
                  </div>
                )
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-sidebar-accent scrollbar-track-transparent min-h-0">
            <div className="p-3 space-y-2">
              <ChatHistory isMobile={isMobile} />
            </div>
          </div>

          <div className="p-3"> 
            {/* border-t border-border removed*/}
            <TeamSwitcher />
          </div>
        </div>
      ) : (
        // Minimized sidebar content
        <div className="flex flex-col h-full">
          <div className="p-3 flex flex-col items-center gap-3">
            {/* Logo */}
            <div className="flex items-center justify-center w-full">
              {markLogoError ? (
                <span className="font-semibold text-lg">O</span>
              ) : (
                <Image
                  src="/opie-logo-mark-dark-purple-rgb-teal.svg"
                  alt="Opie Logo"
                  width={32}
                  height={32}
                  className="h-8 w-auto"
                  onError={() => setMarkLogoError(true)}
                />
              )}
            </div>

            {/* Plus button (New Chat) in collapsed view */}
            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-10 h-10"
              title="New Chat"
              onClick={() => {
                router.push("/chat");
                if (isMobile) {
                  closeMobileNav();
                }
              }}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-sidebar-accent scrollbar-track-transparent">
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
                      className={`rounded-full w-10 h-10 ${pathname.startsWith(item.url) ? "bg-sidebar-accent" : ""}`}
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
                        className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-sidebar-accent hover:bg-sidebar-accent/80"
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
                       <div className="absolute left-12 top-0 z-10 bg-background border rounded shadow p-2 flex flex-col gap-1 min-w-[120px]">
                        {loadingDocs ? (
                          <span className="text-xs text-muted-foreground p-2">Loading...</span>
                        ) : (
                          <>
                            {visibleDocuments.map((doc: Doc) => (
                              <div
                                key={doc.id}
                                className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-sidebar-accent text-sm ${pathname === `/documents/${doc.id}` ? "bg-sidebar-accent font-semibold" : ""}`}
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
                    {/* Compliance popover (commented out - might use later) */}
                    {/* {item.name === "Compliance" && pathname.startsWith("/compliance") && (
                      <div className="absolute left-12 top-0 z-10 bg-background border rounded shadow p-2 flex flex-col gap-1 min-w-[160px]">
                        {complianceSubItems.map((subItem) => (
                          <div
                            key={subItem.url}
                            className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-sidebar-accent text-sm ${pathname === subItem.url ? "bg-sidebar-accent font-semibold" : ""}`}
                            onClick={e => {
                              e.stopPropagation();
                              handleNavItemClick(subItem.url);
                            }}
                          >
                            {renderIcon(subItem.icon)}
                            <span className="flex-1 truncate">{subItem.name}</span>
                          </div>
                        ))}
                      </div>
                    )} */}
                  </div>
                )
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
            disabled={isRenamingDoc}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                setIsRenamingDoc(true);
                updateDocMutation.mutate({ id: renameDocId!, title: renameDocTitle });
              }
            }}
          />
          <DialogFooter>
            <Button
              variant="default"
              onClick={() => {
                setIsRenamingDoc(true);
                updateDocMutation.mutate({ id: renameDocId!, title: renameDocTitle });
              }}
              disabled={isRenamingDoc || !renameDocTitle.trim()}
            >
              Save
            </Button>
            <Button
              variant="outline"
              onClick={() => setRenameDocOpen(false)}
              disabled={isRenamingDoc}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Simple Delete Confirmation Dialog */}
      {docToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Delete Document</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to delete "{docToDelete.title}"? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={handleDeleteDocClose}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteConfirm}
                disabled={removeDocMutation.isPending}
              >
                {removeDocMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <DeleteProjectDialog
        open={deleteProjectOpen}
        onOpenChange={setDeleteProjectOpen}
        projectId={projectToDelete?.id || null}
        projectName={projectToDelete?.name || null}
        onProjectDeleted={() => {
          // Refresh the projects list
          void queryClient.invalidateQueries({ queryKey: ['projects'] });
        }}
      />
    </div>
  );
}
