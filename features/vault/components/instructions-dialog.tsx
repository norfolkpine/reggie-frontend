import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dispatch, SetStateAction } from "react";

interface InstructionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instructions: string;
  setInstructions: Dispatch<SetStateAction<string>>;
}

export function InstructionsDialog({ open, onOpenChange, instructions, setInstructions }: InstructionsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full">
        <DialogHeader>
          <DialogTitle>Project Instructions</DialogTitle>
          <DialogDescription>
            Reggie will follow these instructions for all conversations in this project.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2">
          <Label htmlFor="project-instructions" className="sr-only">Instructions</Label>
          <Textarea
            id="project-instructions"
            placeholder="Write instructions for Reggie..."
            value={instructions}
            onChange={e => setInstructions(e.target.value)}
            className="min-h-[150px] text-md"
            autoFocus
          />
        </div>
        <DialogFooter className="mt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
