"use client";

import { useEffect, useState } from "react";
import { createAgent, getAgent, updateAgent } from "@/api/agents";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronRight, Save, Server } from "lucide-react";
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
import { useRouter, useSearchParams } from "next/navigation";
import { AgentProvider, useAgent } from "./context/agent-context";
import { AgentDetails } from "./components/agent-details";

const tabs = [
  { id: "details", label: "Details" },
  { id: "prompts", label: "Prompts" },
  { id: "engine", label: "AI engine" },
  { id: "resources", label: "Knowledge Base" },
  // { id: "limits", label: "Limits" },
];

function AgentCreationContent() {
  const [activeTab, setActiveTab] = useState("details");
  const { toast } = useToast();
  const { user } = useAuth();
  const { agentData, setAgentData, isSubmitting, setIsSubmitting, isFetchingData, setIsFetchingData } = useAgent();

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
  const searchParams = useSearchParams();
  const agentId = searchParams.get('id') ?? '';

  useEffect(() => {
    setAgentData({})
    if (agentId) {
      const fetchAgentData = async () => {
        setIsFetchingData(true);
        try {
          const agent = await getAgent(Number(agentId));
          setAgentData({
            name: agent.name,
            description: agent.description,
            systemMessage: agent.instructions?.instruction,
            systemTemplateId: agent.instructions?.id.toString(),
            expectedTemplateId: agent.expected_output?.id.toString(),
            expectedOutput: agent.expected_output?.expected_output,
            model: agent.model.toString(),
            knowledgeBaseId: agent.knowledge_base || null,
            searchKnowledge: agent.search_knowledge || false,
            citeKnowledge: false,
          });
        } catch (error) {
          console.error('Error fetching agent data:', error);
        } finally {
          setIsFetchingData(false);
        }
      };
      fetchAgentData();
    }
  }, [agentId]);


  const handleSave = async () => {
    setIsSubmitting(true);

    try {
      const agentPayload: Partial<AgentCreate> = {
        name: agentData.name || "",
        description: agentData.description || "",
        custom_instruction: agentData.systemMessage,
        custom_excpected_output: agentData.expectedOutput,
        model: Number(agentData.model) || 1,
        team: teamStorage.getActiveTeam()?.id || null,
        knowledge_base: agentData.knowledgeBaseId || undefined,
        search_knowledge: agentData.searchKnowledge || false,
        cite_knowledge: agentData.citeKnowledge || false,
      };

      if (agentId) {
       await updateAgent(Number(agentId), agentPayload);
      }else{
        await createAgent(agentPayload);
      }
      
      toast({
        title:  `Agent ${agentId ? "edited" : "created"} successfully`,
        description: "Your agent is now ready to use.",
      });

      if (agentId) {
        router.push(`/agent`);
      } else {
        router.push("/workflows");
      }
    } catch (error) {
      console.error("Error saving agent:", error);
      toast({
        title: "Error agent",
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
        <h1 className="text-xl font-medium">{agentId ? "Edit Agent" : "Create Agent"}</h1>
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
              />
            )}
            {activeTab === "prompts" && (
              <AgentPrompts
              />
            )}
            {activeTab === "engine" && (
              <AgentEngine
              />
            )}
            {activeTab === "resources" && (
              <AgentResources
                onChange={(data) => {
                  setAgentData({
                    knowledgeBaseId: data.knowledgeBaseId,
                    searchKnowledge: data.searchKnowledge,
                    citeKnowledge: data.citeKnowledge,
                    files: data.files,
                    urls: data.urls,
                    isCite: data.isCite
                  });
                }}
              />
            )}
            {/* {activeTab === "limits" && (
              <AgentLimits
                onChange={(data) => {}
                }
              />
            )} */}
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

export default function AgentCreationView() {
  return (
    <AgentProvider>
      <AgentCreationContent />
    </AgentProvider>
  );
}
