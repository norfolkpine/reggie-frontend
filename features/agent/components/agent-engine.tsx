"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Badge } from "@/components/ui/badge"
import { Info, Server } from "lucide-react"
import { useEffect, useState } from "react"
import { models } from "../data/models"
import { AgentForm } from "./types"
import { getModelProviders, ModelProvider } from "@/api/agent-providers";

interface AgentEngineProps {
  onChange: (agentData: AgentForm) => void
  value: AgentForm
}

export default function AgentEngine({ onChange, value }: AgentEngineProps) {
  const [selectedModel, setSelectedModel] = useState(value.model ?? "0");
  const [modelProviders, setModelProviders] = useState<ModelProvider[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModelProviders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getModelProviders();
        setModelProviders(response.results);
      } catch (err) {
        console.error("Failed to fetch model providers:", err);
        setError("Failed to load model providers");
      } finally {
        setIsLoading(false);
      }
    };

    fetchModelProviders();
  }, []);

  useEffect(() => {
    onChange({
      model: selectedModel
    })
  }, [selectedModel])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>AI engine</CardTitle>
        
      </CardHeader>
      <CardContent className="space-y-8">

        <div className="space-y-4">
          <div className="flex items-center">
            <label className="text-sm font-medium">AI model</label>
            <HoverCard>
              <HoverCardTrigger asChild>
                <Info className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <p className="text-sm">Select the AI model that will power your agent.</p>
              </HoverCardContent>
            </HoverCard>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Server className="h-4 w-4 animate-spin" />
              <span className="ml-2">Loading models...</span>
            </div>
          ) : error ? (
            <div className="text-destructive text-sm p-4 text-center">{error}</div>
          ) : (
            <RadioGroup value={selectedModel} onValueChange={setSelectedModel} className="space-y-4">
              {modelProviders.map((model) => (
                <div
                  key={model.model_name}
                  className={`flex items-center space-x-2 border rounded-md p-4 ${
                    model.model_name === selectedModel ? "bg-muted/50" : ""
                  } ${!model.is_enabled ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <RadioGroupItem 
                    value={model.id.toString()} 
                    id={model.provider} 
                    className="mt-1"
                    disabled={!model.is_enabled}
                  />
                  <div className="flex-1">
                    <Label 
                      htmlFor={model.provider} 
                      className={`font-normal ${!model.is_enabled ? "cursor-not-allowed" : ""}`}
                    >
                      {model.model_name}
                      <p className="text-sm text-muted-foreground mt-1">
                        {model.description ?? model.provider}
                        {!model.is_enabled && " (Currently unavailable)"}
                      </p>
                    </Label>
                  </div>
                </div>
              ))}
            </RadioGroup>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

