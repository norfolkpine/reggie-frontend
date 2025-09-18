import { api } from '@/lib/api-client';
import { 
  PlatformApiKey, 
  PlatformApiKeyCreate, 
  PaginatedPlatformApiKeyList,
  PlatformApiKeyGenerated
} from '../types/api';

export async function getPlatformApiKeys(page: number = 1): Promise<PaginatedPlatformApiKeyList> {
  // Since Opie doesn't provide a list endpoint, return empty results
  return {
    count: 0,
    next: null,
    previous: null,
    results: []
  };
}

export async function getPlatformApiKey(id: string): Promise<PlatformApiKey> {
  // Opie API doesn't provide a get endpoint
  throw new Error('Get API key operation not supported by Opie API');
}

export async function createPlatformApiKey(data: PlatformApiKeyCreate): Promise<PlatformApiKeyGenerated> {
  // For external Opie API, we need to use the full URL
  const response = await api.post(`/users/api-keys/create/`);
  return response as PlatformApiKeyGenerated;
}

export async function revokePlatformApiKey(id: string): Promise<PlatformApiKey> {
  // For external Opie API, we need to use the full URL
  const response = await api.post(`/users/api-keys/revoke/`, { id });
  return response as PlatformApiKey;
}