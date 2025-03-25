import { api } from '@/lib/api-client';
import { Document, PaginatedDocumentList, PatchedDocument } from '../types/api';

export const getDocuments = async (page: number = 1) => {
  const response = await api.get('/reggie/documents/', {
    params: { page: page.toString() }
  });
  return response as PaginatedDocumentList;
};

export const getDocument = async (id: number) => {
  const response = await api.get(`/reggie/documents/${id}/`);
  return response as Document;
};

export const createDocument = async (document: Omit<Document, 'id' | 'created_at' | 'updated_at'>) => {
  const response = await api.post('/reggie/documents/', document);
  return response as Document;
};

export const updateDocument = async (id: number, document: Omit<Document, 'id' | 'created_at' | 'updated_at'>) => {
  const response = await api.put(`/reggie/documents/${id}/`, document);
  return response as Document;
};

export const patchDocument = async (id: number, document: PatchedDocument) => {
  const response = await api.post(`/reggie/documents/${id}/`, document);
  return response as Document;
};

export const deleteDocument = async (id: number) => {
  await api.delete(`/reggie/documents/${id}/`);
};