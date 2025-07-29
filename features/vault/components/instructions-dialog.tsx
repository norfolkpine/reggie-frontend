import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { createVaultProjectInstruction, updateVaultProjectInstruction, VaultProjectInstruction } from "@/api/vault";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface InstructionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
  onSave?: (instruction: VaultProjectInstruction) => void;
  editingInstruction?: VaultProjectInstruction | null;
}

export function InstructionsDialog({ 
  open, 
  onOpenChange, 
  projectId, 
  onSave,
  editingInstruction 
}: InstructionsDialogProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [instruction, setInstruction] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Reset form when dialog opens/closes or when editing instruction changes
  useEffect(() => {
    if (open) {
      if (editingInstruction) {
        setTitle(editingInstruction.title);
        setInstruction(editingInstruction.instruction);
      } else {
        setTitle("");
        setInstruction("");
      }
    }
  }, [open, editingInstruction]);

  const handleSave = async () => {
    if (!title.trim() || !instruction.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide both a title and instruction content.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      let savedInstruction: VaultProjectInstruction;

      if (editingInstruction) {
        // Update existing instruction
        savedInstruction = await updateVaultProjectInstruction(editingInstruction.id, {
          title: title.trim(),
          instruction: instruction.trim(),
        });
      } else {
        // Create new instruction
        savedInstruction = await createVaultProjectInstruction({
          project: projectId,
          title: title.trim(),
          instruction: instruction.trim(),
        });
      }

      toast({
        title: editingInstruction ? "Instruction Updated" : "Instruction Created",
        description: "Your instruction has been saved successfully.",
      });

      // Call the onSave callback with the saved instruction
      onSave?.(savedInstruction);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save instruction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full">
        <DialogHeader>
          <DialogTitle>
            {editingInstruction ? "Edit Instruction" : "Create New Instruction"}
          </DialogTitle>
          <DialogDescription>
            {editingInstruction 
              ? "Update the instruction for this project."
              : "Create a new instruction for Reggie to follow in this project."
            }
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="instruction-title">Title</Label>
            <Input
              id="instruction-title"
              placeholder="Enter instruction title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="instruction-content">Instruction</Label>
            <Textarea
              id="instruction-content"
              placeholder="Write instructions for Reggie..."
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              className="min-h-[150px] text-md mt-1"
            />
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleSave} 
            disabled={isSaving || !title.trim() || !instruction.trim()}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              editingInstruction ? "Update" : "Create"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
