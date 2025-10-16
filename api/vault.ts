import { api } from '@/lib/api-client';
import { getCSRFToken } from '@/api';
import { VaultFile } from '../types/api';
import { handleApiError } from '@/lib/utils/handle-api-error';
import { BASE_URL } from '@/lib/api-client';

export interface UploadFileParams {
  file: File;
  project_uuid: string;
  uploaded_by: number;
  team?: number;
  parent_id?: number;
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
  let url = `/opie/api/v1/vault-files/by-project/?project_uuid=${projectId}&page=${page}&page_size=${pageSize}&parent_id=${parentId}`;
  
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
  team,
  shared_with_users,
  shared_with_teams,
  parent_id,
}: UploadFileParams) {
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('project_uuid', project_uuid);
  formData.append('uploaded_by', String(uploaded_by));
  formData.append('parent_id', String(parent_id ?? 0));
  if (typeof team !== 'undefined') {
    formData.append('team', String(team));
  }
  if (shared_with_users) {
    shared_with_users.forEach((user) => formData.append('shared_with_users', String(user)));
  }
  if (shared_with_teams) {
    shared_with_teams.forEach((team) => formData.append('shared_with_teams', String(team)));
  }


  for (const [key, value] of formData.entries()) {
    console.log(key, value);
  }

  const csrfToken = getCSRFToken();

  try {
    const response = await fetch(`${BASE_URL}/opie/api/v1/vault-files/`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      headers: {
        ...(csrfToken && { "X-CSRFToken": csrfToken }),
      },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData?.detail || 'Upload failed';
      throw new Error(message);
    }
    const data = await response.json();
    return data as VaultFile;
  } catch (error: any) {
    const message = error?.message || 'Upload failed';
    console.error(message);
    throw new Error(message);
  }
}

export async function deleteVaultFile(fileId: number): Promise<void> {
  try {
    await api.delete(`/opie/api/v1/vault-files/${fileId}/`);
  } catch (error) {
    const { message } = handleApiError(error);
    throw new Error(message || 'Failed to delete file');
  }
}

export async function updateVaultFile(fileId: number, data: { original_filename?: string }): Promise<VaultFile> {
  try {
    const response = await api.patch(`/opie/api/v1/vault-files/${fileId}/`, data);
    return response as VaultFile;
  } catch (error) {
    const { message } = handleApiError(error);
    throw new Error(message || 'Failed to update file');
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
  const { getCSRFToken } = await import('@/api');
  
  
  // Ensure CSRF token exists for non-GET requests (like the API client does)
  await ensureCSRFToken();
  const csrfToken = getCSRFToken();
  
  // Use exactly the same authentication pattern as the main API client
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    // Include CSRF token if available  
    ...(csrfToken ? { "X-CSRFToken": csrfToken } : {}),
  };
  const response = await fetch(`${BASE_URL}/opie/api/v1/vault-files/vault-agent-chat/`, {
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
export async function createFolder({
  folderName,
  project_uuid,
  parent_id = 0,
  uploaded_by,
  team,
}: {
  folderName: string;
  project_uuid: string;
  uploaded_by?: number;
  parent_id?: number;
  team?: number;
}): Promise<VaultFile> {
  const payload = {
    folderName:folderName,
    original_filename:folderName,
    project_uuid :project_uuid,
    parent_id :parent_id,
    uploaded_by :uploaded_by,
    team : team,
    is_folder: true,
    type: "folder"
  }

  try {
    console.log("payload", payload);
    const response = await api.post('/opie/api/v1/vault-files/', payload);
    return response as VaultFile;
  } catch (error: any) {
    const message = error?.message || 'Failed to create folder';
    console.error(message);
    throw new Error(message);
  }
}

export async function moveVaultFiles(fileIds: number[], targetFolderId: number): Promise<void> {
  try {
    await api.post('/opie/api/v1/vault-files/move/', {
      file_ids: fileIds,
      target_folder_id: targetFolderId
    });
  } catch (error) {
    const { message } = handleApiError(error);
    throw new Error(message || 'Failed to move files');
  }
}