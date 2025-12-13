import { api } from '@/lib/api-client';

export interface CreateFolderRequest {
  name: string;
  description?: string;
  parent_uuid?: string;
  collection_type?: 'folder' | 'regulation' | 'act' | 'guideline' | 'manual';
  jurisdiction?: string;
  regulation_number?: string;
  effective_date?: string;
  sort_order?: number;
}

export interface Collection {
  uuid?: string;
  id?: number;
  name: string;
  description?: string;
  collection_type: 'folder' | 'regulation' | 'act' | 'guideline' | 'manual';
  jurisdiction?: string;
  regulation_number?: string;
  effective_date?: string;
  sort_order: number;
  children: Collection[];
  files: Array<{
    uuid: string;
    title: string;
    description?: string;
    file_type: string;
    collection_order: number;
    file_size?: number;
    created_at: string;
  }>;
  full_path: string;
  created_at: string;
}

// Paginated response interface
export interface PaginatedCollectionResponse {
  results: Collection[];
  count: number;
  next: string | null;
  previous: string | null;
}

// CollectionDetail is now the same as Collection since files are included
export type CollectionDetail = Collection;

export async function createFolder(data: CreateFolderRequest): Promise<Collection> {
  return api.post('/opie/api/v1/collections/create-folder/', data) as Promise<Collection>;
}

export async function listCollections(): Promise<Collection[]> {
  return api.get('/opie/api/v1/collections/') as Promise<Collection[]>;
}

export async function listCollectionsPaginated(page: number = 1, pageSize: number = 10, search?: string): Promise<PaginatedCollectionResponse> {
  const params: Record<string, string> = {
    page: page.toString(),
    page_size: pageSize.toString(),
  };
  
  if (search) {
    params.search = search;
  }
  
  return api.get('/opie/api/v1/collections/', { params }) as Promise<PaginatedCollectionResponse>;
}

export async function getCollectionTree(): Promise<Collection[]> {
  return api.get('/opie/api/v1/collections/tree/') as Promise<Collection[]>;
}

export async function getCollectionDetails(id: number): Promise<CollectionDetail> {
  return api.get(`/opie/api/v1/collections/${id}/`) as Promise<CollectionDetail>;
}

export async function getCollectionByUuid(uuid: string): Promise<CollectionDetail> {
  return api.get(`/opie/api/v1/collections/${uuid}/`) as Promise<CollectionDetail>;
}

export async function deleteCollection(uuid: string): Promise<void> {
  return api.delete(`/opie/api/v1/collections/${uuid}/`) as Promise<void>;
}

export async function updateCollection(uuid: string, data: Partial<CreateFolderRequest>): Promise<Collection> {
  return api.patch(`/opie/api/v1/collections/${uuid}/`, data) as Promise<Collection>;
}

/**
 * Move a collection to a new parent collection
 */
export async function moveCollection(uuid: string, parentUuid: string | null): Promise<Collection> {
  return api.patch(`/opie/api/v1/collections/${uuid}/`, {
    parent_uuid_write: parentUuid
  }) as Promise<Collection>;
}
