'use client';

import React, { useState, useEffect } from 'react';
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
import { createFolder, updateCollection, Collection } from '@/api/collections';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

interface CreateCollectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCollectionCreated: () => void;
  mode?: 'create' | 'edit';
  parentCollectionUuid?: string;
  collection?: Collection;
}

export function CreateCollectionDialog({ isOpen, onClose, onCollectionCreated, mode = 'create', parentCollectionUuid, collection }: CreateCollectionDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    collection_type: 'regulation' as 'folder' | 'regulation' | 'act' | 'guideline' | 'manual',
    jurisdiction: '',
    regulation_number: '',
    effective_date: '',
    sort_order: 0,
  });
  const [isCreating, setIsCreating] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (mode === 'edit' && collection) {
      setFormData({
        name: collection.name,
        description: collection.description || '',
        collection_type: collection.collection_type,
        jurisdiction: collection.jurisdiction || '',
        regulation_number: collection.regulation_number || '',
        effective_date: collection.effective_date || '',
        sort_order: collection.sort_order,
      });
    } else {
      resetForm();
    }
  }, [mode, collection, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsCreating(true);
    try {
      if (mode === 'edit' && collection) {
        await updateCollection(collection.uuid, {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          collection_type: formData.collection_type,
          jurisdiction: formData.jurisdiction.trim() || undefined,
          regulation_number: formData.regulation_number.trim() || undefined,
          effective_date: formData.effective_date || undefined,
          sort_order: formData.sort_order,
        });
        
        toast.success('Collection updated successfully');
        onCollectionCreated();
        onClose();
      } else {
        await createFolder({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          parent_uuid: parentCollectionUuid,
          collection_type: formData.collection_type,
          jurisdiction: formData.jurisdiction.trim() || undefined,
          regulation_number: formData.regulation_number.trim() || undefined,
          effective_date: formData.effective_date || undefined,
          sort_order: formData.sort_order,
        });
        
        toast.success('Collection created successfully');
        resetForm();
        onCollectionCreated();
        onClose();
      }
    } catch (error: any) {
      console.error(mode === 'edit' ? 'Failed to update collection:' : 'Failed to create collection:', error);
      // Extract meaningful error message from API response
      let errorMessage = mode === 'edit' ? 'Failed to update collection' : 'Failed to create collection';
      if (error?.message) {
        errorMessage += `: ${error.message}`;
      } else if (error?.detail) {
        errorMessage += `: ${error.detail}`;
      } else if (error?.name && Array.isArray(error.name)) {
        errorMessage += `: ${error.name.join(', ')}`;
      } else if (typeof error === 'string') {
        errorMessage += `: ${error}`;
      }
      toast.error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      collection_type: 'regulation',
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
          <DialogTitle>{mode === 'edit' ? 'Edit Collection' : 'Create New Collection'}</DialogTitle>
          <DialogDescription>
            {mode === 'edit' 
              ? 'Edit the collection details and settings.'
              : 'Create a new collection to organize your files and documents.'
            }
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
                    <SelectItem value="regulation">Regulation</SelectItem>
                    <SelectItem value="act">Act</SelectItem>
                    <SelectItem value="guideline">Guideline</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="folder">Folder</SelectItem>
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
              {isCreating ? (mode === 'edit' ? 'Updating...' : 'Creating...') : (mode === 'edit' ? 'Update Collection' : 'Create Collection')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
