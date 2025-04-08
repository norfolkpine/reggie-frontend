import { api } from '@/lib/api-client';

export interface ModelProvider {
  provider: string;
  model_name: string;
  description: string;
}

interface PaginatedModelProviderList {
  count: number;
  next: string | null;
  previous: string | null;
  results: ModelProvider[];
}

export const getModelProviders = async (page: number = 1) => {
  const response = await api.get('/reggie/api/v1/model-providers/', {
    params: { page: page.toString() },
  });
  return response as PaginatedModelProviderList;
};

export const getModelProvider = async (provider: string) => {
  const response = await api.get(`/reggie/api/v1/model-providers/${provider}/`);
  return response.data as ModelProvider;
};