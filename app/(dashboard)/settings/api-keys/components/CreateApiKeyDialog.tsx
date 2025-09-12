import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
    description: '',
    expires_at: '',
  });

  const generateAutoName = () => {
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 16).replace('T', ' ');
    return `API Key ${timestamp}`;
  };

  const handleSubmit = async () => {
    try {
      const validatedData = createApiKeySchema.parse(formData);
      await onSubmit(validatedData);
      setFormData({ name: '', description: '', expires_at: '' });
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
      setFormData({ name: '', description: '', expires_at: '' });
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
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder={generateAutoName()}
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe what this key will be used for..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expires_at">Expiration Date (Optional)</Label>
            <Input
              id="expires_at"
              type="datetime-local"
              value={formData.expires_at}
              onChange={(e) => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
            />
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