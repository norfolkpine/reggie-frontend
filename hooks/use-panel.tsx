"use client";

import { useEffect, useState } from "react";
import { useGlobalPanel } from "@/contexts/global-panel-context";
import type { PanelConfig } from "@/contexts/global-panel-context/types";

// Lazy import components to avoid circular imports
let AiLayoutPanel: React.ComponentType<any> | null = null;

// Single reusable panel hook for all panel types
export const usePanel = (config: PanelConfig) => {
  const { registerPanel, unregisterPanel, togglePanel, isPanelOpen, setPanelWidth } = useGlobalPanel();
  const [isComponentLoaded, setIsComponentLoaded] = useState(true);

  // Handle dynamic component loading for special cases
  useEffect(() => {
    if (config.type === "ai" && !AiLayoutPanel) {
      import("@/components/vault/ai-layout-panel").then(({ AiLayoutPanel: LoadedComponent }) => {
        AiLayoutPanel = LoadedComponent;
        setIsComponentLoaded(true);
      });
    }
  }, [config.type]);

  // Register/unregister the panel
  useEffect(() => {
    // For AI panels, ensure component is loaded
    if (config.type === "ai" && !AiLayoutPanel) {
      return; // Wait for component to load
    }

    // Create final config with loaded components
    const finalConfig: PanelConfig = {
      ...config,
      component: config.type === "ai" ? (AiLayoutPanel as React.ComponentType<any>) : (config.component as React.ComponentType<any>)
    };

    registerPanel(finalConfig);

    return () => {
      unregisterPanel(config.id);
    };
  }, [registerPanel, unregisterPanel, config, isComponentLoaded]);

  return {
    openPanel: () => togglePanel(config.id),
    closePanel: () => {
      if (isPanelOpen(config.id)) togglePanel(config.id);
    },
    isOpen: isPanelOpen(config.id),
    setWidth: (width: number) => setPanelWidth(config.id, width)
  };
};

// Convenience hook for creating panel configs
export const createPanelConfig = (
  id: string,
  component: React.ComponentType<any>,
  options: {
    type?: PanelConfig["type"];
    size?: Partial<PanelConfig["size"]>;
    position?: PanelConfig["position"];
    resizable?: boolean;
    persistent?: boolean;
    priority?: number;
    props?: Record<string, any>;
  } = {}
): PanelConfig => {
  const {
    type = "custom",
    size = { default: 30, min: 20, max: 50 },
    position = "right",
    resizable = true,
    persistent = false,
    priority = 0,
    props = {}
  } = options;

  return {
    id,
    type,
    component,
    props,
    size: {
      default: size.default ?? 30,
      min: size.min ?? 20,
      max: size.max ?? 50
    },
    position,
    resizable,
    persistent,
    priority
  };
};
