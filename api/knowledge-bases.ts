import { api } from '@/lib/api-client';
import { KnowledgeBase, PaginatedKnowledgeBaseList, PatchedKnowledgeBase } from '../types/api';

export const getKnowledgeBases = async (page: number = 1) => {
  const response = await api.get('/reggie/knowledge-bases/', {
    params: { page: page.toString() }
  });
  return response as PaginatedKnowledgeBaseList;
};

export const getKnowledgeBase = async (id: number) => {
  const response = await api.get(`/reggie/knowledge-bases/${id}/`);
  return response as KnowledgeBase;
};

export const createKnowledgeBase = async (knowledgeBase: Omit<KnowledgeBase, 'id' | 'created_at' | 'updated_at'>) => {
  const response = await api.post('/reggie/knowledge-bases/', knowledgeBase);
  return response as KnowledgeBase;
};

export const updateKnowledgeBase = async (id: number, knowledgeBase: Omit<KnowledgeBase, 'id' | 'created_at' | 'updated_at'>) => {
  const response = await api.put(`/reggie/knowledge-bases/${id}/`, knowledgeBase);
  return response as KnowledgeBase;
};

export const patchKnowledgeBase = async (id: number, knowledgeBase: PatchedKnowledgeBase) => {
  const response = await api.post(`/reggie/knowledge-bases/${id}/`, knowledgeBase);
  return response as KnowledgeBase;
};

export const deleteKnowledgeBase = async (id: number) => {
  await api.delete(`/reggie/knowledge-bases/${id}/`);
};