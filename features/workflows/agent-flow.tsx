"use client"

import React, { useCallback, useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useHeader } from "@/contexts/header-context";
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
import { Home, Bot, Database, MessageSquare, Clock, Workflow, X } from "lucide-react"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from "@/components/ui/context-menu"

function StartNode({ data }: NodeProps) {
  return (
    <div className="py-1 px-2 rounded-lg bg-white border-2 border-gray-200 shadow-sm min-w-[100px] flex items-center justify-center gap-2 relative">
      <div className="w-5 h-5 bg-gray-100 rounded flex items-center justify-center">
        <Home size={12} />
      </div>
      <span className='text-xs font-semibold'>{data.label}</span>
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-gray-400 !w-3 !h-3 !border-2 !border-white"
      />
    </div>
  );
}

function AgentNode({ data }: NodeProps) {
  return (
    <div className="rounded-lg bg-white border-2 shadow-sm w-[200px] relative">
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-gray-400 !w-3 !h-3 !border-2 !border-white"
      />
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gray-100 rounded flex items-center justify-center">
            <Bot size={14} />
          </div>
          <span className='text-xs font-semibold'>{data.type || 'Agent'}</span>
        </div>
        <div className="space-y-1.5">
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

// Sidebar node categories
const nodeCategories = [
  {
    title: 'Core',
    nodes: [
      { type: 'agentNode', label: 'Agent', icon: Bot },
      { type: 'default', label: 'End', icon: Home},
      { type: 'default', label: 'Note', icon: MessageSquare},
    ]
  },
  // {
  //   title: 'Tools',
  //   nodes: [
  //     { type: 'default', label: 'File search', icon: Database, bgColor: 'bg-yellow-100', textColor: 'text-yellow-600' },
  //     { type: 'default', label: 'Guardrails', icon: Clock, bgColor: 'bg-yellow-100', textColor: 'text-yellow-600' },
  //     { type: 'default', label: 'MCP', icon: Workflow, bgColor: 'bg-yellow-100', textColor: 'text-yellow-600' },
  //   ]
  // },
  // {
  //   title: 'Logic',
  //   nodes: [
  //     { type: 'default', label: 'If / else', icon: Workflow, bgColor: 'bg-orange-100', textColor: 'text-orange-600' },
  //     { type: 'default', label: 'While', icon: Clock, bgColor: 'bg-orange-100', textColor: 'text-orange-600' },
  //     { type: 'default', label: 'User approval', icon: MessageSquare, bgColor: 'bg-orange-100', textColor: 'text-orange-600' },
  //   ]
  // },
  // {
  //   title: 'Data',
  //   nodes: [
  //     { type: 'default', label: 'Transform', icon: Workflow, bgColor: 'bg-purple-100', textColor: 'text-purple-600' },
  //     { type: 'default', label: 'Set state', icon: Database, bgColor: 'bg-purple-100', textColor: 'text-purple-600' },
  //   ]
  // }
];

function WorkflowEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const connectingNodeId = useRef<string | null>(null);
  const { screenToFlowPosition } = useReactFlow();
  const { setHeaderCustomContent } = useHeader();
  const router = useRouter();

  useEffect(() => {
    setHeaderCustomContent(
      <div className="flex items-center gap-2 text-sm sm:text-base lg:text-lg font-medium">
        <span
          className="hover:text-foreground cursor-pointer text-muted-foreground dark:hover:text-foreground dark:text-muted-foreground"
          onClick={() => router.push("/workflow")}
        >
          Workflows
        </span>
        <span className="text-muted-foreground dark:text-muted-foreground/60">/</span>
        <span className="text-foreground font-medium">Create Workflow</span>
      </div>
    );

    return () => {
      setHeaderCustomContent(null);
    };
  }, [setHeaderCustomContent, router]);

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
    <div className="flex h-[calc(100vh-4rem)] w-full">
      {/* Sidebar */}
      <div className="w-48 bg-gray-50 border-r border-gray-200 overflow-y-auto flex-shrink-0">
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
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
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
  );
}

export default function ExploreWorkflows() {
  return (
    <ReactFlowProvider>
      <WorkflowEditor />
    </ReactFlowProvider>
  );
}