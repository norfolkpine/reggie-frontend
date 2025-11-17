"use client"

import React from 'react';
import { Button } from "@/components/ui/button";
import { Handle, Position, useReactFlow, type NodeProps } from '@xyflow/react';
import { MessageSquareText, Trash2 } from "lucide-react";

export function EndNode({ data, id }: NodeProps) {
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
        isConnectable={1}
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

