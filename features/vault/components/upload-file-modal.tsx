import React, { useRef, useState, DragEvent, ChangeEvent } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { UploadCloud, X, AlertCircle, FileText } from "lucide-react"
import { uploadFiles } from "@/api/vault"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"

interface UploadFileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUploadComplete: (files: any[]) => void
  onFilesSelected?: (files: File[]) => void
  supportedTypes: string[]
  projectId: number
  maxFiles?: number
  title?: string
}

interface UploadingFile {
  file: File
  progress: number
  error?: string
}

export function UploadFileModal({
  open,
  onOpenChange,
  onUploadComplete,
  onFilesSelected,
  supportedTypes,
  projectId,
  maxFiles = 5,
  title = "Upload files",
}: UploadFileModalProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<UploadingFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    processFiles(Array.from(e.dataTransfer.files))
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return
    processFiles(Array.from(e.target.files))
  }

  function processFiles(input: File[]) {
    setError(null)
    const accepted = input.filter((file) =>
      supportedTypes.some((type) =>
        type.startsWith(".")
          ? file.name.toLowerCase().endsWith(type.toLowerCase())
          : file.type === type
      )
    )
    if (accepted.length === 0) {
      setError("No supported files selected.")
      return
    }
    if (accepted.length + files.length > maxFiles) {
      setError(`You can upload up to ${maxFiles} files.`)
      return
    }

    // If onFilesSelected is provided (for auto-upload), call it and close modal
    if (onFilesSelected) {
      onFilesSelected(accepted)
      onOpenChange(false)
      return
    }

    // Otherwise, add files to the list for manual upload
    const newUploadingFiles = accepted.map((file) => ({ file, progress: 0 }))
    setFiles((prev) => [...prev, ...newUploadingFiles])
  }

  function handleRemoveFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  async function handleUpload() {
    if (!files.length) return

    setUploading(true)
    setError(null)
    const uploaded: any[] = []
    const failedFiles: { file: File; error: string }[] = []

    for (const [idx, fileObj] of files.entries()) {
      try {
        setFiles((prev) =>
          prev.map((f, i) => (i === idx ? { ...f, progress: 50 } : f))
        )

        const result = await uploadFiles({
          file: fileObj.file,
          project_uuid: projectId.toString(),
          uploaded_by: user?.id || 0,
          parent_id: 0, // Root level folder
        })
        uploaded.push(result)

        setFiles((prev) =>
          prev.map((f, i) => (i === idx ? { ...f, progress: 100 } : f))
        )
      } catch (err: any) {
        setFiles((prev) =>
          prev.map((f, i) =>
            i === idx ? { ...f, error: err?.message || "Failed to upload", progress: 0 } : f
          )
        )
        failedFiles.push({ file: fileObj.file, error: err?.message || "Upload failed" })
        toast({
          title: "Upload Failed",
          description: `${fileObj.file.name}: ${err?.message || 'Upload failed'}`,
          variant: "destructive"
        })
      }
    }

    setUploading(false)

    if (uploaded.length) {
      onUploadComplete(uploaded)

      // Show success toast
      if (failedFiles.length > 0) {
        // Partial success
        toast({
          title: "Upload Partially Successful",
          description: `${uploaded.length} file(s) uploaded successfully, ${failedFiles.length} file(s) failed`,
          variant: "default"
        })
      } else {
        // All files succeeded
        toast({ title: "Success", description: `${uploaded.length} file(s) uploaded successfully` })
      }

      setTimeout(() => setFiles([]), 1500)
      onOpenChange(false)
    } else if (failedFiles.length > 0) {
      // All files failed
      toast({
        title: "Upload Failed",
        description: `All ${failedFiles.length} file(s) failed to upload`,
        variant: "destructive"
      })
    }
  }

  function handleClick() {
    inputRef.current?.click()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-4 space-y-2">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">{title}</DialogTitle>
        </DialogHeader>

        <div
          className={cn(
            "flex flex-col items-center justify-center border-2 border-dashed rounded-md transition-colors cursor-pointer w-full min-h-[100px] text-center bg-muted/60 py-4",
            isDragging ? "border-primary bg-primary/10" : "border-muted"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
          tabIndex={0}
          role="button"
          aria-label="Upload files"
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            multiple={maxFiles > 1}
            accept={supportedTypes.join(",")}
            onChange={handleInputChange}
          />
          <UploadCloud className="h-7 w-7 text-muted-foreground mb-1" />
          <span className="text-xs text-muted-foreground mb-1">Drag & drop or click</span>
          <span className="text-xs text-muted-foreground">{supportedTypes.join(", ")}</span>
        </div>

        {files.length > 0 && (
          <ul className="space-y-2 max-h-40 overflow-auto w-full">
            {files.map((fileObj, idx) => (
              <li key={fileObj.file.name + idx} className="flex items-center justify-between text-xs bg-background rounded px-2 py-1 border">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="truncate max-w-[120px]" title={fileObj.file.name}>{fileObj.file.name}</span>
                  {fileObj.progress > 0 && fileObj.progress < 100 && (
                    <Progress value={fileObj.progress} className="w-20" />
                  )}
                  {fileObj.error && <AlertCircle className="w-4 h-4 text-destructive" />}
                </div>
                <button
                  type="button"
                  className="ml-2 text-destructive hover:underline"
                  onClick={() => handleRemoveFile(idx)}
                  disabled={uploading}
                >
                  <X className="w-3 h-3" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <DialogFooter className="mt-2">
          <DialogClose asChild>
            <Button variant="ghost" size="sm" type="button" disabled={uploading}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            size="sm"
            type="button"
            onClick={handleUpload}
            disabled={!files.length || uploading}
          >
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
