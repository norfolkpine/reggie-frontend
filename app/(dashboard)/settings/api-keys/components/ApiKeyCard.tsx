import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  IconEye,
  IconEyeOff,
  IconTrash,
  IconCopy,
  IconRefresh,
  IconEdit,
  IconToggleLeft,
  IconToggleRight,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import { ApiKeyCardProps } from "../types";

export function ApiKeyCard({
  apiKey,
  isVisible,
  onToggleVisibility,
  onEdit,
  onToggleStatus,
  onRegenerate,
  onDelete,
  onCopy,
}: ApiKeyCardProps) {
  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Check if key is expired
  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const expired = isExpired(apiKey.expires_at);

  return (
    <Card className={expired ? 'border-red-200 bg-red-50' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{apiKey.name}</CardTitle>
              <div className="flex items-center gap-2">
                {apiKey.is_active ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                    Inactive
                  </Badge>
                )}
                {expired && (
                  <Badge variant="destructive">
                    <IconAlertTriangle className="h-3 w-3 mr-1" />
                    Expired
                  </Badge>
                )}
              </div>
            </div>
            {apiKey.description && (
              <CardDescription>{apiKey.description}</CardDescription>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(apiKey)}
            >
              <IconEdit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleStatus(apiKey)}
            >
              {apiKey.is_active ? (
                <IconToggleRight className="h-4 w-4 text-green-600" />
              ) : (
                <IconToggleLeft className="h-4 w-4 text-gray-400" />
              )}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <IconRefresh className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Regenerate API Key</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will generate a new API key and invalidate the current one.
                    Any applications using the current key will need to be updated.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onRegenerate(apiKey.id, apiKey.name)}
                  >
                    Regenerate
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <IconTrash className="h-4 w-4 text-red-600" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete API Key</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{apiKey.name}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(apiKey.id, apiKey.name)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* API Key Display */}
        <div className="space-y-2">
          <Label>API Key</Label>
          <div className="flex gap-2">
            <Input
              type={isVisible ? "text" : "password"}
              value={isVisible ? apiKey.key : apiKey.masked_key}
              readOnly
              className="font-mono text-sm"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleVisibility(apiKey.id)}
            >
              {isVisible ? (
                <IconEyeOff className="h-4 w-4" />
              ) : (
                <IconEye className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCopy(apiKey.key, 'API key')}
            >
              <IconCopy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Key Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <Label className="text-xs text-muted-foreground">Created</Label>
            <p>{formatDate(apiKey.created_at)}</p>
          </div>
          {apiKey.expires_at && (
            <div>
              <Label className="text-xs text-muted-foreground">Expires</Label>
              <p className={expired ? 'text-red-600' : ''}>
                {formatDate(apiKey.expires_at)}
              </p>
            </div>
          )}
          {apiKey.last_used_at && (
            <div>
              <Label className="text-xs text-muted-foreground">Last Used</Label>
              <p>{formatDistanceToNow(new Date(apiKey.last_used_at), { addSuffix: true })}</p>
            </div>
          )}
          {apiKey.usage_count !== undefined && (
            <div>
              <Label className="text-xs text-muted-foreground">Usage Count</Label>
              <p>{apiKey.usage_count.toLocaleString()}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}