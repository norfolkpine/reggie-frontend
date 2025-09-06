'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import ContentSection from '../components/content-section';
import { IconPlus, IconKey } from '@tabler/icons-react';
import { toast } from 'sonner';

// Components
import { ApiKeysList } from './components/ApiKeysList';
import { CreateApiKeyDialog } from './components/CreateApiKeyDialog';
import { EditApiKeyDialog } from './components/EditApiKeyDialog';
import { GeneratedKeyDisplay } from './components/GeneratedKeyDisplay';

// Hooks and Types
import { useApiKeys } from './hooks/useApiKeys';
import { CreateApiKeyFormData, UpdateApiKeyFormData } from './types';
import { PlatformApiKey, PlatformApiKeyGenerated } from '@/types/api';

export default function ApiKeysPage() {
  const {
    apiKeys,
    isLoading,
    createApiKey,
    updateApiKey,
    deleteApiKey,
    regenerateApiKey,
    toggleApiKeyStatus,
  } = useApiKeys();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<PlatformApiKey | null>(null);
  const [generatedKey, setGeneratedKey] = useState<PlatformApiKeyGenerated | null>(null);

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

  const handleUpdateApiKey = async (formData: UpdateApiKeyFormData) => {
    if (!editingKey) return;
    
    try {
      await updateApiKey(editingKey.id, formData);
      setIsEditDialogOpen(false);
      setEditingKey(null);
      toast.success('API key updated successfully');
    } catch (error) {
      console.error('Failed to update API key:', error);
      toast.error('Failed to update API key');
    }
  };

  const handleEditApiKey = (apiKey: PlatformApiKey) => {
    setEditingKey(apiKey);
    setIsEditDialogOpen(true);
  };

  const handleToggleApiKeyStatus = async (apiKey: PlatformApiKey) => {
    try {
      await toggleApiKeyStatus(apiKey.id, apiKey.name, !apiKey.is_active);
      const action = apiKey.is_active ? 'deactivated' : 'activated';
      toast.success(`API key ${action} successfully`);
    } catch (error) {
      console.error('Failed to toggle API key status:', error);
      toast.error('Failed to update API key status');
    }
  };

  const handleRegenerateApiKey = async (keyId: string, keyName: string) => {
    try {
      const newKey = await regenerateApiKey(keyId, keyName);
      setGeneratedKey(newKey);
      toast.success('API key regenerated successfully');
    } catch (error) {
      console.error('Failed to regenerate API key:', error);
      toast.error('Failed to regenerate API key');
    }
  };

  const handleDeleteApiKey = async (keyId: string, keyName: string) => {
    try {
      await deleteApiKey(keyId, keyName);
      toast.success('API key deleted successfully');
    } catch (error) {
      console.error('Failed to delete API key:', error);
      toast.error('Failed to delete API key');
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

  return (
    <ContentSection
      title="API Keys"
      description="Manage your platform API keys for secure access to our services."
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
            onEdit={handleEditApiKey}
            onToggleStatus={handleToggleApiKeyStatus}
            onRegenerate={handleRegenerateApiKey}
            onDelete={handleDeleteApiKey}
            onCopy={copyToClipboard}
          />
        )}

        {/* Create API Key Dialog */}
        <CreateApiKeyDialog
          isOpen={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSubmit={handleCreateApiKey}
        />

        {/* Edit API Key Dialog */}
        <EditApiKeyDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          editingKey={editingKey}
          onSubmit={handleUpdateApiKey}
        />
      </div>
    </ContentSection>
  );
}