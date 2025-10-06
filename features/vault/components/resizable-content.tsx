"use client"

import { useState, useRef, useCallback, useEffect, ReactNode, memo, useMemo } from "react"
import { GripVertical, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"

/**
 * ResizableContent Component
 * 
 * A responsive layout component that provides resizable left and right sections.
 * 
 * Desktop behavior (> 1024px):
 * - Side-by-side layout with draggable resize handle
 * - Left section width adjustable between 20% and 80%
 * - Right section takes remaining width
 * 
 * Mobile behavior (<= 1024px):
 * - Two modes available:
 *   1. "drawer" mode: Right section slides in from the right edge (85% width, max 28rem)
 *   2. "overlay" mode: Right section appears centered on top of left section
 * - Both modes include:
 *   - Semi-transparent backdrop (dismissible)
 *   - Close button (X icon)
 *   - Smooth transitions
 * 
 * @example
 * ```tsx
 * <ResizableContent
 *   showRightSection={isOpen}
 *   leftSectionContent={<MainContent />}
 *   rightSectionContent={<SidePanel />}
 *   mobileMode="drawer"
 *   onMobileClose={() => setIsOpen(false)}
 * />
 * ```
 */
interface ResizableContentProps {
  showRightSection?: boolean
  rightSectionContent?: ReactNode
  leftSectionContent?: ReactNode
  mobileMode?: "drawer" | "overlay" // Mode for mobile: drawer slides in, overlay covers
  onMobileClose?: () => void // Callback when closing on mobile
}

// Memoized left section to prevent re-renders
const LeftSection = memo(({ children, width }: { children: ReactNode; width: number }) => {
  return (
    <div 
      className="absolute top-0 left-0 h-full transition-all duration-200 ease-in-out" 
      style={{ width: `calc(${width}% - 2.5px)` }}
    >
      <div className="h-full overflow-hidden">
        {children}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if width changes significantly (more than 0.1%) or children change
  return Math.abs(prevProps.width - nextProps.width) < 0.1 && prevProps.children === nextProps.children;
});
LeftSection.displayName = 'LeftSection';

// Memoized right section to prevent re-renders
const RightSection = memo(({ 
  children, 
  width, 
  show, 
  isMobile, 
  mobileMode,
  onClose 
}: { 
  children: ReactNode; 
  width: number; 
  show: boolean;
  isMobile: boolean;
  mobileMode: "drawer" | "overlay";
  onClose?: () => void;
}) => {
  // Desktop layout
  if (!isMobile) {
    return (
      <div 
        className={cn(
          "absolute top-0 right-0 h-full bg-muted/30 transition-all duration-200 ease-in-out",
          !show && "opacity-0 pointer-events-none"
        )}
        style={{ width: `calc(${width}% - 2.5px)` }}
      >
        <div className="h-full overflow-hidden">
          {children}
        </div>
      </div>
    );
  }

  // Mobile: Drawer mode - slides in from right
  if (mobileMode === "drawer") {
    return (
      <>
        {/* Backdrop */}
        {show && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 lg:hidden"
            onClick={onClose}
          />
        )}
        
        {/* Drawer */}
        <div 
          className={cn(
            "fixed top-0 right-0 h-full w-[85%] max-w-md shadow-xl z-50 transition-transform duration-300 ease-in-out lg:hidden",
            show ? "translate-x-0" : "translate-x-full"
          )}
        >

          
          <div className="h-full overflow-hidden">
            {children}
          </div>
        </div>
      </>
    );
  }

  // Mobile: Overlay mode - appears on top
  return (
    <>
      {/* Backdrop */}
      {show && (
        <div 
          className="absolute inset-0 bg-black/50 z-40 transition-opacity duration-300 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Overlay */}
      <div 
        className={cn(
          "absolute inset-4 rounded-lg shadow-2xl z-50 transition-all duration-300 ease-in-out lg:hidden",
          show ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        )}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="h-full overflow-hidden">
          {children}
        </div>
      </div>
    </>
  );
}, (prevProps, nextProps) => {
  // Only re-render if key props change
  return Math.abs(prevProps.width - nextProps.width) < 0.1 && 
         prevProps.show === nextProps.show && 
         prevProps.isMobile === nextProps.isMobile &&
         prevProps.mobileMode === nextProps.mobileMode &&
         prevProps.children === nextProps.children;
});
RightSection.displayName = 'RightSection';

export const ResizableContent = memo(function ResizableContent({
  showRightSection = true,
  rightSectionContent,
  leftSectionContent,
  mobileMode = "drawer",
  onMobileClose
}: ResizableContentProps) {
  const [leftWidth, setLeftWidth] = useState(65) // percentage
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const isMobile = useMediaQuery("(max-width: 1024px)")

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
      setLeftWidth(65);
    }
  }, [showRightSection]);

  // Calculate right width
  const rightWidth = useMemo(() => 100 - leftWidth, [leftWidth]);

  // Single layout for all scenarios - no conditional rendering to reduce re-renders
  return (
    <div ref={containerRef} className="h-full bg-background relative overflow-hidden">
      {/* Left Section - Always rendered, full width on mobile */}
      <LeftSection width={!isMobile && showRightSection ? leftWidth : 100}>
        {leftSectionContent}
      </LeftSection>

      {/* Resize Handle - Only visible on desktop when right section is shown */}
      {!isMobile && showRightSection && (
        <div
          className={cn(
            "absolute top-0 h-full w-1 bg-transparent cursor-col-resize flex items-center justify-center transition-all duration-200 z-10",
            isDragging ? "bg-primary/10" : "hover:bg-primary/5"
          )}
          style={{ left: `calc(${leftWidth}% - 0.5px)` }}
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

      {/* Right Section - Responsive: side-by-side on desktop, drawer/overlay on mobile */}
      <RightSection 
        width={rightWidth} 
        show={showRightSection}
        isMobile={isMobile}
        mobileMode={mobileMode}
        onClose={onMobileClose}
      >
        {rightSectionContent}
      </RightSection>
    </div>
  )
});
