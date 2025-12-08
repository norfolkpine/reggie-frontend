import React, { useState } from 'react';
import { ColumnType } from '../types';
import { generatePromptHelper } from './services/geminiService';
import { 
  X, 
  HelpCircle, 
  Sparkles, 
  Loader2,
  Type,
  WrapText,
  Hash,
  Calendar,
  CheckSquare,
  List,
  FileText,
  Trash2
} from './Icons';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './ui/select';

const COLUMN_TYPES: { type: ColumnType; label: string; icon: React.FC<any> }[] = [
  { type: 'short-text', label: 'Short Text', icon: Type },
  { type: 'long-text', label: 'Long Text', icon: WrapText },
  { type: 'number', label: 'Number', icon: Hash },
  { type: 'date', label: 'Date', icon: Calendar },
  { type: 'boolean', label: 'Yes/No', icon: CheckSquare },
  { type: 'list', label: 'List', icon: List },
  { type: 'file', label: 'File', icon: FileText },
];

interface AddColumnMenuProps {
  triggerRect: DOMRect;
  onClose: () => void;
  onSave: (col: { name: string; type: ColumnType; prompt: string }) => void;
  onDelete?: () => void;
  modelId: string;
  initialData?: { name: string; type: ColumnType; prompt?: string };
}

export const AddColumnMenu: React.FC<AddColumnMenuProps> = ({
  triggerRect,
  onClose,
  onSave,
  onDelete,
  modelId,
  initialData
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [type, setType] = useState<ColumnType>(initialData?.type || 'short-text');
  const [prompt, setPrompt] = useState(initialData?.prompt || '');
  
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);

  const selectedType = COLUMN_TYPES.find(t => t.type === type) || COLUMN_TYPES[0];

  // Calculate position
  // Align the LEFT edge of the menu with the LEFT edge of the trigger (extends right)
  const MENU_WIDTH = 400;
  let top = triggerRect.bottom + 8;
  let left = triggerRect.left;

  // If that pushes it off-screen to the right, align the RIGHT edge of the menu with the RIGHT edge of the trigger
  if (left + MENU_WIDTH > window.innerWidth - 10) {
    left = triggerRect.right - MENU_WIDTH;
    // If that pushes it off-screen to the left, force it to the left edge plus a margin
    if (left < 10) {
      left = 10;
    }
  }

  const handleAiGeneratePrompt = async () => {
    if (!name) return;
    
    setIsGeneratingPrompt(true);
    try {
      const suggestion = await generatePromptHelper(name, type, prompt || undefined, modelId);
      setPrompt(suggestion);
    } catch (e) {
      console.error("Failed to generate prompt", e);
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const handleSave = () => {
    if (name) {
      onSave({ name, type, prompt });
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose}></div>
      <div 
        className="fixed flex flex-col justify-content-between bg-background rounded-lg border shadow-lg w-[400px] z-50"
        style={{ top, left }}
      >
        <div className="p-4 space-y-4">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-2 right-2 h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Label Input */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
              <label className="text-sm font-medium">Label</label>
            </div>
            <Input
              placeholder="e.g. Persons mentioned"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSave()}
            />
          </div>

          {/* Format Dropdown */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Format</label>
            <Select value={type} onValueChange={(value) => setType(value as ColumnType)}>
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                  {/* <selectedType.icon className="h-4 w-4" /> */}
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                {COLUMN_TYPES.map((t) => (
                  <SelectItem key={t.type} value={t.type}>
                    <div className="flex items-center gap-2">
                      <t.icon className="h-4 w-4" />
                      <span>{t.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Prompt Textarea */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
              <label className="text-sm font-medium">Prompt (optional)</label>
            </div>
            <div className="relative space-y-2">
              <Textarea 
                className="h-[120px] pr-24 resize-none"
                placeholder="Describe what data to extract from the document... (optional)"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAiGeneratePrompt}
                  disabled={isGeneratingPrompt || !name}
                >
                  {isGeneratingPrompt ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Sparkles className="h-3 w-3" />
                  )}
                  <span className="ml-1.5">
                    {prompt ? "Optimize" : "Generate"}
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className={`px-4 py-3 bg-slate-50 border-t border-slate-100 flex ${initialData ? 'justify-between' : 'justify-end'} gap-3`}>
          {initialData && onDelete && (
            <Button variant="outline" size="sm" onClick={onDelete}>
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </Button>
          )}
          <Button variant="default" size="sm" onClick={handleSave} disabled={!name}>
            {initialData ? 'Update Column' : 'Create Column'}
          </Button>
        </div>
      </div>
    </>
  );
};