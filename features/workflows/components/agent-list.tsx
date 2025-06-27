"use client"

import { Agent } from "@/types/api"
import { AgentCard } from "./agent-card"

interface AgentListProps {
  title: string
  agents: Agent[]
}

export function AgentList({ title, agents }: AgentListProps) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-medium mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  )
}