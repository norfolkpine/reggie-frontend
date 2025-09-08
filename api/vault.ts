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
