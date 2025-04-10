"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAgent } from "../context/agent-context";

export const AgentDetails = () => {
  const { agentData, setAgentData } = useAgent();

  const handleChange = (field: string, value: string) => {
    setAgentData({
      [field]: value,
    });

    
  };return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Agent details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center">
            <label htmlFor="agent-name" className="text-sm font-medium">
              Agent's name
            </label>
          </div>
          <Input
            id="agent-name"
            className="bg-muted"
            placeholder="Enter agent name"
            value={agentData.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center">
            <label
              htmlFor="agent-description"
              className="text-sm font-medium"
            >
              Short description of what this agent does
            </label>
            <HoverCard>
              <HoverCardTrigger asChild>
                <Info className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <p className="text-sm">
                  Provide a brief description of what this agent does.
                </p>
              </HoverCardContent>
            </HoverCard>
          </div>
          <Textarea
            id="agent-description"
            className="bg-muted min-h-[100px]"
            placeholder="Describe what tasks or functions this agent can perform"
            value={agentData.description}
            onChange={(e) => handleChange("description", e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
