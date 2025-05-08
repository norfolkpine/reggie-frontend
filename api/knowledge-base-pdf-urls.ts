import { api } from '@/lib/api-client';
import { KnowledgeBasePdfURL, PaginatedKnowledgeBasePdfURLList, PatchedKnowledgeBasePdfURL } from '../types/api';

export const getKnowledgeBasePdfUrls = async (page: number = 1) => {
  const response = await api.get('/reggie/api/v1/knowledge-base/pdf-urls/', {
    params: { page: page.toString() },
  });
  return response as PaginatedKnowledgeBasePdfURLList;
};

export const getKnowledgeBasePdfUrl = async (id: string) => {
  const response = await api.get(`/reggie/api/v1/knowledge-base/pdf-urls/${id}/`);
  return response as KnowledgeBasePdfURL;
};

export const createKnowledgeBasePdfUrl = async (
  pdfUrl: Omit<Partial<KnowledgeBasePdfURL>, 'id' | 'added_at'>
) => {
  const response = await api.post('/reggie/api/v1/knowledge-base/pdf-urls/', pdfUrl);
  return response as KnowledgeBasePdfURL;
};

export const updateKnowledgeBasePdfUrl = async (
  id: string,
  pdfUrl: Omit<Partial<KnowledgeBasePdfURL>, 'id' | 'added_at'>
) => {
  const response = await api.put(`/reggie/api/v1/knowledge-base/pdf-urls/${id}/`, pdfUrl);
  return response as KnowledgeBasePdfURL;
};

export const patchKnowledgeBasePdfUrl = async (id: string, pdfUrl: PatchedKnowledgeBasePdfURL) => {
  const response = await api.patch(`/reggie/api/v1/knowledge-base/pdf-urls/${id}/`, pdfUrl);
  return response as KnowledgeBasePdfURL;
};

export const deleteKnowledgeBasePdfUrl = async (id: string) => {
  await api.delete(`/reggie/api/v1/knowledge-base/pdf-urls/${id}/`);
}; 