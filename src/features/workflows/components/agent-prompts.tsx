"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { FileText, Info, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { cn, truncateText } from "@/lib/utils";

import { AgentForm } from "./types";
import {
  AgentTemplateResponse,
  ExpectedOutput,
  Instruction,
} from "@/types/api";
import { getAgentTemplates } from "@/api/agent-templates";
import { useAgent } from "../context/agent-context";

interface AgentPromptsProps {
}

export default function AgentPrompts({}: AgentPromptsProps) {
  const [apiOutputs, setApiOutputs] = useState<ExpectedOutput[]>([]);
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const { agentData, setAgentData } = useAgent();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const templatesResponse = await getAgentTemplates();
        setApiOutputs([
          ...templatesResponse.expected_outputs,
          {
            id: 0,
            updated_at: "",
            title: "Custom",
            expected_output: "A Custom Output",
            category: "",
            is_enabled: true,
            is_global: true,
            created_at: "",
            user: 0,
            agent: 0,
          },
        ]);
        setInstructions([
          ...templatesResponse.instructions,
          {
            id: 0,
            updated_at: "",
            title: "Custom",
            instruction: "A Custom Instruction",
            category: "",
            is_template: false,
            is_enabled: true,
            is_global: true,
            is_system: false,
            created_at: "",
            user: 0,
          },
        ]);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setError("Failed to load agent templates");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Agent prompts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* System Message Section - Basic Mode */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <label htmlFor="basic-template" className="text-sm font-medium">
                Agent Instructions
              </label>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Info className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <p className="text-sm">
                    Choose a pre-defined personality for your agent.
                  </p>
                </HoverCardContent>
              </HoverCard>
            </div>
          </div>

          {instructions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {instructions.map((template) => (
                <Card
                  key={template.id}
                  className={cn(
                    "cursor-pointer hover:border-primary transition-colors",
                    agentData.systemTemplateId === template.id.toString() &&
                      "border-primary bg-primary/5",
                    "border-dashed"
                  )}
                  onClick={() => {
                    setAgentData({
                      systemMessage: template.instruction,
                      systemTemplateId: template.id.toString() === "0" ? "" : template.id.toString(),
                    });

                  }}
                >
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base flex items-center">
                      {template.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground">
                      {truncateText(template.instruction)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center border rounded-lg bg-muted/50">
              <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                No instructions available
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Instructions will appear here once they are configured.
              </p>
            </div>
          )}

        

          {agentData.systemTemplateId && agentData.systemTemplateId !== "0" && instructions.map((e) => e.id.toString()).includes(agentData.systemTemplateId) ?  (
            <div className="border rounded-md p-4 bg-muted/50 mt-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium">
                  System Message Preview:
                </div>
              </div>
              <div className="text-sm whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                  {agentData.systemMessage}
                </div>
            </div>
          ): (
            <div className="mt-4">
              <label
                htmlFor="custom-system-message"
                className="text-sm font-medium block mb-2"
              >
                Custom System Message
              </label>
              <Textarea
                id="custom-system-message"
                className="bg-muted min-h-[200px]"
                placeholder="Enter your custom system message here..."
                value={agentData.systemMessage}
                onChange={(e) => {
                  console.log("Typeddd")
                  setAgentData({
                    systemMessage: e.target.value,
                    systemTemplateId: "0",
                  });
                }}
              />
            </div>
          )}
        </div>

        {/* Expected Output Section - Basic Mode */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <label htmlFor="basic-output" className="text-sm font-medium">
                Response Format
              </label>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Info className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <p className="text-sm">
                    Choose how you want your agent's responses to be formatted.
                  </p>
                </HoverCardContent>
              </HoverCard>
            </div>
          </div>

          {apiOutputs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {apiOutputs.map((output) => (
                <Card
                  key={output.id}
                  className={cn(
                    "cursor-pointer hover:border-primary transition-colors",
                    agentData.expectedTemplateId === output.id.toString() &&
                      "border-primary bg-primary/5"
                  )}
                  onClick={() => {
                    setAgentData({
                      expectedOutput: output.id.toString() === "0" ? "" : output.expected_output,
                      expectedTemplateId: output.id.toString(),
                    });
                  }}
                >
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base flex items-center">
                      {output.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground">
                      {truncateText(output.expected_output)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center border rounded-lg bg-muted/50">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                No response formats available
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Response formats will appear here once they are configured.
              </p>
            </div>
          )}
          {agentData.expectedTemplateId && agentData.expectedTemplateId !== "0" && apiOutputs.map((e) => e.id.toString()).includes(agentData.expectedTemplateId) ? (
            <div className="border rounded-md p-4 bg-muted/50 mt-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium">Format Preview:</div>
              </div>
              <div className="text-sm whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                  {agentData.expectedOutput}
                </div>
            </div>
          ) : (
            <div className="mt-4">
              <label
                htmlFor="custom-output-format"
                className="text-sm font-medium block mb-2"
              >
                Custom Output Format
              </label>
              <Textarea
                id="custom-output-format"
                className="bg-muted min-h-[200px]"
                placeholder="Enter your custom output format here..."
                value={agentData.expectedOutput}
                onChange={(e) => {
                  setAgentData({
                    expectedOutput: e.target.value,
                    expectedTemplateId: "0",
                  });
                }}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
