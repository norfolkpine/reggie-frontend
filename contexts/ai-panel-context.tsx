"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface AiPanelContextType {
  isOpen: boolean;
  panelWidth: number;
  isResizing: boolean;
  currentContext: {
    title: string;
    files?: any[];
    folderId?: number;
    projectId?: string;
  };
  openPanel: (context?: Partial<AiPanelContextType['currentContext']>) => void;
  closePanel: () => void;
  setPanelWidth: (width: number) => void;
  setIsResizing: (resizing: boolean) => void;
  setCurrentContext: (context: Partial<AiPanelContextType['currentContext']>) => void;
}

const AiPanelContext = createContext<AiPanelContextType | undefined>(undefined);

export function useAiPanel() {
  const context = useContext(AiPanelContext);
  if (!context) {
    throw new Error('useAiPanel must be used within an AiPanelProvider');
  }
  return context;
}

interface AiPanelProviderProps {
  children: ReactNode;
}

export function AiPanelProvider({ children }: AiPanelProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [panelWidth, setPanelWidth] = useState(450); // Default width
  const [isResizing, setIsResizing] = useState(false);
  const [currentContext, setCurrentContextState] = useState({
    title: 'AI Assistant',
    files: [],
    folderId: 0,
    projectId: '',
  });
  const pathname = usePathname();

  const openPanel = (context?: Partial<AiPanelContextType['currentContext']>) => {
    if (context) {
      setCurrentContextState(prev => ({ ...prev, ...context }));
    }
    setIsOpen(true);
  };

  const closePanel = () => {
    setIsOpen(false);
  };

  const setCurrentContext = (context: Partial<AiPanelContextType['currentContext']>) => {
    setCurrentContextState(prev => ({ ...prev, ...context }));
  };

  useEffect(() => {
    if (isOpen) {
      setIsOpen(false);
    }
  }, [pathname]); 

  const value: AiPanelContextType = {
    isOpen,
    panelWidth,
    isResizing,
    currentContext,
    openPanel,
    closePanel,
    setPanelWidth,
    setIsResizing,
    setCurrentContext,
  };

  return (
    <AiPanelContext.Provider value={value}>
      {children}
    </AiPanelContext.Provider>
  );
}