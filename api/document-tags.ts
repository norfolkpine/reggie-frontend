import { api } from '@/lib/api-client';
import { DocumentTag, PaginatedDocumentTagList, PatchedDocumentTag } from '../types/api';

export const getDocumentTags = async (page: number = 1) => {
  const response = await api.get('/reggie/document-tags/', {
    params: { page: page.toString() }
  });
  return response as PaginatedDocumentTagList;
};

export const getDocumentTag = async (id: number) => {
  const response = await api.get(`/reggie/document-tags/${id}/`);
  return response as DocumentTag;
};

export const createDocumentTag = async (documentTag: Omit<DocumentTag, 'id' | 'created_at' | 'updated_at'>) => {
  const response = await api.post('/reggie/document-tags/', documentTag);
  return response as DocumentTag;
};

export const updateDocumentTag = async (id: number, documentTag: Omit<DocumentTag, 'id' | 'created_at' | 'updated_at'>) => {
  const response = await api.put(`/reggie/document-tags/${id}/`, documentTag);
  return response as DocumentTag;
};

export const patchDocumentTag = async (id: number, documentTag: PatchedDocumentTag) => {
  const response = await api.post(`/reggie/document-tags/${id}/`, documentTag);
  return response as DocumentTag;
};

export const deleteDocumentTag = async (id: number) => {
  await api.delete(`/reggie/document-tags/${id}/`);
};