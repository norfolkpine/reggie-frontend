"use client";

import { useEffect, useState } from "react";
import { createAgent, getAgent, updateAgent } from "@/api/agents";
import { createInstruction } from "@/api/instructions";
import { Button } from "@/components/ui/button";
import { Database } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { AgentCreate } from "@/types/api";
import { teamStorage } from "@/lib/utils/team-storage";
import { useRouter, useSearchParams } from "next/navigation";
import { AgentProvider, useAgent } from "./context/agent-context";
import { useHeader } from "@/contexts/header-context";
import { useAuth } from "@/contexts/auth-context";
import { getKnowledgeBases } from "@/api/knowledge-bases"
import { KnowledgeBase } from "@/types/api"
import { getAllModelProviders, ModelProvider } from "@/api/agent-providers";
import {
  Form,
  FormControl,
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
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().default(""),
  systemMessage: z.string().default(""),
  model: z.string().min(1, "Model is required"),
  knowledgeBaseId: z.string().nullable().default(null),
  searchKnowledge: z.boolean().default(false)
});

function AgentCreationContent() {
  const { toast } = useToast();
  const { setAgentData, setIsSubmitting, setIsFetchingData } = useAgent();
  const { setHeaderCustomContent, setHeaderActions } = useHeader();
  const { user } = useAuth();
  const [modelProviders, setModelProviders] = useState<ModelProvider[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      systemMessage: "",
      model: "",
      knowledgeBaseId: null,
      searchKnowledge: false
    }
  });
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([])

  const router = useRouter();
  const searchParams = useSearchParams();
  const agentId = searchParams.get('id') ?? '';

  // Set header content
  useEffect(() => {
    setHeaderCustomContent(
      <h1 className="text-xl font-medium">
        {agentId ? "Edit Agent" : "Create Agent"}
      </h1>
    );

    // Cleanup when component unmounts
    return () => {
      setHeaderCustomContent(null);
    };
  }, [agentId, setHeaderCustomContent]);

  useEffect(() => {
    const fetchModelProviders = async () => {
      try {
        const response = await getAllModelProviders() as ModelProvider[];
        setModelProviders(response);
      } catch (err) {
        console.error("Failed to fetch model providers:", err);
        toast({
          title: "Error",
          description: "Failed to load model providers",
          variant: "destructive"
        });
      }
    };
    const fetchKnowledgeBases = async () => {
      try {
        const response: { results: KnowledgeBase[] } = await getKnowledgeBases()
        setKnowledgeBases(response.results)
      } catch (error) {
        console.error("Failed to fetch knowledge bases:", error)
      }
    }
    fetchModelProviders();
    fetchKnowledgeBases();
  }, []);



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
            expectedTemplateId: agent.expected_output?.id.toString(),
            expectedOutput: agent.expected_output?.expected_output,
            model: agent.model.toString(),
            knowledgeBaseId: agent.knowledge_base || null,
            searchKnowledge: agent.search_knowledge || false,
            citeKnowledge: false,
          });
          form.setValue("name", agent.name);
          form.setValue("description", agent.description);
          form.setValue("systemMessage", agent.instructions?.instruction || "");
          form.setValue("model", agent.model.toString());
          form.setValue("knowledgeBaseId", agent.knowledge_base || null);
          form.setValue("searchKnowledge", agent.search_knowledge || false);
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

      // Handle instruction creation
      let instructionId: number | undefined;
      if (agentData.systemMessage && agentData.systemMessage.trim()) {
        const instruction = await createInstruction({
          instruction: agentData.systemMessage,
          category: "USER",
          is_enabled: true,
          is_global: false,
          user: user?.id || 1, // Use current user ID or fallback to 1
          agent: 0, // Will be set by the backend
        });
        instructionId = instruction.id;
      }

      const agentPayload: Partial<AgentCreate> = {
        name: agentData.name || "",
        description: agentData.description || "",
        model: Number(agentData.model) || 1,
        team: teamStorage.getActiveTeam()?.id || null,
        knowledge_base: agentData.knowledgeBaseId === "none" || !agentData.knowledgeBaseId ? undefined : agentData.knowledgeBaseId,
        search_knowledge: agentData.searchKnowledge || false,
        instructions_id: instructionId,
        custom_instruction: agentData.systemMessage || "",
      };

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

  const handleCancel = () => {
    form.reset();
    router.push(`/agent`);
  }




  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="flex-1 overflow-auto p-4">
        <Form {...form}>
          <form className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agent's name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter agent name" {...field} />
                  </FormControl>
                  {/* <FormDescription>This is your public display Agent name.</FormDescription> */}
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
                    <Textarea
                      placeholder="Describe what tasks or functions this agent can perform"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  {/* <FormDescription>
                    Short description of what this agent does.
                  </FormDescription> */}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="systemMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>System Instructions</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter custom instructions for your agent. This defines how the agent should behave and respond to users."
                      {...field}
                      value={field.value || ""}
                      rows={6}
                    />
                  </FormControl>
                  {/* <FormDescription>
                    Define how your agent should behave and respond to users. Be specific about the agent's role, tone, and capabilities.
                  </FormDescription> */}
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
                  <Select onValueChange={field.onChange} value={field.value}>
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
                    {/* <FormDescription>Select the AI model that will power your agent.</FormDescription> */}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="knowledgeBaseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Knowledge Base (Optional)</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value === "none" ? null : value);
                      if (value && value !== "none") {
                        form.setValue("searchKnowledge", true);
                      } else {
                        form.setValue("searchKnowledge", false);
                      }
                    }}
                    value={field.value ?? "none"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a Knowledge Base" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">
                        <div className="flex items-center">
                          <span>No Knowledge Base</span>
                        </div>
                      </SelectItem>
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
                    {/* <FormDescription>Select a knowledge base for the agent to use when answering questions.</FormDescription> */}
                </FormItem>
              )}
            />
            <div className="mt-8 flex justify-between">
              <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
              <Button type="submit" onClick={handleSave}>{agentId ? "Update Agent" : "Create Agent"}</Button>
            </div>
          </form>
        </Form>
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
