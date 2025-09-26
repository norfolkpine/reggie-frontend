"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { PanelConfig, PanelState, GlobalPanelContextType } from "./types";

const PANEL_STORAGE_KEY = "global-panel-state";

const GlobalPanelContext = createContext<GlobalPanelContextType | null>(null);

export const GlobalPanelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePanels, setActivePanels] = useState<Map<string, PanelState>>(new Map());
  const [isInitialized, setIsInitialized] = useState(false);
  const [closingPanels, setClosingPanels] = useState<Set<string>>(new Set());

  // Save panel state to localStorage
  const savePanelState = useCallback(() => {
    if (!isInitialized) return;

    try {
      const persistentPanels: Record<string, { isOpen: boolean; width: number; config: PanelConfig }> = {};

      activePanels.forEach((panelState, panelId) => {
        if (panelState.config?.persistent) {
          persistentPanels[panelId] = {
            isOpen: panelState.isOpen,
            width: panelState.width,
            config: panelState.config
          };
        }
      });

      localStorage.setItem(PANEL_STORAGE_KEY, JSON.stringify(persistentPanels));
    } catch (error) {
      console.warn("Failed to save panel state:", error);
    }
  }, [activePanels, isInitialized]);

  // Load persisted panel state from localStorage
  const loadPanelState = useCallback(() => {
    try {
      const stored = localStorage.getItem(PANEL_STORAGE_KEY);
      if (stored) {
        const persistentPanels = JSON.parse(stored) as Record<string, { isOpen: boolean; width: number; config: PanelConfig }>;

        const restoredPanels = new Map<string, PanelState>();
        Object.entries(persistentPanels).forEach(([panelId, panelData]) => {
          restoredPanels.set(panelId, {
            isOpen: panelData.isOpen,
            width: panelData.width,
            config: panelData.config
          });
        });

        setActivePanels(restoredPanels);
      }
    } catch (error) {
      console.warn("Failed to load panel state:", error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Load persisted state on mount
  useEffect(() => {
    loadPanelState();
  }, [loadPanelState]);

  // Save state when panels change
  useEffect(() => {
    savePanelState();
  }, [savePanelState]);

  const registerPanel = useCallback((config: PanelConfig) => {
    setActivePanels(prev => {
      const newMap = new Map(prev);
      // Check if panel already exists and is persistent
      const existingPanel = newMap.get(config.id);

      newMap.set(config.id, {
        isOpen: existingPanel?.isOpen ?? false,
        width: existingPanel?.width ?? config.size.default,
        config
      });
      return newMap;
    });
  }, []);

  const unregisterPanel = useCallback((panelId: string) => {
    setActivePanels(prev => {
      const newMap = new Map(prev);
      const panel = newMap.get(panelId);

      // If panel is persistent, remove from localStorage
      if (panel?.config?.persistent) {
        try {
          const stored = localStorage.getItem(PANEL_STORAGE_KEY);
          if (stored) {
            const persistentPanels = JSON.parse(stored);
            delete persistentPanels[panelId];
            localStorage.setItem(PANEL_STORAGE_KEY, JSON.stringify(persistentPanels));
          }
        } catch (error) {
          console.warn("Failed to remove persistent panel:", error);
        }
      }

      newMap.delete(panelId);
      return newMap;
    });
  }, []);

  const togglePanel = useCallback((panelId: string) => {
    const panel = activePanels.get(panelId);
    if (!panel) return;

    if (panel.isOpen) {
      // Closing animation: mark as closing, set isOpen to false
      setClosingPanels(prev => new Set(prev).add(panelId));

      // Start close animation
      setActivePanels(prev => {
        const newMap = new Map(prev);
        const panelState = newMap.get(panelId);
        if (panelState) {
          newMap.set(panelId, { ...panelState, isOpen: false });
        }
        return newMap;
      });

      // Remove from closing state after animation completes (300ms)
      setTimeout(() => {
        setClosingPanels(prev => {
          const newSet = new Set(prev);
          newSet.delete(panelId);
          return newSet;
        });
      }, 300);
    } else {
      // Opening: just set as open
      setActivePanels(prev => {
        const newMap = new Map(prev);
        const panelState = newMap.get(panelId);
        if (panelState) {
          newMap.set(panelId, { ...panelState, isOpen: true });
        }
        return newMap;
      });
    }
  }, [activePanels]);

  const setPanelWidth = useCallback((panelId: string, width: number) => {
    setActivePanels(prev => {
      const newMap = new Map(prev);
      const panel = newMap.get(panelId);
      if (panel) {
        newMap.set(panelId, { ...panel, width });
      }
      return newMap;
    });
  }, []);

  const getActivePanel = useCallback((): PanelConfig | null => {
    // Return the highest priority open panel, or the first open panel if no priorities set
    const openPanels = Array.from(activePanels.values())
      .filter(panel => panel.isOpen && panel.config)
      .sort((a, b) => (b.config!.priority || 0) - (a.config!.priority || 0));

    return openPanels[0]?.config || null;
  }, [activePanels]);

  const getActiveOrClosingPanels = useCallback(() => {
    // Return both active open panels and panels that are closing
    const result: Array<{ config: PanelConfig; isClosing: boolean }> = [];

    // Add open panels
    Array.from(activePanels.values())
      .filter(panel => panel.isOpen && panel.config)
      .forEach(panel => {
        result.push({ config: panel.config!, isClosing: false });
      });

    // Add closing panels (these have isOpen: false but are in closing state)
    closingPanels.forEach(panelId => {
      const panel = activePanels.get(panelId);
      if (panel?.config && !panel.isOpen) {
        result.push({ config: panel.config, isClosing: true });
      }
    });

    // Sort by priority
    return result.sort((a, b) => (b.config.priority || 0) - (a.config.priority || 0));
  }, [activePanels, closingPanels]);

  const isPanelOpen = useCallback((panelId: string): boolean => {
    return activePanels.get(panelId)?.isOpen || false;
  }, [activePanels]);

  const isPanelClosing = useCallback((panelId: string): boolean => {
    return closingPanels.has(panelId);
  }, [closingPanels]);

  const clearAllPersistentPanels = useCallback(() => {
    try {
      // Remove all persistent panels from memory
      setActivePanels(prev => {
        const newMap = new Map(prev);
        Array.from(newMap.entries()).forEach(([panelId, panelState]) => {
          if (panelState.config?.persistent) {
            newMap.delete(panelId);
          }
        });
        return newMap;
      });

      // Clear persistent panels from localStorage
      localStorage.removeItem(PANEL_STORAGE_KEY);
    } catch (error) {
      console.warn("Failed to clear persistent panels:", error);
    }
  }, []);

  const value: GlobalPanelContextType = {
    registerPanel,
    unregisterPanel,
    togglePanel,
    setPanelWidth,
    getActivePanel,
    getActiveOrClosingPanels,
    isPanelOpen,
    isPanelClosing,
    clearAllPersistentPanels,
    activePanels,
    closingPanels
  };

  return (
    <GlobalPanelContext.Provider value={value}>
      {children}
    </GlobalPanelContext.Provider>
  );
};

export const useGlobalPanel = (): GlobalPanelContextType => {
  const context = useContext(GlobalPanelContext);
  if (!context) {
    throw new Error("useGlobalPanel must be used within a GlobalPanelProvider");
  }
  return context;
};
