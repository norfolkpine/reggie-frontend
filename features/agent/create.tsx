"use client";

import { useState } from "react";
import { createAgent } from "@/api/agents";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronRight, Save, Server } from "lucide-react";
import AgentDetails from "./components/agent-details";
import AgentPrompts from "./components/agent-prompts";
import AgentEngine from "./components/agent-engine";
import AgentResources from "./components/agent-resources";
import AgentLimits from "./components/agent-limits";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { AgentForm } from "./components/types";
import { Agent, AgentCreate } from "@/types/api";
import { teamStorage } from "@/lib/utils/team-storage";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";

const tabs = [
  { id: "details", label: "Details" },
  { id: "prompts", label: "Prompts" },
  { id: "engine", label: "AI engine" },
  { id: "resources", label: "Resources" },
  { id: "limits", label: "Limits" },
];

export default function AgentCreationView() {
  const [activeTab, setActiveTab] = useState("details");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const {user} = useAuth()
  const [agentData, setAgentData] = useState<AgentForm>({});

  const getTabIndex = (tabId: string) => {
    return tabs.findIndex((tab) => tab.id === tabId);
  };

  const handleNext = () => {
    const currentIndex = getTabIndex(activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    const currentIndex = getTabIndex(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id);
    }
  };

  const router = useRouter();

  const handleSave = async () => {
    setIsSubmitting(true);

    try {
      const agentPayload: Partial<AgentCreate> = {
        name: agentData.name || '',
        description: agentData.description || '',
        custom_instruction: agentData.systemMessage,
        model:  Number(agentData.model) || 1,
        team: teamStorage.getActiveTeam()?.id || 0,
      };

      await createAgent(agentPayload);

      toast({
        title: "Agent created successfully",
        description: "Your agent is now ready to use.",
      });

      router.push('/agent');
    } catch (error) {
      console.error("Error saving agent:", error);
      toast({
        title: "Error creating agent",
        description:
          "There was a problem creating your agent. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLastTab = getTabIndex(activeTab) === tabs.length - 1;

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between">
        <h1 className="text-xl font-medium">Create Agent</h1>
      </div>

      {/* Step Tabs */}
      <div className="flex-1 overflow-auto p-4">

      <Card className="mb-8">
        <div className="flex items-center p-1">
          {tabs.map((tab, index) => (
            <div key={tab.id} className="flex items-center">
              <Button
                variant={activeTab === tab.id ? "default" : "ghost"}
                className={cn(
                  "rounded-md",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground"
                )}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </Button>

              {index < tabs.length - 1 && (
                <ChevronRight className="mx-1 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Content Area */}
      <div>
        <div className="mb-4">
          {activeTab === "details" && (
            <AgentDetails
              onChange={(data) =>
                setAgentData((prev) => ({ ...prev, ...data }))
              }
            />
          )}
          {activeTab === "prompts" && (
            <AgentPrompts
              onChange={(data) =>
                setAgentData((prev) => ({ ...prev, ...data }))
              }
            />
          )}
          {activeTab === "engine" && (
            <AgentEngine
              onChange={(data) =>
                setAgentData((prev) => ({ ...prev, ...data }))
              }
            />
          )}
          {activeTab === "resources" && (
            <AgentResources
              onChange={(data) =>
                setAgentData((prev) => ({ ...prev, ...data }))
              }
            />
          )}
          {activeTab === "limits" && (
            <AgentLimits
              onChange={(data) =>
                setAgentData((prev) => ({ ...prev, ...data }))
              }
            />
          )}
        </div>

        <div className="mt-8 flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={getTabIndex(activeTab) === 0}
          >
            Previous
          </Button>

          {!isLastTab ? (
            <Button onClick={handleNext}>Next</Button>
          ) : (
            <Button
              onClick={handleSave}
              className="bg-primary hover:bg-primary/90"
              disabled={isSubmitting}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Saving..." : "Save & Finish"}
            </Button>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
