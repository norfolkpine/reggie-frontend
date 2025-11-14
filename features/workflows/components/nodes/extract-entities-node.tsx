"use client"

import React from 'react';
import { Button } from "@/components/ui/button";
import { Handle, Position, useReactFlow, type NodeProps } from '@xyflow/react';
import { Search, Trash2 } from "lucide-react";

export function ExtractEntitiesNode({ data, id }: NodeProps) {
  const { setNodes } = useReactFlow();

  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
  };

  return (
    <div className="rounded-lg bg-indigo-50 border-2 border-indigo-300 shadow-sm w-[200px] relative group">
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-indigo-400 !w-3 !h-3 !border-2 !border-white"
        isConnectable={1}
      />
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="bg-indigo-100 rounded flex items-center justify-center gap-1 px-2 py-1">
            <Search size={14} className="text-indigo-700" />
            <span className='text-xs font-semibold text-indigo-700'>Extract</span>
          </div>
          <Button
            onClick={onDelete}
            className="h-5 w-5 bg-red-500 hover:bg-red-600 text-red-500/0 hover:text-red-50/100 p-0 rounded-full flex items-center justify-center"
          >
            <Trash2 size={12}/>
          </Button>
        </div>
        {data.config?.entities && (
          <div className="text-xs text-indigo-800 font-medium">
            {data.config.entities.length} types
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-indigo-400 !w-3 !h-3 !border-2 !border-white"
        isConnectable={1}
      />
    </div>
  );
}

