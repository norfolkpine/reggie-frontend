"use client"

import React from 'react';
import { Button } from "@/components/ui/button";
import { Handle, Position, useReactFlow, ResizeControl, type NodeProps } from '@xyflow/react';
import { GitBranch, Trash2 } from "lucide-react";

export function IfNode({ data, id, width, height }: NodeProps) {
  const { setNodes } = useReactFlow();

  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
  };

  return (
    <div 
      className="rounded-lg bg-blue-50 border-2 border-blue-300 shadow-sm relative group"
      style={{ width: width || 200, height: height || 100, minWidth: 150, minHeight: 100 }}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-blue-400 !w-3 !h-3 !border-2 !border-white"
        isConnectable={true}
      />
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="bg-blue-100 rounded flex items-center justify-center gap-1 px-2 py-1">
            <GitBranch size={14} className="text-blue-700" />
            <span className='text-xs font-semibold text-blue-700'>If</span>
          </div>
          <Button
            onClick={onDelete}
            className="h-5 w-5 bg-red-500 hover:bg-red-600 text-red-500/0 hover:text-red-50/100 p-0 rounded-full flex items-center justify-center"
          >
            <Trash2 size={12}/>
          </Button>
        </div>
        <div className="text-xs text-blue-800 font-medium break-words min-h-[16px]">
          {(data.config as any)?.condition || (
            <span className="text-blue-400 italic">No condition set</span>
          )}
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-blue-200">
          <span className="text-[10px] font-medium text-green-700">True</span>
          <span className="text-[10px] font-medium text-red-700">False</span>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="true"
        className="!bg-green-400 !w-3 !h-3 !border-2 !border-white !top-[30%]"
        isConnectable={true}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="false"
        className="!bg-red-400 !w-3 !h-3 !border-2 !border-white !top-[70%]"
        isConnectable={true}
      />
      <ResizeControl style={{ background: 'transparent', border: 'none' }} minWidth={150} minHeight={100} />
    </div>
  );
}

