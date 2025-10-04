import { api } from '@/lib/api-client';
import { Document, PaginatedDocumentList, PatchedDocument } from '../types/api';
import { Doc } from '@/features/docs';

const apiVersion = 'v1.0';
const apiUrl = `/api/${apiVersion}/documents`;

export const getDocuments = async (page: number = 1) => {
  const response = await api.get('/opie/api/documents/', {
    params: { page: page.toString() },
  });
  return response as PaginatedDocumentList;
};

export const getPaginatedDocuments = async (
  params: {
    is_creator_me?: boolean;
    is_favorite?: boolean;
    page?: number;
    page_size?: number;
    title?: string;
  } = {}
) => {
  // Convert all params to strings as required by the API client
  const stringParams: Record<string, string> = {};
  if (params.is_creator_me !== undefined)
    stringParams.is_creator_me = params.is_creator_me ? 'true' : 'false';
  if (params.is_favorite !== undefined)
    stringParams.is_favorite = params.is_favorite ? 'true' : 'false';
  if (params.page !== undefined) stringParams.page = params.page.toString();
  if (params.page_size !== undefined)
    stringParams.page_size = params.page_size.toString();
  if (params.title) stringParams.title = params.title;

  const response = await api.get(apiUrl, {
    params: stringParams,
  });
  return response as PaginatedDocumentList;
};

export const getDocument = async (id: string) => {
  const response = await api.get(`${apiUrl}/${id}/`);
  return response as Doc;
};

export const createDocument = async (
  document: Omit<Document, 'id' | 'created_at' | 'updated_at'>
) => {
  const response = await api.post(apiUrl, document);
  return response as Document;
};

export const createDocumentWithTitleOnly = async (title: string) => {
  const response = await api.post(`${apiUrl}/`, { title });
  return response as Document;
};

export const updateDocument = async (
  id: number,
  document: Omit<Document, 'id' | 'created_at' | 'updated_at'>
) => {
  const response = await api.put(`/opie/api/documents/${id}/`, document);
  return response as Document;
};

export const patchDocument = async (id: string, document: PatchedDocument) => {
  const response = await api.patch(`${apiUrl}/${id}/`, document);
  return response as Doc;
};

export const deleteDocument = async (id: number) => {
  try {
    await api.delete(`${apiUrl}/${id}/`);
  } catch (error: any) {
    // If error response is 204, treat as success (no error shown)
    if (error?.response?.status === 204) {
      return;
    }
    throw error;
  }
};
