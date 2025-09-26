"use client";
import React, { useState, useEffect, useRef } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import Sidebar from "@/components/sidebar";
import { PageHeader } from "@/components/ui/page-header";
import { HeaderProvider, useHeader } from "@/contexts/header-context";
import { useGlobalPanel, GlobalPanelProvider } from "@/contexts/global-panel-context";
import { SidebarProvider, useSidebar } from "@/contexts/sidebar-context";
import { MobileNavProvider } from "@/contexts/mobile-nav-context";
import { MobileHeader, MobileSidebarDrawer } from "@/components/sidebar/index";
import { useResponsiveStore } from "@/stores/useResponsiveStore";
import { cn } from "@/lib/utils";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { customHeader, headerActions, headerCustomContent } = useHeader();
  const { getActiveOrClosingPanels } = useGlobalPanel();
  const { isMobile } = useResponsiveStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Get active and closing panels
  const activeOrClosingPanels = getActiveOrClosingPanels();
  const hasActivePanel = activeOrClosingPanels.some(p => !p.isClosing);
  const activePanel = activeOrClosingPanels.find(p => !p.isClosing)?.config || null;

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

  // Render header based on mobile/custom conditions
  const renderHeader = () => {
    if (customHeader) return customHeader;

    if (isMobile) {
      return (
        <MobileHeader
          actions={headerActions || []}
          customContent={headerCustomContent}
        />
      );
    }

    return (
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
    );
  };

  // Generic panel rendering based on active and closing panels
  const renderActivePanel = () => {
    if (activeOrClosingPanels.length === 0) return null;

    // Render all panels (active and closing) in priority order
    return (
      <>
        {activeOrClosingPanels.map(({ config, isClosing }, index) => {
          const PanelComponent = config.component;
          if (!PanelComponent) return null;

          // Get transition classes based on panel position and state
          const getTransitionClasses = (position: string, isClosing: boolean) => {
            if (isClosing) {
              // Exit animations
              switch (position) {
                case "right":
                  return "animate-out slide-out-to-right-full duration-300";
                case "left":
                  return "animate-out slide-out-to-left-full duration-300";
                case "bottom":
                  return "animate-out slide-out-to-bottom-full duration-300";
                default:
                  return "animate-out slide-out-to-right-full duration-300";
              }
            } else {
              // Enter animations
              switch (position) {
                case "right":
                  return "animate-in slide-in-from-right-full duration-300";
                case "left":
                  return "animate-in slide-in-from-left-full duration-300";
                case "bottom":
                  return "animate-in slide-in-from-bottom-full duration-300";
                default:
                  return "animate-in slide-in-from-right-full duration-300";
              }
            }
          };

          const transitionClasses = getTransitionClasses(config.position, isClosing);

          return (
            <React.Fragment key={config.id}>
              <PanelResizeHandle className={`w-0.5 bg-transparent hover:bg-gray-200 transition-colors ${
                config.position === "left" ? "order-first" : ""
              }`} />
              <Panel
                defaultSize={config.size.default}
                minSize={config.size.min}
                maxSize={config.size.max}
                className={transitionClasses}
              >
                <PanelComponent {...config.props} />
              </Panel>
            </React.Fragment>
          );
        })}
      </>
    );
  };

  // Main panel configuration based on active panel
  const mainPanelSize = hasActivePanel ? (100 - (activePanel?.size.default || 30)) : 100;
  const mainPanelMinSize = hasActivePanel ? (100 - (activePanel?.size.max || 50)) : 100;
  const backgroundClass = customHeader ? "bg-white" : "bg-background";

  return (
    <PanelGroup direction="horizontal" className="h-full gap-1">
      <Panel
        defaultSize={mainPanelSize}
        minSize={mainPanelMinSize}
        className={cn(
          backgroundClass,
          "border shadow-sm flex flex-col overflow-hidden rounded-xl transition-[flex-basis] duration-300 ease-in-out"
        )}
      >
        {renderHeader()}
        <div className="flex-1 overflow-auto px-1" ref={scrollContainerRef}>
          {children}
        </div>
      </Panel>
      {renderActivePanel()}
    </PanelGroup>
  );
}

function SidebarLayout({ children }: { children: React.ReactNode }) {
  const { isExpanded } = useSidebar();
  const { isMobile } = useResponsiveStore();

  // Calculate sidebar dimensions
  const sidebarWidth = isExpanded ? 'w-64' : 'w-16';
  const sidebarStyle = {
    '--sidebar-width': isExpanded ? 'calc(var(--spacing) * 64)' : '3rem',
    '--sidebar-width-icon': '3rem',
    '--header-height': 'calc(var(--spacing) * 14)'
  } as React.CSSProperties;

  // Desktop Sidebar (only render when not mobile)
  const desktopSidebar = !isMobile ? (
    <div className="group peer text-sidebar-foreground hidden md:block" data-state={isExpanded ? "expanded" : "collapsed"} data-collapsible="" data-variant="inset" data-side="left">
      {/* Sidebar Gap - maintains layout space */}
      <div className={cn(
        "relative bg-transparent transition-[width] duration-200 ease-linear",
        sidebarWidth
      )} />

      {/* Fixed Sidebar Container */}
      <div className={cn(
        "fixed inset-y-0 z-10 hidden h-svh transition-[left,right,width] duration-200 ease-linear md:flex left-0",
        sidebarWidth
      )}>
        <div className="bg-background flex h-full w-full flex-col overflow-hidden">
          <Sidebar />
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div
      className="group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full"
      style={sidebarStyle}
    >
      {desktopSidebar}

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
    <GlobalPanelProvider>
      <SidebarProvider>
        <MobileNavProvider>
          <SidebarLayout>{children}</SidebarLayout>
        </MobileNavProvider>
      </SidebarProvider>
    </GlobalPanelProvider>
  );
}
