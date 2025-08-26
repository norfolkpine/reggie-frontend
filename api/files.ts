import { api, BASE_URL, triggerTokenExpiration } from '@/lib/api-client';
import { File, PaginatedFileList, PatchedFile } from '../types/api';
import { TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from "../lib/constants";
import { getCSRFToken } from './utils';

const ENDPOINT = '/reggie/api/v1/files/'

// Response types from OpenAPI spec
interface UploadFileResponse {
  message: string;
  documents: File[];
  failed_uploads: Record<string, any>[];
}

interface FileIngest {
  file_ids: string[];
  knowledgebase_ids: string[];
}

export const getFiles = async (page: number = 1,page_size: number,
  search: string) => {
  const response = await api.get(ENDPOINT, {
    params: { page: page.toString(), page_size: page_size.toString(), search: search },
  });
  return response as PaginatedFileList;
};

export const getFile = async (uuid: string) => {
  const response = await api.get(`${ENDPOINT}${uuid}/`);
  return response as File;
};

export const createFile = async (file: Omit<Partial<File>, 'uuid' | 'created_at' | 'updated_at'>) => {
  const response = await api.post(ENDPOINT, file);
  return response as File;
};

export const updateFile = async (uuid: string, file: Omit<Partial<File>, 'uuid' | 'created_at' | 'updated_at'>) => {
  const response = await api.put(`${ENDPOINT}${uuid}/`, file);
  return response as File;
};

export const patchFile = async (uuid: string, file: PatchedFile) => {
  const response = await api.patch(`${ENDPOINT}${uuid}/`, file);
  return response as File;
};

export const deleteFile = async (uuid: string) => {
  await api.delete(`${ENDPOINT}${uuid}/`);
};

export const reingestFile = async (uuid: string, file: Partial<File>) => {
  const response = await api.post(`${ENDPOINT}${uuid}/reingest/`, file);
  return response as File;
};

export const updateFileProgress = async (uuid: string, file: Partial<File>) => {
  const response = await api.post(`${ENDPOINT}${uuid}/update-progress/`, file);
  return response as File;
};

interface FileUploadOptions {
  title?: string;
  description?: string;
  team?: number;
  auto_ingest?: boolean;
  is_global?: boolean;
  knowledgebase_id?: string;
  is_ephemeral?: boolean;
  session_id?: string;
  collection_uuid?: string; // Add support for uploading to specific collections
}

export const uploadFiles = async (files: globalThis.File[], options?: FileUploadOptions) => {
  const formData = new FormData();
  
  files.forEach((file) => {
    formData.append('files', file);
  });
  
  if (options) {
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value.toString());
      }
    });
  }

  const csrfToken = getCSRFToken();
  const response = await fetch(BASE_URL+'/reggie/api/v1/files/', {
    method: 'POST',
    body: formData,
    credentials: 'include',
    headers: {
      ...(csrfToken && { "X-CSRFToken": csrfToken }),
    }
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      // Use centralized auth context for consistent handling
      triggerTokenExpiration();
      throw new Error('Authentication failed');
    }
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data as UploadFileResponse;
};

type ListFilesParams = Record<string, string> & {
  keywords?: string;
  page?: string;
  page_size?: string;
  type?: string;
};

export const listFiles = async (params?: ListFilesParams) => {
  const response = await api.get(ENDPOINT + 'list/', { params });
  return response as PaginatedFileList;
};

type ListFilesWithKbsParams = Record<string, string> & {
  page?: string;
  page_size?: string;
  search?: string;
  type?: string;
};

export const listFilesWithKbs = async (params?: ListFilesWithKbsParams) => {
  const response = await api.get(ENDPOINT + 'list-with-kbs/', { params });
  return response as PaginatedFileList;
};

export const ingestSelectedFiles = async (data: FileIngest) => {
  const response = await api.post(ENDPOINT + 'ingest-selected/', data);
  return response as FileIngest;
};

export const linkFilesToKb = async (data: Partial<File>) => {
  const response = await api.post(ENDPOINT + 'link-to-kb/', data);
  return response as File;
};

export const unlinkFilesFromKb = async (data: Partial<File>) => {
  const response = await api.post(ENDPOINT + 'unlink-from-kb/', data);
  return response as File;
};

export const unlinkFilesFromKbBulk = async (data: FileIngest) => {
  const response = await api.post(ENDPOINT + 'unlink-from-kb/', data);
  return response as FileIngest;
};

/**
 * Bulk delete and unlink files from knowledgebases.
 * @param fileIds Array of file UUIDs to delete
 * @param knowledgebaseIds (Optional) Array of knowledgebase IDs to unlink from
 * @returns Summary of unlink and delete results
 */
export const bulkDeleteAndUnlink = async (
  fileIds: string[],
  knowledgebaseIds?: string[]
): Promise<{
  unlinkResult?: FileIngest | null;
  deleteResults: { uuid: string; success: boolean; error?: any }[];
}> => {
  let unlinkResult: FileIngest | null = null;
  if (knowledgebaseIds && knowledgebaseIds.length > 0) {
    try {
      unlinkResult = await unlinkFilesFromKbBulk({ file_ids: fileIds, knowledgebase_ids: knowledgebaseIds });
    } catch (error) {
      // Continue to delete even if unlink fails
      unlinkResult = null;
    }
  }

  const deleteResults = await Promise.all(
    fileIds.map(async (uuid) => {
      try {
        await deleteFile(uuid);
        return { uuid, success: true };
      } catch (error) {
        return { uuid, success: false, error };
      }
    })
  );

  return { unlinkResult, deleteResults };
};

interface BulkFileUploadRequest {
  files: string[];
  title?: string;
  description?: string;
  team?: number;
}

export const bulkUploadFiles = async (data: BulkFileUploadRequest) => {
  const response = await api.post('/reggie/api/v1/files/bulk-upload/', data);
  return response as any;
};

export const uploadFilesWithFormData = async (files: globalThis.File[], options?: { title?: string; description?: string; team?: number }) => {
  const formData = new FormData();
  
  files.forEach((file, index) => {
    formData.append(`files`, file);
  });
  
  if (options?.title) {
    formData.append('title', options.title);
  }
  
  if (options?.description) {
    formData.append('description', options.description);
  }
  
  if (options?.team) {
    formData.append('team', options.team.toString());
  }
  
  const response = await api.post('/reggie/api/v1/files/bulk-upload/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response as any;
}; 