"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X, FileText, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { uploadFiles } from "@/api/vault"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"

interface FileUploadProps {
  onUploadComplete: (files: any[]) => void
  projectId: string
  title?: string
}

interface UploadingFile {
  file: File
  progress: number
  error?: string
}

export function FileUpload({ onUploadComplete, projectId, title }: FileUploadProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<UploadingFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const addFiles = (newFiles: File[]) => {
    // Filter for supported file types
    const supportedFileTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.csv', '.png', '.jpg', '.jpeg']
    const validFiles = newFiles.filter(file => {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      return supportedFileTypes.includes(extension);
    });
    
    if (validFiles.length === 0) {
      setError("No supported file types selected.");
      return;
    }
    
    if (validFiles.length !== newFiles.length) {
      setError(`${newFiles.length - validFiles.length} unsupported file(s) were skipped.`);
    }
    
    const updatedFiles = [...files, ...validFiles.map((file) => ({ file, progress: 0 }))]
    setFiles(updatedFiles)
  }

  const removeFile = (index: number) => {
    const updatedFiles = [...files]
    updatedFiles.splice(index, 1)
    setFiles(updatedFiles)
  }

  const uploadFilesHandler = async () => {
    if (files.length === 0) return;

    // Check for user authentication
    if (!user) {
      setError("You must be logged in to upload files.");
      toast({
        title: "Upload Failed",
        description: "You must be logged in to upload files.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Set all files to 50% progress before API call
      setFiles((currentFiles) =>
        currentFiles.map((file) => ({ ...file, progress: 50 }))
      );

      // Upload all files
      const uploadedFiles = [];
      const failedFiles: { file: File; error: string }[] = [];

      for (const fileObj of files) {
        try {
          // Pass file and project parameters directly to the uploadFiles function
          const result = await uploadFiles({
            file: fileObj.file,
            project_uuid: projectId,
            uploaded_by: user?.id || 0
          });
          uploadedFiles.push(result);
        } catch (err: any) {
          console.error("Error uploading file:", fileObj.file.name, err);
          setError(`Error uploading ${fileObj.file.name}`);
          failedFiles.push({ file: fileObj.file, error: err?.message || "Upload failed" });
          toast({
            title: "Upload Failed",
            description: `${fileObj.file.name}: ${err?.message || 'Upload failed'}`,
            variant: "destructive"
          });
        }
      }

      // Update progress to 100% for all files
      setFiles((currentFiles) =>
        currentFiles.map((file) => ({ ...file, progress: 100 }))
      );

      // Pass uploaded files to parent component immediately
      onUploadComplete(uploadedFiles);

      // Show success toast
      if (failedFiles.length > 0) {
        // Partial success
        toast({
          title: "Upload Partially Successful",
          description: `${uploadedFiles.length} file(s) uploaded successfully, ${failedFiles.length} file(s) failed`,
          variant: "default"
        });
      } else {
        // All files succeeded
        toast({ title: "Success", description: `${uploadedFiles.length} file(s) uploaded successfully` });
      }

      // Reset state after successful upload
      setFiles([]);

    } catch (error: any) {
      console.error("Upload failed:", error);
      setError("Upload failed. Please try again.");
      toast({
        title: "Upload Failed",
        description: "Upload failed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">

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
            <p className="text-xs text-muted-foreground">Supported formats: PDF, DOCX, XLSX, TXT, CSV, PNG, JPG</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-auto">
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-auto">
              Select Files
            </Button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            onChange={handleFileInputChange}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.jpg,.jpeg,.png"
          />
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-3 w-full">
          <div className="text-sm font-medium">Files to upload ({files.length})</div>
          <div className="space-y-2 max-h-[200px] overflow-y-auto w-full">
            {files.map((fileObj, index) => (
              <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded border p-3 gap-2 sm:gap-0 w-full">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium break-all">{fileObj.file.name}</div>
                    <div className="text-xs text-muted-foreground">{(fileObj.file.size / 1024).toFixed(1)} KB</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 w-auto justify-end">
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
          <div className="flex justify-end gap-2">
            <Button onClick={uploadFilesHandler} disabled={uploading} className="w-auto">
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
