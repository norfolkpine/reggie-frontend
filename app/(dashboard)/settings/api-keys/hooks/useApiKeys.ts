import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  getPlatformApiKeys,
  createPlatformApiKey,
  updatePlatformApiKey,
  deletePlatformApiKey,
  regeneratePlatformApiKey,
  revokePlatformApiKey,
} from "@/api/platform-api-keys";
import { PlatformApiKey, PlatformApiKeyGenerated } from "@/types/api";
import { CreateApiKeyFormData, UpdateApiKeyFormData, UseApiKeysReturn } from "../types";

export function useApiKeys(): UseApiKeysReturn {
  const [apiKeys, setApiKeys] = useState<PlatformApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load API keys from server
  const loadApiKeys = async () => {
    try {
      setIsLoading(true);
      const response = await getPlatformApiKeys();
      setApiKeys(response.results);
    } catch (error) {
      console.error('Failed to load API keys:', error);
      toast.error('Failed to load API keys');
      // For development, use mock data
      setApiKeys([
        {
          id: '1',
          name: 'Development Key',
          description: 'Key for development environment',
          key: 'pk_dev_1234567890abcdef',
          masked_key: 'pk_dev_****...cdef',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          last_used_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          is_active: true,
          usage_count: 42,
          user: 1,
        },
        {
          id: '2',
          name: 'Production Key',
          description: 'Key for production environment',
          key: 'pk_prod_abcdef1234567890',
          masked_key: 'pk_prod_****...7890',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          is_active: false,
          usage_count: 156,
          user: 1,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Create new API key
  const createApiKey = async (data: CreateApiKeyFormData): Promise<PlatformApiKeyGenerated> => {
    const autoName = () => {
      const timestamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
      return `API Key ${timestamp}`;
    };

    const newKey = await createPlatformApiKey({
      ...data,
      name: data.name || autoName(),
      expires_at: data.expires_at || undefined,
    });

    await loadApiKeys();
    toast.success('API key generated successfully');
    return newKey;
  };

  // Update existing API key
  const updateApiKey = async (id: string, data: UpdateApiKeyFormData): Promise<void> => {
    await updatePlatformApiKey(id, data);
    await loadApiKeys();
    toast.success('API key updated successfully');
  };

  // Delete API key
  const deleteApiKey = async (id: string): Promise<void> => {
    await deletePlatformApiKey(id);
    await loadApiKeys();
  };

  // Regenerate API key
  const regenerateApiKey = async (id: string): Promise<PlatformApiKeyGenerated> => {
    const newKey = await regeneratePlatformApiKey(id);
    await loadApiKeys();
    return newKey;
  };

  // Toggle API key status (activate/revoke)
  const toggleApiKeyStatus = async (key: PlatformApiKey): Promise<void> => {
    if (key.is_active) {
      await revokePlatformApiKey(key.id);
      toast.success(`API key "${key.name}" revoked`);
    } else {
      await updatePlatformApiKey(key.id, { is_active: true });
      toast.success(`API key "${key.name}" activated`);
    }
    await loadApiKeys();
  };

  // Load API keys on mount
  useEffect(() => {
    loadApiKeys();
  }, []);

  return {
    apiKeys,
    isLoading,
    loadApiKeys,
    createApiKey,
    updateApiKey,
    deleteApiKey,
    regenerateApiKey,
    toggleApiKeyStatus,
  };
}