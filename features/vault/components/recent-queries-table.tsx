import { Play } from "lucide-react";

const recentQueries = [
  {
    name: "Identify and Summarize Representations and Warranties",
    type: "Review table",
    time: "4 hours ago",
  },
  {
    name: "Analyze Non-Compete Clauses",
    type: "Review table",
    time: "Yesterday",
  },
  {
    name: "Compare Indemnification Clauses",
    type: "Assist",
    time: "A week ago",
  },
];

export default function RecentQueriesTable() {
  return (
    <div className="mt-8">
      <h3 className="text-sm font-semibold mb-2">Recent queries</h3>
      <div className="overflow-x-auto rounded-md border divide-y">
        <div className="grid grid-cols-12 px-4 py-2 text-xs text-muted-foreground font-medium">
          <div className="col-span-6">&nbsp;</div>
          <div className="col-span-2">&nbsp;</div>
          <div className="col-span-2">&nbsp;</div>
          <div className="col-span-2">&nbsp;</div>
        </div>
        {recentQueries.map((q, idx) => (
          <div
            key={q.name}
            className="grid grid-cols-12 items-center px-4 py-4 hover:bg-muted cursor-pointer transition group"
          >
            <div className="col-span-6 truncate text-sm font-normal">
              {q.name}
            </div>
            <div className="col-span-2 flex items-center justify-center">
              <button className="rounded bg-muted p-2 group-hover:bg-primary/10 transition">
                <Play className="h-6 w-6 text-muted-foreground" />
              </button>
            </div>
            <div className="col-span-2 text-xs text-muted-foreground text-right">
              {q.type}
            </div>
            <div className="col-span-2 text-xs text-muted-foreground text-right">
              {q.time}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
