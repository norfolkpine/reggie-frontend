"use client"

import { useState } from "react"
import { LayoutGrid, ListIcon } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ViewToggleProps {
  onViewChange: (view: "grid" | "list") => void
  defaultView?: "grid" | "list"
}

export function ViewToggle({ onViewChange, defaultView = "grid" }: ViewToggleProps) {
  const [activeView, setActiveView] = useState<"grid" | "list">(defaultView)

  const handleViewChange = (view: "grid" | "list") => {
    setActiveView(view)
    onViewChange(view)
  }

  return (
    <Tabs defaultValue={activeView} onValueChange={(value) => handleViewChange(value as "grid" | "list")}>
      <TabsList className="h-9">
        <TabsTrigger value="grid" className="px-3">
          <LayoutGrid className="h-4 w-4" />
        </TabsTrigger>
        <TabsTrigger value="list" className="px-3">
          <ListIcon className="h-4 w-4" />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
