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

interface AgentPromptsProps {
  onChange: (agentData: AgentForm) => void;
  value: AgentForm;
}

export default function AgentPrompts({ onChange, value }: AgentPromptsProps) {
  const [apiOutputs, setApiOutputs] = useState<ExpectedOutput[]>([]);
  const [selectedBasicTemplate, setSelectedBasicTemplate] =
    useState<string>(value.systemTemplateId ?? "");
  const [selectedBasicOutput, setSelectedBasicOutput] = useState<string>(value.expectedTemplateId ?? "");
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [customSystemMessage, setCustomSystemMessage] = useState(value.systemMessage);

  const [customOutputFormat, setCustomOutputFormat] = useState(value.expectedOutput);



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

  useEffect(() => {
    onChange({
      systemMessage: customSystemMessage,
      expectedOutput: customOutputFormat,
      systemTemplateId: selectedBasicTemplate,
      expectedTemplateId: selectedBasicOutput,
    });
  }, [customSystemMessage, customOutputFormat, selectedBasicTemplate, selectedBasicOutput]);

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
                    selectedBasicTemplate === template.id.toString() &&
                      "border-primary bg-primary/5",
                    "border-dashed"
                  )}
                  onClick={() => {
                    setSelectedBasicTemplate(template.id.toString());
                    
                    if(template.id.toString() === "0") {
                      setCustomSystemMessage("");
                    }else{
                      setCustomSystemMessage(template.instruction);
                    }

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

          {selectedBasicTemplate && selectedBasicTemplate === "0" && (
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
                value={customSystemMessage}
                onChange={(e) => {
                  setCustomSystemMessage(e.target.value);
                }}
              />
            </div>
          )}

          {selectedBasicTemplate && selectedBasicTemplate !== "0" && (
            <div className="border rounded-md p-4 bg-muted/50 mt-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium">
                  System Message Preview:
                </div>
              </div>
              {selectedBasicTemplate === "0" ? (
                <Textarea
                  className="bg-muted min-h-[80px]"
                  value={customSystemMessage}
                  onChange={(e) => setCustomSystemMessage(e.target.value)}
                  placeholder="Enter your custom instruction..."
                />
              ) : (
                <div className="text-sm whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                  {customSystemMessage}
                </div>
              )}
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
                    selectedBasicOutput === output.id.toString() &&
                      "border-primary bg-primary/5"
                  )}
                  onClick={() => {
                    setSelectedBasicOutput(output.id.toString());
                   
                    if(output.id.toString() === "0") {
                      setCustomOutputFormat("");
                    }else{
                      setCustomOutputFormat(output.expected_output);
                    }
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

          {selectedBasicOutput && selectedBasicOutput === "0" && (
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
                value={customOutputFormat}
                onChange={(e) => {
                  setCustomOutputFormat(e.target.value);
                }}
              />
            </div>
          )}

          {selectedBasicOutput && selectedBasicOutput !== "0" && (
            <div className="border rounded-md p-4 bg-muted/50 mt-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium">Format Preview:</div>
              </div>
              {selectedBasicOutput === "0" ? (
                <Textarea
                  className="bg-muted min-h-[80px]"
                  value={customOutputFormat}
                  onChange={(e) => setCustomOutputFormat(e.target.value)}
                  placeholder="Enter your custom response format..."
                />
              ) : (
                <div className="text-sm whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                  {customOutputFormat}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
