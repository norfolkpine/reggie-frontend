"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { usePanel, createPanelConfig } from "@/hooks/use-panel";
import { SettingsPanel } from "@/components/panels/settings-panel";
import { useGlobalPanel } from "@/contexts/global-panel-context";

// Persistent panel component example
const PersistentPanel = ({ title = "Persistent Panel" }: { title?: string }) => {
  const { togglePanel } = useGlobalPanel();
  const panelId = "demo-persistent-panel";

  return (
    <div className="flex h-full bg-card rounded-xl border border-border shadow-sm">
      <div className="flex-1 flex flex-col h-full overflow-hidden p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => togglePanel(panelId)}
          >
            Close
          </Button>
        </div>
        <div className="space-y-2 text-sm">
          <p>🎯 <strong>This panel persists</strong> across page navigation!</p>
          <p>🔄 Navigate to other pages and come back - it stays open.</p>
          <p>💾 Panel state is saved to localStorage.</p>
          <p>🗑️ Only clears when explicitly closed or component unmounts.</p>
        </div>
      </div>
    </div>
  );
};

// Left slide panel component example
const LeftPanel = ({ title = "Left Slide Panel" }: { title?: string }) => {
  const { togglePanel } = useGlobalPanel();
  const panelId = "demo-left-panel";

  return (
    <div className="flex h-full bg-blue-50 rounded-xl border border-blue-200 shadow-sm">
      <div className="flex-1 flex flex-col h-full overflow-hidden p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-blue-900">{title}</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => togglePanel(panelId)}
          >
            Close
          </Button>
        </div>
        <div className="space-y-2 text-sm text-blue-800">
          <p>⬅️ <strong>Slides from the left!</strong></p>
          <p>🎨 Different styling to show left positioning</p>
          <p>⚡ Smooth slide-in animation from left side</p>
          <p>🔄 Closes with slide-out to the left</p>
        </div>
      </div>
    </div>
  );
};

export default function PanelDemoPage() {
  const [settingsData, setSettingsData] = useState({
    theme: "light",
    notifications: true,
    language: "en"
  });

  // Regular settings panel configuration - memoize to prevent re-renders
  const settingsPanelConfig = useMemo(() => createPanelConfig(
    "demo-settings-panel",
    SettingsPanel,
    {
      type: "settings",
      size: { default: 35, min: 30, max: 45 },
      position: "right",
      persistent: false,
      priority: 5,
      props: { title: "Demo Settings" }
    }
  ), []);

  const { openPanel, closePanel, isOpen } = usePanel(settingsPanelConfig);

  // Persistent panel example - memoize config to prevent re-renders
  const persistentPanelConfig = useMemo(() => createPanelConfig("demo-persistent-panel", PersistentPanel, {
    type: "custom",
    size: { default: 40, min: 30, max: 60 },
    position: "right",
    persistent: true,
    priority: 8
  }), []);

  const { openPanel: openPersistentPanel, closePanel: closePersistentPanel, isOpen: isPersistentOpen } = usePanel(
    persistentPanelConfig
  );

  // Left panel configuration
  const leftPanelConfig = useMemo(() => createPanelConfig(
    "demo-left-panel",
    LeftPanel,
    {
      type: "custom",
      size: { default: 35, min: 25, max: 50 },
      position: "left",
      persistent: false,
      priority: 5
    }
  ), []);

  // Left panel example
  const { openPanel: openLeftPanel, closePanel: closeLeftPanel, isOpen: isLeftOpen } = usePanel(leftPanelConfig);

  // Access global panel context for management
  const { clearAllPersistentPanels } = useGlobalPanel();

  return (
    <div className="p-8 space-y-6">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Global Panel System Demo</h1>
        <p className="text-muted-foreground">
          This page demonstrates how any component can register and control panels using the global panel system.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Panel Controls</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Regular Settings Panel */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Regular Settings Panel</h3>
            <div className="flex gap-2 mb-2">
              <Button
                onClick={openPanel}
                disabled={isOpen}
                variant={isOpen ? "secondary" : "default"}
                size="sm"
              >
                {isOpen ? "Open" : "Open Settings"}
              </Button>

              {isOpen && (
                <Button onClick={closePanel} variant="outline" size="sm">
                  Close
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Status: {isOpen ? "🟢 Open" : "🔴 Closed"} (closes on navigation)
            </p>
          </div>

          {/* Persistent Panel */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Persistent Panel</h3>
            <div className="flex gap-2 mb-2">
              <Button
                onClick={openPersistentPanel}
                disabled={isPersistentOpen}
                variant={isPersistentOpen ? "secondary" : "default"}
                size="sm"
              >
                {isPersistentOpen ? "Open" : "Open Persistent"}
              </Button>

              {isPersistentOpen && (
                <Button onClick={closePersistentPanel} variant="outline" size="sm">
                  Close
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Status: {isPersistentOpen ? "🟢 Open" : "🔴 Closed"} (persists across navigation!)
            </p>
          </div>

          {/* Left Slide Panel */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Left Slide Panel</h3>
            <div className="flex gap-2 mb-2">
              <Button
                onClick={openLeftPanel}
                disabled={isLeftOpen}
                variant={isLeftOpen ? "secondary" : "default"}
                size="sm"
              >
                {isLeftOpen ? "Open" : "Open Left"}
              </Button>

              {isLeftOpen && (
                <Button onClick={closeLeftPanel} variant="outline" size="sm">
                  Close
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Status: {isLeftOpen ? "🟢 Open" : "🔴 Closed"} (slides from left!)
            </p>
          </div>
        </div>

        {/* Global Management */}
        <div className="p-4 border rounded-lg bg-muted/20">
          <h3 className="font-medium mb-2">Global Panel Management</h3>
          <Button
            onClick={clearAllPersistentPanels}
            variant="destructive"
            size="sm"
          >
            Clear All Persistent Panels
          </Button>
          <p className="text-xs text-muted-foreground mt-1">
            Removes all persistent panels from memory and localStorage
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">How It Works</h2>

        <div className="space-y-2 text-sm">
          <p>1. <strong>Register Panel:</strong> Hooks automatically register panels when components mount.</p>
          <p>2. <strong>Configure Panel:</strong> Customize size, position, priority, and persistence behavior.</p>
          <p>3. <strong>Control Panel:</strong> Use returned functions to open/close panels programmatically.</p>
          <p>4. <strong>Persistence:</strong> Set <code>persistent: true</code> to survive page navigation.</p>
          <p>5. <strong>Auto Cleanup:</strong> Panels unregister automatically when components unmount.</p>
          <p>6. <strong>Priority System:</strong> Higher priority panels take precedence when multiple are open.</p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Panel Types Available</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium">AI Panel</h3>
            <p className="text-sm text-muted-foreground">Used in vault pages for AI assistance</p>
            <code className="text-xs bg-muted p-1 rounded">useAiPanel(contextData)</code>
          </div>

          <div className="p-4 border rounded-lg">
            <h3 className="font-medium">Settings Panel</h3>
            <p className="text-sm text-muted-foreground">Generic settings/configuration panels</p>
            <code className="text-xs bg-muted p-1 rounded">useSettingsPanel(Component)</code>
          </div>

          <div className="p-4 border rounded-lg">
            <h3 className="font-medium">Custom Panel</h3>
            <p className="text-sm text-muted-foreground">Fully customizable panels</p>
            <code className="text-xs bg-muted p-1 rounded">usePanel(config)</code>
          </div>

          <div className="p-4 border rounded-lg">
            <h3 className="font-medium">Generic Panel</h3>
            <p className="text-sm text-muted-foreground">Create any panel type with full configuration</p>
            <code className="text-xs bg-muted p-1 rounded">createPanelConfig()</code>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Benefits</h2>

        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong>Global Reusability:</strong> Any page/component can register panels</li>
          <li><strong>Persistence Support:</strong> Panels can survive page navigation</li>
          <li><strong>Type Safety:</strong> Full TypeScript support with proper interfaces</li>
          <li><strong>Automatic Cleanup:</strong> Panels unregister when components unmount</li>
          <li><strong>Flexible Configuration:</strong> Customize size, position, priority, behavior</li>
          <li><strong>Priority System:</strong> Handle multiple open panels gracefully</li>
          <li><strong>Performance Optimized:</strong> Panels only render when active</li>
          <li><strong>localStorage Integration:</strong> Persistent panels save state automatically</li>
        </ul>
      </div>
    </div>
  );
}
