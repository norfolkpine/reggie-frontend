"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronRight, Save } from "lucide-react"
import AgentDetails from "./agent-details"
import AgentPrompts from "./agent-prompts"
import AgentEngine from "./agent-engine"
import AgentResources from "./agent-resources"
import AgentLimits from "./agent-limits"
import { cn } from "@/lib/utils"

const tabs = [
  { id: "details", label: "Organization Details" },
  { id: "prompts", label: "Risk Assessment" },
  { id: "engine", label: "Customer Due Diligence" },
  { id: "resources", label: "Transaction Monitoring" },
  { id: "limits", label: "Reporting" },
]

export default function AustracComplianceInterface() {
  const [activeTab, setActiveTab] = useState("details")

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

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-16 bg-slate-800 flex flex-col items-center py-4 fixed h-full">
        {/* Sidebar icons would go here */}
      </div>

      {/* Main content */}
      <div className="flex-1 pl-16">
        <div className="p-6 max-w-6xl mx-auto">
          <h1 className="text-3xl font-medium mb-6">AUSTrac Compliance Program</h1>

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

              <div className="flex space-x-4">
                <Button className="bg-green-600 hover:bg-green-700">
                  Save Progress
                  <Save className="h-4 w-4 ml-2" />
                </Button>
                <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                  Submit for Review
                </Button>
              </div>

              <Button onClick={handleNext} disabled={getTabIndex(activeTab) === tabs.length - 1}>
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

