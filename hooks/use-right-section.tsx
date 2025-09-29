"use client"

import { ReactNode, useState, useCallback, createContext, useContext, ReactElement } from 'react';

interface RightSectionConfig {
  id: string;
  component: ReactNode;
  show: boolean;
}

interface UseRightSectionReturn {
  rightSection: RightSectionConfig | null;
  setRightSection: (config: RightSectionConfig | null) => void;
  showRightSection: (id: string, component: ReactNode) => void;
  hideRightSection: () => void;
  toggleRightSection: (id: string, component: ReactNode) => void;
}

// Create context
const RightSectionContext = createContext<UseRightSectionReturn | null>(null);

// Context provider component
export function RightSectionProvider({ children }: { children: ReactElement | ReactElement[] }) {
  const [rightSection, setRightSection] = useState<RightSectionConfig | null>(null);

  const showRightSection = useCallback((id: string, component: ReactNode) => {
    setRightSection({ id, component, show: true });
  }, []);

  const hideRightSection = useCallback(() => {
    setRightSection(null);
  }, []);

  const toggleRightSection = useCallback((id: string, component: ReactNode) => {
    setRightSection(prev => {
      if (prev?.id === id) {
        return null; // Hide if same ID
      }
      return { id, component, show: true }; // Show if different ID
    });
  }, []);

  const value: UseRightSectionReturn = {
    rightSection,
    setRightSection,
    showRightSection,
    hideRightSection,
    toggleRightSection,
  };

  return (
    <RightSectionContext.Provider value={value}>
      {children}
    </RightSectionContext.Provider>
  );
}

// Hook to use the context
export function useRightSection(): UseRightSectionReturn {
  const context = useContext(RightSectionContext);
  if (!context) {
    throw new Error('useRightSection must be used within a RightSectionProvider');
  }
  return context;
}
