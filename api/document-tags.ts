import { api } from '@/lib/api-client';
import { DocumentTag, PaginatedDocumentTagList, PatchedDocumentTag } from '../types/api';

export const getDocumentTags = async (page: number = 1) => {
  const response = await api.get('/opie/document-tags/', {
    params: { page: page.toString() }
  });
  return response as PaginatedDocumentTagList;
};

export const getDocumentTag = async (id: number) => {
  const response = await api.get(`/opie/document-tags/${id}/`);
  return response as DocumentTag;
};

export const createDocumentTag = async (documentTag: Omit<DocumentTag, 'id' | 'created_at' | 'updated_at'>) => {
  const response = await api.post('/opie/document-tags/', documentTag);
  return response as DocumentTag;
};

export const updateDocumentTag = async (id: number, documentTag: Omit<DocumentTag, 'id' | 'created_at' | 'updated_at'>) => {
  const response = await api.put(`/opie/document-tags/${id}/`, documentTag);
  return response as DocumentTag;
};

export const patchDocumentTag = async (id: number, documentTag: PatchedDocumentTag) => {
  const response = await api.post(`/opie/document-tags/${id}/`, documentTag);
  return response as DocumentTag;
};

export const deleteDocumentTag = async (id: number) => {
  await api.delete(`/opie/document-tags/${id}/`);
};