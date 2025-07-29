import { api } from '@/lib/api-client';
import { VaultFile } from '../types/api';
import { handleApiError } from '@/lib/utils/handle-api-error';
import { BASE_URL } from '@/lib/api-client';
import { TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from "../lib/constants";

export interface UploadFileParams {
  file: File;
  project: number;
  uploaded_by: number;
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
  projectId: number,
  page: number = 1,
  pageSize: number = 10,
  search: string = ''
): Promise<VaultFilesResponse> {
  let url = `/reggie/api/v1/vault-files/by-project/?project_id=${projectId}&page=${page}&page_size=${pageSize}`;
  
  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }
  
  const response = await api.get(url);
  return response as VaultFilesResponse;
}

export async function uploadFiles({
  file,
  project,
  uploaded_by,
  team,
  shared_with_users,
  shared_with_teams,
}: UploadFileParams) {
  const token = localStorage.getItem(TOKEN_KEY);
  const formData = new FormData();
  formData.append('file', file);
  formData.append('project', String(project));
  formData.append('uploaded_by', String(uploaded_by));
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

  try {
    const response = await fetch(`${BASE_URL}/reggie/api/v1/vault-files/`, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
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
    await api.delete(`/reggie/api/v1/vault-files/${fileId}/`);
  } catch (error) {
    const { message } = handleApiError(error);
    throw new Error(message || 'Failed to delete file');
  }
}

export interface VaultProjectInstruction {
  id: number;
  project: number;
  project_name: string;
  instruction: string;
  title: string;
  user: number;
  user_name: string;
  created_at: string;
  updated_at: string;
}

export async function getVaultProjectInstructions(projectId: number): Promise<VaultProjectInstruction[]> {
  try {
    const response = await api.get(`/reggie/api/v1/vault-project-instructions/?project=${projectId}`);
    return response as VaultProjectInstruction[];
  } catch (error) {
    const { message } = handleApiError(error);
    throw new Error(message || 'Failed to fetch project instructions');
  }
}

export async function getVaultProjectInstruction(id: number): Promise<VaultProjectInstruction> {
  try {
    const response = await api.get(`/reggie/api/v1/vault-project-instructions/${id}/`);
    return response as VaultProjectInstruction;
  } catch (error) {
    const { message } = handleApiError(error);
    throw new Error(message || 'Failed to fetch project instruction');
  }
}

export async function createVaultProjectInstruction(data: {
  project: number;
  instruction: string;
  title: string;
}): Promise<VaultProjectInstruction> {
  try {
    const response = await api.post('/reggie/api/v1/vault-project-instructions/', data);
    return response as VaultProjectInstruction;
  } catch (error) {
    const { message } = handleApiError(error);
    throw new Error(message || 'Failed to create project instruction');
  }
}

export async function updateVaultProjectInstruction(
  id: number,
  data: {
    instruction?: string;
    title?: string;
  }
): Promise<VaultProjectInstruction> {
  try {
    const response = await api.patch(`/reggie/api/v1/vault-project-instructions/${id}/`, data);
    return response as VaultProjectInstruction;
  } catch (error) {
    const { message } = handleApiError(error);
    throw new Error(message || 'Failed to update project instruction');
  }
}

export async function deleteVaultProjectInstruction(id: number): Promise<void> {
  try {
    await api.delete(`/reggie/api/v1/vault-project-instructions/${id}/`);
  } catch (error) {
    const { message } = handleApiError(error);
    throw new Error(message || 'Failed to delete project instruction');
  }
}
