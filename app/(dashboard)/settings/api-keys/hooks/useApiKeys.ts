import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  getPlatformApiKeys,
  createPlatformApiKey,
  revokePlatformApiKey,
} from "@/api/platform-api-keys";
import { PlatformApiKey, PlatformApiKeyGenerated } from "@/types/api";
import { CreateApiKeyFormData, UseApiKeysReturn } from "../types";

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
      // Since Opie API doesn't provide a list endpoint, show empty state
      setApiKeys([]);
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
      name: data.name || autoName(),
    });

    await loadApiKeys();
    toast.success('API key generated successfully');
    return newKey;
  };


  // Toggle API key status (activate/revoke)
  const toggleApiKeyStatus = async (key: PlatformApiKey): Promise<void> => {
    try {
      if (key.is_active) {
        await revokePlatformApiKey(key.id);
        toast.success(`API key "${key.name}" revoked`);
      } else {
        // Since Opie doesn't support activation, we can only revoke
        toast.error('API key activation not supported by Opie API. Only revocation is available.');
        return;
      }
      await loadApiKeys();
    } catch (error) {
      console.error('Failed to toggle API key status:', error);
      toast.error('Failed to toggle API key status');
      throw error;
    }
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
    toggleApiKeyStatus,
  };
}