"use client";
import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { ResizableContent } from "@/features/vault/components/resizable-content";
import Sidebar from "@/components/sidebar";
import { PageHeader } from "@/components/ui/page-header";
import { HeaderProvider, useHeader } from "@/contexts/header-context";
import { useGlobalPanel, GlobalPanelProvider } from "@/contexts/global-panel-context";
import { SidebarProvider, useSidebar } from "@/contexts/sidebar-context";
import { MobileNavProvider } from "@/contexts/mobile-nav-context";
import { MobileHeader, MobileSidebarDrawer } from "@/components/sidebar/index";
import { useResponsiveStore } from "@/stores/useResponsiveStore";
import { RightSectionProvider, useRightSection } from "@/hooks/use-right-section";
import { DragDropProvider, useDragDropContext } from "@/contexts/drag-drop-context";
import { cn } from "@/lib/utils";

// Memoize the main content wrapper to prevent re-renders when only right section changes
const MainContentWrapper = React.memo(({ 
  children, 
  customHeader, 
  headerActions, 
  headerCustomContent,
  isMobile,
  isScrolled,
  scrollProgress,
  scrollContainerRef,
  backgroundClass
}: { 
  children: React.ReactNode;
  customHeader: React.ReactNode;
  headerActions: any[];
  headerCustomContent: React.ReactNode;
  isMobile: boolean;
  isScrolled: boolean;
  scrollProgress: number;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  backgroundClass: string;
}) => {
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
      <div className={`sticky top-0 z-[100] transition-all duration-150 ease-out ${
        isScrolled 
          ? 'shadow-md backdrop-blur-md bg-background/80' 
          : 'bg-background'
      }`}>
        <PageHeader
          actions={headerActions || []}
          customContent={headerCustomContent}
        />
      </div>
    );
  };

  // Calculate dynamic border radius based on scroll progress
  const borderRadius = 12 * (1 - scrollProgress); // 12px (rounded-xl) to 0px
  
  return (
    <div 
      className={cn(
        backgroundClass,
        "sm:border shadow-sm  overflow-hidden sm:mx-2 mb-2 transition-all duration-150 ease-out",
        isScrolled ? "-mt-2 h-[calc(100%+2px)]" : "mt-2",
        !isScrolled && "h-[calc(100%-1rem)]"
      )}
      style={{
        borderRadius: `${borderRadius}px`,
        marginTop: isScrolled ? '-2px' : '8px'
      }}
    >
      <div className="h-full overflow-auto" ref={scrollContainerRef}>
        {renderHeader()}
        <div className="min-h-[calc(100vh-8rem)] z-10">
          {children}
        </div>
      </div>
    </div>
  );
});
MainContentWrapper.displayName = 'MainContentWrapper';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { customHeader, headerActions, headerCustomContent } = useHeader();
  const { getActiveOrClosingPanels } = useGlobalPanel();
  const { rightSection, showRightSection, hideRightSection } = useRightSection();
  const { isMobile } = useResponsiveStore();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Get active and closing panels
  const activeOrClosingPanels = getActiveOrClosingPanels();
  const hasActivePanel = activeOrClosingPanels.some(p => !p.isClosing);
  const activePanel = activeOrClosingPanels.find(p => !p.isClosing)?.config || null;

  // Update right section based on active panels and route
  useEffect(() => {
    // Check if we're on a vault route
    const isVaultRoute = pathname?.startsWith('/vault');

    if (hasActivePanel && activePanel) {
      const PanelComponent = activePanel.component;
      const panelElement = <PanelComponent {...activePanel.props} />;
      showRightSection(activePanel.id, panelElement);
    } else if (!isVaultRoute) {
      // Close right section when navigating away from vault routes
      hideRightSection();
    }
  }, [hasActivePanel, activePanel, showRightSection, hideRightSection, pathname]);

  // Detect scroll position to change header styling
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const scrollTop = scrollContainer.scrollTop;
      const maxScroll = 20; // Adjust this value to control when corners fully disappear
      const progress = Math.min(scrollTop / maxScroll, 1);
      
      setIsScrolled(scrollTop > 0);
      setScrollProgress(progress);
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, []);

  // Main content configuration
  const backgroundClass = customHeader ? "bg-white" : "bg-background";

  // Memoize left section content to prevent re-renders when only right section changes
  const leftSectionContent = React.useMemo(() => (
    <MainContentWrapper
      customHeader={customHeader}
      headerActions={headerActions || []}
      headerCustomContent={headerCustomContent}
      isMobile={isMobile}
      isScrolled={isScrolled}
      scrollProgress={scrollProgress}
      scrollContainerRef={scrollContainerRef}
      backgroundClass={backgroundClass}
    >
      {children}
    </MainContentWrapper>
  ), [customHeader, headerActions, headerCustomContent, isMobile, isScrolled, scrollProgress, backgroundClass, children]);

  // Memoize right section content
  const rightSectionContent = React.useMemo(() => rightSection?.component, [rightSection?.component]);

  // Get drag drop options from context
  const { dragDropOptions } = useDragDropContext();

  return (
    <ResizableContent
      showRightSection={!!rightSection}
      leftSectionContent={leftSectionContent}
      rightSectionContent={rightSectionContent}
      mobileMode="drawer"
      onMobileClose={hideRightSection}
      dragDropOptions={dragDropOptions || undefined}
    />
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
      <main className="bg-background relative flex w-full flex-1 flex-col">
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
    <RightSectionProvider>
      <GlobalPanelProvider>
        <SidebarProvider>
          <MobileNavProvider>
            <DragDropProvider>
              <SidebarLayout>{children}</SidebarLayout>
            </DragDropProvider>
          </MobileNavProvider>
        </SidebarProvider>
      </GlobalPanelProvider>
    </RightSectionProvider>
  );
}
