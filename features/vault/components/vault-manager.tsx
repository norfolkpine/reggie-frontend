"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getProject } from "@/api/projects";
import { Project } from "@/types/api";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Settings, Edit, Sparkles } from "lucide-react";
import { useHeader } from "@/contexts/header-context";
import { useRightSection } from "@/hooks/use-right-section";
// Files tab manages AI panel context itself
import { InstructionsDialog } from "./instructions-dialog";
import { RenameDialog } from "./rename-dialog";
import { FilesTab } from "./files-tab";
import { ActivityTabContent } from "./activity-tab-content";
import { SettingsTabContent } from "./settings-tab-content";
import { ProjectNotFound } from "./project-not-found";
import { AskAIButton } from "./ask-ai-button";
import { AiLayoutPanel } from "@/components/vault/ai-layout-panel";

export function VaultManager() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { setHeaderActions, setHeaderCustomContent } = useHeader();
  const { showRightSection, rightSection } = useRightSection();
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

  // Drag and drop state for file uploads
  const [isDragOver, setIsDragOver] = useState(false);

  const filesTabRef = useRef<{
    getBreadcrumbData: () => { currentFolderId: number; breadcrumbs: { id: number; name: string }[] };
    navigateToFolder: (folderId: number) => void;
    handleFilesDrop: (files: File[]) => Promise<void>;
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

  // Drag and drop handlers for file uploads (only active when on files tab)
  const handleFileDragOver = useCallback((e: React.DragEvent) => {
    if (activeTab !== 'files') return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, [activeTab]);

  const handleFileDragLeave = useCallback((e: React.DragEvent) => {
    if (activeTab !== 'files') return;
    e.preventDefault();
    e.stopPropagation();
    // Only set isDragOver to false if we're leaving the container entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, [activeTab]);

  const handleFileDrop = useCallback(async (e: React.DragEvent) => {
    if (activeTab !== 'files') return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length === 0) return;

    // Call the FilesTab's handleFilesDrop method
    await filesTabRef.current?.handleFilesDrop(droppedFiles);
  }, [activeTab]);

  // Memoize AI panel context to prevent unnecessary re-renders
  const aiPanelContext = React.useMemo(() => ({
    title: breadcrumbData.currentFolderId === 0 
      ? project?.name || 'Root Folder' 
      : breadcrumbData.breadcrumbs[breadcrumbData.breadcrumbs.length - 1]?.name || 'Current Folder',
    files: [], // Files will be populated by the AI panel
    folderId: breadcrumbData.currentFolderId,
    projectId: projectId
  }), [breadcrumbData.currentFolderId, breadcrumbData.breadcrumbs, project?.name, projectId]);

  // Ask AI handler
  const handleAskAI = useCallback(() => {
    if (!project) return;
    
    const aiPanelComponent = <AiLayoutPanel contextData={aiPanelContext} />;
    showRightSection("vault-ai-panel", aiPanelComponent);
  }, [project, aiPanelContext, showRightSection]);

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
      setHeaderActions([
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
        },
        // {
        //   label: "Delete Project",
        //   onClick: () => setDeleteProjectOpen(true),
        //   variant: "outline",
        //   size: "sm",
        //   icon: <Trash2 className="h-4 w-4" />
        // }
      ]);

      // Set merged breadcrumb navigation as custom content
      setHeaderCustomContent(
        <div className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base lg:text-lg font-medium overflow-x-auto max-w-full scrollbar-thin">
          {/* Vault link */}
          <span
            className="hover:text-foreground cursor-pointer text-muted-foreground dark:hover:text-foreground dark:text-muted-foreground whitespace-nowrap flex-shrink-0"
            onClick={() => router.push("/vault")}
          >
            Vault
          </span>
          <span className="text-muted-foreground dark:text-muted-foreground/60 flex-shrink-0">/</span>

          {/* Project name with edit button - clickable to navigate to project root */}
          <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0 min-w-0">
            <button
              onClick={() => navigateToFolder(0)}
              className="text-foreground font-medium hover:text-blue-600 dark:hover:text-blue-400 hover:underline truncate max-w-[100px] sm:max-w-[150px] md:max-w-[200px] lg:max-w-none"
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
                    <span className="text-muted-foreground dark:text-muted-foreground/60 mx-0.5 sm:mx-1 flex-shrink-0">/</span>
                    <button
                      onClick={() => navigateToFolder(folder.id)}
                      className="text-foreground font-medium hover:text-blue-600 dark:hover:text-blue-400 hover:underline truncate max-w-[100px] sm:max-w-[150px] md:max-w-[200px] lg:max-w-none"
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
  }, [setHeaderActions, setHeaderCustomContent, project, loading, router, breadcrumbData]);


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
      await import("@/api/projects").then(({ updateProject }) => updateProject(project.id!, { ...project, name: newName }));
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
        onDragOver={handleFileDragOver}
        onDragLeave={handleFileDragLeave}
        onDrop={handleFileDrop}
      >
        {/* Drag overlay - only show when files tab is active */}
        {isDragOver && activeTab === 'files' && (
          <div className="absolute inset-0 bg-primary/10 border-4 border-dotted border-primary rounded-lg flex items-center justify-center z-50 pointer-events-none">
            <div className="text-center">
              <p className="text-2xl font-semibold text-primary">Drop files here to upload</p>
              <p className="text-muted-foreground mt-2">Supported formats: PDF, DOC, DOCX, XLS, XLSX, TXT, CSV, PNG, JPG, JPEG</p>
            </div>
          </div>
        )}
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
            <TabsList>
              <TabsTrigger value="files">Files</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <FilesTab
              ref={(ref) => {
                filesTabRef.current = ref;
              }}
              projectId={projectId || ''}
              projectName={project?.name}
              teamId={(project?.team as any)?.id}
              requestedNavigation={requestedNavigation}
              onBreadcrumbChange={() => updateBreadcrumbDataRef.current()}
            />

            <ActivityTabContent />

            <SettingsTabContent
              description={project?.description}
              projectId={projectId}
            />
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
