"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Info, Server } from "lucide-react"
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AgentForm } from "./types"

interface AgentLimitsProps {
  onChange: (agentData: AgentForm) => void
}

export default function AgentLimits({ onChange }: AgentLimitsProps) {
  const [limitPrompts, setLimitPrompts] = useState(false)
  const [limitCompletions, setLimitCompletions] = useState(false)
  const [overrideMessages, setOverrideMessages] = useState(false)
  const [promptLimit, setPromptLimit] = useState(1000)
  const [completionLimit, setCompletionLimit] = useState(2000)
  const [messageLimit, setMessageLimit] = useState(50)

  useEffect(() => {
    onChange({
      limitPrompts: limitPrompts ? promptLimit : undefined,
      limitCompletions: limitCompletions ? completionLimit: undefined,
      limitMessages: overrideMessages ? messageLimit : undefined,
    })
  }, [limitPrompts, limitCompletions, overrideMessages, promptLimit, completionLimit, messageLimit])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Limits</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch id="limit-prompts" checked={limitPrompts} onCheckedChange={setLimitPrompts} />
            <div className="flex items-center">
              <Label htmlFor="limit-prompts" className="text-sm font-medium">
                Limit the length of user prompts
              </Label>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Info className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <p className="text-sm">Set a maximum length for user prompts to prevent excessively long inputs.</p>
                </HoverCardContent>
              </HoverCard>
            </div>
          </div>

          {limitPrompts && (
            <div className="ml-6 flex items-center space-x-2">
              <Input
                type="number"
                min={100}
                max={10000}
                value={promptLimit}
                onChange={(e) => setPromptLimit(Number.parseInt(e.target.value))}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">characters</span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch id="limit-completions" checked={limitCompletions} onCheckedChange={setLimitCompletions} />
            <div className="flex items-center">
              <Label htmlFor="limit-completions" className="text-sm font-medium">
                Limit the length of AI completions
              </Label>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Info className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <p className="text-sm">Set a maximum length for AI responses to keep them concise.</p>
                </HoverCardContent>
              </HoverCard>
            </div>
          </div>

          {limitCompletions && (
            <div className="ml-6 flex items-center space-x-2">
              <Input
                type="number"
                min={100}
                max={10000}
                value={completionLimit}
                onChange={(e) => setCompletionLimit(Number.parseInt(e.target.value))}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">characters</span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch id="override-messages" checked={overrideMessages} onCheckedChange={setOverrideMessages} />
            <div className="flex items-center">
              <Label htmlFor="override-messages" className="text-sm font-medium">
                Override number of chat messages allowed per hour by each user
              </Label>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Info className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <p className="text-sm">Set a custom rate limit for how many messages each user can send per hour.</p>
                </HoverCardContent>
              </HoverCard>
            </div>
          </div>

          {overrideMessages && (
            <div className="ml-6 flex items-center space-x-2">
              <Input
                type="number"
                min={1}
                max={1000}
                value={messageLimit}
                onChange={(e) => setMessageLimit(Number.parseInt(e.target.value))}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">messages per hour</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

