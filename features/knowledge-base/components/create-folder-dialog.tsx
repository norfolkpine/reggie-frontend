'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { createFolder } from '@/api/collections';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

interface CreateFolderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onFolderCreated: () => void;
}

export function CreateFolderDialog({ isOpen, onClose, onFolderCreated }: CreateFolderDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    collection_type: 'folder' as const,
    jurisdiction: '',
    regulation_number: '',
    effective_date: '',
    sort_order: 0,
  });
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsCreating(true);
    try {
      await createFolder({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        collection_type: formData.collection_type,
        jurisdiction: formData.jurisdiction.trim() || undefined,
        regulation_number: formData.regulation_number.trim() || undefined,
        effective_date: formData.effective_date || undefined,
        sort_order: formData.sort_order,
      });
      
      toast.success('Folder created successfully');
      resetForm();
      onFolderCreated();
      onClose();
    } catch (error) {
      console.error('Failed to create folder:', error);
      toast.error('Failed to create folder');
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      collection_type: 'folder',
      jurisdiction: '',
      regulation_number: '',
      effective_date: '',
      sort_order: 0,
    });
  };

  const handleClose = () => {
    if (!isCreating) {
      resetForm();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Collection</DialogTitle>
          <DialogDescription>
            Create a new folder or collection to organize your files.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Name *
                </label>
                <Input
                  id="name"
                  placeholder="Collection Name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  disabled={isCreating}
                />
              </div>
              <div>
                <label htmlFor="type" className="block text-sm font-medium mb-2">
                  Type
                </label>
                <Select
                  value={formData.collection_type}
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, collection_type: value }))}
                  disabled={isCreating}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="folder">Folder</SelectItem>
                    <SelectItem value="regulation">Regulation</SelectItem>
                    <SelectItem value="act">Act</SelectItem>
                    <SelectItem value="guideline">Guideline</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-2">
                Description (Optional)
              </label>
              <Textarea
                id="description"
                placeholder="Description (optional)"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                disabled={isCreating}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="jurisdiction" className="block text-sm font-medium mb-2">
                  Jurisdiction
                </label>
                <Input
                  id="jurisdiction"
                  placeholder="Jurisdiction (optional)"
                  value={formData.jurisdiction}
                  onChange={(e) => setFormData(prev => ({ ...prev, jurisdiction: e.target.value }))}
                  disabled={isCreating}
                />
              </div>
              <div>
                <label htmlFor="regulation_number" className="block text-sm font-medium mb-2">
                  Regulation #
                </label>
                <Input
                  id="regulation_number"
                  placeholder="Regulation Number (optional)"
                  value={formData.regulation_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, regulation_number: e.target.value }))}
                  disabled={isCreating}
                />
              </div>
              <div>
                <label htmlFor="effective_date" className="block text-sm font-medium mb-2">
                  Effective Date
                </label>
                <Input
                  id="effective_date"
                  type="date"
                  value={formData.effective_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, effective_date: e.target.value }))}
                  disabled={isCreating}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.name.trim() || isCreating}>
              <Plus className="h-4 w-4 mr-2" />
              {isCreating ? 'Creating...' : 'Create Collection'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
