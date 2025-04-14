import { api } from '@/lib/api-client';

export interface Integration {
  key: string;
  label: string;
}

interface PaginatedIntegrationList {
  count: number;
  next: string | null;
  previous: string | null;
  results: Integration[];
}

export const getIntegrations = async (page: number = 1) => {
  const response = await api.get('/reggie/api/v1/integrations/apps/', {
    params: { page: page.toString() }
  });
  return response as PaginatedIntegrationList;
};