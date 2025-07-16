"use client"

import React, { useEffect } from "react"
import { motion } from "framer-motion"
import { FileIcon, Loader2, X, FileImage, FileText } from "lucide-react";

interface FilePreviewProps {
  file: File | { name: string; type: string; url: string };
  onRemove?: () => void;
  isUploading?: boolean;
}

// Utility to pick icon based on mimetype or extension
function getFileIcon(type: string, name: string) {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  if (type.startsWith("image/") || ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext)) {
    return <FileImage className="h-6 w-6 text-yellow-600" />;
  }
  if (type.startsWith("text/") || ["txt", "md"].includes(ext)) {
    return <FileText className="h-6 w-6 text-gray-600" />;
  }
  if (ext === "pdf") {
    return <FileText className="h-6 w-6 text-red-600" />; // Red for PDF
  }
  if (["doc", "docx"].includes(ext)) {
    return <FileText className="h-6 w-6 text-blue-600" />; // Blue for Word
  }
  if (["xls", "xlsx", "csv"].includes(ext)) {
    return <FileText className="h-6 w-6 text-green-600" />; // Green for spreadsheet
  }
  return <FileIcon className="h-6 w-6 text-foreground" />;
}

export const FilePreview = React.forwardRef<HTMLDivElement, FilePreviewProps>(
  (props, ref) => {
    // If the file is a pseudo-file with a URL (from backend), render a download link
    if ('url' in props.file && typeof props.file.url === 'string') {
      return (
        <motion.div
          ref={ref}
          className="relative flex max-w-[250px] rounded-md border p-1.5 pr-2 text-xs"
          layout
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
        >
          <div className="flex w-full items-center space-x-2">
            {getFileIcon(props.file.type, props.file.name)}
            <div className="flex flex-col min-w-0">
              <a
                href={props.file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-blue-600 hover:underline"
                download={props.file.name}
              >
                {props.file.name}
              </a>
              <span className="text-[10px] text-muted-foreground truncate">{props.file.type}</span>
            </div>
          </div>
          {props.onRemove && !props.isUploading ? (
            <button
              className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full border bg-background"
              type="button"
              onClick={props.onRemove}
              aria-label="Remove attachment"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          ) : null}
        </motion.div>
      );
    }
    // Otherwise, treat as a real File object
    if (props.file instanceof File) {
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
      // For generic files, show icon and mimetype
      return (
        <motion.div
          ref={ref}
          className="relative flex max-w-[250px] rounded-md border p-1.5 pr-2 text-xs"
          layout
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
        >
          <div className="flex w-full items-center space-x-2">
            {getFileIcon(props.file.type, props.file.name)}
            <div className="flex flex-col min-w-0">
              <span className="truncate text-muted-foreground">{props.file.name}</span>
              <span className="text-[10px] text-muted-foreground truncate">{props.file.type}</span>
            </div>
          </div>
          {props.onRemove && !props.isUploading ? (
            <button
              className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full border bg-background"
              type="button"
              onClick={props.onRemove}
              aria-label="Remove attachment"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          ) : null}
        </motion.div>
      );
    }
    // fallback (should not happen)
    return null;
  }
)
FilePreview.displayName = "FilePreview"

const ImageFilePreview = React.forwardRef<HTMLDivElement, FilePreviewProps>(
  (props, ref) => {
    if (!(props.file instanceof File)) return null;
    const { file, onRemove, isUploading } = props;
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
  (props, ref) => {
    if (!(props.file instanceof File)) return null;
    const { file, onRemove, isUploading } = props;
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
