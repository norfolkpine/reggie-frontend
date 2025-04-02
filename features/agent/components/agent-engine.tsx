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

interface AgentEngineProps {
  onChange: (agentData: AgentForm) => void
}

export default function AgentEngine({ onChange }: AgentEngineProps) {
  const [temperature, setTemperature] = useState(0.4)
  const [selectedModel, setSelectedModel] = useState("gpt4-turbo")

  useEffect(() => {
    onChange({
      temperature,
      model: selectedModel
    })
  }, [temperature, selectedModel])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>AI engine</CardTitle>
        
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

