"use client"

import { useState, useRef, useCallback, useEffect, ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { GripVertical } from "lucide-react"

interface ResizableContentProps {
  showRightSection?: boolean
  rightSectionContent?: ReactNode
  leftSectionContent?: ReactNode
}

export function ResizableContent({
  showRightSection = true,
  rightSectionContent,
  leftSectionContent
}: ResizableContentProps) {
  const [leftWidth, setLeftWidth] = useState(50) // percentage
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)

  const handleMouseDown = useCallback(() => {
    setIsDragging(true)
    isDraggingRef.current = true
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current || !containerRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100

    // Constrain between 20% and 80%
    const constrainedWidth = Math.min(Math.max(newLeftWidth, 20), 80)
    setLeftWidth(constrainedWidth)
  }, [])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    isDraggingRef.current = false
  }, [])

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => handleMouseMove(e)
    const handleGlobalMouseUp = () => handleMouseUp()

    if (isDragging) {
      document.addEventListener("mousemove", handleGlobalMouseMove)
      document.addEventListener("mouseup", handleGlobalMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove)
      document.removeEventListener("mouseup", handleGlobalMouseUp)
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  // Generate dummy items for left section
  const leftItems = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    title: `Scrollable Item ${i + 1}`,
    description: `This is a description for item ${i + 1}. It contains some dummy content to demonstrate scrolling functionality.`,
    status: ["Active", "Pending", "Completed"][i % 3],
    date: new Date(2024, 0, i + 1).toLocaleDateString(),
  }))

  // Generate dummy items for right section
  const rightItems = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    title: `Fixed Item ${i + 1}`,
    value: Math.floor(Math.random() * 1000),
    type: ["Info", "Warning", "Success"][i % 3],
  }))

  if (!showRightSection) {
    return (
      <div className="h-full bg-background">
        {leftSectionContent || (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-border bg-card flex-shrink-0">
              <h1 className="text-2xl font-bold text-foreground">Scrollable Section</h1>
              <p className="text-muted-foreground">This section contains scrollable content</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {leftItems.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <Badge
                        variant={
                          item.status === "Active" ? "default" : item.status === "Pending" ? "secondary" : "outline"
                        }
                      >
                        {item.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-2">{item.description}</p>
                    <p className="text-sm text-muted-foreground">Date: {item.date}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div ref={containerRef} className="h-full bg-background relative overflow-hidden">
      {/* Left Section - Scrollable */}
      <div className="absolute top-0 left-0 h-full" style={{ width: `calc(${leftWidth}% - 2.5px)` }}>
        {leftSectionContent || (
          <></>
        )}
      </div>

      {/* Resize Handle - 5px gap */}
      <div
        className="absolute top-0 h-full w-3 bg-transparent cursor-col-resize flex items-center justify-center transition-colors z-10"
        style={{ left: `calc(${leftWidth}% - 2.5px)` }}
        onMouseDown={handleMouseDown}
      >
        <GripVertical className="w-3 h-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" style={{ strokeWidth: 0.5 }} />
      </div>

      {/* Right Section - Fixed/Pinned */}
      <div className="absolute top-0 right-0 h-full bg-muted/30" style={{ width: `calc(${100 - leftWidth}% - 2.5px)` }}>
        {rightSectionContent || (
          <></>
        )}
      </div>
    </div>
  )
}
