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
import { Star, ArrowRight, LucideIcon } from "lucide-react";

import { Agent } from "@/types/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createChatSession } from "@/api/chat-sessions";
import { useChatSessionContext } from "@/features/chats/ChatSessionContext";

interface AgentCardProps {
  agent: Agent;
}

export function AgentCard({ agent }: AgentCardProps) {
  const router = useRouter();

  const { refresh } = useChatSessionContext();
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
              const agent_code = (agent.model ? agent.model.toString() : "gpt-4o");
              const session = await createChatSession({
                title: `New chat with ${agent.name}`,
                agent_id: agent.agent_id,
                agent_code,
              });
              refresh();
              router.push(`/chat/${session.session_id}?agentId=${agent.agent_id}`);
            } catch (e) {
              // Optionally handle error, e.g., toast
              alert("Failed to start chat session. Please try again.");
            }
          }}
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
