'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import ContentSection from '../components/content-section';
import { IconPlus, IconKey } from '@tabler/icons-react';
import { toast } from 'sonner';

// Components
import { ApiKeysList } from './components/ApiKeysList';
import { CreateApiKeyDialog } from './components/CreateApiKeyDialog';
import { GeneratedKeyDisplay } from './components/GeneratedKeyDisplay';

// Hooks and Types
import { useApiKeys } from './hooks/useApiKeys';
import { CreateApiKeyFormData } from './types';
import { PlatformApiKey, PlatformApiKeyGenerated } from '@/types/api';

export default function ApiKeysPage() {
  const {
    apiKeys,
    isLoading,
    createApiKey,
    toggleApiKeyStatus,
  } = useApiKeys();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<PlatformApiKeyGenerated | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});

  const handleCreateApiKey = async (formData: CreateApiKeyFormData) => {
    try {
      const newKey = await createApiKey(formData);
      setGeneratedKey(newKey);
      setIsCreateDialogOpen(false);
      toast.success('API key created successfully');
    } catch (error) {
      console.error('Failed to create API key:', error);
      toast.error('Failed to create API key');
    }
  };

  const handleToggleApiKeyStatus = async (apiKey: PlatformApiKey) => {
    try {
      await toggleApiKeyStatus(apiKey);
      const action = apiKey.is_active ? 'deactivated' : 'activated';
      toast.success(`API key ${action} successfully`);
    } catch (error) {
      console.error('Failed to toggle API key status:', error);
      toast.error('Failed to update API key status');
    }
  };


  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleToggleVisibility = (keyId: string) => {
    setVisibleKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  return (
    <ContentSection
      title="API Keys"
      desc="Manage your platform API keys for secure access to our services."
    >
      <div className="space-y-6">

        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Your API Keys</h3>
            <p className="text-sm text-muted-foreground">
              {apiKeys.length} {apiKeys.length === 1 ? 'key' : 'keys'} total
            </p>
          </div>
          
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <IconPlus className="h-4 w-4 mr-2" />
            Generate New Key
          </Button>
        </div>

        {/* Generated Key Display */}
        {generatedKey && (
          <GeneratedKeyDisplay
            generatedKey={generatedKey}
            onDismiss={() => setGeneratedKey(null)}
            onCopy={copyToClipboard}
          />
        )}

        {/* API Keys List */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading API keys...</p>
          </div>
        ) : (
          <ApiKeysList
            apiKeys={apiKeys}
            isLoading={isLoading}
            visibleKeys={visibleKeys}
            onToggleVisibility={handleToggleVisibility}
            onToggleStatus={handleToggleApiKeyStatus}
            onCopy={copyToClipboard}
            onCreateNew={() => setIsCreateDialogOpen(true)}
          />
        )}

        {/* Create API Key Dialog */}
        <CreateApiKeyDialog
          isOpen={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSubmit={handleCreateApiKey}
        />

      </div>
    </ContentSection>
  );
}