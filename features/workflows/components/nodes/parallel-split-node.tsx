"use client"

import React from 'react';
import { Button } from "@/components/ui/button";
import { Handle, Position, useReactFlow, ResizeControl, type NodeProps } from '@xyflow/react';
import { Split, Trash2 } from "lucide-react";

export function ParallelSplitNode({ data, id, width, height }: NodeProps) {
  const { setNodes } = useReactFlow();

  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
  };

  return (
    <div 
      className="rounded-lg bg-blue-50 border-2 border-blue-300 shadow-sm relative group"
      style={{ width: width || 200, height: height || 100, minWidth: 150, minHeight: 80 }}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-blue-400 !w-3 !h-3 !border-2 !border-white"
        isConnectable={1}
      />
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="bg-blue-100 rounded flex items-center justify-center gap-1 px-2 py-1">
            <Split size={14} className="text-blue-700" />
            <span className='text-xs font-semibold text-blue-700'>Split</span>
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
        className="!bg-blue-400 !w-3 !h-3 !border-2 !border-white"
        isConnectable={1}
      />
      <ResizeControl style={{ background: 'transparent', border: 'none' }} minWidth={150} minHeight={80} />
    </div>
  );
}

