"use client"

import React, { useCallback, useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
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

function BeginNode({ data }: NodeProps) {
  return (
    <div className="py-2 pr-4 pl-4 rounded-sm bg-white min-w-[250px] flex items-center justify-between gap-4 relative">
      <div className="flex items-center gap-3">
        <div className="w-[25px] h-[25px] bg-black rounded flex items-center justify-center">
          <Home size={16} />
        </div>
        <span className='text-base text-sm font-semibold'>{data.label}</span>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="bg-black w-[25px] h-[25px] flex items-center justify-center"
      >
      </Handle>
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
  beginNode: BeginNode,
};

const edgeTypes = {
  deletable: DeletableEdge,
};

const initialNodes: Node[] = [
  {
    id: 'begin-node',
    type: 'beginNode',
    position: { x: 250, y: 100 },
    data: { label: 'Begin' },
  },
];
const initialEdges: Edge[] = [];

function WorkflowEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const connectingNodeId = useRef<string | null>(null);
  const { screenToFlowPosition } = useReactFlow();

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
    (event: React.MouseEvent, edge: Edge) => {
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
    (type: string) => {
      const id = `${type}-${Date.now()}`;
      const position = screenToFlowPosition({
        x: menuPosition.x,
        y: menuPosition.y,
      });

      const newNode: Node = {
        id,
        type: 'default',
        position,
        data: { label: type },
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

  return (
    <div className="h-[89vh] w-full" style={{height: '89vh', width: '100%'}}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        onEdgeClick={onEdgeClick}
        onEdgesDelete={onEdgesDelete}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{
          type: 'deletable',
        }}
        fitView
      >
        <Background bgColor='#e6e5e5ff' variant={BackgroundVariant.Dots} />
        <Controls />
      </ReactFlow>

      {menuOpen && (
        <div
          className="fixed bg-white rounded-lg shadow-lg border p-2 min-w-[200px] z-50"
          style={{
            left: `${menuPosition.x}px`,
            top: `${menuPosition.y}px`,
          }}
        >
          <div className="text-sm font-medium px-2 py-1.5 text-gray-500">Next step</div>

          <div className="space-y-1 mt-2">
            <div className="text-xs font-semibold px-2 py-1 text-gray-700">Foundation</div>
            <button
              onClick={() => handleAddNode('Agent')}
              className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded text-sm"
            >
              <Bot size={16} />
              Agent
            </button>
            <button
              onClick={() => handleAddNode('Retrieval')}
              className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded text-sm"
            >
              <Database size={16} />
              Retrieval
            </button>
          </div>

          <div className="space-y-1 mt-3">
            <div className="text-xs font-semibold px-2 py-1 text-gray-700">Dialogue</div>
            <button
              onClick={() => handleAddNode('Message')}
              className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded text-sm"
            >
              <MessageSquare size={16} />
              Message
            </button>
            <button
              onClick={() => handleAddNode('Await Response')}
              className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded text-sm"
            >
              <MessageSquare size={16} />
              Await Response
            </button>
          </div>

          <div className="space-y-1 mt-3">
            <div className="text-xs font-semibold px-2 py-1 text-gray-700">Flow</div>
            <button
              onClick={() => handleAddNode('Delay')}
              className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded text-sm"
            >
              <Clock size={16} />
              Delay
            </button>
          </div>
        </div>
      )}

      {menuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setMenuOpen(false)}
        />
      )}
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