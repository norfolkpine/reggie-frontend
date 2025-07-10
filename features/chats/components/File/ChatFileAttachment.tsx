import React from "react";
import { FileIcon, Loader2 } from "lucide-react";

interface ChatFileAttachmentProps {
  file: File | {
    name: string;
    url: string;
    mimeType: string;
    size?: number;
  };
  isUploading?: boolean;
  progress?: number; // 0-100
  onRemove?: () => void;
}

export const ChatFileAttachment: React.FC<ChatFileAttachmentProps> = ({ file, isUploading = false, progress, onRemove }) => {
  // Normalize file props
  const name = file instanceof File ? file.name : file.name;
  const mimeType = file instanceof File ? file.type : file.mimeType;
  const size = file instanceof File ? file.size : file.size;
  const url = file instanceof File ? URL.createObjectURL(file) : file.url;

  const isImage = mimeType.startsWith("image/");
  const isText = mimeType.startsWith("text/") || name.endsWith(".txt") || name.endsWith(".md");

  return (
    <div className="relative flex max-w-[250px] rounded-md border p-2 pr-3 text-xs bg-muted/40">
      <div className="flex w-full items-center space-x-2">
        {isImage ? (
          <img
            alt={name}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-sm border bg-muted object-cover"
            src={url}
          />
        ) : isText ? (
          <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-sm border bg-muted p-0.5">
            <span className="h-full w-full overflow-hidden text-[7px] leading-none text-muted-foreground">
              {name}
            </span>
          </div>
        ) : (
          <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-sm border bg-muted">
            <FileIcon className="h-6 w-6 text-foreground" />
          </div>
        )}
        <div className="flex flex-col min-w-0">
          <span className="truncate font-medium text-foreground" title={name}>{name}</span>
          <span className="truncate text-xs text-muted-foreground">{mimeType}{size ? ` • ${(size/1024).toFixed(1)} KB` : ""}</span>
        </div>
      </div>
      {isUploading && (
        <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-black/40 rounded-md">
          <Loader2 className="h-5 w-5 animate-spin text-white" />
          {typeof progress === "number" && (
            <span className="ml-2 text-xs text-white">{progress}%</span>
          )}
        </div>
      )}
      {onRemove && !isUploading && (
        <button
          className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full border bg-background"
          type="button"
          onClick={onRemove}
          aria-label="Remove attachment"
        >
          <span className="text-xs">×</span>
        </button>
      )}
    </div>
  );
}; 