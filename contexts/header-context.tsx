"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface HeaderAction {
  label: string;
  onClick: () => void;
  variant?: "default" | "outline" | "secondary" | "destructive" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  icon?: ReactNode;
}

interface HeaderContextType {
  customHeader: ReactNode | null;
  setCustomHeader: (header: ReactNode | null) => void;
  headerActions: HeaderAction[];
  setHeaderActions: (actions: HeaderAction[]) => void;
  headerCustomContent: ReactNode | null;
  setHeaderCustomContent: (content: ReactNode | null) => void;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [customHeader, setCustomHeader] = useState<ReactNode | null>(null);
  const [headerActions, setHeaderActions] = useState<HeaderAction[]>([]);
  const [headerCustomContent, setHeaderCustomContent] = useState<ReactNode | null>(null);

  return (
    <HeaderContext.Provider value={{ 
      customHeader, 
      setCustomHeader, 
      headerActions, 
      setHeaderActions, 
      headerCustomContent, 
      setHeaderCustomContent 
    }}>
      {children}
    </HeaderContext.Provider>
  );
}

export function useHeader() {
  const context = useContext(HeaderContext);
  if (context === undefined) {
    throw new Error('useHeader must be used within a HeaderProvider');
  }
  return context;
}
