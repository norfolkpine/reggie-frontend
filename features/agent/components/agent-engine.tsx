"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Info, Server } from "lucide-react"
import { useEffect, useState } from "react"
import { getModelProviders, ModelProvider } from "@/api/agent-providers";
import { useAgent } from "../context/agent-context";

interface AgentEngineProps {
}

export default function AgentEngine({  }: AgentEngineProps) {
  const { agentData, setAgentData } = useAgent();

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
            <select
              className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
              value={agentData.model || ''}
              onChange={e => setAgentData({ model: e.target.value })}
            >
              <option value="" disabled>Select a model</option>
              {modelProviders.map((model) => (
                <option
                  key={model.model_name}
                  value={model.id}
                  disabled={!model.is_enabled}
                >
                  {model.model_name} {model.description ? `- ${model.description}` : ''} {!model.is_enabled ? '(Currently unavailable)' : ''}
                </option>
              ))}
            </select>
          )}
        </div>

      </CardContent>
    </Card>
  );
}

