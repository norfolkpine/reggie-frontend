import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { IconPlus } from "@tabler/icons-react";
import { CreateApiKeyDialogProps, CreateApiKeyFormData, createApiKeySchema } from "../types";
import { toast } from "sonner";

export function CreateApiKeyDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  isCreating,
}: CreateApiKeyDialogProps) {
  const [formData, setFormData] = useState<CreateApiKeyFormData>({
    name: '',
  });

  const generateAutoName = () => {
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 16).replace('T', ' ');
    return `API Key ${timestamp}`;
  };

  const handleSubmit = async () => {
    try {
      // Auto-generate name if not provided
      const dataToSubmit = {
        name: formData.name || generateAutoName()
      };
      const validatedData = createApiKeySchema.parse(dataToSubmit);
      await onSubmit(validatedData);
      setFormData({ name: '' });
      onOpenChange(false);
    } catch (error: any) {
      console.error('Failed to create API key:', error);
      if (error.errors) {
        error.errors.forEach((err: any) => toast.error(err.message));
      } else {
        toast.error('Failed to create API key');
      }
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setFormData({ name: '' });
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <IconPlus className="h-4 w-4 mr-2" />
          Generate New Key
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate New API Key</DialogTitle>
          <DialogDescription>
            Create a new API key for platform access. The key will be shown only once.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name (Optional)</Label>
            <Input
              id="name"
              placeholder={generateAutoName()}
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
            <p className="text-sm text-muted-foreground">
              Leave empty to auto-generate a name with timestamp
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isCreating}>
            {isCreating ? 'Generating...' : 'Generate Key'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}