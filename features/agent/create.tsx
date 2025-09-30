"use client";

import { useEffect, useState } from "react";
import { createAgent, getAgent, updateAgent } from "@/api/agents";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronRight, Save, Server, Database } from "lucide-react";
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
import { getKnowledgeBases } from "@/api/knowledge-bases"
import { KnowledgeBase } from "@/types/api"
import { getModelProviders,getAllModelProviders, ModelProvider } from "@/api/agent-providers";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const tabs = [
  { id: "details", label: "Details" },
  // { id: "prompts", label: "Prompts" },
  { id: "engine", label: "AI engine" },
  { id: "resources", label: "Knowledge Base" },
  // { id: "limits", label: "Limits" },
];

const formSchema = z.object({
  name: z.string(),
  description: z.string(),
  model: z.string(),
  knowledgeBaseId: z.string(),
  searchKnowledge: z.boolean()
});

function AgentCreationContent() {
  const [activeTab, setActiveTab] = useState("details");
  const { toast } = useToast();
  const { user } = useAuth();
  const { agentData, setAgentData, isSubmitting, setIsSubmitting, isFetchingData, setIsFetchingData } = useAgent();
  const [modelProviders, setModelProviders] = useState<ModelProvider[]>([]);
  const form = useForm< z.infer < typeof formSchema >> ({
    resolver: zodResolver(formSchema),
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([])
  const [isLoadingKnowledgeBases, setIsLoadingKnowledgeBases] = useState(false)
  const [searchKnowledge, setSearchKnowledge] = useState(false)
  const [knowledgeBaseId, setKnowledgeBaseId] = useState<string | null>(null)

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
    const fetchModelProviders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getAllModelProviders() as ModelProvider[];
        setModelProviders(response);
      } catch (err) {
        console.error("Failed to fetch model providers:", err);
        setError("Failed to load model providers");
      } finally {
        setIsLoading(false);
      }
    };
    const fetchKnowledgeBases = async () => {
      setIsLoadingKnowledgeBases(true)
      try {
        const response = await getKnowledgeBases()
        console.log(response.results)
        setKnowledgeBases(response.results)
      } catch (error) {
        console.error("Failed to fetch knowledge bases:", error)
      } finally {
        setIsLoadingKnowledgeBases(false)
      }
    }
    fetchModelProviders();
    fetchKnowledgeBases();
  }, []);

  const handleKnowledgeBaseChange = (value: string) => {
    if (value === "none") {
      setKnowledgeBaseId(null)
      return
    }
    
    setKnowledgeBaseId(value)
    if (value) {
      setSearchKnowledge(true)
    }
  }

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
      const agentData = form.getValues();
      if (agentData.knowledgeBaseId) {
        agentData.searchKnowledge = true;
      }
      const agentPayload: Partial<AgentCreate> = {
        name: agentData.name || "",
        description: agentData.description || "",
        model: Number(agentData.model) || 1,
        team: teamStorage.getActiveTeam()?.id || null,
        knowledge_base: agentData.knowledgeBaseId || undefined,
        search_knowledge: agentData.searchKnowledge || false,
      };
      console.log(agentPayload);

      if (agentId) {
        await updateAgent(Number(agentId), agentPayload);
        form.reset();
      }else{
        await createAgent(agentPayload);
        form.reset();
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

  const handleCancel = async () => {
    await form.reset();
    router.push(`/agent`);
  }

  const isLastTab = getTabIndex(activeTab) === tabs.length - 1;

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between">
        <h1 className="text-xl font-medium">{agentId ? "Edit Agent" : "Create Agent"}</h1>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agent's name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter agent name" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is your public display Agent name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agent's description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe what tasks or functions this agent can perform" {...field} />
                  </FormControl>
                  <FormDescription>
                    Short description of what this agent does.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AI engine</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select the AI model" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {modelProviders.map((model) => (
                        <SelectItem key={model.id} value={model.id.toString()}>
                          {model.model_name} {model.description ? `- ${model.description}` : ''} {!model.is_enabled ? '(Currently unavailable)' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                    <FormDescription>Select the AI model that will power your agent.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="knowledgeBaseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Knowledge Base</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a Knowledge Base" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {knowledgeBases.map((kb) => (
                        <SelectItem key={kb.knowledgebase_id} value={kb.knowledgebase_id}>
                          <div className="flex items-center">
                            <Database className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{kb.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                    <FormDescription>Select a knowledge base for the agent to use when answering questions.</FormDescription>
                </FormItem>
              )}
            />
            <div className="mt-8 flex justify-between">
              <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
              <Button type="submit" onClick={handleSave}>Create Agent</Button>
            </div>
          </form>
        </Form>
        {/* <Card className="mb-8">
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

        <div>
          <div className="mb-4">
            {activeTab === "details" && (
              <AgentDetails
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
        </div> */}
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
