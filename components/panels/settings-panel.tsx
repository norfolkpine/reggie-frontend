"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, X } from "lucide-react";
import { useGlobalPanel } from "@/contexts/global-panel-context";

interface SettingsPanelProps {
  title?: string;
  onClose?: () => void;
  panelId?: string;
}

export function SettingsPanel({
  title = "Settings",
  onClose,
  panelId = "settings-panel"
}: SettingsPanelProps) {
  const { togglePanel } = useGlobalPanel();

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      togglePanel(panelId);
    }
  };

  return (
    <div className="flex h-full bg-card rounded-xl border border-border shadow-sm">
      {/* Panel Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 border-b border-border rounded-t-xl bg-card">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            <span className="text-xl text-card-foreground">{title}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            title="Close Settings"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Settings Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">General Settings</h3>

            <div className="space-y-2">
              <Label htmlFor="display-name">Display Name</Label>
              <Input
                id="display-name"
                placeholder="Enter your display name"
                defaultValue="User"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">Enable Notifications</Label>
              <Switch id="notifications" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode">Dark Mode</Label>
              <Switch id="dark-mode" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Privacy Settings</h3>

            <div className="flex items-center justify-between">
              <Label htmlFor="analytics">Share Analytics</Label>
              <Switch id="analytics" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="public-profile">Public Profile</Label>
              <Switch id="public-profile" />
            </div>
          </div>

          <div className="pt-4">
            <Button className="w-full">Save Settings</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
