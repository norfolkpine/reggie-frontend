"use client"

import { useState, useRef, useCallback, useEffect, ReactNode, memo, useMemo } from "react"
import { GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"

interface ResizableContentProps {
  showRightSection?: boolean
  rightSectionContent?: ReactNode
  leftSectionContent?: ReactNode
}

// Memoized left section to prevent re-renders
const LeftSection = memo(({ children, width }: { children: ReactNode; width: number }) => {
  return (
    <div 
      className="absolute top-0 left-0 h-full transition-all duration-200 ease-in-out" 
      style={{ width: `calc(${width}% - 2.5px)` }}
    >
      {children}
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if width changes significantly (more than 0.1%) or children change
  return Math.abs(prevProps.width - nextProps.width) < 0.1 && prevProps.children === nextProps.children;
});
LeftSection.displayName = 'LeftSection';

// Memoized right section to prevent re-renders
const RightSection = memo(({ children, width, show }: { children: ReactNode; width: number; show: boolean }) => {
  return (
    <div 
      className={cn(
        "absolute top-0 right-0 h-full bg-muted/30 transition-all duration-200 ease-in-out",
        !show && "opacity-0 pointer-events-none"
      )}
      style={{ width: `calc(${width}% - 2.5px)` }}
    >
      {children}
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if width changes significantly or show state changes
  return Math.abs(prevProps.width - nextProps.width) < 0.1 && 
         prevProps.show === nextProps.show && 
         prevProps.children === nextProps.children;
});
RightSection.displayName = 'RightSection';

export const ResizableContent = memo(function ResizableContent({
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

  // Adjust left width when right section visibility changes
  useEffect(() => {
    if (!showRightSection) {
      setLeftWidth(100);
    } else {
      setLeftWidth(50);
    }
  }, [showRightSection]);

  // Calculate right width
  const rightWidth = useMemo(() => 100 - leftWidth, [leftWidth]);

  // Single layout for all scenarios - no conditional rendering to reduce re-renders
  return (
    <div ref={containerRef} className="h-full bg-background relative overflow-hidden">
      {/* Left Section - Always rendered */}
      <LeftSection width={showRightSection ? leftWidth : 100}>
        {leftSectionContent}
      </LeftSection>

      {/* Resize Handle - Only visible when right section is shown */}
      {showRightSection && (
        <div
          className={cn(
            "absolute top-0 h-full w-3 bg-transparent cursor-col-resize flex items-center justify-center transition-all duration-200 z-10",
            isDragging ? "bg-primary/10" : "hover:bg-primary/5"
          )}
          style={{ left: `calc(${leftWidth}% - 2.5px)` }}
          onMouseDown={handleMouseDown}
        >
          <GripVertical 
            className={cn(
              "w-3 h-3 transition-colors",
              isDragging 
                ? "text-primary" 
                : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            )}
            style={{ strokeWidth: 0.5 }} 
          />
        </div>
      )}

      {/* Right Section - Always rendered but hidden with CSS */}
      <RightSection width={rightWidth} show={showRightSection}>
        {rightSectionContent}
      </RightSection>
    </div>
  )
});
