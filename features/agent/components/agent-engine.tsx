"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Badge } from "@/components/ui/badge"
import { Info, Server } from "lucide-react"
import { useState } from "react"

export default function AgentEngine() {
  const [temperature, setTemperature] = useState(0.4)
  const [selectedModel, setSelectedModel] = useState("gpt4-turbo")
  const [models, setModels] = useState([
    {
      id: "gpt35",
      name: "GPT-3.5",
      description: "Released in November 2022. A capable model for understanding and generating natural language.",
      tokens: 200,
    },
    {
      id: "gpt35-16k",
      name: "GPT-3.5 16K",
      description: "Same as GPT-3.5 but with an extended 16,385-token context window.",
      tokens: 300,
    },
    {
      id: "gpt4",
      name: "GPT-4",
      description: "Released in March 2023. A state-of-the-art model with enhanced reasoning capabilities.",
      tokens: 100,
    },
    {
      id: "gpt4-turbo",
      name: "GPT-4 Turbo",
      description:
        "Released in April 2024. Faster than GPT-4 with improved reasoning and a 96,000-word context window.",
      tokens: 250,
    },
    {
      id: "o3-mini",
      name: "[Experimental] o3 mini",
      description:
        "Released in January 2025. Designed for reasoning and problem-solving with a 150,000-word context window. Stronger in STEM fields.",
      tokens: 90,
    },
  ])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>AI engine</CardTitle>
        <div className="flex space-x-2">
          <Badge variant="outline" className="flex items-center gap-1 text-xs">
            <Server className="h-3 w-3" /> GET /api/model-providers/
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1 text-xs">
            <Server className="h-3 w-3" /> PUT /api/agents/:id/model/
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center">
            <label className="text-sm font-medium">Temperature</label>
            <HoverCard>
              <HoverCardTrigger asChild>
                <Info className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <p className="text-sm">
                  Controls randomness: Lower values are more deterministic, higher values are more creative.
                </p>
              </HoverCardContent>
            </HoverCard>
          </div>
          <div className="flex items-center space-x-4">
            <Slider
              defaultValue={[temperature]}
              max={1}
              step={0.1}
              className="w-full"
              onValueChange={(value) => setTemperature(value[0])}
            />
            <span className="text-sm font-medium">{temperature}</span>
          </div>
        </div>

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
          <RadioGroup value={selectedModel} onValueChange={setSelectedModel} className="space-y-4">
            {models.map((model) => (
              <div
                key={model.id}
                className={`flex items-start space-x-2 border rounded-md p-4 ${model.id === selectedModel ? "bg-muted/50" : ""}`}
              >
                <RadioGroupItem value={model.id} id={model.id} className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor={model.id} className="font-normal">
                    {model.name}
                    <p className="text-sm text-muted-foreground mt-1">{model.description}</p>
                  </Label>
                  <Badge variant="outline" className="mt-1">
                    {model.tokens}
                  </Badge>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  )
}

