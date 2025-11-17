import { api } from '@/lib/api-client';
import { Tag, PaginatedTagList, PatchedTag } from '../types/api';

export const getTags = async (page: number = 1) => {
  const response = await api.get('/opie/tags/', {
    params: { page: page.toString() }
  });
  return response as PaginatedTagList;
};

export const getTag = async (id: number) => {
  const response = await api.get(`/opie/tags/${id}/`);
  return response as Tag;
};

export const createTag = async (tag: Omit<Tag, 'id' | 'created_at' | 'updated_at'>) => {
  const response = await api.post('/opie/tags/', tag);
  return response as Tag;
};

export const updateTag = async (id: number, tag: Omit<Tag, 'id' | 'created_at' | 'updated_at'>) => {
  const response = await api.put(`/opie/tags/${id}/`, tag);
  return response as Tag;
};

export const patchTag = async (id: number, tag: PatchedTag) => {
  const response = await api.post(`/opie/tags/${id}/`, tag);
  return response as Tag;
};

export const deleteTag = async (id: number) => {
  await api.delete(`/opie/tags/${id}/`);
};