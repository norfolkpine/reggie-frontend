export interface Folder {
  id: string
  name: string
  parentId: string | null
  path: string
  createdAt: string
}

export interface Collection {
  id: number;
  name: string;
}

export interface File {
  uuid: string
  title: string
  description?: string
  file_type: string
  file: string
  storage_bucket?: number
  storage_path: string
  original_path?: string
  uploaded_by?: number
  team?: number
  source?: string
  visibility: "public" | "private"
  is_global: boolean
  created_at: string
  updated_at: string
  file_size?: number
  collection?: Collection
}

export interface FileWithUI extends File {
  status: "ready" | "processing" | "error"
  errorMessage?: string
  folderId: string | null
  previewUrl?: string
  thumbnailUrl?: string
  linkedKnowledgeBases: string[] // IDs of knowledge bases this file is linked to
}

export interface KnowledgeBase {
  id: number
  name: string
  description?: string
  knowledge_type: KnowledgeTypeEnum
  path?: string
  unique_code: string
  knowledgebase_id: string
  vector_table_name: string
  chunk_size?: number
  chunk_overlap?: number
  created_at: string
  updated_at: string
  model_provider?: number
  permissions?: KnowledgeBasePermission[],
  role?: "owner" | "editor" | "viewer"
}

export enum KnowledgeTypeEnum {
  AGNO_PGVECTOR = 'agno_pgvector',
  LLAMAINDEX = 'llamaindex',
  ARXIV = 'arxiv',
  COMBINED = 'combined',
  CSV = 'csv',
  DOCUMENT = 'document',
  JSON = 'json',
  LANGCHAIN = 'langchain',
  PDF = 'pdf',
  PDF_URL = 'pdf_url',
  S3_PDF = 's3_pdf',
  S3_TEXT = 's3_text',
  TEXT = 'text',
  WEBSITE = 'website',
  WIKIPEDIA = 'wikipedia',
  OTHER = 'other'
}

export interface KnowledgeBasePermission {
  id: string
  userId?: string
  team_id?: number
  team_name?: string
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

// API response types
export interface ListFilesWithKbsParams extends Record<string, string | undefined> {
  page: string
  page_size: string
  search?: string
  type?: string
}

export interface FileUploadOptions {
  title?: string
  description?: string
  team?: number
  auto_ingest?: boolean
  is_global?: boolean
  knowledgebase_id?: string
}

export interface FileUploadResponse {
  message: string
  documents: File[]
  failed_uploads: Record<string, any>[]
}

export interface PaginatedKnowledgeBaseList {
  count: number
  next: string | null
  previous: string | null
  results: KnowledgeBase[]
}

export interface PatchedKnowledgeBase extends Partial<Omit<KnowledgeBase, 'id' | 'unique_code' | 'knowledgebase_id' | 'vector_table_name' | 'created_at' | 'updated_at'>> {}

export interface PaginatedFileList {
  count: number
  next: string | null
  previous: string | null
  results: File[]
}

export interface KnowledgeBaseFile {
  file_id: string
  title: string
  description: string | null
  file_type: string
  filesize: number
  page_count: number
  created_at: string
  updated_at: string
  status: "pending" | "processing" | "completed" | "failed"
  progress: number
  error: string | null
  processed_docs: number
  total_docs: number
  chunk_size: number
  chunk_overlap: number
  collection?: Collection
}

export interface PaginatedKnowledgeBaseFileList {
  count: number
  next: string | null
  previous: string | null
  results: KnowledgeBaseFile[]
}
