import { api } from '@/lib/api-client';

export interface Integration {
  key: string;
  title: string;
  description: string;
  icon_url: string;
  is_connected: boolean | false;
}

interface PaginatedIntegrationList {
  count: number;
  next: string | null;
  previous: string | null;
  results: Integration[];
}

export const getIntegrations = async (page: number = 1) => {
  const response = await api.get('/integrations/apps/', {
    params: { page: page.toString() }
  });
  return response as Integration[];
};