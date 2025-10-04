import { api } from '@/lib/api-client';
import { FileTag, PaginatedFileTagList, PatchedFileTag } from '../types/api';

export const getFileTags = async (page: number = 1) => {
  const response = await api.get('/opie/api/v1/file-tags/', {
    params: { page: page.toString() },
  });
  return response as PaginatedFileTagList;
};

export const getFileTag = async (id: number) => {
  const response = await api.get(`/opie/api/v1/file-tags/${id}/`);
  return response as FileTag;
};

export const createFileTag = async (fileTag: Omit<Partial<FileTag>, 'id' | 'created_at' | 'updated_at'>) => {
  const response = await api.post('/opie/api/v1/file-tags/', fileTag);
  return response as FileTag;
};

export const updateFileTag = async (id: number, fileTag: Omit<Partial<FileTag>, 'id' | 'created_at' | 'updated_at'>) => {
  const response = await api.put(`/opie/api/v1/file-tags/${id}/`, fileTag);
  return response as FileTag;
};

export const patchFileTag = async (id: number, fileTag: PatchedFileTag) => {
  const response = await api.patch(`/opie/api/v1/file-tags/${id}/`, fileTag);
  return response as FileTag;
};

export const deleteFileTag = async (id: number) => {
  await api.delete(`/opie/api/v1/file-tags/${id}/`);
}; 