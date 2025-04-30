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
import { cn } from "@/lib/utils"
import { UploadCloud, X } from "lucide-react"

interface UploadFileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onFilesSelected: (files: File[]) => void
  supportedTypes: string[]
  maxFiles?: number
  title?: string
}

export function UploadFileModal({
  open,
  onOpenChange,
  onFilesSelected,
  supportedTypes,
  maxFiles = 5,
  title = "Upload files",
}: UploadFileModalProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pickedFiles, setPickedFiles] = useState<File[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    processFiles(files)
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
    const files = Array.from(e.target.files)
    processFiles(files)
  }

  function processFiles(files: File[]) {
    setError(null)
    const accepted = files.filter((file) =>
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
    if (accepted.length > maxFiles) {
      setError(`You can upload up to ${maxFiles} files.`)
      return
    }
    setPickedFiles(accepted)
  }

  function handleClick() {
    inputRef.current?.click()
  }

  function handleRemoveFile(idx: number) {
    setPickedFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  function handleConfirm() {
    if (pickedFiles.length) {
      onFilesSelected(pickedFiles)
      setPickedFiles([])
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-4">
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
        {pickedFiles.length > 0 && (
          <ul className="mt-2 space-y-1 max-h-24 overflow-auto w-full">
            {pickedFiles.map((file, idx) => (
              <li key={file.name + idx} className="flex items-center justify-between text-xs bg-background rounded px-2 py-1 border">
                <span className="truncate max-w-[120px]" title={file.name}>{file.name}</span>
                <button type="button" className="ml-2 text-destructive hover:underline" onClick={() => handleRemoveFile(idx)}>
                  <X className="w-3 h-3" />
                </button>
              </li>
            ))}
          </ul>
        )}
        {error && <div className="text-xs text-destructive mt-1">{error}</div>}
        <DialogFooter className="mt-2">
          <DialogClose asChild>
            <Button variant="ghost" size="sm" type="button">Cancel</Button>
          </DialogClose>
          <Button size="sm" type="button" onClick={handleConfirm} disabled={!pickedFiles.length}>
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 