"use client"

import React from 'react';
import { Button } from "@/components/ui/button";
import { useReactFlow, type NodeProps } from '@xyflow/react';
import { StickyNote, Trash2 } from "lucide-react";

export function StickyNoteNode({ data, id }: NodeProps) {
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

