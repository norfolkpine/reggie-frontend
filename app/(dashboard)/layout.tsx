"use client";
import type React from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import Sidebar from "@/components/sidebar";
import { PageHeader } from "@/components/ui/page-header";
import { HeaderProvider, useHeader } from "@/contexts/header-context";
import { useAiPanel } from "@/contexts/ai-panel-context";
import { AiLayoutPanel } from "@/components/vault/ai-layout-panel";
import { SidebarProvider, useSidebar } from "@/contexts/sidebar-context";
import { MobileNavProvider } from "@/contexts/mobile-nav-context";
import { MobileHeader, MobileSidebarDrawer } from "@/components/sidebar/index";
import { useResponsiveStore } from "@/stores/useResponsiveStore";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { customHeader, headerActions, headerCustomContent } = useHeader();
  const { isOpen: isAiPanelOpen, panelWidth } = useAiPanel();
  const { isMobile } = useResponsiveStore();
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
      <PanelGroup direction="horizontal" className="h-full gap-1">
        <Panel 
          defaultSize={isAiPanelOpen ? 70 : 100}
          minSize={isAiPanelOpen ? 30 : 100}
          className={cn(
            "bg-white border shadow-sm flex flex-col overflow-hidden transition-all duration-300 rounded-xl"
          )}
        >
          {customHeader}
          <div className="flex-1 overflow-auto px-1" ref={scrollContainerRef}>
            {children}
          </div>
        </Panel>
        {isAiPanelOpen && (
          <>
            <PanelResizeHandle className="w-0.5 bg-transparent hover:bg-gray-200 transition-colors" />
            <Panel defaultSize={30} minSize={20} maxSize={50}>
              <AiLayoutPanel />
            </Panel>
          </>
        )}
      </PanelGroup>
    );
  }

  return (
    <PanelGroup direction="horizontal" className="h-full gap-1">
      <Panel 
        defaultSize={isAiPanelOpen ? 70 : 100}
        minSize={isAiPanelOpen ? 30 : 100}
        className={cn(
          "bg-background border shadow-sm flex flex-col overflow-hidden transition-all duration-300 rounded-xl"
        )}
      >
        {/* Mobile Header */}
        {isMobile && (
          <MobileHeader 
            actions={headerActions || []}
            customContent={headerCustomContent}
          />
        )}
        
        {/* Desktop Header */}
        {!isMobile && (
          <div className={`transition-all duration-200 ${
            isScrolled 
              ? 'sticky top-0 z-50 rounded-none shadow-md bg-background' 
              : 'rounded-t-xl'
          }`}>
            <PageHeader 
              actions={headerActions || []}
              customContent={headerCustomContent}
            />
          </div>
        )}
        
        <div className="flex-1 overflow-auto px-1" ref={scrollContainerRef}>
          {children}
        </div>
      </Panel>
      
      {isAiPanelOpen && (
        <>
          <PanelResizeHandle className="w-0.5 bg-transparent hover:bg-gray-200 transition-colors" />
          <Panel defaultSize={30} minSize={20} maxSize={50}>
            <AiLayoutPanel />
          </Panel>
        </>
      )}
    </PanelGroup>
  );
}

function SidebarLayout({ children }: { children: React.ReactNode }) {
  const { isExpanded } = useSidebar();
  const { isMobile } = useResponsiveStore();
  
  return (
    <div 
      className="group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full"
      style={{
        '--sidebar-width': isExpanded ? 'calc(var(--spacing) * 64)' : '3rem',
        '--sidebar-width-icon': '3rem',
        '--header-height': 'calc(var(--spacing) * 14)'
      } as React.CSSProperties}
    >
      {/* Desktop Sidebar Container */}
      {!isMobile && (
        <div className="group peer text-sidebar-foreground hidden md:block" data-state={isExpanded ? "expanded" : "collapsed"} data-collapsible="" data-variant="inset" data-side="left">
          {/* Sidebar Gap - maintains layout space */}
          <div className={cn(
            "relative bg-transparent transition-[width] duration-200 ease-linear",
            isExpanded ? "w-64" : "w-16"
          )}></div>
           {/* Fixed Sidebar Container */}
           <div className={cn(
             "fixed inset-y-0 z-10 hidden h-svh transition-[left,right,width] duration-200 ease-linear md:flex left-0",
             isExpanded ? "w-64" : "w-16"
           )}>
             <div className="bg-background flex h-full w-full flex-col overflow-hidden">
               <Sidebar />
             </div>
           </div>
        </div>
      )}
      
       {/* Main Content Area */}
       <main className="bg-background relative flex w-full flex-1 flex-col p-2">
        <HeaderProvider>
          <DashboardContent>{children}</DashboardContent>
        </HeaderProvider>
      </main>
      
      {/* Mobile Navigation Drawer */}
      {isMobile && <MobileSidebarDrawer />}
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <MobileNavProvider>
        <SidebarLayout>{children}</SidebarLayout>
      </MobileNavProvider>
    </SidebarProvider>
  );
}
