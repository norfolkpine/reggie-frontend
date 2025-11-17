"use client"

import { Agent, Workflow } from "@/types/api"
import { WorkflowCard } from "./workflow-card"

interface WorkflowListProps {
  title: string
  agents?: Agent[]
  workflows?: Workflow[]
  isLoading?: boolean
  onWorkflowDelete?: (id: number) => void
  onWorkflowEdit?: (id: number) => void
}

export function WorkflowList({ title, agents = [], workflows = [], isLoading, onWorkflowDelete, onWorkflowEdit }: WorkflowListProps) {
  const items = workflows.length > 0 ? workflows : agents;

  if (isLoading) {
    return (
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mb-6 text-center py-12">
        <p className="text-muted-foreground">
          {workflows.length === 0 && agents.length === 0
            ? "No items found. Create your first one to get started!"
            : "No items found."}
        </p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      {/* <h2 className="text-lg font-medium mb-4">{title}</h2> */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <WorkflowCard
            key={item.id}
            agent={'agent_id' in item ? item : undefined}
            workflow={'name' in item && !('agent_id' in item) ? item : undefined}
            onDelete={onWorkflowDelete}
            onEdit={onWorkflowEdit}
          />
        ))}
      </div>
    </div>
  )
}