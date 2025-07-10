"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X, FileText, AlertCircle, FolderPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import type { File as ApiFile, FileWithUI, Folder } from "@/types/knowledge-base"
import { uploadFiles } from "@/api/files"
import { TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from "../../../lib/constants";

interface FileUploadProps {
  onUploadComplete: (files: FileWithUI[]) => void
  folders: Folder[]
  currentFolderId: string | null
  knowledgeBaseId?: string
}

interface UploadingFile {
  file: globalThis.File
  progress: number
  error?: string
}

interface ApiResponse {
  uuid: string
  title: string
  description: string | null
  file_type: string
  file: string
  storage_bucket: number | null
  storage_path: string
  original_path: string | null
  uploaded_by: number | null
  team: number | null
  source: string | null
  visibility: "public" | "private"
  is_global: boolean
  created_at: string
  updated_at: string
}

export function FileUpload({ onUploadComplete, folders, currentFolderId, knowledgeBaseId }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<UploadingFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(currentFolderId)
  const [title, setTitle] = useState("")
  const [isGlobal, setIsGlobal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files)
      addFiles(newFiles)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      addFiles(newFiles)
    }
  }

  const handleFolderInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      addFiles(newFiles)
    }
  }

  const addFiles = (newFiles: File[]) => {
    const updatedFiles = [...files, ...newFiles.map((file) => ({ file, progress: 0 }))]
    setFiles(updatedFiles)
  }

  const removeFile = (index: number) => {
    const updatedFiles = [...files]
    updatedFiles.splice(index, 1)
    setFiles(updatedFiles)
  }

  const uploadFilesHandler = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      // Set all files to 50% progress before API call
      setFiles((currentFiles) =>
        currentFiles.map((file) => ({ ...file, progress: 50 }))
      );

      // Upload all files in parallel, each with its own title (file name)
      await Promise.all(
        files.map(async (fileObj) => {
          try {
            await uploadFiles([
              fileObj.file
            ], {
              title: title || "",
              description: "Files uploaded through knowledge base interface",
              ...(knowledgeBaseId && {
                knowledgebase_id: knowledgeBaseId,
                auto_ingest: true
              }),
              is_global: isGlobal
            });
          } catch (err) {
            // Optionally, set error on this fileObj
          }
        })
      );

      // Update progress to 100% for all files
      setFiles((currentFiles) =>
        currentFiles.map((file) => ({ ...file, progress: 100 }))
      );

      onUploadComplete([]);
      setFiles([]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload files");
    } finally {
      setUploading(false);
    }
  }

  const getThumbnailUrl = (fileType: string): string => {
    switch (fileType) {
      case 'pdf':
        return "/pdf-icon-stack.png"
      case 'docx':
        return "/document-stack.png"
      case 'csv':
      case 'xlsx':
        return "/spreadsheet.png"
      default:
        return "/document-stack.png"
    }
  }

  // Build folder options for select dropdown
  const folderOptions = [
    { id: null, name: "Root", path: "/" },
    ...folders.map((folder) => ({
      id: folder.id,
      name: folder.name,
      path: folder.path,
    })),
  ]

  return (
    <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto px-1">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="Enter a collection or folder name (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={uploading}
        />

      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-4 min-h-40 sm:p-8 text-center ${
          isDragging ? "border-primary bg-primary/5" : "border-border"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center m-4 justify-center space-y-3">
          <div className="rounded-full bg-primary/10 p-3">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Drag and drop files here or</p>
            <p className="text-xs text-muted-foreground">Supported formats: PDF, DOCX, XLSX, TXT, CSV, MD, JPEG, PNG</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-full sm:w-auto">
              Select Files
            </Button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            onChange={handleFileInputChange}
            accept=".pdf,.docx,.xlsx,.txt,.csv,.md,.jpg,.jpeg,.png"
          />
          <input
            type="file"
            ref={folderInputRef}
            className="hidden"
            multiple
            onChange={handleFolderInputChange}
          />
        </div>
      </div>

      {/* Is Global checkbox below upload area */}
      <div className="flex items-center gap-2 mb-2">
        <input
          id="is-global"
          type="checkbox"
          checked={isGlobal}
          onChange={(e) => setIsGlobal(e.target.checked)}
          disabled={uploading}
          className="accent-primary h-4 w-4"
        />
        <Label htmlFor="is-global" className="text-sm cursor-pointer select-none">Is Global</Label>
      </div>

      {files.length > 0 && (
        <div className="space-y-3">
          <div className="text-sm font-medium">Files to upload ({files.length})</div>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {files.map((fileObj, index) => (
              <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded border p-3 gap-2 sm:gap-0">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium break-all">{fileObj.file.name}</div>
                    <div className="text-xs text-muted-foreground">{(fileObj.file.size / 1024).toFixed(1)} KB</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                  {fileObj.progress > 0 && fileObj.progress < 100 && (
                    <Progress value={fileObj.progress} className="w-24" />
                  )}
                  {fileObj.error && <AlertCircle className="h-5 w-5 text-destructive" />}
                  <Button variant="ghost" size="icon" onClick={() => removeFile(index)} disabled={uploading}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Button onClick={uploadFilesHandler} disabled={uploading} className="w-full sm:w-auto">
              {uploading ? "Uploading..." : "Upload Files"}
            </Button>
          </div>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
