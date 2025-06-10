"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import {
  Plus,
  Search,
  MoreHorizontal,
  FolderIcon,
  FileText,
  Settings,
  MessageSquare,
  ArrowLeft,
  Star,
  Loader,
} from "lucide-react"
import { useEffect, useState } from "react"
import { InstructionDialog } from "./instructions-dialog"
import { useRouter } from "next/navigation"
import { Project } from "@/types/api"
import { getProject } from "@/api/projects"
import { uploadFiles, getVaultFilesByProject } from "@/api/vault"
import { VaultFile } from "@/types/api"
import { handleApiError } from "@/lib/utils/handle-api-error"
import { useToast } from "@/components/ui/use-toast"
import { UploadFileModal } from "./upload-file-modal"
import SearchInput from "@/components/ui/search-input"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"

export default function ProjectView({ projectId }: { projectId: number }) {
  const [project, setProject] = useState<Project | null>(null)
  const router = useRouter()

  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [pickedFiles, setPickedFiles] = useState<File[]>([])
  const [vaultFiles, setVaultFiles] = useState<VaultFile[]>([])
  const [search, setSearch] = useState("")
  const [tab, setTab] = useState("all")
  const { toast } = useToast()
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  // View mode: 'list' (table) or 'thumbnail' (grid)
  const [viewMode, setViewMode] = useState<'list' | 'thumbnail'>('list');

  // Upload picked files when they change
  // Fetch vault files on mount and after upload

  async function fetchFiles() {
    try {
      const files = await getVaultFilesByProject(projectId);
      setVaultFiles(files);
    } catch (error) {
      console.error(error);
      // Optionally handle error
    }
  }
  useEffect(() => {
   
    fetchFiles();
  }, [projectId, pickedFiles]);

  useEffect(() => {
    async function doUpload() {
      if (pickedFiles.length > 0) {
        setUploading(true);
        const uploaded_by = user?.id || 0;
        try {
          for (const file of pickedFiles) {
            await uploadFiles({
              file,
              project: projectId,
              uploaded_by,
            });
          }
          toast({ title: "Upload successful" });
          fetchFiles();
        } catch (error) {
          const { message } = handleApiError(error);
          toast({
            title: message || "Upload failed",
            variant: "destructive",
          });
        }
        setPickedFiles([]);
        setUploading(false);
      }
    }
    doUpload();
  }, [pickedFiles]);

  function onBack() {
    router.back()
  }

  async function fetchProject() {
    try {
      const response = await getProject(projectId)
      setProject(response)
    } catch (error) {
      const { message } = handleApiError(error)
      if (message) {
        toast({
          title: message,
          description: "Failed to fetch project",
          variant: "destructive",
        })
      }
    }
  }

  useEffect(() => {
    fetchProject()
  }, [])


  return (
    <div className="flex flex-col min-h-screen w-full max-w-4xl mx-auto px-2 sm:px-6 py-6 gap-4">
      {/* Header */}
      <div className="flex items-center gap-4 border-b pb-4">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={onBack}
          title="Back to projects"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center">
          <FolderIcon className="h-6 w-6 text-red-500" />
        </div>
        <h1 className="text-2xl font-semibold truncate flex-1">{project?.name}</h1>
        <Button variant="outline" className="gap-2" onClick={() => setUploadModalOpen(true)}>
          <FileText className="h-5 w-5" /> Upload File
        </Button>

      </div>

      {/* Search and Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
        <SearchInput
          placeholder="Search files..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <Card className="p-3 mb-2">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-medium">Files in this vault:</div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              aria-label="List view"
            >
              <FileText className="h-4 w-4 mr-1" /> List
            </Button>
            <Button
              variant={viewMode === 'thumbnail' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('thumbnail')}
              aria-label="Thumbnail view"
            >
              <FolderIcon className="h-4 w-4 mr-1" /> Thumbnails
            </Button>
          </div>
        </div>
        {viewMode === 'list' ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Filename</TableHead>
                  <TableHead>Uploaded By</TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vaultFiles.length > 0 ? (
                  vaultFiles
                    .filter(file =>
                      file.filename.toLowerCase().includes(search.toLowerCase())
                    )
                    .map(file => (
                      <TableRow key={file.id}>
                        <TableCell className="max-w-[220px] truncate">
                          <a
                            href={file.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline flex items-center gap-2"
                            title={file.filename}
                          >
                            <FileText className="w-4 h-4 text-muted-foreground inline" />
                            {file.filename}
                          </a>
                        </TableCell>
                        <TableCell>
                          {file.uploaded_by ? `User #${file.uploaded_by}` : "-"}
                        </TableCell>
                        <TableCell>
                          {file.created_at ? new Date(file.created_at).toLocaleString() : "-"}
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">No files found.</TableCell>
                  </TableRow>
                )}
                {/* Show uploading files at the bottom */}
                {uploading && pickedFiles.length > 0 && pickedFiles.map((file, idx) => (
                  <TableRow key={file.name + idx} className="opacity-60 italic">
                    <TableCell className="max-w-[220px] truncate">
                      <span className="flex items-center gap-2">
                        <FileText className="w-4 h-4 mr-1 text-muted-foreground animate-pulse" />
                        {file.name} (Uploading...)
                        <Loader className="animate-spin h-4 w-4 ml-2 text-primary" />
                      </span>
                    </TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {vaultFiles.length > 0 ? (
              vaultFiles
                .filter(file =>
                  file.filename.toLowerCase().includes(search.toLowerCase())
                )
                .map(file => (
                  <Card key={file.id} className="flex flex-col items-center p-3 gap-2 h-full">
                    <div className="flex items-center justify-center w-16 h-16 bg-muted rounded-md mb-2">
                      {file.filename.match(/\.(png|jpg|jpeg|gif)$/i) ? (
                        <img
                          src={file.file}
                          alt={file.filename}
                          className="object-contain w-12 h-12"
                        />
                      ) : (
                        <FileText className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <a
                      href={file.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline text-xs truncate max-w-[120px]"
                      title={file.filename}
                    >
                      {file.filename}
                    </a>
                    <div className="text-[10px] text-muted-foreground mt-1">{file.created_at ? new Date(file.created_at).toLocaleDateString() : "-"}</div>
                  </Card>
                ))
            ) : (
              <div className="col-span-full text-center text-muted-foreground">No files found.</div>
            )}
            {/* Show uploading files at the bottom */}
            {uploading && pickedFiles.length > 0 && pickedFiles.map((file, idx) => (
              <Card key={file.name + idx} className="flex flex-col items-center p-3 gap-2 h-full opacity-60 italic">
                <div className="flex items-center justify-center w-16 h-16 bg-muted rounded-md mb-2">
                  <FileText className="w-8 h-8 text-muted-foreground animate-pulse" />
                </div>
                <span className="text-xs truncate max-w-[120px]">{file.name} (Uploading...)</span>
                <Loader className="animate-spin h-4 w-4 text-primary mt-1" />
              </Card>
            ))}
          </div>
        )}
      </Card>


      <UploadFileModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        onFilesSelected={setPickedFiles}
        supportedTypes={[".pdf", ".png", "image/jpeg"]}
        maxFiles={5}
        title="Upload files"
      />
    </div>
  )
}
