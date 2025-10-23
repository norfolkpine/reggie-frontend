"use client"

import React, { useCallback, useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
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
import { Home, Bot, MessageSquareText, Clock, Workflow, X, ArrowLeft, Plus, Trash2, Check, ChevronsUpDown } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function StartNode({ data, id }: NodeProps) {
  // const { setNodes } = useReactFlow();

  // const onDelete = (e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   setNodes((nodes) => nodes.filter((node) => node.id !== id));
  // };

  return (
    <div className="py-1 px-2 rounded-lg bg-white border-2 border-gray-200 shadow-sm min-w-[100px] flex items-center justify-center gap-2 relative group">
      <div className="w-5 h-5 bg-gray-100 rounded flex items-center justify-center">
        <Home size={12} />
      </div>
      <span className='text-xs font-semibold'>{data.label}</span>
      {/* <Button
        onClick={onDelete}
        className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 hover:bg-red-600 text-white p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 size={12}/>
      </Button> */}
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
        {/* <div className="space-y-1.5">
          <Select>
            <SelectTrigger className="h-7 text-xs w-full">
              <SelectValue placeholder="Knowledge Base" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kb1">Knowledge Base 1</SelectItem>
              <SelectItem value="kb2">Knowledge Base 2</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="h-7 text-xs w-full">
              <SelectValue placeholder="Select Tools" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tool1">Tool 1</SelectItem>
              <SelectItem value="tool2">Tool 2</SelectItem>
            </SelectContent>
          </Select>
        </div> */}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-gray-400 !w-3 !h-3 !border-2 !border-white"
      />
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
};

const edgeTypes = {
  deletable: DeletableEdge,
};

const initialNodes: Node[] = [
  {
    id: 'start-node',
    type: 'startNode',
    position: { x: 250, y: 200 },
    data: { label: 'Start' },
  },
];
const initialEdges: Edge[] = [];

// Available tools list
const availableTools = [
  { value: "web-search", label: "Web Search" },
  { value: "calculator", label: "Calculator" },
  { value: "file-reader", label: "File Reader" },
  { value: "api-caller", label: "API Caller" },
  { value: "database-query", label: "Database Query" },
  { value: "image-generator", label: "Image Generator" },
  { value: "code-interpreter", label: "Code Interpreter" },
];

// Sidebar node categories
const nodeCategories = [
  {
    title: 'Core',
    nodes: [
      { type: 'agentNode', label: 'Agent', icon: Bot },
      { type: 'endNode', label: 'End', icon: MessageSquareText},
    ]
  },
  // {
  //   title: 'Logic',
  //   nodes: [
  //     { type: 'default', label: 'If / else', icon: Workflow, bgColor: 'bg-orange-100', textColor: 'text-orange-600' },
  //     { type: 'default', label: 'While', icon: Clock, bgColor: 'bg-orange-100', textColor: 'text-orange-600' },
  //     { type: 'default', label: 'User approval', icon: MessageSquare, bgColor: 'bg-orange-100', textColor: 'text-orange-600' },
  //   ]
  // },
];

function WorkflowEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 100, y: 100 });
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [toolsComboOpen, setToolsComboOpen] = useState(false);
  const [toolSearchQuery, setToolSearchQuery] = useState('');
  const connectingNodeId = useRef<string | null>(null);
  const { screenToFlowPosition } = useReactFlow();
  const router = useRouter();

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onConnectStart = useCallback((_: any, { nodeId }: { nodeId: string | null }) => {
    connectingNodeId.current = nodeId;
  }, []);

  const onConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent) => {
      const target = event.target as HTMLElement;

      // Check if the connection ended on the canvas (not on a node)
      if (target.classList.contains('react-flow__pane')) {
        const clientX = 'clientX' in event ? event.clientX : event.touches[0].clientX;
        const clientY = 'clientY' in event ? event.clientY : event.touches[0].clientY;

        // Store screen coordinates for menu positioning
        setMenuPosition({ x: clientX, y: clientY });
        setMenuOpen(true);
      }
    },
    []
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
      // Reset tools when switching nodes
      setSelectedTools([]);
    },
    []
  );

  const handleToggleTool = (toolValue: string) => {
    if (selectedTools.includes(toolValue)) {
      setSelectedTools(selectedTools.filter(t => t !== toolValue));
    } else {
      setSelectedTools([...selectedTools, toolValue]);
    }
  };

  const handleAddNode = useCallback(
    (nodeType: string, label: string, position?: { x: number; y: number }) => {
      const id = `${label.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
      const nodePosition = position || screenToFlowPosition({
        x: menuPosition.x,
        y: menuPosition.y,
      });

      const newNode: Node = {
        id,
        type: nodeType,
        position: nodePosition,
        data: { label, type: label },
      };

      setNodes((nds) => nds.concat(newNode));

      // If there was a connecting node, create an edge
      if (connectingNodeId.current) {
        const newEdge: Edge = {
          id: `${connectingNodeId.current}-${id}`,
          source: connectingNodeId.current,
          target: id,
          type: 'bezier',
        };
        setEdges((eds) => eds.concat(newEdge));
      }

      setMenuOpen(false);
      connectingNodeId.current = null;
    },
    [menuPosition, screenToFlowPosition, setNodes, setEdges]
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

  return (
    <div className="flex h-screen w-full flex-col">
      {/* Header with Back Button */}
      <div className="h-14 border-b bg-background px-4 flex items-center gap-3 flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/workflow")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="h-6 w-px bg-border" />
        <span className="text-sm font-medium">Create Workflow</span>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {/* <div className="w-48 bg-gray-50 border-r border-gray-200 overflow-y-auto flex-shrink-0">
          {nodeCategories.map((category, idx) => (
            <div key={idx} className="mb-4">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                {category.title}
              </div>
              <div className="space-y-1 px-2">
                {category.nodes.map((node, nodeIdx) => {
                  const Icon = node.icon;
                  return (
                    <div
                      key={nodeIdx}
                      draggable
                      onDragStart={(e) => onDragStart(e, node.type, node.label)}
                      className="flex items-center gap-2 px-2 py-2 text-sm cursor-move hover:bg-gray-100 rounded transition-colors"
                    >
                      <div className={`w-6 h-6 ${node.bgColor} rounded flex items-center justify-center flex-shrink-0`}>
                        <Icon size={14} className={node.textColor} />
                      </div>
                      <span className="text-sm">{node.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div> */}

        {/* Canvas */}
        <div className="flex-1 relative">
          {/* Floating Add Node Button */}
          <div className="absolute top-15 left-15 z-10 pl-5 mt-5">
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  className="h-11 w-11 rounded-full bg-primary hover:bg-primary/90 shadow-lg"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="bottom"
                align="start"
                className="w-52 ml-2"
              >
                <DropdownMenuLabel className="text-sm text-muted-foreground font-normal px-3 py-2">
                  ADD NODE
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  {nodeCategories.map((category, idx) => (
                    <div key={idx}>
                      {category.nodes.map((node, nodeIdx) => {
                        const Icon = node.icon;
                        return (
                          <DropdownMenuItem
                            key={nodeIdx}
                            onSelect={() => handleAddNode(node.type, node.label)}
                            className="cursor-pointer mb-2 px-3 py-2.5 hover:bg-gray-100"
                          >
                            <div className="flex items-center gap-3 p-1">
                              <Icon size={22} className="text-muted-foreground" />
                              <span className="text-md font-normal">{node.label}</span>
                            </div>
                          </DropdownMenuItem>
                        );
                      })}
                      {idx < nodeCategories.length - 1 && <DropdownMenuSeparator />}
                    </div>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
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
      </div>

      {/* Right Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="right" className="!w-[800px] ">
          <SheetHeader>
            <SheetTitle>
              {selectedNode?.data?.label || selectedNode?.data?.type || 'Node Settings'}
            </SheetTitle>
            <SheetDescription>
              Configure the properties for this node
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            {selectedNode?.type === 'startNode' ? (
              <div>
                <label className="text-sm font-medium mb-2 block">Instructions</label>
                <Textarea
                  placeholder="Enter instructions for the workflow start..."
                  className="min-h-[200px] resize-none"
                />
              </div>
            ) : selectedNode?.type === 'agentNode' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="agent-select">Agent</Label>
                  <Select>
                    <SelectTrigger id="agent-select">
                      <SelectValue placeholder="Select an agent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agent1">Agent 1</SelectItem>
                      <SelectItem value="agent2">Agent 2</SelectItem>
                      <SelectItem value="agent3">Agent 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Tools</Label>
                  <div className="border rounded-lg p-3 space-y-2">

                    <div className="max-h-[200px] overflow-y-auto space-y-1">
                      {selectedTools.map((toolValue) => {
                        const tool = availableTools.find(t => t.value === toolValue);
                        return (
                          <div
                            key={toolValue}
                            className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer"
                            onClick={() => handleToggleTool(toolValue)}
                          >
                            <Checkbox
                              checked={true}
                              onCheckedChange={() => handleToggleTool(toolValue)}
                            />
                            <span className="text-sm">{tool?.label}</span>
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
                          {availableTools
                            .filter(tool =>
                              tool.label.toLowerCase().includes(toolSearchQuery.toLowerCase())
                            )
                            .map((tool) => (
                              <div
                                key={tool.value}
                                className="flex items-center gap-2 px-2 py-2 hover:bg-gray-50 rounded cursor-pointer"
                                onClick={() => handleToggleTool(tool.value)}
                              >
                                <Checkbox
                                  checked={selectedTools.includes(tool.value)}
                                />
                                <span className="text-sm">{tool.label}</span>
                              </div>
                            ))}
                          {availableTools.filter(tool =>
                            tool.label.toLowerCase().includes(toolSearchQuery.toLowerCase())
                          ).length === 0 && (
                            <div className="text-sm text-muted-foreground text-center py-6">
                              No tool found.
                            </div>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </>
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
        </SheetContent>
      </Sheet>
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