"use client";

import * as React from "react";
import { X, HelpCircle, ChevronDown, Check, Sparkles, Loader2, Type, WrapText, Hash, Calendar, CheckSquare, List, FileText } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { generatePromptHelper } from "../services/geminiService";

// Column type definition
type ColumnType = 'short-text' | 'long-text' | 'number' | 'date' | 'boolean' | 'list' | 'file';

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
  const [name, setName] = React.useState(initialData?.name || '');
  const [type, setType] = React.useState<ColumnType>(initialData?.type || 'short-text');
  const [prompt, setPrompt] = React.useState(initialData?.prompt || '');
  const [isTypeMenuOpen, setIsTypeMenuOpen] = React.useState(false);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = React.useState(false);

  const selectedType = COLUMN_TYPES.find(t => t.type === type) || COLUMN_TYPES[0];

  // Calculate position
  const MENU_WIDTH = 400;
  let top = triggerRect.bottom + 8;
  let left = triggerRect.left;

  if (left + MENU_WIDTH > window.innerWidth - 10) {
    left = triggerRect.right - MENU_WIDTH;
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
        className="fixed bg-background rounded-xl shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50 w-[400px]"
        style={{ top, left }}
      >
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 p-1 text-muted-foreground hover:text-foreground hover:bg-accent rounded-full transition-colors z-10"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="p-5 space-y-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <HelpCircle className="w-3.5 h-3.5" />
              <label className="text-xs font-semibold">Label</label>
            </div>
            <input 
              type="text" 
              className="w-full border border-border rounded-lg px-3 py-2 text-sm text-foreground bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-muted-foreground"
              placeholder="e.g. Persons mentioned"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSave()}
            />
          </div>

          <div className="space-y-1.5 relative">
            <label className="text-xs font-semibold text-muted-foreground ml-1">Format</label>
            <button 
              onClick={() => setIsTypeMenuOpen(!isTypeMenuOpen)}
              className="w-full flex items-center justify-between border border-border bg-muted/50 hover:bg-muted rounded-lg px-3 py-2 text-sm text-foreground transition-colors focus:ring-2 focus:ring-primary outline-none"
            >
              <div className="flex items-center gap-2">
                <selectedType.icon className="w-4 h-4 text-muted-foreground" />
                <span>{selectedType.label}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
            
            {isTypeMenuOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setIsTypeMenuOpen(false)}></div>
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border shadow-xl rounded-lg overflow-hidden z-30 py-1 max-h-[200px] overflow-y-auto">
                  {COLUMN_TYPES.map((t) => (
                    <button
                      key={t.type}
                      onClick={() => { setType(t.type); setIsTypeMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-accent text-sm text-foreground text-left"
                    >
                      <t.icon className="w-4 h-4 text-muted-foreground" />
                      <span>{t.label}</span>
                      {type === t.type && <Check className="w-3.5 h-3.5 ml-auto text-primary" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
              <label className="text-xs font-semibold text-foreground">Prompt (optional)</label>
            </div>
            <div className="relative group">
              <Textarea 
                className={cn(
                  "h-[120px] pr-24 resize-none overflow-y-auto",
                  "focus-visible:ring-2"
                )}
                placeholder="Describe what data to extract from the document... (optional)"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              {/* AI Generate / Optimize Button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAiGeneratePrompt}
                disabled={isGeneratingPrompt || !name}
                className={cn(
                  "absolute bottom-2 right-2",
                  "h-7 px-2.5 text-xs",
                  "shadow-sm",
                  "hover:bg-accent hover:text-accent-foreground",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {isGeneratingPrompt ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3" />
                )}
                <span className="ml-1.5">
                  {prompt ? "Optimize" : "Generate"}
                </span>
              </Button>
            </div>
          </div>
        </div>

        <div className={`px-5 py-3 bg-muted/50 border-t border-border flex ${initialData ? 'justify-between' : 'justify-end'} gap-3`}>
          {initialData && onDelete && (
            <button
              onClick={onDelete}
              className="flex items-center gap-2 px-3 py-2 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg font-medium text-xs transition-colors"
            >
              Delete
            </button>
          )}
          <Button 
            onClick={handleSave}
            disabled={!name}
            className="px-4 py-2"
          >
            {initialData ? 'Update Column' : 'Create Column'}
          </Button>
        </div>
      </div>
    </>
  );
};

