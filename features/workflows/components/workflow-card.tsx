"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Star, ArrowRight, Workflow as WorkflowIcon, Play, Loader2, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

import { Agent, Workflow } from "@/types/api";
import { useRouter } from "next/navigation";
import { useChatSessionContext } from "@/features/chats/ChatSessionContext";
import { runWorkflow, deleteWorkflow } from "@/api/workflows";
import { WorkflowResultDialog } from "./workflow-result-dialog";

interface WorkflowCardProps {
  agent?: Agent;
  workflow?: Workflow;
  onDelete?: (id: number) => void;
  onEdit?: (id: number) => void;
}

export function WorkflowCard({ agent, workflow, onDelete, onEdit }: WorkflowCardProps) {
  const router = useRouter();
  const { refresh } = useChatSessionContext();
  const { toast } = useToast();

  const [isRunning, setIsRunning] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [workflowResult, setWorkflowResult] = useState<{
    status: string;
    result?: string;
    error?: string;
  } | null>(null);

  const handleDelete = async () => {
    if (!workflow) return;
    if (!window.confirm(`Are you sure you want to delete workflow "${workflow.name}"? This action cannot be undone.`)) return;

    setIsDeleting(true);
    try {
      await deleteWorkflow(workflow.id);
      toast({
        title: "Workflow deleted",
        description: `Workflow '${workflow.name}' was deleted successfully.`,
        variant: "default",
      });
      if (onDelete) onDelete(workflow.id);
    } catch (e) {
      toast({
        title: "Error deleting workflow",
        description: "There was a problem deleting the workflow. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRunWorkflow = async () => {
    if (!workflow) {
      return;
    }

    setIsRunning(true);
    try {
      const result = await runWorkflow(workflow.id);

      setWorkflowResult(result);
      setShowResultDialog(true);

      toast({
        title: "Workflow Executed Successfully",
        description: `Status: ${result.status}`,
      });
    } catch (error: any) {
      setWorkflowResult({
        status: "failed",
        error: error?.message || "An error occurred while running the workflow",
      });
      setShowResultDialog(true);

      toast({
        title: "Workflow Execution Failed",
        description: error?.message || "An error occurred while running the workflow",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  if (workflow) {
    return (
      <>
        <Card
          className="overflow-hidden border-2 hover:border-primary/50 transition-colors bg-blue-50 cursor-pointer"
          onClick={() => router.push(`/workflow/create?id=${workflow.id}`)}
        >
        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-white">
                <WorkflowIcon className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">{workflow.name}</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {workflow.is_template && (
                <Badge
                  variant="default"
                  className="bg-primary/10 text-primary border-primary/20"
                >
                  Template
                </Badge>
              )}
              {workflow.permissions && workflow.permissions.length > 0 && (
                <Badge
                  variant="default"
                  className="bg-primary/10 text-primary border-primary/20"
                >
                  Shared
                </Badge>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 p-0"
                    onClick={e => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={e => {
                      e.stopPropagation();
                      if (onEdit) {
                        onEdit(workflow.id);
                      } else {
                        router.push(`/workflow/create?id=${workflow.id}`);
                      }
                    }}
                  >
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={e => {
                      e.stopPropagation();
                      handleDelete();
                    }}
                    disabled={isDeleting || workflow.is_template}
                    className="text-destructive focus:text-destructive disabled:text-muted-foreground"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <CardDescription className="mt-2">
            {workflow.description || "No description provided"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="flex flex-wrap gap-2 mt-2">
            {workflow.trigger_type && (
              <Badge variant="outline" className="bg-white">
                Trigger: {workflow.trigger_type}
              </Badge>
            )}
            {workflow.definition?.agent_ids && workflow.definition.agent_ids.length > 0 && (
              <Badge variant="outline" className="bg-white">
                {workflow.definition.agent_ids.length} Agent{workflow.definition.agent_ids.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </CardContent>
        <CardFooter className="p-2 bg-white/80 flex justify-end">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleRunWorkflow();
            }}
            variant="ghost"
            size="sm"
            className="gap-1"
            disabled={isRunning}
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Running
              </>
            ) : (
              <>
                Run <Play className="h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

        {/* Workflow Result Dialog */}
        <WorkflowResultDialog
          open={showResultDialog}
          onOpenChange={setShowResultDialog}
          result={workflowResult}
        />
      </>
    );
  }

  if (!agent) {
    return null;
  }

  return (
    <Card className="overflow-hidden border-2 hover:border-primary/50 transition-colors bg-blue-50">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-white">
              <Star className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg">{agent.name}</CardTitle>
          </div>
          {agent.is_global && (
            <Badge
              variant="default"
              className="bg-primary/10 text-primary border-primary/20"
            >
              <Star className="h-3 w-3 mr-1 fill-primary" /> Global
            </Badge>
          )}
        </div>
        <CardDescription className="mt-2">{agent.description}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex flex-wrap gap-2 mt-2">
          {/* {agent.instructions.slice(0, 3).map((instruction, index) => ( */}
          <Badge variant="outline" className="bg-white">
            {agent.instructions.title}
          </Badge>
          {/* ))} */}
        </div>
      </CardContent>
      <CardFooter className="p-2 bg-white/80 flex justify-between">
        <Button
          onClick={() => router.push(`/agent/create?id=${agent.id}`)}
          variant="outline"
          size="sm"
          className="gap-1"
        >
          Edit
        </Button>
        <Button
          onClick={async () => {
            try {
              // You can customize the agent_code if needed, fallback to 'gpt-4o' if not present
              // const agent_code = (agent.model ? agent.model.toString() : "gpt-4o");
              // const session = await createChatSession({
              //   title: `New chat with ${agent.name}`,
              //   agent_id: agent.agent_id,
              //   agent_code,
              // });
              refresh();
              // router.push(`/chat/${session.session_id}?agentId=${agent.agent_id}`);
            } catch (e) {
              // Optionally handle error, e.g., toast
              alert("Failed to start chat session. Please try again.");
            }
          }}
          variant="ghost"
          size="sm"
          className="gap-1"
        >
          Test now <ArrowRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
