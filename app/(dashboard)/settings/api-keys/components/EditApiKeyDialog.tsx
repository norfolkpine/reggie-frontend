import { useState, useEffect } from "react";
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
} from "@/components/ui/dialog";
import { EditApiKeyDialogProps, UpdateApiKeyFormData, updateApiKeySchema } from "../types";
import { toast } from "sonner";

export function EditApiKeyDialog({
  isOpen,
  onOpenChange,
  editingKey,
  onSubmit,
}: EditApiKeyDialogProps) {
  const [formData, setFormData] = useState<UpdateApiKeyFormData>({
    name: '',
    description: '',
    expires_at: '',
  });

  // Update form data when editing key changes
  useEffect(() => {
    if (editingKey) {
      setFormData({
        name: editingKey.name,
        description: editingKey.description || '',
        expires_at: editingKey.expires_at ? editingKey.expires_at.slice(0, 16) : '',
      });
    }
  }, [editingKey]);

  const handleSubmit = async () => {
    if (!editingKey) return;
    
    try {
      const validatedData = updateApiKeySchema.parse(formData);
      await onSubmit(validatedData);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Failed to update API key:', error);
      if (error.errors) {
        error.errors.forEach((err: any) => toast.error(err.message));
      } else {
        toast.error('Failed to update API key');
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit API Key</DialogTitle>
          <DialogDescription>
            Update the details of your API key.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Name</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description (Optional)</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-expires_at">Expiration Date (Optional)</Label>
            <Input
              id="edit-expires_at"
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
          <Button onClick={handleSubmit}>
            Update Key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}