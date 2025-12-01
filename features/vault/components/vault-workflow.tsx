"use client";

import { TabsContent } from "@/components/ui/tabs";
import { Workflow } from "lucide-react";

export function WorkflowTabContent() {
  return (
    <TabsContent value="workflow" className="mt-4">
      <div className="bg-card text-foreground rounded-md border border-border shadow-sm p-6">
        <div className="flex items-center space-x-2">
          <Workflow className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-medium">Workflow</h3>
        </div>
        <p className="text-muted-foreground mt-4">Workflow feed will be displayed here.</p>
      </div>
    </TabsContent>
  );
}


