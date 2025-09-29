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
import { Star, ArrowRight, LucideIcon, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { Agent } from "@/types/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createChatSession } from "@/api/chat-sessions";
import { useChatSessionContext } from "@/features/chats/ChatSessionContext";
import { deleteAgent } from "@/api/agents";
import { useToast } from "@/components/ui/use-toast";

interface AgentCardProps {
  agent: Agent;
  onDelete?: (id: number) => void;
}

export function AgentCard({ agent, onDelete }: AgentCardProps) {
  const router = useRouter();
  const { refresh } = useChatSessionContext();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete agent "${agent.name}"? This action cannot be undone.`)) return;
    setIsDeleting(true);
    try {
      await deleteAgent(agent.id);
      toast({
        title: "Agent deleted",
        description: `Agent '${agent.name}' was deleted successfully.`,
        variant: "default",
      });
      if (onDelete) onDelete(agent.id);
    } catch (e) {
      toast({
        title: "Error deleting agent",
        description: "There was a problem deleting the agent. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStartChat = async () => {
    try {
      const agent_code = (agent.model ? agent.model.toString() : "gpt-4o");
      const session = await createChatSession({
        title: `New chat with ${agent.name}`,
        agent_id: agent.agent_id,
        agent_code,
      });
      refresh();
      router.push(`/chat/${session.session_id}?agentId=${agent.agent_id}`);
    } catch (e) {
      alert("Failed to start chat session. Please try again.");
    }
  };

  return (
    <Card
      className="overflow-hidden border-2 hover:border-primary/50 transition-colors h-full w-full aspect-[4/5] cursor-pointer"
      onClick={handleStartChat}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-white">
              <Star className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg">{agent.name}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {agent.is_global && (
              <Badge
                variant="default"
                className="bg-primary/10 text-primary border-primary/20"
              >
                <Star className="h-3 w-3 mr-1 fill-primary" /> Global
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
                    router.push(`/agent/create?id=${agent.id}`);
                  }}
                >
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={e => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  disabled={isDeleting}
                  className="text-destructive focus:text-destructive"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <CardDescription className="mt-2">{agent.description}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex flex-wrap gap-2 mt-2">
          {/* {agent.instructions.slice(0, 3).map((instruction, index) => ( */}
          <Badge variant="outline" className="bg-white">
            {agent.instructions?.title || agent.instructions?.category || 'No category'}
          </Badge>
          {/* ))} */}
        </div>
      </CardContent>
      <CardFooter className="p-2 bg-white/80 flex justify-between">
        {/* Remove Edit and Delete buttons, keep Chat now */}
        <span />
        <Button
          onClick={e => e.stopPropagation()}
          variant="ghost"
          size="sm"
          className="gap-1"
        >
          Chat now <ArrowRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
