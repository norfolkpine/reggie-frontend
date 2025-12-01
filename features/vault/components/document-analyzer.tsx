"use client";

import { TabsContent } from "@/components/ui/tabs";
import { BookOpenText } from "lucide-react";

export function AnalyzerTabContent() {
  return (
    <TabsContent value="analyzer" className="mt-4">
      <div className="bg-card text-foreground rounded-md border border-border shadow-sm p-6">
        <div className="flex items-center space-x-2">
          <BookOpenText className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-medium">Analyzer</h3>
        </div>
        <p className="text-muted-foreground mt-4">Analyzer feed will be displayed here.</p>
      </div>
    </TabsContent>
  );
}


