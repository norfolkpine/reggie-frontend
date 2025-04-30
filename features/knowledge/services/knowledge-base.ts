export interface Folder {
  id: string
  name: string
  parentId: string | null
  path: string
  createdAt: string
}

export interface File {
  id: string
  name: string
  type: string
  size: number
  url: string
  uploadedAt: string
  status: "ready" | "processing" | "error"
  errorMessage?: string
  folderId: string | null
  previewUrl?: string
  thumbnailUrl?: string
  linkedKnowledgeBases?: string[] // IDs of knowledge bases this file is linked to
}

export interface KnowledgeBase {
  id: string
  name: string
  description: string
  documentCount: number
  createdAt: string
  updatedAt: string
  embeddingModel: string // Added field for embedding model
  chunkMethod: string // Added field for chunk method
  chunkSize?: number // Optional chunk size parameter
  chunkOverlap?: number // Optional chunk overlap parameter
  permissions: KnowledgeBasePermission[] // Added field for permissions
}

export interface KnowledgeBasePermission {
  id: string
  userId?: string
  teamId?: string
  role: "owner" | "editor" | "viewer"
}

export interface FileKnowledgeBaseLink {
  id: string
  fileId: string
  knowledgeBaseId: string
  status: "pending" | "processing" | "completed" | "failed" | "disabled"
  createdAt: string
  updatedAt: string
  errorMessage?: string
}

export interface LinkFilesRequest {
  fileIds: string[]
  knowledgeBaseId: string
}

export interface LinkFilesResponse {
  success: boolean
  message: string
  links: FileKnowledgeBaseLink[]
}

export interface FilePreview {
  fileId: string
  fileType: string
  previewType: "image" | "pdf" | "text" | "spreadsheet" | "unsupported"
  content: string | null // URL for images/PDFs, text content for text files
  thumbnailUrl?: string
}

export interface IngestRequest {
  fileIds: string[]
  knowledgeBaseId: string
}

export interface DocumentKnowledgeLink {
  id: string
  documentId: string
  knowledgeBaseId: string
  createdAt: string
}

export interface IngestResponse {
  success: boolean
  message: string
}

// Added types for embedding models and chunk methods
export interface EmbeddingModel {
  id: string
  name: string
  provider: string
  description: string
  dimensions: number
  isDefault?: boolean
}

export interface ChunkMethod {
  id: string
  name: string
  description: string
  supportsCustomSize: boolean
  supportsOverlap: boolean
  isDefault?: boolean
}
