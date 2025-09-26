"use client";

import { Paperclip } from "lucide-react";

interface DragOverlayProps {
  visible: boolean;
}

export function DragOverlay({ visible }: DragOverlayProps) {
  if (!visible) return null;
  return (
    <div className="absolute inset-0 bg-blue-500/10 border-2 border-dashed border-blue-400 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 shadow-lg border border-blue-200">
        <div className="text-center">
          <Paperclip className="w-8 h-8 mx-auto mb-2 text-blue-500" />
          <p className="text-lg font-medium text-gray-900">Drop files here</p>
          <p className="text-sm text-gray-500">Release to upload</p>
        </div>
      </div>
    </div>
  );
}


