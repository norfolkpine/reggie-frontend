"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileManager } from "@/features/shared/components/file-manager";
import { getProject } from "@/api/projects";
import { Project } from "@/types/api";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Settings, Activity, Plus, File, ArrowLeft, Filter, ChevronDown } from "lucide-react";

export function VaultManager() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('vault_active_tab') || 'files';
    }
    return 'files';
  });
  const projectId = params?.id as string;

  useEffect(() => {
    fetchProject();
  }, [projectId]);

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
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load project details",
        variant: "destructive",
      });
      router.push("/vault");
    } finally {
      setLoading(false);
    }
  };

  if (!project && !loading) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Project not found</h2>
        <p className="text-muted-foreground mt-2">The requested project could not be found.</p>
        <Button className="mt-4" onClick={() => router.push("/vault")}>
          Back to Vault
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/vault")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-medium">
            {loading ? "Loading project..." : project?.name}
          </h1>
          {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
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
            
            <TabsContent value="files" className="mt-4">
              <FileManager 
                projectId={projectId}
                onFileSelect={(file) => {
                  // Handle file selection if needed
                  console.log('Selected file:', file);
                }}
              />
            </TabsContent>
            
            <TabsContent value="activity" className="mt-4">
              <div className="bg-white rounded-md border shadow-sm p-6">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Activity</h3>
                </div>
                <p className="text-muted-foreground mt-4">Activity feed will be displayed here.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="mt-4">
              <div className="bg-white rounded-md border shadow-sm p-6">
                <div className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Settings</h3>
                </div>
                
                {project?.description && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium">Description</h4>
                    <p className="text-muted-foreground mt-1">{project.description}</p>
                  </div>
                )}
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium">Project ID</h4>
                  <p className="text-muted-foreground mt-1 font-mono">{projectId}</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
