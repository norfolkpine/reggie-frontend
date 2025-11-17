"use client"

import React from 'react';
import { Button } from "@/components/ui/button";
import { Handle, Position, useReactFlow, type NodeProps } from '@xyflow/react';
import { Variable, Trash2 } from "lucide-react";

export function SetVariableNode({ data, id }: NodeProps) {
  const { setNodes } = useReactFlow();

  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
  };

  return (
    <div className="rounded-lg bg-purple-50 border-2 border-purple-300 shadow-sm w-[200px] relative group">
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-purple-400 !w-3 !h-3 !border-2 !border-white"
        isConnectable={1}
      />
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="bg-purple-100 rounded flex items-center justify-center gap-1 px-2 py-1">
            <Variable size={14} className="text-purple-700" />
            <span className='text-xs font-semibold text-purple-700'>Set</span>
          </div>
          <Button
            onClick={onDelete}
            className="h-5 w-5 bg-red-500 hover:bg-red-600 text-red-500/0 hover:text-red-50/100 p-0 rounded-full flex items-center justify-center"
          >
            <Trash2 size={12}/>
          </Button>
        </div>
        {data.config?.variable && (
          <div className="text-xs text-purple-800 font-medium truncate">
            {data.config.variable}
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-purple-400 !w-3 !h-3 !border-2 !border-white"
        isConnectable={1}
      />
    </div>
  );
}

