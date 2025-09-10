"use client";
import type React from "react";
import Sidebar from "@/components/sidebar";
import { PageHeader } from "@/components/ui/page-header";
import { HeaderProvider, useHeader } from "@/contexts/header-context";
import { useAiPanel } from "@/contexts/ai-panel-context";
import { AiLayoutPanel } from "@/components/ai/ai-layout-panel";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { customHeader, headerActions, headerCustomContent } = useHeader();
  const { isOpen: isAiPanelOpen, panelWidth } = useAiPanel();
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Detect scroll position to change header styling
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const scrollTop = scrollContainer.scrollTop;
      setIsScrolled(scrollTop > 0);
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, []);
  
  // If custom header is provided, use it; otherwise use PageHeader with actions/content
  if (customHeader) {
    return (
      <div className="flex h-full gap-2">
        <div 
          className={cn(
            "bg-white border shadow-sm flex flex-col overflow-hidden transition-all duration-300",
            isAiPanelOpen ? "rounded-xl" : "rounded-xl"
          )}
          style={{
            width: isAiPanelOpen ? `calc(100% - ${panelWidth}px - 5px)` : '100%'
          }}
        >
          {customHeader}
          <div className="flex-1 overflow-auto px-1">
            {children}
          </div>
        </div>
        
        {/* AI Panel */}
        <AiLayoutPanel />
      </div>
    );
  }

  return (
    <div className="flex h-full gap-2">
      <div 
        className={cn(
          "bg-white border shadow-sm flex flex-col overflow-hidden transition-all duration-300",
          isAiPanelOpen ? "rounded-xl" : "rounded-xl"
        )}
        style={{
          width: isAiPanelOpen ? `calc(100% - ${panelWidth}px - 5px)` : '100%'
        }}
        ref={scrollContainerRef}
      >
        <div className={`transition-all duration-200 ${
          isScrolled 
            ? 'sticky top-0 z-50 rounded-none shadow-md bg-white' 
            : 'rounded-t-xl'
        }`}>
          <PageHeader 
            actions={headerActions || []}
            customContent={headerCustomContent}
          />
        </div>
        <div className="flex-1 overflow-auto px-1">
          {children}
        </div>
      </div>
      
      <AiLayoutPanel />
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="h-screen overflow-auto flex-1 pt-2 pr-2 pb-2">
        <HeaderProvider>
          <DashboardContent>{children}</DashboardContent>
        </HeaderProvider>
      </div>
    </div>
  );
}
