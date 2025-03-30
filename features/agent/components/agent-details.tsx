"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Info, Server } from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"

export default function AgentDetails() {
  const [agentData, setAgentData] = useState({
    name: "AUSTRAC Compliance Assistant",
    description: "Helps organizations navigate AML/CTF compliance requirements and reporting obligations",
    information:
      "Get guidance on AUSTRAC reporting requirements, KYC procedures, and regulatory compliance for Australian financial services",
  })

  const handleChange = (field: string, value: string) => {
    setAgentData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Agent details</CardTitle>
        <div className="flex space-x-2">
          <Badge variant="outline" className="flex items-center gap-1 text-xs">
            <Server className="h-3 w-3" /> POST /api/agents/
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1 text-xs">
            <Server className="h-3 w-3" /> PUT /api/agents/:id/
          </Badge>
        </div>
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
            value={agentData.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center">
            <label htmlFor="agent-description" className="text-sm font-medium">
              Short description of what this agent does
            </label>
            <HoverCard>
              <HoverCardTrigger asChild>
                <Info className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <p className="text-sm">Provide a brief description of what this agent does.</p>
              </HoverCardContent>
            </HoverCard>
          </div>
          <Textarea
            id="agent-description"
            className="bg-muted min-h-[100px]"
            value={agentData.description}
            onChange={(e) => handleChange("description", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center">
            <label htmlFor="agent-info" className="text-sm font-medium">
              Information for users
            </label>
            <HoverCard>
              <HoverCardTrigger asChild>
                <Info className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <p className="text-sm">This information will be shown to users when they interact with your agent.</p>
              </HoverCardContent>
            </HoverCard>
          </div>
          <Textarea
            id="agent-info"
            className="bg-muted min-h-[100px]"
            value={agentData.information}
            onChange={(e) => handleChange("information", e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  )
}

