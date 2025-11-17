import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IconKey, IconCopy } from "@tabler/icons-react";
import { GeneratedKeyDisplayProps } from "../types";

export function GeneratedKeyDisplay({ 
  generatedKey, 
  onDismiss, 
  onCopy 
}: GeneratedKeyDisplayProps) {
  if (!generatedKey) return null;

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="text-green-800 flex items-center gap-2">
          <IconKey className="h-5 w-5" />
          New API Key Generated
        </CardTitle>
        <CardDescription className="text-green-700">
          This is your new API key. Copy it now as it won't be shown again.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>API Key</Label>
          <div className="flex gap-2">
            <Input
              value={generatedKey.key}
              readOnly
              className="font-mono text-sm bg-white"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCopy(generatedKey.key, 'API key')}
            >
              <IconCopy className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onDismiss}
          >
            I've copied the key
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}