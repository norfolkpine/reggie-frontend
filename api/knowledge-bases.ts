import { api } from '@/lib/api-client';
import { KnowledgeBase, PaginatedKnowledgeBaseList, PatchedKnowledgeBase } from '../types/api';
import { PaginatedKnowledgeBaseFileList } from '../types/knowledge-base';

const knowledgeBaseApi = '/opie/api/v1/knowledge-bases/';

export const getKnowledgeBases = async (page: number = 1, file_id?: string) => {
  const response = await api.get(knowledgeBaseApi, {
    params: { page: page.toString(), file_id: file_id ?? ""}
  });
  return response as PaginatedKnowledgeBaseList;
};

export const getKnowledgeBase = async (id: number) => {
  const response = await api.get(`${knowledgeBaseApi}${id}/`);
  return response as KnowledgeBase;
};

export const createKnowledgeBase = async (knowledgeBase: Omit<KnowledgeBase, 'id' | 'created_at' | 'updated_at'>) => {
  const response = await api.post(knowledgeBaseApi, knowledgeBase);
  return response as KnowledgeBase;
};

export const updateKnowledgeBase = async (id: number, knowledgeBase: Omit<KnowledgeBase, 'id' | 'created_at' | 'updated_at'>) => {
  const response = await api.put(`${knowledgeBaseApi}${id}/`, knowledgeBase);
  return response as KnowledgeBase;
};

export const patchKnowledgeBase = async (id: number, knowledgeBase: PatchedKnowledgeBase) => {
  const response = await api.patch(`${knowledgeBaseApi}${id}/`, knowledgeBase);
  return response as KnowledgeBase;
};

export const deleteKnowledgeBase = async (id: number) => {
  await api.delete(`${knowledgeBaseApi}${id}/`);
};

// Get files in a knowledge base
export const getKnowledgeBaseFiles = async (id: number, params?: { 
  page?: string; 
  page_size?: string; 
  search?: string; 
  status?: string; 
}) => {
  const response = await api.get(`${knowledgeBaseApi}${id}/files/`, { params });
  return response as PaginatedKnowledgeBaseFileList;
};