"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getProject } from "@/api/projects";
import { Project } from "@/types/api";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Settings, Edit, Sparkles, Download, Brain, Play } from "lucide-react";
import { useHeader } from "@/contexts/header-context";
import { useRightSection } from "@/hooks/use-right-section";
import { useDragDropContext } from "@/contexts/drag-drop-context";
// Files tab manages AI panel context itself
import { InstructionsDialog } from "./instructions-dialog";
import { RenameDialog } from "./rename-dialog";
import { FilesTab } from "./files-tab";
import { AnalyserTabContent } from "./document-analyser";
import { WorkflowTabContent } from "./vault-workflow";
import { SettingsTabContent } from "./settings-tab-content";
import { TrashTab } from "./trash-tab";
import { ProjectNotFound } from "./project-not-found";
import { AskAIButton } from "./ask-ai-button";
import { AiLayoutPanel } from "@/components/vault/ai-layout-panel";
import { Button } from "@/components/ui/button";

export function VaultManager() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { setHeaderActions, setHeaderCustomContent } = useHeader();
  const { showRightSection, rightSection, toggleRightSection } = useRightSection();
  const { setDragDropOptions, clearDragDropOptions } = useDragDropContext();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('vault_active_tab') || 'files';
    }
    return 'files';
  });
  const projectId = params?.uuid as string;
  const [renameOpen, setRenameOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  // const [deleteProjectOpen, setDeleteProjectOpen] = useState(false);
  
  const [showInstructionsDialog, setShowInstructionsDialog] = useState(false);
  const [instructions, setInstructions] = useState("");
  const [requestedNavigation, setRequestedNavigation] = useState<number | null>(null);
  const [breadcrumbData, setBreadcrumbData] = useState<{
    currentFolderId: number;
    breadcrumbs: { id: number; name: string }[];
  }>({ currentFolderId: 0, breadcrumbs: [] });

  const [dragOverBreadcrumbId, setDragOverBreadcrumbId] = useState<number | null>(null);

  const filesTabRef = useRef<{
    getBreadcrumbData: () => { currentFolderId: number; breadcrumbs: { id: number; name: string }[] };
    navigateToFolder: (folderId: number) => void;
    handleFilesDrop: (files: File[]) => Promise<void>;
    handleDrop: (e: React.DragEvent, targetFolderId: number) => Promise<void>;
    refreshFiles: () => void;
  }>(null);

  const trashTabRef = useRef<{
    refreshFiles: () => void;
  }>(null);

  // Update breadcrumb data from FilesTab
  const updateBreadcrumbData = useCallback(() => {
    const data = filesTabRef.current?.getBreadcrumbData() || { currentFolderId: 0, breadcrumbs: [] };
    setBreadcrumbData(data);
  }, []); // Empty dependency array to avoid infinite loops

  // Ref to store updateBreadcrumbData function to avoid stale closures
  const updateBreadcrumbDataRef = useRef<() => void>(() => {});

  // Keep the ref updated
  useEffect(() => {
    updateBreadcrumbDataRef.current = updateBreadcrumbData;
  }, [updateBreadcrumbData]);

  // Function to navigate to a folder (called from breadcrumb clicks)
  const navigateToFolder = useCallback((folderId: number) => {
    setRequestedNavigation(folderId);
    // Reset navigation request and update breadcrumb data after FilesTab processes it
    setTimeout(() => {
      setRequestedNavigation(null);
      updateBreadcrumbDataRef.current();
    }, 100);
  }, []); // No dependencies to avoid infinite loops

  const handleBreadcrumbDragOver = useCallback((e: React.DragEvent, folderId: number) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDragOverBreadcrumbId(folderId);
  }, []);

  const handleBreadcrumbDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!e.currentTarget.contains(relatedTarget)) {
      setDragOverBreadcrumbId(null);
    }
  }, []);

  const handleBreadcrumbDrop = useCallback(async (e: React.DragEvent, targetFolderId: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverBreadcrumbId(null);

    await filesTabRef.current?.handleDrop(e, targetFolderId);
  }, []);

  // Set up drag and drop options when activeTab changes
  useEffect(() => {
    if (activeTab === 'files') {
      setDragDropOptions({
        enabled: true,
        acceptedTypes: ['application/pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.csv', 'image/png', 'image/jpeg', 'image/jpg'],
        maxFileSize: 50 * 1024 * 1024, // 50MB
        maxFiles: 10,
        onFilesDrop: async (files: File[]) => {
          // Call the FilesTab's handleFilesDrop method
          await filesTabRef.current?.handleFilesDrop(files);
        }
      });
    } else {
      clearDragDropOptions();
    }
  }, [activeTab, setDragDropOptions, clearDragDropOptions]);

  // Memoize AI panel context to prevent unnecessary re-renders
  const aiPanelContext = React.useMemo(() => ({
    title: breadcrumbData.currentFolderId === 0 
      ? project?.name || 'Root Folder' 
      : breadcrumbData.breadcrumbs[breadcrumbData.breadcrumbs.length - 1]?.name || 'Current Folder',
    files: [], // Files will be populated by the AI panel
    folderId: breadcrumbData.currentFolderId,
    projectId: projectId
  }), [breadcrumbData.currentFolderId, breadcrumbData.breadcrumbs, project?.name, projectId]);

  // Ask AI handler - now toggles the AI panel
  const handleAskAI = useCallback(() => {
    if (!project) return;
    
    const aiPanelComponent = <AiLayoutPanel contextData={aiPanelContext} />;
    toggleRightSection("vault-ai-panel", aiPanelComponent);
  }, [project, aiPanelContext, toggleRightSection]);

  // Set header actions and custom content
  useEffect(() => {
    if (loading) {
      // Show loading state
      setHeaderActions([]);
      setHeaderCustomContent(
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-gray-600">
            <span 
              className="hover:text-gray-900 cursor-pointer"
              onClick={() => router.push("/vault")}
            >
              Vault
            </span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">Loading project...</span>
          </div>
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      );
    } else if (project) {
      // Set the back button and project name with edit functionality
      activeTab === "analyser" ?
        setHeaderActions([
          {
            label: "Ask AI",
            onClick: handleAskAI,
            variant: "outline",
            size: "sm",
            icon: <Sparkles className="h-4 w-4" />
          },
          {
            label: "Export CSV",
            onClick: () => {
              // Dispatch event to trigger CSV export in AnalyserTabContent
              window.dispatchEvent(new CustomEvent('analyser-export-csv', {
                detail: { projectName: project?.name || 'export' }
              }));
            },
            variant: "outline",
            size: "sm",
            icon: <Download className="h-4 w-4" />
          },
          {
            label: "Select Model",
            onClick: () => {
              console.log("Select Model clicked");
            },
            variant: "outline",
            size: "sm",
            icon: <Brain className="h-4 w-4" />
          },
          {
            label: "Run Analysis",
            onClick: () => {
              // Dispatch event to trigger analysis in AnalyserTabContent
              window.dispatchEvent(new CustomEvent('analyser-run-analysis'));
            },
            variant: "default",
            size: "sm",
            icon: <Play className="h-4 w-4" />
          },
          {
            label: "",
            onClick: () => {
              setShowInstructionsDialog(true);
            },
            variant: "ghost",
            size: "icon",
            icon: <Settings className="h-4 w-4" />
          }
        ]) : setHeaderActions([
          {
            label: "Ask AI",
            onClick: handleAskAI,
            variant: "outline",
            size: "sm",
            icon: <Sparkles className="h-4 w-4" />
          },
          {
            label: "",
            onClick: () => {
              setShowInstructionsDialog(true);
            },
            variant: "ghost",
            size: "icon",
            icon: <Settings className="h-4 w-4" />
          }
        ])

      // Set merged breadcrumb navigation as custom content
      setHeaderCustomContent(
        <div className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base lg:text-lg font-medium overflow-x-auto max-w-full scrollbar-thin">
          {/* Vault link */}
          <span
            className="hover:text-foreground font-medium cursor-pointer text-muted-foreground dark:hover:text-foreground dark:text-muted-foreground whitespace-nowrap flex-shrink-0"
            onClick={() => router.push("/vault")}
          >
            Vault
          </span>
          <span className="text-muted-foreground dark:text-muted-foreground/60 flex-shrink-0">/</span>

          {/* Project name with edit button - clickable to navigate to project root */}
          <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0 min-w-0">
            <button
              onClick={() => navigateToFolder(0)}
              onDragOver={(e) => handleBreadcrumbDragOver(e, 0)}
              onDragLeave={handleBreadcrumbDragLeave}
              onDrop={(e) => handleBreadcrumbDrop(e, 0)}
              className={`text-foreground font-medium hover:text-blue-600 dark:hover:text-blue-400 hover:underline truncate max-w-[100px] sm:max-w-[150px] md:max-w-[200px] lg:max-w-none ${
                dragOverBreadcrumbId === 0 ? 'bg-blue-100 dark:bg-blue-900/30 rounded px-1' : ''
              }`}
              title={project.name}
            >
              {project.name}
            </button>
            <button
              type="button"
              className="p-0.5 sm:p-1 rounded hover:bg-muted focus:outline-none dark:hover:bg-muted/50 flex-shrink-0"
              title="Edit project name"
              onClick={() => { setRenameOpen(true); setNewName(project.name || ""); }}
            >
              <Edit className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-muted-foreground dark:text-muted-foreground/80" />
            </button>
          </div>

          {/* Folder breadcrumbs */}
          {breadcrumbData.breadcrumbs.length > 0 && (
            <>
              {/* Show ellipsis if more than 2 breadcrumbs on small screens */}
              {breadcrumbData.breadcrumbs.length > 2 && (
                <div className="flex items-center sm:hidden flex-shrink-0">
                  <span className="text-muted-foreground dark:text-muted-foreground/60 mx-0.5">/</span>
                  <span className="text-muted-foreground dark:text-muted-foreground/60">...</span>
                </div>
              )}
              
              {breadcrumbData.breadcrumbs.map((folder, index) => {
                // On small screens, only show the last breadcrumb if there are more than 2
                const isLastBreadcrumb = index === breadcrumbData.breadcrumbs.length - 1;
                const shouldShowOnMobile = breadcrumbData.breadcrumbs.length <= 2 || isLastBreadcrumb;
                
                return (
                  <div
                    key={folder.id}
                    className={`flex items-center flex-shrink-0 min-w-0 ${!shouldShowOnMobile ? 'hidden sm:flex' : 'flex'}`}
                  >
                    <span className="text-muted-foreground dark:text-muted-foreground/60 mx-0.5 sm:mx-1 flex-shrink-0 mr-1">/</span>
                    <button
                      onClick={() => navigateToFolder(folder.id)}
                      onDragOver={(e) => handleBreadcrumbDragOver(e, folder.id)}
                      onDragLeave={handleBreadcrumbDragLeave}
                      onDrop={(e) => handleBreadcrumbDrop(e, folder.id)}
                      className={`text-foreground font-medium hover:text-blue-600 dark:hover:text-blue-400 hover:underline truncate max-w-[100px] sm:max-w-[150px] md:max-w-[200px] lg:max-w-none ${
                        dragOverBreadcrumbId === folder.id ? 'bg-blue-100 dark:bg-blue-900/30 rounded px-1' : ''
                      }`}
                      title={folder.name}
                    >
                      {folder.name}
                    </button>
                  </div>
                );
              })}
            </>
          )}
        </div>
      );
    }

    // Cleanup when component unmounts
    return () => {
      setHeaderActions([]);
      setHeaderCustomContent(null);
    };
  }, [setHeaderActions, setHeaderCustomContent, project, loading, router, breadcrumbData, activeTab]);


  // Initialize breadcrumb data when component mounts
  useEffect(() => {
    // Small delay to ensure FilesTab ref is set
    const timer = setTimeout(() => {
      if (filesTabRef.current) {
        updateBreadcrumbDataRef.current();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []); // No dependencies to avoid infinite loops

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  // Files data fetching moved into FilesTab

  // Persist activeTab in localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vault_active_tab', activeTab);
    }
  }, [activeTab]);

  // Listen for switch to analyser tab event
  useEffect(() => {
    const handleSwitchToAnalyser = () => {
      setActiveTab('analyser');
    };

    window.addEventListener('switch-to-analyser-tab', handleSwitchToAnalyser);
    return () => {
      window.removeEventListener('switch-to-analyser-tab', handleSwitchToAnalyser);
    };
  }, []);
  
  const fetchProject = async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      const data = await getProject(projectId);
      setProject(data);
      // Load existing custom instructions
      setInstructions(data.instruction?.content || "");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load project",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Add a function to handle rename
  const handleRename = async () => {
    if (!project || !project.id) return;
    setIsRenaming(true);
    try {
      await import("@/api/projects").then(({ updateProject }) => updateProject(project.uuid ?? project.id!, { ...project, name: newName }));
      toast({ title: "Project renamed", description: `Project renamed to '${newName}'.` });
      setRenameOpen(false);
      setNewName("");
      // Refresh project name
      fetchProject();
    } catch (e) {
      toast({ title: "Error renaming project", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsRenaming(false);
    }
  };


  if (!project && !loading) {
    return <ProjectNotFound />;
  }

  return (
    <div className="flex-1 flex flex-col h-full relative">
      {/* Header removed - now handled by layout */}

      <div 
        className="flex-1 overflow-auto p-4 mt-1 relative"
      >
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs 
            defaultValue="files" 
            value={activeTab} 
            onValueChange={(value) => {
              setActiveTab(value);
            }}
          >
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="files">Files</TabsTrigger>
                <TabsTrigger value="analyser">Analyser</TabsTrigger>
                <TabsTrigger value="workflow">Workflow</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="trash">Trash</TabsTrigger>
              </TabsList>
              {/* {activeTab === "analyser" ? <Button size="sm">Analyse</Button> : null} */}
            </div>
            
            <FilesTab
              ref={(ref) => {
                filesTabRef.current = ref;
              }}
              projectId={projectId || ''}
              projectName={project?.name}
              teamId={(project?.team as any)?.id}
              requestedNavigation={requestedNavigation}
              onBreadcrumbChange={() => updateBreadcrumbDataRef.current()}
              onTrashTabRefresh={() => trashTabRef.current?.refreshFiles()}
            />

            <AnalyserTabContent 
              projectId={projectId || ''}
              teamId={(project?.team as any)?.id}
            />
            <WorkflowTabContent />

            <SettingsTabContent
              description={project?.description}
              projectId={projectId}
            />

            <TabsContent value="trash" className="mt-4">
              <TrashTab
                ref={(ref) => {
                  trashTabRef.current = ref;
                }}
                projectId={projectId || ''}
                projectName={project?.name}
                onFilesTabRefresh={() => filesTabRef.current?.refreshFiles()}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
      <RenameDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        title="Rename Project"
        currentName={project?.name || ""}
        newName={newName}
        onNameChange={setNewName}
        onConfirm={handleRename}
        isLoading={isRenaming}
        placeholder="New project name"
      />
      <InstructionsDialog
        open={showInstructionsDialog}
        onOpenChange={setShowInstructionsDialog}
        instructions={instructions}
        setInstructions={setInstructions}
        projectUuid={projectId}
        onSave={(newInstructions) => {
          setInstructions(newInstructions);
          // Update the project state with the new instructions
          if (project) {
            setProject({ ...project, custom_instruction: newInstructions });
          }
        }}
      />

      {/* Files create/rename dialogs handled in FilesTab */}

    </div>
  );
}
