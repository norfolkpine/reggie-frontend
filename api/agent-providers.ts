import { api } from '@/lib/api-client';

export interface ModelProvider {
  provider: string;
  id: number;
  model_name: string;
  description: string;
  is_enabled: boolean;
}

interface PaginatedModelProviderList {
  count: number;
  next: string | null;
  previous: string | null;
  results: ModelProvider[];
}

export const getModelProviders = async (page: number = 1) => {
  const response = await api.get('/opie/api/v1/model-providers/', {
    params: { page: page.toString() },
  });
  return response as PaginatedModelProviderList;
};

export const getAllModelProviders = async () => {
  const response = await api.get('/opie/api/v1/model-providers/listmodels/', { });
  return response;
};

export const getModelProvider = async (provider: string) => {
  const response = await api.get(`/opie/api/v1/model-providers/${provider}/`);
  return response.data as ModelProvider;
};