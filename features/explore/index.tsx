"use client"

import { useState } from "react"
import { agents, categories } from "./store/agents"
import { SearchFilter } from "./components/search-filter"
import { AgentList } from "./components/agent-list"

export default function ExploreAgents() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("All")

  // Filter agents based on search query and category
  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.category.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = activeCategory === "All" || agent.category === activeCategory

    return matchesSearch && matchesCategory
  })

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <h1 className="text-xl font-medium">Explore AI Agents</h1>
      </div>

      {/* Search and filters */}
      <SearchFilter
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        categories={categories}
      />

      {/* Main content */}
      <div className="flex-1 overflow-auto p-4">
        <AgentList
          title="Popular Agents"
          agents={filteredAgents.filter((agent) => agent.popular)}
        />

        <AgentList
          title="All Specialized Agents"
          agents={filteredAgents.filter((agent) => !agent.popular || activeCategory !== "All" || searchQuery)}
        />
      </div>
    </div>
  )
}

