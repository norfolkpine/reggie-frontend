"use client"

import React, { useCallback, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { WorkflowResultDialog } from "./components/workflow-result-dialog";
import {
  createWorkflow,
  createWorkflowNode,
  createWorkflowEdge,
  getWorkflow,
  getNodesByWorkflow,
  getEdgesByWorkflow,
  updateWorkflow,
  updateWorkflowNode,
  updateWorkflowEdge,
  deleteWorkflowNode,
  deleteWorkflowEdge,
  runWorkflow,
} from "@/api/workflows";
import { getAllModelProviders } from "@/api/agent-providers";
import { getKnowledgeBases } from "@/api/knowledge-bases";
import { getTools } from "@/api/tools";
import { useSearchParams } from 'next/navigation';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import {
  Background,
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider,
  BackgroundVariant,
  Controls,
  PanelPosition,
  ConnectionMode,
  type Connection,
  type Node,
  type Edge,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { 
  Home, 
  Bot, 
  MessageSquareText, 
  ArrowLeft, 
  Plus, 
  StickyNote, 
  Loader2, 
  Play, 
  X,
  Webhook,
  Clock,
  PlayCircle,
  GitBranch,
  Route,
  Split,
  GitMerge,
  Repeat,
  Timer,
  AlertTriangle,
  Variable,
  ArrowRightLeft,
  Code,
  Globe,
  Database,
  Folder,
  Bell,
  Search,
  ShieldCheck,
  FileText,
  Upload,
  UserCheck,
  Edit,
  Workflow as WorkflowIcon,
  Radio,
  PanelBottom
} from "lucide-react"
import { nodeTypes, edgeTypes } from './components/nodes';

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

// Sidebar node categories
const nodeCategories = [
  {
    title: 'Input',
    nodes: [
      { type: 'startNode', label: 'Input', icon: Home },
      { type: 'webhookTrigger', label: 'Webhook', icon: Webhook },
      { type: 'cronTrigger', label: 'Schedule', icon: Clock },
      { type: 'manualTrigger', label: 'Manual', icon: PlayCircle },
    ]
  },
  {
    title: 'Core',
    nodes: [
      { type: 'agentNode', label: 'Agent', icon: Bot },
      { type: 'stickyNoteNode', label: 'Sticky Note', icon: StickyNote },
    ]
  },
  {
    title: 'Output',
    nodes: [
      { type: 'endNode', label: 'Output', icon: MessageSquareText },
    ]
  },
  {
    title: 'Control & Flow',
    nodes: [
      { type: 'ifNode', label: 'If', icon: GitBranch },
      { type: 'switchNode', label: 'Switch', icon: Route },
      { type: 'parallelSplit', label: 'Split', icon: Split },
      { type: 'parallelMerge', label: 'Merge', icon: GitMerge },
      { type: 'loopNode', label: 'Loop', icon: Repeat },
      { type: 'timerNode', label: 'Timer', icon: Timer },
      { type: 'errorNode', label: 'Try-Catch', icon: AlertTriangle },
    ]
  },
  {
    title: 'Data & Transform',
    nodes: [
      { type: 'setVariable', label: 'Set Variable', icon: Variable },
      { type: 'mapTransform', label: 'Map', icon: ArrowRightLeft },
      { type: 'functionNode', label: 'Function', icon: Code },
    ]
  },
  {
    title: 'Integrations',
    nodes: [
      { type: 'httpRequest', label: 'HTTP Request', icon: Globe },
      { type: 'databaseQuery', label: 'Database', icon: Database },
      { type: 'fileStorage', label: 'File Storage', icon: Folder },
      { type: 'notification', label: 'Notification', icon: Bell },
    ]
  },
  {
    title: 'AI / Legal',
    nodes: [
      { type: 'extractEntities', label: 'Extract Entities', icon: Search },
      { type: 'complianceCheck', label: 'Compliance Check', icon: ShieldCheck },
      { type: 'generateSummary', label: 'Generate Summary', icon: FileText },
      { type: 'documentIngest', label: 'Document Ingest', icon: Upload },
    ]
  },
  {
    title: 'Human-in-the-Loop',
    nodes: [
      { type: 'approvalTask', label: 'Approval', icon: UserCheck },
      { type: 'dataCorrection', label: 'Data Review', icon: Edit },
    ]
  },
  {
    title: 'Temporal / System',
    nodes: [
      { type: 'childWorkflow', label: 'Child Workflow', icon: WorkflowIcon },
      { type: 'signalWait', label: 'Signal Wait', icon: Radio },
    ]
  },
];

function WorkflowEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  // const [palettePosition, setPalettePosition] = useState({ x: 20, y: 80 });
  // const [isDraggingPalette, setIsDraggingPalette] = useState(false);
  // const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [toolsComboOpen, setToolsComboOpen] = useState(false);
  const [toolSearchQuery, setToolSearchQuery] = useState('');
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [showWorkflowDialog, setShowWorkflowDialog] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [workflowResult, setWorkflowResult] = useState<{
    status: string;
    result?: string;
    error?: string;
  } | null>(null);
  const [workflowId, setWorkflowId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modelProviders, setModelProviders] = useState<any[]>([]);
  const [knowledgeBases, setKnowledgeBases] = useState<any[]>([]);
  const [availableTools, setAvailableTools] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState<string>('');
  const { screenToFlowPosition } = useReactFlow();
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const loadData = async () => {
    const providersData = await getAllModelProviders();
    const knowledgeBasesData = await getKnowledgeBases();
    // const toolsData = await getTools();

    console.log('providersData:', providersData);
    console.log('knowledgeBasesData:', knowledgeBasesData);
    // console.log('toolsData:', toolsData);

    setModelProviders(providersData);
    setKnowledgeBases(knowledgeBasesData?.results);
    // setAvailableTools(toolsData?.results);
  };

  // Load workflow data if editing
  useEffect(() => {
    loadData();
  }, []);
  useEffect(() => {
    const loadWorkflow = async () => {
      const id = searchParams.get('id');
      if (!id) return;

      setIsLoading(true);
      try {
        const workflowData = await getWorkflow(parseInt(id));
        setWorkflowId(workflowData.id);
        setWorkflowName(workflowData.name);
        setWorkflowDescription(workflowData.description || '');

        // Load nodes
        const nodesData = await getNodesByWorkflow(workflowData.id);
        const loadedNodes: Node[] = nodesData.nodes.map((node) => {
          const nodeData = node.config || { label: node.name, type: node.name };
          return {
            id: node.id.toString(),
            type: node.node_type,
            position: { x: node.position_x, y: node.position_y },
            data: {
              ...nodeData,
              config: nodeData.config || {}
            },
          };
        });
        setNodes(loadedNodes);

        // Load edges
        const edgesData = await getEdgesByWorkflow(workflowData.id);
        const loadedEdges: Edge[] = edgesData.edges.map((edge) => ({
          id: edge.id.toString(),
          source: edge.source_node.toString(),
          target: edge.target_node.toString(),
          type: 'deletable',
        }));
        setEdges(loadedEdges);

        toast({
          title: "Workflow loaded",
          description: `Loaded workflow: ${workflowData.name}`,
        });
      } catch (error: any) {
        console.error('Error loading workflow:', error);
        toast({
          title: "Error",
          description: error?.message || "Failed to load workflow",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkflow();
  }, [searchParams, setNodes, setEdges, toast]);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => {
        // Remove any existing edge from the source node
        const filteredEdges = eds.filter((edge) => edge.source !== params.source);
        // Add the new edge with deletable type
        return addEdge({ ...params, type: 'deletable' }, filteredEdges);
      });
    },
    [setEdges]
  );

  const onEdgeClick = useCallback(
    (event: React.MouseEvent, _edge: Edge) => {
      event.preventDefault();
      event.stopPropagation();
    },
    []
  );

  const onEdgesDelete = useCallback(
    (edgesToDelete: Edge[]) => {
      setEdges((eds) => eds.filter((edge) => !edgesToDelete.find((e) => e.id === edge.id)));
    },
    [setEdges]
  );

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setSelectedNode(node);
      setDrawerOpen(true);
      // Load node configuration from data
      setSelectedModel(node.data?.config?.model || '');
      setSelectedKnowledgeBase(node.data?.config?.knowledgeBase || '');
      setSelectedTools(node.data?.config?.tools || []);
    },
    []
  );

  const onPaneClick = useCallback(() => {
    setDrawerOpen(false);
    setSelectedNode(null);
  }, []);

  const handleToggleTool = (toolValue: string) => {
    const newTools = selectedTools.includes(toolValue)
      ? selectedTools.filter(t => t !== toolValue)
      : [...selectedTools, toolValue];

    setSelectedTools(newTools);

    // Update node data
    if (selectedNode) {
      updateNodeConfig(selectedNode.id, { tools: newTools });
    }
  };

  const updateNodeConfig = (nodeId: string, configUpdate: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          const updatedConfig = {
            ...(node.data?.config || {}),
            ...configUpdate,
          };
          console.log('Updating node:', nodeId, 'config:', updatedConfig);
          return {
            ...node,
            data: {
              ...node.data,
              config: updatedConfig,
            },
          };
        }
        return node;
      })
    );
  };

  const handleModelChange = (value: string) => {
    setSelectedModel(value);
    if (selectedNode) {
      updateNodeConfig(selectedNode.id, { model: value });
    }
  };

  const handleKnowledgeBaseChange = (value: string) => {
    setSelectedKnowledgeBase(value);
    if (selectedNode) {
      updateNodeConfig(selectedNode.id, { knowledgeBase: value });
    }
  };

  const handleInputMessageChange = (value: string) => {
    if (selectedNode) {
      updateNodeConfig(selectedNode.id, { inputMessage: value });
    }
  };

  const handleOutputMessageChange = (value: string) => {
    if (selectedNode) {
      updateNodeConfig(selectedNode.id, { outputMessage: value });
    }
  };

  const handleNoteChange = (value: string) => {
    if (selectedNode) {
      updateNodeConfig(selectedNode.id, { note: value });
      // Also update the note in the main data for display on the node
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === selectedNode.id) {
            return {
              ...node,
              data: {
                ...node.data,
                note: value,
              },
            };
          }
          return node;
        })
      );
    }
  };

  const handleInstructionChange = (value: string) => {
    if (selectedNode) {
      updateNodeConfig(selectedNode.id, { instruction: value });
    }
  };

  const handleAgentNameChange = (value: string) => {
    if (selectedNode) {
      updateNodeConfig(selectedNode.id, { agentName: value, name: value });
      // Also update the label in the main data for display on the node
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === selectedNode.id) {
            return {
              ...node,
              data: {
                ...node.data,
                label: value,
              },
            };
          }
          return node;
        })
      );
    }
  };

  const handleConditionChange = (value: string) => {
    if (selectedNode) {
      updateNodeConfig(selectedNode.id, { condition: value });
      // Also update the condition in the main data for display on the node
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === selectedNode.id) {
            return {
              ...node,
              data: {
                ...node.data,
                config: {
                  ...node.data.config,
                  condition: value,
                },
              },
            };
          }
          return node;
        })
      );
    }
  };

  const handleAddNode = useCallback(
    (nodeType: string, label: string, position: { x: number; y: number }) => {
      const id = `${label.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

      const newNode: Node = {
        id,
        type: nodeType,
        position,
        data: {
          label,
          type: label,
          config: {}
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  const onDragStart = (event: React.DragEvent, nodeType: string, label: string) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({ nodeType, label }));
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const data = event.dataTransfer.getData('application/reactflow');
      if (!data) return;

      const { nodeType, label } = JSON.parse(data);
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      handleAddNode(nodeType, label, position);
    },
    [screenToFlowPosition, handleAddNode]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // const handlePaletteMouseDown = (e: React.MouseEvent) => {
  //   setIsDraggingPalette(true);
  //   setDragOffset({
  //     x: e.clientX - palettePosition.x,
  //     y: e.clientY - palettePosition.y,
  //   });
  // };

  // useEffect(() => {
  //   const handleMouseMove = (e: MouseEvent) => {
  //     if (isDraggingPalette) {
  //       setPalettePosition({
  //         x: e.clientX - dragOffset.x,
  //         y: e.clientY - dragOffset.y,
  //       });
  //     }
  //   };

  //   const handleMouseUp = () => {
  //     setIsDraggingPalette(false);
  //   };

  //   if (isDraggingPalette) {
  //     document.addEventListener('mousemove', handleMouseMove);
  //     document.addEventListener('mouseup', handleMouseUp);
  //   }

  //   return () => {
  //     document.removeEventListener('mousemove', handleMouseMove);
  //     document.removeEventListener('mouseup', handleMouseUp);
  //   };
  // }, [isDraggingPalette, dragOffset]);

  const handleTestWorkflow = async () => {
    if (!workflowId) {
      toast({
        title: "Error",
        description: "Please save the workflow first before testing",
        variant: "destructive",
      });
      return;
    }

    setIsTestRunning(true);
    try {
      const result = await runWorkflow(workflowId);

      setWorkflowResult(result);
      setShowResultDialog(true);

      toast({
        title: "Workflow Executed Successfully",
        description: `Status: ${result.status}`,
      });
    } catch (error: any) {
      setWorkflowResult({
        status: "failed",
        error: error?.message || "An error occurred while running the workflow",
      });
      setShowResultDialog(true);

      toast({
        title: "Workflow Execution Failed",
        description: error?.message || "An error occurred while running the workflow",
        variant: "destructive",
      });
    } finally {
      setIsTestRunning(false);
    }
  };

  const handleSaveWorkflow = async () => {
    // Validate workflow name
    if (!workflowName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a workflow name",
        variant: "destructive",
      });
      return;
    }

    // Validate that there are nodes
    if (nodes.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one node to the workflow",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      let currentWorkflowId = workflowId;

      // Step 1: Create or update the workflow
      if (currentWorkflowId) {
        // Update existing workflow
        await updateWorkflow(currentWorkflowId, {
          name: workflowName,
          description: workflowDescription,
          definition: {
            agent_ids: [], // Extract from nodes if needed
            tool_ids: selectedTools.map(t => parseInt(t)) || [],
          },
          trigger_type: "manual",
          trigger_config: {},
        });
        console.log('Workflow updated with ID:', currentWorkflowId);

        // Delete all existing nodes and edges
        try {
          // Get existing edges first (must delete before nodes due to foreign key constraints)
          const existingEdgesData = await getEdgesByWorkflow(currentWorkflowId);
          if (existingEdgesData?.edges) {
            for (const edge of existingEdgesData.edges) {
              await deleteWorkflowEdge(edge.id);
            }
            console.log(`Deleted ${existingEdgesData.edges.length} existing edges`);
          }

          // Get and delete existing nodes
          const existingNodesData = await getNodesByWorkflow(currentWorkflowId);
          if (existingNodesData?.nodes) {
            for (const node of existingNodesData.nodes) {
              await deleteWorkflowNode(node.id);
            }
            console.log(`Deleted ${existingNodesData.nodes.length} existing nodes`);
          }
        } catch (deleteError) {
          console.error('Error deleting existing nodes/edges:', deleteError);
        }
      } else {
        // Create new workflow
        const workflow = await createWorkflow({
          name: workflowName,
          description: workflowDescription,
          definition: {
            agent_ids: [], // Extract from nodes if needed
            tool_ids: selectedTools.map(t => parseInt(t)) || [],
          },
          trigger_type: "manual",
          trigger_config: {},
        });
        currentWorkflowId = workflow.id;
        setWorkflowId(currentWorkflowId);
        console.log('Workflow created with ID:', currentWorkflowId);
      }

      // Step 2: Create nodes with the workflow_id
      const nodeIdMapping: Record<string, number> = {}; // Map UI node IDs to backend IDs

      for (const node of nodes) {
        const nodeConfig = {
          ...node.data,
          originalId: node.id, // Store original UI ID
        };

        console.log('Saving node:', node.id, 'with config:', nodeConfig);

        const createdNode = await createWorkflowNode({
          workflow: currentWorkflowId,
          name: String(node.data.label || node.data.type || 'Node'),
          node_type: node.type || 'agentNode',
          position_x: node.position.x,
          position_y: node.position.y,
          config: nodeConfig,
        });

        // Store mapping of UI ID to backend ID
        nodeIdMapping[node.id] = createdNode.id;
      }

      console.log('Nodes created:', nodeIdMapping);

      // Step 3: Create edges using the mapped node IDs
      for (const edge of edges) {
        const sourceNodeId = nodeIdMapping[edge.source];
        const targetNodeId = nodeIdMapping[edge.target];

        if (sourceNodeId && targetNodeId) {
          await createWorkflowEdge({
            workflow: currentWorkflowId,
            source_node: sourceNodeId,
            target_node: targetNodeId,
            config: {
              originalEdgeId: edge.id,
            },
          });
        }
      }

      console.log('Edges created successfully');

      toast({
        title: "Success",
        description: `Workflow "${workflowName}" has been saved successfully!`,
      });

      // Close dialog and redirect
      setShowWorkflowDialog(false);
      setTimeout(() => {
        router.push("/workflow");
      }, 1000);

    } catch (error: any) {
      console.error('Error saving workflow:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to save workflow. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading workflow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col">
      {/* Header with Back Button */}
      <div className="h-16 border-b bg-background px-6 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/workflow")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="h-5 w-px bg-border" />
          <span className="text-sm font-semibold">{workflowId ? 'Edit Workflow' : 'Create Workflow'}</span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 px-4"
            onClick={handleTestWorkflow}
            disabled={!workflowId || isTestRunning}
          >
            {isTestRunning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Running
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Test Workflow
              </>
            )}
          </Button>
          <Button
            size="sm"
            className="gap-2 px-4"
            onClick={() => setShowWorkflowDialog(true)}
            disabled={nodes.length === 0 || isSaving}
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Draggable Palette Card */}
        {paletteOpen && (
          <div
            className="absolute bg-white border border-gray-300 rounded-xl shadow-2xl overflow-hidden z-50"
            style={{
              left: `20px`,
              top: `80px`,
              width: '350px',
              maxHeight: '800px',
            }}
          >
            <div
              className="px-4 py-3 border-b border-gray-200 flex items-center justify-between cursor-move bg-white cursor-grabbing"
            >
              <h3 className="text-base font-semibold text-gray-800">Add Nodes</h3>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setPaletteOpen(false)}
                className="h-8 w-8 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Search Input */}
            <div className="px-4 py-3 border-b border-gray-200">
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Content */}
            <div className="overflow-y-auto" style={{ maxHeight: '480px' }}>
              <div className="p-4">
                {nodeCategories.map((category, idx) => {
                  const filteredNodes = category.nodes.filter(node =>
                    node.label.toLowerCase().includes(searchQuery.toLowerCase())
                  );

                  if (filteredNodes.length === 0) return null;

                  return (
                    <Accordion
                      type="single"
                      collapsible
                      className="w-full"
                      defaultValue="Input"
                      key={idx}
                    >
                      <AccordionItem value={category.title} className="mb-4 border-none">
                        <AccordionTrigger className="px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md hover:no-underline">
                          {category.title}
                        </AccordionTrigger>
                        <AccordionContent className="space-y-2 mt-2">
                          {filteredNodes.map((node, nodeIdx) => {
                            const Icon = node.icon;
                            return (
                              <div
                                key={nodeIdx}
                                draggable
                                onDragStart={(e) => onDragStart(e, node.type, node.label)}
                                className="flex items-center gap-2 px-2 py-2 hover:bg-gray-50 hover:border hover:border-gray-200 rounded-lg cursor-pointer transition-all group"
                              >
                                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                                  <Icon size={16} className="text-gray-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-700">{node.label}</span>
                                <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-blue-500 text-lg font-semibold">+</span>
                              </div>
                            );
                          })}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Canvas */}
        <div className="flex-1 relative">
          {/* Floating Toggle Palette Button */}
          {!paletteOpen && (
            <Button
              size="icon"
              onClick={() => setPaletteOpen(true)}
              className="absolute ml-4 top-4 z-10 h-12 w-12 rounded-full shadow-lg"
            >
              <Plus className="h-6 w-6" />
            </Button>
          )}

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onEdgeClick={onEdgeClick}
            onEdgesDelete={onEdgesDelete}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            connectionMode={ConnectionMode.Strict}
            defaultEdgeOptions={{
              type: 'deletable',
            }}
            // defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            fitView
          >
            <Background bgColor='#fafafa' variant={BackgroundVariant.Dots} gap={16} size={1} />
            <Controls position='bottom-center' orientation='horizontal' />
          </ReactFlow>
        </div>

        {/* Right Palette */}
        {drawerOpen && selectedNode && (
          <div key={selectedNode.id} className="w-80 bg-gray-50/50 border-l border-gray-200 overflow-y-auto flex-shrink-0">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700">
                  {selectedNode?.data?.label || selectedNode?.data?.type || 'Node Settings'}
                </h3>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setDrawerOpen(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mb-6">
                Configure the properties for this node
              </p>
              <div className="space-y-4">
                {selectedNode?.type === 'startNode' ? (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Input Message</label>
                    <Textarea
                      placeholder="Enter the input message..."
                      className="min-h-[200px] resize-none"
                      defaultValue={selectedNode?.data?.config?.inputMessage || ''}
                      onChange={(e) => handleInputMessageChange(e.target.value)}
                    />
                  </div>
                ) : selectedNode?.type === 'stickyNoteNode' ? (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Note Content</label>
                    <Textarea
                      placeholder="Add your note here..."
                      className="min-h-[200px]"
                      defaultValue={selectedNode?.data?.note || ''}
                      onChange={(e) => handleNoteChange(e.target.value)}
                    />
                  </div>
                ) : selectedNode?.type === 'agentNode' ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="agent-name">Agent Name</Label>
                      <Input
                        id="agent-name"
                        placeholder="Enter agent name"
                        defaultValue={selectedNode?.data?.config.name || ''}
                        onChange={(e) => handleAgentNameChange(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="model-select">Model Provider</Label>
                      <Select value={selectedModel} onValueChange={handleModelChange}>
                        <SelectTrigger id="model-select">
                          <SelectValue placeholder="Select a model provider" />
                        </SelectTrigger>
                        <SelectContent>
                          {modelProviders && modelProviders.length > 0 ? (
                            modelProviders.map((provider: any) => (
                              <SelectItem key={provider.id} value={provider.id.toString()}>
                                {provider.model_name || provider.provider || 'Unknown Model'}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="px-2 py-1.5 text-sm text-muted-foreground">
                              No model providers available
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="kb-select">Knowledge Base</Label>
                      <Select value={selectedKnowledgeBase} onValueChange={handleKnowledgeBaseChange}>
                        <SelectTrigger id="kb-select">
                          <SelectValue placeholder="Select a knowledge base" />
                        </SelectTrigger>
                        <SelectContent>
                          {knowledgeBases && knowledgeBases.length > 0 ? (
                            knowledgeBases.map((kb: any) => (
                              <SelectItem key={kb.id} value={kb.id.toString()}>
                                {kb.name || 'Unnamed Knowledge Base'}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="px-2 py-1.5 text-sm text-muted-foreground">
                              No knowledge bases available
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label>Tools</Label>
                      <div className="border rounded-lg p-3 space-y-2">
                        <div className="max-h-[200px] overflow-y-auto space-y-1">
                          {selectedTools.map((toolId) => {
                            const tool = availableTools.find(t => t.id.toString() === toolId);
                            return (
                              <div
                                key={toolId}
                                className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer"
                                onClick={() => handleToggleTool(toolId)}
                              >
                                <Checkbox
                                  checked={true}
                                  onCheckedChange={() => handleToggleTool(toolId)}
                                />
                                <span className="text-sm">{tool?.name}</span>
                              </div>
                            );
                          })}
                        </div>

                        <Popover open={toolsComboOpen} onOpenChange={(open) => {
                          setToolsComboOpen(open);
                          if (!open) setToolSearchQuery('');
                        }}>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              className="w-full justify-center gap-2 text-sm h-9"
                            >
                              <Plus className="h-4 w-4" />
                              Add Tools
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[400px] p-0" align="start">
                            <div className="p-2">
                              <Input
                                placeholder="Search tools..."
                                value={toolSearchQuery}
                                onChange={(e) => setToolSearchQuery(e.target.value)}
                                className="h-9"
                              />
                            </div>
                            <div className="max-h-[300px] overflow-y-auto p-2">
                              {availableTools && availableTools.length > 0 ? (
                                <>
                                  {availableTools
                                    .filter(tool =>
                                      tool.name.toLowerCase().includes(toolSearchQuery.toLowerCase())
                                    )
                                    .map((tool) => (
                                      <div
                                        key={tool.id}
                                        className="flex items-center gap-2 px-2 py-2 hover:bg-gray-50 rounded cursor-pointer"
                                        onClick={() => handleToggleTool(tool.id.toString())}
                                      >
                                        <Checkbox
                                          checked={selectedTools.includes(tool.id.toString())}
                                        />
                                        <span className="text-sm">{tool.name}</span>
                                      </div>
                                    ))}
                                  {availableTools.filter(tool =>
                                    tool.name.toLowerCase().includes(toolSearchQuery.toLowerCase())
                                  ).length === 0 && (
                                    <div className="text-sm text-muted-foreground text-center py-6">
                                      No tool found.
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div className="text-sm text-muted-foreground text-center py-6">
                                  No tools available
                                </div>
                              )}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Instructions</label>
                      <Textarea
                        placeholder="Enter agent instructions..."
                        className="min-h-[120px]"
                        defaultValue={selectedNode?.data?.config?.instruction || ''}
                        onChange={(e) => handleInstructionChange(e.target.value)}
                      />
                    </div>
                  </>
                ) : selectedNode?.type === 'endNode' ? (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Output Message</label>
                    <Textarea
                      placeholder="Enter the output message..."
                      className="min-h-[200px] resize-none"
                      defaultValue={selectedNode?.data?.config?.outputMessage || ''}
                      onChange={(e) => handleOutputMessageChange(e.target.value)}
                    />
                  </div>
                ) : selectedNode?.type === 'ifNode' ? (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Condition</label>
                    <Textarea
                      placeholder="Enter condition (e.g., status === 'approved', amount > 1000, name contains 'test')"
                      className="min-h-[120px] resize-none"
                      defaultValue={(selectedNode?.data?.config as any)?.condition || ''}
                      onChange={(e) => handleConditionChange(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      The condition will be evaluated. If true, flow continues through the green output. If false, flow continues through the red output.
                    </p>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="text-sm font-medium">Node ID</label>
                      <p className="text-sm text-muted-foreground mt-1">{selectedNode?.id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Node Type</label>
                      <p className="text-sm text-muted-foreground mt-1">{selectedNode?.type}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Position</label>
                      <p className="text-sm text-muted-foreground mt-1">
                        X: {selectedNode?.position.x.toFixed(0)}, Y: {selectedNode?.position.y.toFixed(0)}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Workflow Save Dialog */}
      <Dialog open={showWorkflowDialog} onOpenChange={setShowWorkflowDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Save Workflow</DialogTitle>
            <DialogDescription>
              Enter a name and description for your workflow
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="workflow-name">Workflow Name *</Label>
              <Input
                id="workflow-name"
                placeholder="Enter workflow name"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workflow-description">Description</Label>
              <Textarea
                id="workflow-description"
                placeholder="Enter workflow description (optional)"
                value={workflowDescription}
                onChange={(e) => setWorkflowDescription(e.target.value)}
                className="min-h-[100px]"
                disabled={isSaving}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p>This workflow contains:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>{nodes.length} node{nodes.length !== 1 ? 's' : ''}</li>
                <li>{edges.length} connection{edges.length !== 1 ? 's' : ''}</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowWorkflowDialog(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveWorkflow}
              disabled={isSaving || !workflowName.trim()}
              className="gap-2"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSaving ? "Saving..." : "Save Workflow"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Workflow Result Dialog */}
      <WorkflowResultDialog
        open={showResultDialog}
        onOpenChange={setShowResultDialog}
        result={workflowResult}
      />
    </div>
  );
}

export default function ExploreWorkflows() {
  return (
    <ReactFlowProvider>
      <WorkflowEditor />
    </ReactFlowProvider>
  );
}