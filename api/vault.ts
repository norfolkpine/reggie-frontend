import { api } from '@/lib/api-client';
import { VaultFile } from '../types/api';
import { handleApiError } from '@/lib/utils/handle-api-error';

export interface UploadFileParams {
  file: File;
  project_uuid: string;
  uploaded_by: number;
  parent_id?: number;
  team?: number;
  shared_with_users?: number[];
  shared_with_teams?: number[];
}

export interface VaultFilesResponse {
  results: VaultFile[];
  count: number;
  next: string | null;
  previous: string | null;
}

export async function getVaultFilesByProject(
  projectId: string,
  page: number = 1,
  pageSize: number = 10,
  search: string = '',
  parentId: number = 0
): Promise<VaultFilesResponse> {
  let url = `/reggie/api/v1/vault-files/by-project/?project_uuid=${projectId}&page=${page}&page_size=${pageSize}&parent_id=${parentId}`;
  
  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }
  
  const response = await api.get(url);
  return response as VaultFilesResponse;
}

export async function uploadFiles({
  file,
  project_uuid,
  uploaded_by,
  parent_id = 0,
  team,
  shared_with_users,
  shared_with_teams,
}: UploadFileParams) {
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('project_uuid', project_uuid);
  formData.append('uploaded_by', String(uploaded_by));
  formData.append('is_folder', '0');  // This is a file
  formData.append('parent_id', String(parent_id));
  if (typeof team !== 'undefined' && team !== null) {
    formData.append('team', String(team));
  }
  if (shared_with_users) {
    shared_with_users.forEach((user) => formData.append('shared_with_users', String(user)));
  }
  if (shared_with_teams) {
    shared_with_teams.forEach((team) => formData.append('shared_with_teams', String(team)));
  }


  try {
    const response = await api.postMultipart('/reggie/api/v1/vault-files/', formData);
    return response as VaultFile;
  } catch (error: any) {
    const message = error?.message || 'Upload failed';
    console.error(message);
    throw new Error(message);
  }
}

export async function createFolder({
  folderName,
  project_uuid,
  uploaded_by,
  parent_id = 0,
  team,
}: {
  folderName: string;
  project_uuid: string;
  uploaded_by: number;
  parent_id?: number;
  team?: number;
}): Promise<VaultFile> {
  const formData = new FormData();
  formData.append('original_filename', folderName);
  formData.append('project_uuid', project_uuid);
  formData.append('uploaded_by', String(uploaded_by));
  formData.append('is_folder', '1');  // This is a folder
  formData.append('parent_id', String(parent_id));
  formData.append('type', 'folder');
  if (typeof team !== 'undefined' && team !== null) {
    formData.append('team', String(team));
  }

  try {
    const response = await api.postMultipart('/reggie/api/v1/vault-files/', formData);
    return response as VaultFile;
  } catch (error: any) {
    const message = error?.message || 'Failed to create folder';
    console.error(message);
    throw new Error(message);
  }
}

export async function deleteVaultFile(fileId: number, force: boolean = false): Promise<void> {
  try {
    const url = `/reggie/api/v1/vault-files/${fileId}/${force ? '?force=true' : ''}`;
    await api.delete(url);
  } catch (error) {
    const { message } = handleApiError(error);
    throw new Error(message || 'Failed to delete file');
  }
}

export async function attemptDeleteFile(fileId: number): Promise<{ success: boolean; needsConfirmation?: boolean; children_count?: number; message?: string }> {
  try {
    await deleteVaultFile(fileId, true);
    console.log('Delete successful for file:', fileId);
    return { success: true };
  } catch (error: any) {
    // The API client throws the parsed JSON response directly
    // Check if it's a "folder contains items" error
    if (error?.error === "Folder contains items" && typeof error?.children_count === 'number') {
      console.log('Returning needsConfirmation=true');
      return {
        success: false,
        needsConfirmation: true,
        children_count: error.children_count,
        message: error.message
      };
    }
    
    console.log('Re-throwing error as it does not match criteria');
    // Re-throw if it's a different error
    throw error;
  }
}

export async function moveVaultFiles(fileIds: number[], targetFolderId: number): Promise<void> {
  try {
    await api.post('/reggie/api/v1/vault-files/move/', {
      file_ids: fileIds,
      target_folder_id: targetFolderId
    });
  } catch (error) {
    const { message } = handleApiError(error);
    throw new Error(message || 'Failed to move files');
  }
}

export interface AiInsightsRequest {
  question: string;
  project_uuid: string;
  parent_id?: number;
  file_ids?: number[];
}

export interface AiInsightsResponse {
  response: string;
  insights: {
    summary?: string;
    key_points?: string[];
    file_types?: string[];
    suggestions?: string[];
  };
  processed_files_count: number;
}

export async function getAiInsights({
  question,
  project_uuid,
  parent_id = 0,
  file_ids
}: AiInsightsRequest): Promise<AiInsightsResponse> {
  try {
    const response = await api.post('/reggie/api/v1/vault-files/ai-insights/', {
      question,
      project_uuid,
      parent_id,
      file_ids
    });
    return response as AiInsightsResponse;
  } catch (error) {
    const { message } = handleApiError(error);
    throw new Error(message || 'Failed to get AI insights');
  }
}

export async function chatWithVaultAgent(params: {
  project_uuid: string;
  parent_id?: number;
  file_ids?: number[];
  message: string;
}) {
  // Use the existing ai-chat-stream endpoint which already handles vault queries
  const { BASE_URL, ensureCSRFToken } = await import('@/lib/api-client');
  const { TOKEN_KEY } = await import('@/lib/constants');
  const { getCSRFToken } = await import('@/api');
  
  const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
  
  // Ensure CSRF token exists for non-GET requests (like the API client does)
  await ensureCSRFToken();
  const csrfToken = getCSRFToken();
  
  // Use exactly the same authentication pattern as the main API client
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    // Include auth token if available
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    // Include CSRF token if available  
    ...(csrfToken ? { "X-CSRFToken": csrfToken } : {}),
  };

  const response = await fetch(`${BASE_URL}/reggie/api/v1/vault-files/vault-agent-chat/`, {
    method: "POST",
    headers,
    body: JSON.stringify(params),
    credentials: 'include', // IMPORTANT: This was missing!
  });

  // Handle authentication errors like the main API client
  if (response.status === 401) {
    throw new Error('Authentication failed. Please log in again.');
  }

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch {
      // Use default error message if JSON parsing fails
    }
    throw new Error(errorMessage);
  }

  return response;
}

export async function generateFolderSummary(
  projectId: string,
  parentId: number = 0
): Promise<{summary: string; file_count: number; folder_count: number}> {
  try {
    const response = await api.get(
      `/reggie/api/v1/vault-files/folder-summary/?project_uuid=${projectId}&parent_id=${parentId}`
    );
    return response as {summary: string; file_count: number; folder_count: number};
  } catch (error) {
    const { message } = handleApiError(error);
    throw new Error(message || 'Failed to generate folder summary');
  }
}
