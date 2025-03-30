"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronRight, Save, Server } from "lucide-react"
import AgentDetails from "./components/agent-details"
import AgentPrompts from "./components/agent-prompts"
import AgentEngine from "./components/agent-engine"
import AgentResources from "./components/agent-resources"
import AgentLimits from "./components/agent-limits"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"

const tabs = [
  { id: "details", label: "Details" },
  { id: "prompts", label: "Prompts" },
  { id: "engine", label: "AI engine" },
  { id: "resources", label: "Resources" },
  { id: "limits", label: "Limits" },
]

export default function AgentCreationView() {
  const [activeTab, setActiveTab] = useState("details")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const getTabIndex = (tabId: string) => {
    return tabs.findIndex((tab) => tab.id === tabId)
  }

  const handleNext = () => {
    const currentIndex = getTabIndex(activeTab)
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id)
    }
  }

  const handlePrevious = () => {
    const currentIndex = getTabIndex(activeTab)
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id)
    }
  }

  const handleSave = async () => {
    setIsSubmitting(true)

    try {
      // Example of how you would save the agent data
      // const response = await fetch('/api/agents/', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     name: agentData.name,
      //     description: agentData.description,
      //     // Include all other agent data here
      //   }),
      // });
      //
      // if (!response.ok) {
      //   throw new Error('Failed to create agent');
      // }
      //
      // const data = await response.json();

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Agent created successfully",
        description: "Your agent is now ready to use.",
      })

      // Redirect to agent list or agent detail page
      // window.location.href = '/agents';
    } catch (error) {
      console.error("Error saving agent:", error)
      toast({
        title: "Error creating agent",
        description: "There was a problem creating your agent. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isLastTab = getTabIndex(activeTab) === tabs.length - 1

  return (
    <div className="flex h-screen flex-1">
      {/* Sidebar */}
      <div className="w-16 bg-slate-800 flex flex-col items-center py-4 fixed h-full">
        {/* Sidebar icons would go here */}
      </div>

      {/* Main content */}
      <div className="flex-1 pl-16">
        <div className="p-6 max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-medium">Create agent</h1>
          </div>

          {/* Step Tabs */}
          <Card className="mb-8">
            <div className="flex items-center p-1">
              {tabs.map((tab, index) => (
                <div key={tab.id} className="flex items-center">
                  <Button
                    variant={activeTab === tab.id ? "default" : "ghost"}
                    className={cn(
                      "rounded-md",
                      activeTab === tab.id ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                    )}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                  </Button>

                  {index < tabs.length - 1 && <ChevronRight className="mx-1 text-muted-foreground" />}
                </div>
              ))}
            </div>
          </Card>

          {/* Content Area */}
          <div>
            {activeTab === "details" && <AgentDetails />}
            {activeTab === "prompts" && <AgentPrompts />}
            {activeTab === "engine" && <AgentEngine />}
            {activeTab === "resources" && <AgentResources />}
            {activeTab === "limits" && <AgentLimits />}

            <div className="mt-8 flex justify-between">
              <Button variant="outline" onClick={handlePrevious} disabled={getTabIndex(activeTab) === 0}>
                Previous
              </Button>

              {!isLastTab ? (
                <Button onClick={handleNext}>Next</Button>
              ) : (
                <Button onClick={handleSave} className="bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Saving..." : "Save & Finish"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

