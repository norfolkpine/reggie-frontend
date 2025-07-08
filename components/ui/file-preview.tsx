"use client"

import React, { useEffect } from "react"
import { motion } from "framer-motion"
import { FileIcon, Loader2, X } from "lucide-react" // Added Loader2

interface FilePreviewProps {
  file: File
  onRemove?: () => void
  isUploading?: boolean // Added isUploading prop
}

export const FilePreview = React.forwardRef<HTMLDivElement, FilePreviewProps>(
  (props, ref) => {
    if (props.file.type.startsWith("image/")) {
      return <ImageFilePreview {...props} ref={ref} />
    }

    if (
      props.file.type.startsWith("text/") ||
      props.file.name.endsWith(".txt") ||
      props.file.name.endsWith(".md")
    ) {
      return <TextFilePreview {...props} ref={ref} />
    }

    return <GenericFilePreview {...props} ref={ref} />
  }
)
FilePreview.displayName = "FilePreview"

const ImageFilePreview = React.forwardRef<HTMLDivElement, FilePreviewProps>(
  ({ file, onRemove, isUploading }, ref) => { // Added isUploading
    return (
      <motion.div
        ref={ref}
        className="relative flex max-w-[200px] rounded-md border p-1.5 pr-2 text-xs"
        layout
        initial={{ opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: "100%" }}
      >
        <div className="flex w-full items-center space-x-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={`Attachment ${file.name}`}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-sm border bg-muted object-cover"
            src={URL.createObjectURL(file)}
          />
          {isUploading && (
            <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-black/50">
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            </div>
          )}
          <span className="w-full truncate text-muted-foreground">
            {file.name}
          </span>
        </div>

        {onRemove && !isUploading ? ( // Hide remove button during upload
          <button
            className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full border bg-background"
            type="button"
            onClick={onRemove}
            aria-label="Remove attachment"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        ) : null}
      </motion.div>
    )
  }
)
ImageFilePreview.displayName = "ImageFilePreview"

const TextFilePreview = React.forwardRef<HTMLDivElement, FilePreviewProps>(
  ({ file, onRemove, isUploading }, ref) => { // Added isUploading
    const [preview, setPreview] = React.useState<string>("")

    useEffect(() => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        setPreview(text.slice(0, 50) + (text.length > 50 ? "..." : ""))
      }
      reader.readAsText(file)
    }, [file])

    return (
      <motion.div
        ref={ref}
        className="relative flex max-w-[200px] rounded-md border p-1.5 pr-2 text-xs"
        layout
        initial={{ opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: "100%" }}
      >
        <div className="flex w-full items-center space-x-2">
          <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-sm border bg-muted p-0.5"> {/* Added relative positioning */}
            <div className="h-full w-full overflow-hidden text-[6px] leading-none text-muted-foreground">
              {preview || "Loading..."}
            </div>
            {isUploading && (
              <div className="absolute inset-0 flex h-full w-full items-center justify-center rounded-sm bg-black/50">
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              </div>
            )}
          </div>
          <span className="w-full truncate text-muted-foreground">
            {file.name}
          </span>
        </div>

        {onRemove && !isUploading ? ( // Hide remove button during upload
          <button
            className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full border bg-background"
            type="button"
            onClick={onRemove}
            aria-label="Remove attachment"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        ) : null}
      </motion.div>
    )
  }
)
TextFilePreview.displayName = "TextFilePreview"

const GenericFilePreview = React.forwardRef<HTMLDivElement, FilePreviewProps>(
  ({ file, onRemove, isUploading }, ref) => { // Added isUploading
    return (
      <motion.div
        ref={ref}
        className="relative flex max-w-[200px] rounded-md border p-1.5 pr-2 text-xs"
        layout
        initial={{ opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: "100%" }}
      >
        <div className="flex w-full items-center space-x-2">
          <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-sm border bg-muted"> {/* Added relative positioning */}
            <FileIcon className="h-6 w-6 text-foreground" />
            {isUploading && (
              <div className="absolute inset-0 flex h-full w-full items-center justify-center rounded-sm bg-black/50">
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              </div>
            )}
          </div>
          <span className="w-full truncate text-muted-foreground">
            {file.name}
          </span>
        </div>

        {onRemove && !isUploading ? ( // Hide remove button during upload
          <button
            className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full border bg-background"
            type="button"
            onClick={onRemove}
            aria-label="Remove attachment"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        ) : null}
      </motion.div>
    )
  }
)
GenericFilePreview.displayName = "GenericFilePreview"
