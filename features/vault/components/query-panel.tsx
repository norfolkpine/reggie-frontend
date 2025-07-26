import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import RecentQueriesTable from "./recent-queries-table";

export default function MergerAgreementsPanel() {
  return (
    <div>
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-row gap-6">
            <div className="flex flex-row gap-4">
              <Card className="flex-1 cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex flex-col gap-2">
                  <span className="font-medium">Start a query from scratch</span>
                  <span className="text-xs text-muted-foreground">Choose either a review table or thread</span>
                </CardContent>
              </Card>
              <Card className="flex-1 cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex flex-col gap-2">
                  <span className="font-medium">Extract Terms from Merger Agreements</span>
                  <span className="text-xs text-muted-foreground">Upload merger agreements, and Harvey will generate a table containing key terms from each...</span>
                  <div className="mt-2"><span className="rounded bg-yellow-100 text-yellow-800 px-2 py-1 text-xs">Merger agreement</span></div>
                </CardContent>
              </Card>
              <Card className="flex-1 cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex flex-col gap-2">
                  <span className="font-medium">Analyze Change of Control Provisions</span>
                  <span className="text-xs text-muted-foreground">Generate a table showing the effect of a change of control provisions on each agreement.</span>
                  <div className="mt-2"><span className="rounded bg-yellow-100 text-yellow-800 px-2 py-1 text-xs">Merger agreement</span></div>
                </CardContent>
              </Card>
              <Card className="flex-1 cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex flex-col gap-2">
                  <span className="font-medium">View all workflows</span>
                  <span className="text-xs text-muted-foreground">See all available workflows for merger agreements.</span>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
         
