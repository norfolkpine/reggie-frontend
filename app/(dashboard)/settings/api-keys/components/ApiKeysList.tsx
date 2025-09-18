import { ApiKeyCard } from "./ApiKeyCard";
import { ApiKeysListProps } from "../types";
import { IconKey } from "@tabler/icons-react";

export function ApiKeysList({
  apiKeys,
  visibleKeys,
  onToggleVisibility,
  onToggleStatus,
  onDelete,
  onCopy,
}: ApiKeysListProps) {

  if (apiKeys.length === 0) {
    return (
      <div className="text-center py-12">
        <IconKey className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No API keys</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating your first API key.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {apiKeys.map((apiKey) => (
        <ApiKeyCard
          key={apiKey.id}
          apiKey={apiKey}
          isVisible={visibleKeys[apiKey.id] || false}
          onToggleVisibility={onToggleVisibility}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
          onCopy={onCopy}
        />
      ))}
    </div>
  );
}