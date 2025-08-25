import { fetchAPI } from './fetchApi';

export interface CreateFolderRequest {
  name: string;
  description?: string;
  parent_id?: number;
  collection_type?: 'folder' | 'regulation' | 'act' | 'guideline' | 'manual';
  jurisdiction?: string;
  regulation_number?: string;
  effective_date?: string;
  sort_order?: number;
}

export interface Collection {
  id: number;
  name: string;
  description?: string;
  collection_type: 'folder' | 'regulation' | 'act' | 'guideline' | 'manual';
  jurisdiction?: string;
  regulation_number?: string;
  effective_date?: string;
  sort_order: number;
  children: Collection[];
  full_path: string;
  created_at: string;
}

export async function createFolder(data: CreateFolderRequest): Promise<Collection> {
  const response = await fetchAPI('/collections/create-folder/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to create folder: ${response.statusText}`);
  }
  
  return response.json();
}

export async function listCollections(): Promise<Collection[]> {
  const response = await fetchAPI('/collections/');
  
  if (!response.ok) {
    throw new Error(`Failed to list collections: ${response.statusText}`);
  }
  
  return response.json();
}
