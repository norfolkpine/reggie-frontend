import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, User, Clock, Edit, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getVaultProjectInstructions, VaultProjectInstruction } from "@/api/vault";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

interface InstructionsPanelProps {
  projectId: number;
  onInstructionSelect?: (instruction: VaultProjectInstruction) => void;
  selectedInstructionId?: number;
  onEditInstruction?: (instruction: VaultProjectInstruction) => void;
  onCreateInstruction?: () => void;
}

export interface InstructionsPanelRef {
  refresh: () => void;
}

const InstructionsPanel = forwardRef<InstructionsPanelRef, InstructionsPanelProps>(({ 
  projectId, 
  onInstructionSelect, 
  selectedInstructionId,
  onEditInstruction,
  onCreateInstruction
}, ref) => {
  const [instructions, setInstructions] = useState<VaultProjectInstruction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchInstructions = async () => {
    try {
      setLoading(true);
      const data = await getVaultProjectInstructions(projectId);
      setInstructions(data);
      
      // Auto-select the first instruction if none is selected and there are instructions
      if (data.length > 0 && !selectedInstructionId) {
        onInstructionSelect?.(data[0]);
      }
    } catch (error) {
      console.error('Error fetching instructions:', error);
      toast({
        title: "Error",
        description: "Failed to load project instructions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Expose refresh function to parent component
  useImperativeHandle(ref, () => ({
    refresh: fetchInstructions
  }));

  useEffect(() => {
    const fetchInstructions = async () => {
      try {
        setLoading(true);
        const data = await getVaultProjectInstructions(projectId);
        setInstructions(data);
        
        // Auto-select the first instruction if none is selected and there are instructions
        if (data.length > 0 && !selectedInstructionId) {
          onInstructionSelect?.(data[0]);
        }
      } catch (error) {
        console.error("Error fetching instructions:", error);
        toast({
          title: "Error",
          description: "Failed to load instructions",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInstructions();
  }, [projectId, onInstructionSelect, selectedInstructionId]);

  const handleInstructionClick = (instruction: VaultProjectInstruction) => {
    onInstructionSelect?.(instruction);
  };

  if (loading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading instructions...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Project Instructions
            </CardTitle>
            <Badge variant="secondary">{instructions.length} instruction{instructions.length !== 1 ? 's' : ''}</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {instructions.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No instructions yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first instruction to guide conversations in this project.
              </p>
              <Button onClick={onCreateInstruction}>
                <Plus className="mr-2 h-4 w-4" />
                Create Instruction
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {instructions.map((instruction) => (
                <Card 
                  key={instruction.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedInstructionId === instruction.id 
                      ? 'ring-2 ring-primary bg-primary/5' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => handleInstructionClick(instruction)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium text-sm">{instruction.title}</h3>
                          {selectedInstructionId === instruction.id && (
                            <Badge variant="default" className="text-xs">Selected</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {instruction.instruction}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{instruction.user_name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatDistanceToNow(new Date(instruction.created_at), { addSuffix: true })}</span>
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEditInstruction?.(instruction)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

InstructionsPanel.displayName = "InstructionsPanel";

export default InstructionsPanel; 