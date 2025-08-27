"use client"

import { Clock } from "lucide-react"

export default function ExploreWorkflows() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full p-8">
      <div className="text-center space-y-8">
        <div className="flex justify-center">
          <div className="p-6 rounded-full bg-muted/50">
            <Clock className="h-16 w-16 text-muted-foreground" />
          </div>
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold tracking-tight">Coming Soon</h1>
          <p className="text-lg text-muted-foreground max-w-sm leading-relaxed">
            We're working hard to bring you amazing workflow features. Stay tuned for updates!
          </p>
        </div>
      </div>
    </div>
  )
}

