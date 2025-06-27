"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getProject } from "@/api/projects";
import { uploadFiles, getVaultFilesByProject, deleteVaultFile } from "@/api/vault";
import { Project, VaultFile as BaseVaultFile } from "@/types/api";
import { handleApiError } from "@/lib/utils/handle-api-error";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth-context";

// Extended VaultFile interface with additional properties from the API response
interface VaultFile extends BaseVaultFile {
  filename?: string;
  original_filename?: string;
  size?: number;
  type?: string;
  file_type?: string; // This is derived from the filename extension for filtering
}
import { Loader2, Settings, Activity, ArrowLeft } from "__barrel_optimize__?names=Activity,ArrowLeft,Loader2,Settings!=!lucide-react";
import { Plus, FileText, Filter, ChevronDown, Eye, Download, Link, Trash2, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import SearchInput from "@/components/ui/search-input";
import { formatDistanceToNow } from "date-fns";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UploadFileModal } from "./upload-file-modal";

export function VaultManager() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [vaultFiles, setVaultFiles] = useState<VaultFile[]>([]);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showAllFiles, setShowAllFiles] = useState(true);
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('vault_active_tab') || 'files';
    }
    return 'files';
  });
  const projectId = params?.id as string;

  useEffect(() => {
    fetchProject();
    fetchFiles();
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
      const data = await getProject(Number(projectId));
      setProject(data);
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

  const fetchFiles = async () => {
    try {
      const files = await getVaultFilesByProject(Number(projectId));
      // Add file_type property based on filename extension
      const filesWithType: VaultFile[] = files.map(file => {
        // Extract file extension for filtering
        const fileExtension = file.filename?.split('.').pop()?.toLowerCase() || file.type?.split('/')[1] || '';
        
        return {
          ...file,
          file_type: fileExtension
        };
      });
      setVaultFiles(filesWithType);
    } catch (error) {
      console.error('Error fetching vault files:', error);
      toast({
        title: "Error",
        description: "Failed to load vault files",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (files: File[]) => {
    if (!files || files.length === 0) return;
    
    setUploading(true);
    try {
      const uploaded_by = user?.id || 0;
      
      for (const file of files) {
        await uploadFiles({
          file,
          project: Number(projectId),
          uploaded_by,
        });
      }
      
      toast({
        title: "Success",
        description: `${files.length} file(s) uploaded successfully`,
      });
      fetchFiles(); // Refresh the file list
    } catch (error) {
      const { message } = handleApiError(error);
      toast({
        title: "Error",
        description: message || "Failed to upload files",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadModalOpen(false);
    }
  };

  const handleFileDownload = (file: VaultFile) => {
    // Direct download through URL
    if (file.file) {
      const a = document.createElement('a');
      a.href = file.file;
      a.download = file.filename || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleFilePreview = (file: VaultFile) => {
    // Open file in new tab for preview
    if (file.file) {
      window.open(file.file, '_blank');
    }
  };

  const handleFileDelete = async (fileId: number) => {
    try {
      await deleteVaultFile(fileId);
      toast({
        title: "Success",
        description: "File deleted successfully",
      });
      fetchFiles(); // Refresh the file list
    } catch (error) {
      const { message } = handleApiError(error);
      toast({
        title: "Error",
        description: message || "Failed to delete file",
        variant: "destructive",
      });
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
              {/* Replace with custom file manager UI since shared component doesn't support our vault-specific API needs */}
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="relative w-full max-w-sm">
                      <SearchInput
                        placeholder="Search files..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Filter className="h-4 w-4 mr-2" /> Filter
                          <ChevronDown className="h-4 w-4 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        <DropdownMenuCheckboxItem 
                          checked={showAllFiles}
                          onCheckedChange={(checked) => {
                            setShowAllFiles(checked);
                            if (checked) {
                              setActiveFilters([]);
                            }
                          }}
                        >
                          Show all files
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem 
                          checked={activeFilters.includes('pdf') || showAllFiles}
                          onCheckedChange={(checked) => {
                            setShowAllFiles(false);
                            setActiveFilters(prev => 
                              checked 
                                ? [...prev, 'pdf'] 
                                : prev.filter(f => f !== 'pdf')
                            );
                          }}
                        >
                          PDF files
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem 
                          checked={activeFilters.includes('docx') || activeFilters.includes('doc') || showAllFiles}
                          onCheckedChange={(checked) => {
                            setShowAllFiles(false);
                            const docsFilters = ['docx', 'doc'];
                            setActiveFilters(prev => 
                              checked 
                                ? [...prev.filter(f => !docsFilters.includes(f)), ...docsFilters] 
                                : prev.filter(f => !docsFilters.includes(f))
                            );
                          }}
                        >
                          Documents
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem 
                          checked={activeFilters.includes('jpg') || activeFilters.includes('jpeg') || activeFilters.includes('png') || showAllFiles}
                          onCheckedChange={(checked) => {
                            setShowAllFiles(false);
                            const imageFilters = ['jpg', 'jpeg', 'png'];
                            setActiveFilters(prev => 
                              checked 
                                ? [...prev.filter(f => !imageFilters.includes(f)), ...imageFilters] 
                                : prev.filter(f => !imageFilters.includes(f))
                            );
                          }}
                        >
                          Images
                        </DropdownMenuCheckboxItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button onClick={() => setUploadModalOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" /> Upload
                    </Button>
                  </div>
                </div>
                
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[300px]">Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Last Modified</TableHead>
                        <TableHead className="w-[100px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vaultFiles.length > 0 ? (
                        vaultFiles
                          .filter(file => {
                            // Apply file type filters
                            const fileType = file.file_type || '';
                            const matchesType = showAllFiles || 
                              (activeFilters.length === 0) || 
                              activeFilters.some(filter => fileType.includes(filter));
                            
                            // Apply search filter
                            const matchesSearch = file.filename?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                              file.original_filename?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                              false;
                            
                            return matchesType && matchesSearch;
                          })
                          .map((file) => (
                          <TableRow key={file.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center space-x-2">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                                <span>
                                  {/* Display original filename if available, otherwise the filename */}
                                  {file.original_filename || file.filename || 'Unnamed File'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{file.file_type ? file.file_type.toUpperCase() : 'UNKNOWN'}</Badge>
                            </TableCell>
                            <TableCell>{file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'N/A'}</TableCell>
                            <TableCell>
                              {file.created_at ? 
                                formatDistanceToNow(new Date(file.created_at), { addSuffix: true }) : 
                                'N/A'}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleFilePreview(file)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Preview
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleFileDownload(file)}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Link className="mr-2 h-4 w-4" />
                                    Copy Link
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => handleFileDelete(file.id)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            No files found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              {/* File Upload Dialog */}
              {uploadModalOpen && (
                <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload Files</DialogTitle>
                      <DialogDescription>
                        Upload files to this vault. Supported formats: PDF, DOCX, XLSX, TXT, CSV, PNG, JPG.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <UploadFileModal 
                        onUploadComplete={(files: File[]) => {
                          handleFileUpload(files);
                          setUploadModalOpen(false);
                        }}
                        supportedFileTypes={[".pdf", ".docx", ".xlsx", ".txt", ".csv", ".png", ".jpg", ".jpeg"]}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              )}
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
