"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X, FileText, AlertCircle, FolderPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type { File as FileType, Folder } from "../types"

interface FileUploadProps {
  onUploadComplete: (files: FileType[]) => void
  folders: Folder[]
  currentFolderId: string | null
}

export function FileUpload({ onUploadComplete, folders, currentFolderId }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<{ file: File; progress: number; error?: string }[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(currentFolderId)
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

  const uploadFiles = async () => {
    if (files.length === 0) return

    setUploading(true)
    setError(null)

    const uploadedFiles: FileType[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const fileObj = files[i]

        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setFiles((currentFiles) => {
            const updatedFiles = [...currentFiles]
            if (updatedFiles[i] && updatedFiles[i].progress < 90) {
              updatedFiles[i] = { ...updatedFiles[i], progress: updatedFiles[i].progress + 10 }
            }
            return updatedFiles
          })
        }, 300)

        try {
          // In a real implementation, this would be an actual API call
          // const uploadedFile = await knowledgeBaseService.uploadFile(fileObj.file, selectedFolderId)

          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 2000))

          // Generate preview URL based on file type
          let previewUrl = undefined
          let thumbnailUrl = undefined

          if (fileObj.file.type.startsWith("image/")) {
            previewUrl = URL.createObjectURL(fileObj.file)
            thumbnailUrl = URL.createObjectURL(fileObj.file)
          } else if (fileObj.file.type === "application/pdf") {
            thumbnailUrl = "/pdf-icon-stack.png"
            previewUrl = URL.createObjectURL(fileObj.file)
          } else if (fileObj.file.type.includes("spreadsheet") || fileObj.file.type.includes("excel")) {
            thumbnailUrl = "/spreadsheet.png"
          } else if (fileObj.file.type.includes("word")) {
            thumbnailUrl = "/document-stack.png"
          }

          const uploadedFile: FileType = {
            id: `file-${Date.now()}-${i}`,
            name: fileObj.file.name,
            type: fileObj.file.type,
            size: fileObj.file.size,
            url: URL.createObjectURL(fileObj.file),
            uploadedAt: new Date().toISOString(),
            status: "ready",
            folderId: selectedFolderId,
            previewUrl,
            thumbnailUrl,
            linkedKnowledgeBases: [],
          }

          uploadedFiles.push(uploadedFile)

          // Update progress to 100%
          setFiles((currentFiles) => {
            const updatedFiles = [...currentFiles]
            updatedFiles[i] = { ...updatedFiles[i], progress: 100 }
            return updatedFiles
          })
        } catch (err) {
          setFiles((currentFiles) => {
            const updatedFiles = [...currentFiles]
            updatedFiles[i] = {
              ...updatedFiles[i],
              progress: 100,
              error: err instanceof Error ? err.message : "Upload failed",
            }
            return updatedFiles
          })
        } finally {
          clearInterval(progressInterval)
        }
      }

      onUploadComplete(uploadedFiles)
      setFiles([])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload files")
    } finally {
      setUploading(false)
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
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="folder-select">Upload to folder</Label>
        <Select value={selectedFolderId || ""} onValueChange={(value) => setSelectedFolderId(value || null)}>
          <SelectTrigger id="folder-select">
            <SelectValue placeholder="Select a folder" />
          </SelectTrigger>
          <SelectContent>
            {folderOptions.map((folder) => (
              <SelectItem key={folder.id || "root"} value={folder.id || ""}>
                {folder.path}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          isDragging ? "border-primary bg-primary/5" : "border-border"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="rounded-full bg-primary/10 p-3">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Drag and drop files here or</p>
            <p className="text-xs text-muted-foreground">Supported formats: PDF, DOCX, XLSX, TXT, CSV, MD, JPEG, PNG</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              Select Files
            </Button>
            <Button variant="outline" onClick={() => folderInputRef.current?.click()} disabled={uploading}>
              <FolderPlus className="h-4 w-4 mr-2" />
              Select Folder
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
            webkitdirectory=""
            directory=""
            multiple
            onChange={handleFolderInputChange}
          />
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-3">
          <div className="text-sm font-medium">Files to upload ({files.length})</div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {files.map((fileObj, index) => (
              <div key={index} className="flex items-center justify-between rounded border p-3">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">{fileObj.file.name}</div>
                    <div className="text-xs text-muted-foreground">{(fileObj.file.size / 1024).toFixed(1)} KB</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
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
          <div className="flex justify-end">
            <Button onClick={uploadFiles} disabled={uploading}>
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
