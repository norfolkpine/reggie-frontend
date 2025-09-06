import { z } from "zod";
import { PlatformApiKey, PlatformApiKeyGenerated } from "@/types/api";

// Validation schemas
export const createApiKeySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  expires_at: z.string().optional(),
});

export const updateApiKeySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  expires_at: z.string().optional(),
});

// Form data types
export type CreateApiKeyFormData = z.infer<typeof createApiKeySchema>;
export type UpdateApiKeyFormData = z.infer<typeof updateApiKeySchema>;

// Component props types
export interface ApiKeyCardProps {
  apiKey: PlatformApiKey;
  isVisible: boolean;
  onToggleVisibility: (id: string) => void;
  onEdit: (key: PlatformApiKey) => void;
  onToggleStatus: (key: PlatformApiKey) => void;
  onRegenerate: (id: string, name: string) => void;
  onDelete: (id: string, name: string) => void;
  onCopy: (text: string, label: string) => void;
}

export interface CreateApiKeyDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateApiKeyFormData) => Promise<void>;
  isCreating?: boolean;
}

export interface EditApiKeyDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingKey: PlatformApiKey | null;
  onSubmit: (data: UpdateApiKeyFormData) => void;
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
  onEdit: (key: PlatformApiKey) => void;
  onToggleStatus: (key: PlatformApiKey) => void;
  onRegenerate: (id: string, name: string) => void;
  onDelete: (id: string, name: string) => void;
  onCopy: (text: string, label: string) => void;
  onCreateNew: () => void;
}

// Hook return type
export interface UseApiKeysReturn {
  apiKeys: PlatformApiKey[];
  isLoading: boolean;
  loadApiKeys: () => Promise<void>;
  createApiKey: (data: CreateApiKeyFormData) => Promise<PlatformApiKeyGenerated>;
  updateApiKey: (id: string, data: UpdateApiKeyFormData) => Promise<void>;
  deleteApiKey: (id: string) => Promise<void>;
  regenerateApiKey: (id: string) => Promise<PlatformApiKeyGenerated>;
  toggleApiKeyStatus: (key: PlatformApiKey) => Promise<void>;
}