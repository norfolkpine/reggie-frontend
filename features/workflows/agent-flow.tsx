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
  Handle,
  Position,
  type Connection,
  type Node,
  type Edge,
  type NodeProps,
  type EdgeProps,
  useReactFlow,
  BaseEdge,
  EdgeLabelRenderer,
  getStraightPath,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Home, Bot, MessageSquareText, X, ArrowLeft, Plus, Trash2, StickyNote, Loader2 } from "lucide-react"

function StartNode({ data, id }: NodeProps) {
  const { setNodes } = useReactFlow();

  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
  };

  return (
    <div className="py-1 px-2 rounded-lg bg-white border-2 border-gray-200 shadow-sm min-w-[150px] flex items-center justify-center gap-2 relative group">
      <div className="flex items-center justify-between">
        <div className="bg-gray-100 rounded flex items-center justify-center gap-1 px-2 py-1">
          <Home size={12} />
          <span className='text-xs font-semibold'>{data.label}</span>
        </div>

        <Button
          onClick={onDelete}
          className="h-5 w-5 bg-red-500 ml-2 hover:bg-red-600 text-red-500/0 hover:text-red-50/100 p-0 rounded-full flex items-center justify-center"
        >
          <Trash2 size={12}/>
        </Button>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-gray-400 !w-3 !h-3 !border-2 !border-white"
      />
    </div>
  );
}

function EndNode({ data, id }: NodeProps) {
  const { setNodes } = useReactFlow();

  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
  };

  return (
    <div className="py-1 px-2 rounded-lg bg-white border-2 border-gray-200 shadow-sm min-w-[150px] flex items-center justify-center gap-2 relative group">
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-gray-400 !w-3 !h-3 !border-2 !border-white"
      />

      <div className="flex items-center justify-between">
        <div className="bg-gray-100 rounded flex items-center justify-center gap-1 px-2 py-1">
          <MessageSquareText size={12} />
          <span className='text-xs font-semibold'>{data.label}</span>
        </div>

        <Button
          onClick={onDelete}
          className="h-5 w-5 bg-red-500 ml-2 hover:bg-red-600 text-red-500/0 hover:text-red-50/100 p-0 rounded-full flex items-center justify-center"
        >
          <Trash2 size={12}/>
        </Button>
      </div>
    </div>
  );
}

function AgentNode({ data, id }: NodeProps) {
  const { setNodes } = useReactFlow();

  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
  };

  return (
    <div className="rounded-lg bg-white border-2 shadow-sm w-[200px] relative group">
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-gray-400 !w-3 !h-3 !border-2 !border-white"
      />
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="bg-gray-100 rounded flex items-center justify-center gap-1 px-2 py-1">
            <Bot size={14} />
            <span className='text-xs font-semibold'>{data.type || 'Agent'}</span>
          </div>

          <Button
            onClick={onDelete}
            className="h-5 w-5 bg-red-500 hover:bg-red-600 text-red-500/0 hover:text-red-50/100 p-0 rounded-full flex items-center justify-center"
          >
            <Trash2 size={12}/>
          </Button>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-gray-400 !w-3 !h-3 !border-2 !border-white"
      />
    </div>
  );
}

function StickyNoteNode({ data, id }: NodeProps) {
  const { setNodes } = useReactFlow();

  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
  };

  return (
    <div className="rounded-lg bg-yellow-100 border-2 border-yellow-300 shadow-sm w-[200px] min-h-[150px] relative group">
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <StickyNote size={14} className="text-yellow-700" />
            <span className='text-xs font-semibold text-yellow-700'>Note</span>
          </div>
          <Button
            onClick={onDelete}
            className="h-5 w-5 bg-red-500 hover:bg-red-600 text-red-500/0 hover:text-red-50/100 p-0 rounded-full flex items-center justify-center"
          >
            <Trash2 size={12}/>
          </Button>
        </div>
        <div className="text-xs text-yellow-800 whitespace-pre-wrap">
          {data.note || 'Add your note here...'}
        </div>
      </div>
    </div>
  );
}

function DeletableEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition }: EdgeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { setEdges } = useReactFlow();
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onEdgeDelete = () => {
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  };

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        type="bezier"
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {isHovered && (
            <button
              onClick={onEdgeDelete}
              className="w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

const nodeTypes = {
  startNode: StartNode,
  endNode: EndNode,
  agentNode: AgentNode,
  stickyNoteNode: StickyNoteNode,
};

const edgeTypes = {
  deletable: DeletableEdge,
};

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

// Sidebar node categories
const nodeCategories = [
  {
    title: 'Core',
    nodes: [
      { type: 'startNode', label: 'Input', icon: Home },
      { type: 'agentNode', label: 'Agent', icon: Bot },
      { type: 'endNode', label: 'Output', icon: MessageSquareText},
      { type: 'stickyNoteNode', label: 'Sticky Note', icon: StickyNote},
    ]
  },
];

function WorkflowEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [toolsComboOpen, setToolsComboOpen] = useState(false);
  const [toolSearchQuery, setToolSearchQuery] = useState('');
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showWorkflowDialog, setShowWorkflowDialog] = useState(false);
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
          type: 'smoothstep',
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
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
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
            disabled
          >
            Test Workflow
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
        {/* Palette Sidebar */}
        {paletteOpen && (
          <div className="w-64 bg-gray-50/50 border-r border-gray-200 overflow-y-auto flex-shrink-0">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700">Components</h3>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setPaletteOpen(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {nodeCategories.map((category, idx) => (
                <div key={idx} className="mb-6">
                  <div className="px-2 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {category.title}
                  </div>
                  <div className="space-y-2 mt-2">
                    {category.nodes.map((node, nodeIdx) => {
                      const Icon = node.icon;
                      return (
                        <div
                          key={nodeIdx}
                          draggable
                          onDragStart={(e) => onDragStart(e, node.type, node.label)}
                          className="flex items-center gap-3 px-3 py-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 hover:bg-gray-100 hover:shadow-sm transition-all group"
                        >
                          <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center ">
                            <Icon size={18} className="text-gray-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">{node.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div className="mt-8 px-3 py-3 bg-blue-50 border border-blue-100 rounded-lg">
                <p className="text-xs text-blue-600 leading-relaxed">
                  <span className="font-semibold">Tip:</span> Drag components onto the canvas to build your workflow
                </p>
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
            defaultEdgeOptions={{
              type: 'bezier',
            }}
            // defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            fitView
          >
            <Background bgColor='#fafafa' variant={BackgroundVariant.Dots} gap={16} size={1} />
            <Controls />
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