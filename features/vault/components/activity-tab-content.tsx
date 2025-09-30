"use client";

import { TabsContent } from "@/components/ui/tabs";
import { Activity } from "lucide-react";

export function ActivityTabContent() {
  return (
    <TabsContent value="activity" className="mt-4">
      <div className="bg-card text-foreground rounded-md border border-border shadow-sm p-6">
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-medium">Activity</h3>
        </div>
        <p className="text-muted-foreground mt-4">Activity feed will be displayed here.</p>
      </div>
    </TabsContent>
  );
}


