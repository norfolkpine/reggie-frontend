"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, ArrowRight, LucideIcon } from "lucide-react"

export interface Agent {
  id: number
  name: string
  description: string
  icon: LucideIcon
  category: string
  popular: boolean
  capabilities: string[]
  backgroundColor: string
}

interface AgentCardProps {
  agent: Agent
}

export function AgentCard({ agent }: AgentCardProps) {
  return (
    <Card className={`overflow-hidden border-2 hover:border-primary/50 transition-colors ${agent.backgroundColor}`}>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-white">
              <agent.icon className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg">{agent.name}</CardTitle>
          </div>
          {agent.popular && (
            <Badge variant="default" className="bg-primary/10 text-primary border-primary/20">
              <Star className="h-3 w-3 mr-1 fill-primary" /> Popular
            </Badge>
          )}
        </div>
        <CardDescription className="mt-2">{agent.description}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex flex-wrap gap-2 mt-2">
          {agent.capabilities.map((capability, index) => (
            <Badge key={index} variant="outline" className="bg-white">
              {capability}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-2 bg-white/80 flex justify-between">
        <Badge variant="outline" className="bg-transparent">
          {agent.category}
        </Badge>
        <Button variant="ghost" size="sm" className="gap-1">
          Chat now <ArrowRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}