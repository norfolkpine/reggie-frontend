"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, ArrowRight, Star, Briefcase, Home, Shield, Scale, LineChart, Landmark, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Update the agents array to remove agents with the specified categories
const agents = [
  {
    id: 1,
    name: "Accounting Specialist",
    description: "Expert in Australian tax law, financial reporting, and corporate accounting standards",
    icon: Briefcase,
    category: "Finance",
    popular: true,
    capabilities: ["Tax Compliance", "Financial Analysis", "Audit Support"],
    backgroundColor: "bg-blue-50",
  },
  {
    id: 2,
    name: "Real Estate Advisor",
    description: "Specialized in Australian property law, market analysis, and investment strategies",
    icon: Home,
    category: "Real Estate",
    popular: true,
    capabilities: ["Property Valuation", "Market Trends", "Legal Requirements"],
    backgroundColor: "bg-green-50",
  },
  {
    id: 3,
    name: "AML/KYC Compliance",
    description: "Expert in Anti-Money Laundering and Know Your Customer regulations in Australia",
    icon: Shield,
    category: "Compliance",
    popular: false,
    capabilities: ["Risk Assessment", "Compliance Checks", "Regulatory Updates"],
    backgroundColor: "bg-red-50",
  },
  {
    id: 5,
    name: "Legal Assistant",
    description: "Expert in Australian corporate law, contracts, and legal document analysis",
    icon: Scale,
    category: "Legal",
    popular: true,
    capabilities: ["Contract Review", "Legal Research", "Compliance Guidance"],
    backgroundColor: "bg-indigo-50",
  },
  {
    id: 7,
    name: "Financial Analyst",
    description: "Expert in market analysis, investment strategies, and financial forecasting for Australian markets",
    icon: LineChart,
    category: "Finance",
    popular: false,
    capabilities: ["Market Analysis", "Investment Strategies", "Financial Modeling"],
    backgroundColor: "bg-blue-50",
  },
  {
    id: 8,
    name: "Banking Compliance",
    description: "Specialized in Australian banking regulations, APRA requirements, and financial compliance",
    icon: Landmark,
    category: "Compliance",
    popular: true,
    capabilities: ["APRA Compliance", "Banking Regulations", "Risk Management"],
    backgroundColor: "bg-teal-50",
  },
]

// Update the categories array to remove the specified categories
const categories = ["All", "Finance", "Real Estate", "Compliance", "Legal"]

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
      <div className="p-4 border-b flex items-center justify-between">
        <h1 className="text-xl font-medium">Explore AI Agents</h1>
        <Button onClick={() => console.log("Create Agent clicked")}>
          <Plus className="h-4 w-4 mr-2" />
          Create Agent
        </Button>
      </div>

      {/* Search and filters */}
      <div className="p-4 border-b">
        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for specialized agents..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(category)}
              className="rounded-full"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-4">Popular Agents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAgents
              .filter((agent) => agent.popular)
              .map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-medium mb-4">All Specialized Agents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAgents
              .filter((agent) => !agent.popular || activeCategory !== "All" || searchQuery)
              .map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function AgentCard({ agent }) {
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

