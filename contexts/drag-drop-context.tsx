"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { DragDropFilesOptions } from "@/hooks/use-drag-drop-files";

interface DragDropContextType {
  dragDropOptions: DragDropFilesOptions | null;
  setDragDropOptions: (options: DragDropFilesOptions | null) => void;
  clearDragDropOptions: () => void;
}

const DragDropContext = createContext<DragDropContextType | undefined>(undefined);

export function DragDropProvider({ children }: { children: ReactNode }) {
  const [dragDropOptions, setDragDropOptionsState] = useState<DragDropFilesOptions | null>(null);

  const setDragDropOptions = useCallback((options: DragDropFilesOptions | null) => {
    setDragDropOptionsState(options);
  }, []);

  const clearDragDropOptions = useCallback(() => {
    setDragDropOptionsState(null);
  }, []);

  return (
    <DragDropContext.Provider
      value={{
        dragDropOptions,
        setDragDropOptions,
        clearDragDropOptions,
      }}
    >
      {children}
    </DragDropContext.Provider>
  );
}

export function useDragDropContext() {
  const context = useContext(DragDropContext);
  if (context === undefined) {
    throw new Error("useDragDropContext must be used within a DragDropProvider");
  }
  return context;
}
