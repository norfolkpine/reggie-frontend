"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getProject } from "@/api/projects";
import { Project } from "@/types/api";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Settings, Edit } from "lucide-react";
import { useHeader } from "@/contexts/header-context";
// Files tab manages AI panel context itself
import { InstructionsDialog } from "./instructions-dialog";
import { RenameDialog } from "./rename-dialog";
import { FilesTab } from "./files-tab";
import { ActivityTabContent } from "./activity-tab-content";
import { SettingsTabContent } from "./settings-tab-content";
import { ProjectNotFound } from "./project-not-found";

export function VaultManager() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { setHeaderActions, setHeaderCustomContent } = useHeader();
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
  // File rename handled inside FilesTab
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

      // Set project name with edit button as custom content
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
            <span className="text-gray-900 font-medium">{project.name}</span>
          </div>
          <button
            type="button"
            className="p-1 rounded hover:bg-gray-200 focus:outline-none"
            title="Edit project name"
            onClick={() => { setRenameOpen(true); setNewName(project.name || ""); }}
          >
            <Edit className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      );
    }

    // Cleanup when component unmounts
    return () => {
      setHeaderActions([]);
      setHeaderCustomContent(null);
    };
  }, [setHeaderActions, setHeaderCustomContent, project, loading, router]);


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
    <div 
      className="flex-1 flex flex-col h-full relative"
    >
      {/* Header removed - now handled by layout */}

      {/* Files tab handles drag overlay */}

      <div className="flex-1 overflow-auto p-4 mt-4">
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
              projectId={projectId || ''}
              projectName={project?.name}
              teamId={(project?.team as any)?.id}
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
