"use client";

import { TabsContent } from "@/components/ui/tabs";
import { Settings } from "lucide-react";

interface SettingsTabContentProps {
  description?: string | null;
  projectId: string;
}

export function SettingsTabContent({ description, projectId }: SettingsTabContentProps) {
  return (
    <TabsContent value="settings" className="mt-4">
      <div className="bg-card text-foreground rounded-md border border-border shadow-sm p-6">
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-medium">Settings</h3>
        </div>

        {description && (
          <div className="mt-4">
            <h4 className="text-sm font-medium">Description</h4>
            <p className="text-muted-foreground mt-1">{description}</p>
          </div>
        )}

        <div className="mt-4">
          <h4 className="text-sm font-medium">Project ID</h4>
          <p className="text-muted-foreground mt-1 font-mono">{projectId}</p>
        </div>
      </div>
    </TabsContent>
  );
}


