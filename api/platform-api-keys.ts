import { api } from '@/lib/api-client';
import { 
  PlatformApiKey, 
  PlatformApiKeyCreate, 
  PlatformApiKeyUpdate, 
  PaginatedPlatformApiKeyList,
  PlatformApiKeyGenerated
} from '../types/api';

const ENDPOINT = '/api/platform-api-keys/';

// Get all API keys for the current user
export const getPlatformApiKeys = async (page: number = 1): Promise<PaginatedPlatformApiKeyList> => {
  const response = await api.get(`${ENDPOINT}?page=${page}`);
  return response as PaginatedPlatformApiKeyList;
};

// Get a specific API key by ID
export const getPlatformApiKey = async (id: string): Promise<PlatformApiKey> => {
  const response = await api.get(`${ENDPOINT}${id}/`);
  return response as PlatformApiKey;
};

// Generate a new API key
export const createPlatformApiKey = async (data: PlatformApiKeyCreate): Promise<PlatformApiKeyGenerated> => {
  const response = await api.post(ENDPOINT, data);
  return response as PlatformApiKeyGenerated;
};

// Update an existing API key
export const updatePlatformApiKey = async (id: string, data: PlatformApiKeyUpdate): Promise<PlatformApiKey> => {
  const response = await api.patch(`${ENDPOINT}${id}/`, data);
  return response as PlatformApiKey;
};

// Delete an API key
export const deletePlatformApiKey = async (id: string): Promise<void> => {
  await api.delete(`${ENDPOINT}${id}/`);
};

// Regenerate an API key (creates new key, invalidates old one)
export const regeneratePlatformApiKey = async (id: string): Promise<PlatformApiKeyGenerated> => {
  const response = await api.post(`${ENDPOINT}${id}/regenerate/`);
  return response as PlatformApiKeyGenerated;
};

// Revoke an API key (disable immediately)
export const revokePlatformApiKey = async (id: string): Promise<PlatformApiKey> => {
  const response = await api.post(`${ENDPOINT}${id}/revoke/`);
  return response as PlatformApiKey;
};