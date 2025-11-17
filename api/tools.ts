import { api } from '@/lib/api-client';

export interface Tool {
  id: number;
  name: string;
  description: string;
  is_enabled: boolean;
}

interface PaginatedToolList {
  count: number;
  next: string | null;
  previous: string | null;
  results: Tool[];
}

export const getTools = async (page: number = 1) => {
  const response = await api.get('/opie/api/v1/tools/', {
    params: { page: page.toString() },
  });
  return response as PaginatedToolList;
};

export const getTool = async (id: number) => {
  const response = await api.get(`/opie/api/v1/tools/${id}/`);
  return response as Tool;
};
