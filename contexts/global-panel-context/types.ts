import type React from "react";

export type PanelType = "ai" | "settings" | "custom";

export interface PanelSize {
  default: number;
  min: number;
  max: number;
}

export interface PanelConfig {
  id: string;
  type: PanelType;
  component: React.ComponentType<any>;
  props?: Record<string, any>;
  size: PanelSize;
  position: "right" | "left" | "bottom";
  resizable: boolean;
  persistent: boolean;
  priority?: number; // for panel stacking (higher = more important)
}

export interface PanelState {
  isOpen: boolean;
  width: number;
  config: PanelConfig | null;
}

export interface GlobalPanelContextType {
  registerPanel: (config: PanelConfig) => void;
  unregisterPanel: (panelId: string) => void;
  togglePanel: (panelId: string) => void;
  setPanelWidth: (panelId: string, width: number) => void;
  getActivePanel: () => PanelConfig | null;
  getActiveOrClosingPanels: () => Array<{ config: PanelConfig; isClosing: boolean }>;
  isPanelOpen: (panelId: string) => boolean;
  isPanelClosing: (panelId: string) => boolean;
  clearAllPersistentPanels: () => void;
  activePanels: Map<string, PanelState>;
  closingPanels: Set<string>;
}
