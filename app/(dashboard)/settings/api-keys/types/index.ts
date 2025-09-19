import { z } from "zod";
import { PlatformApiKey, PlatformApiKeyGenerated } from "@/types/api";

// Validation schemas
export const createApiKeySchema = z.object({
  name: z.string().optional(), // Auto-generated, optional for user input
});

// Form data types
export type CreateApiKeyFormData = z.infer<typeof createApiKeySchema>;

// Component props types
export interface ApiKeyCardProps {
  apiKey: PlatformApiKey;
  isVisible: boolean;
  onToggleVisibility: (id: string) => void;
  onToggleStatus: (key: PlatformApiKey) => void;
  onCopy: (text: string, label: string) => void;
}

export interface CreateApiKeyDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateApiKeyFormData) => Promise<void>;
  isCreating?: boolean;
}

export interface GeneratedKeyDisplayProps {
  generatedKey: PlatformApiKeyGenerated | null;
  onDismiss: () => void;
  onCopy: (text: string, label: string) => void;
}

export interface ApiKeysListProps {
  apiKeys: PlatformApiKey[];
  isLoading: boolean;
  visibleKeys: Record<string, boolean>;
  onToggleVisibility: (id: string) => void;
  onToggleStatus: (key: PlatformApiKey) => void;
  onCopy: (text: string, label: string) => void;
  onCreateNew: () => void;
}

// Hook return type
export interface UseApiKeysReturn {
  apiKeys: PlatformApiKey[];
  isLoading: boolean;
  loadApiKeys: () => Promise<void>;
  createApiKey: (data: CreateApiKeyFormData) => Promise<PlatformApiKeyGenerated>;
  toggleApiKeyStatus: (key: PlatformApiKey) => Promise<void>;
}