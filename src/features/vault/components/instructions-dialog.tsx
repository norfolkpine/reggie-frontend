import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dispatch, SetStateAction, useState } from "react";
import { patchProject } from "@/api/projects";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface InstructionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instructions: string;
  setInstructions: Dispatch<SetStateAction<string>>;
  projectUuid: string;
  onSave?: (instructions: string) => void;
}

export function InstructionsDialog({ 
  open, 
  onOpenChange, 
  instructions, 
  setInstructions, 
  projectUuid, 
  onSave 
}: InstructionsDialogProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!projectUuid) {
      toast({
        title: "Error",
        description: "Project UUID is required",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await patchProject(projectUuid, { custom_instruction: instructions });
      toast({
        title: "Success",
        description: "Project instructions updated successfully",
      });
      onSave?.(instructions);
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving project instructions:', error);
      toast({
        title: "Error",
        description: "Failed to save project instructions",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full">
        <DialogHeader>
          <DialogTitle>Project Instructions</DialogTitle>
          <DialogDescription>
            Opie will follow these instructions for all conversations in this project.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2">
          <Label htmlFor="project-instructions" className="sr-only">Instructions</Label>
          <Textarea
            id="project-instructions"
            placeholder="Write instructions for Opie..."
            value={instructions}
            onChange={e => setInstructions(e.target.value)}
            className="h-[250px] min-h-[150px] text-sm"
            style={{ minHeight: 150, height: 250 }}
            autoFocus
          />
        </div>
        <DialogFooter className="mt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
