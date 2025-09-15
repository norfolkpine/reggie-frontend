"use client";
import type React from "react";
import Sidebar from "@/components/sidebar";
import { PageHeader } from "@/components/ui/page-header";
import { HeaderProvider, useHeader } from "@/contexts/header-context";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { customHeader, headerActions, headerCustomContent } = useHeader();

  return (
    <div className="bg-card border shadow-sm rounded-xl flex flex-col h-full">
      {/* Sticky Header */}
      <header className="bg-background/40 sticky top-0 z-50 flex h-14 shrink-0 items-center gap-2 border-b backdrop-blur-md transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-14 rounded-t-xl">
        <div className="flex w-full items-center gap-1 px-4 lg:gap-2">
          {customHeader ? (
            customHeader
          ) : (
            <PageHeader actions={headerActions || []} customContent={headerCustomContent} />
          )}
        </div>
      </header>
      
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto rounded-b-xl min-h-0">
        <div className="h-full">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div 
      className="group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full"
      style={{
        '--sidebar-width': 'calc(var(--spacing) * 64)',
        '--sidebar-width-icon': '3rem',
        '--header-height': 'calc(var(--spacing) * 14)'
      } as React.CSSProperties}
    >
      {/* Sidebar Container */}
      <div className="group peer text-sidebar-foreground hidden md:block" data-state="expanded" data-collapsible="" data-variant="inset" data-side="left">
        {/* Sidebar Gap - maintains layout space */}
        <div className="relative w-64 bg-transparent transition-[width] duration-200 ease-linear group-data-[collapsible=offcanvas]:w-0 group-data-[collapsible=icon]:w-16"></div>
         {/* Fixed Sidebar Container */}
         <div className="fixed inset-y-0 z-10 hidden h-svh w-64 transition-[left,right,width] duration-200 ease-linear md:flex left-0 group-data-[collapsible=offcanvas]:left-[-256px] group-data-[collapsible=icon]:w-16">
           <div className="bg-background flex h-full w-full flex-col overflow-hidden">
             <Sidebar />
           </div>
         </div>
      </div>
      
       {/* Main Content Area */}
       <main className="bg-background relative flex w-full flex-1 flex-col p-4">
        <HeaderProvider>
          <DashboardContent>{children}</DashboardContent>
        </HeaderProvider>
      </main>
    </div>
  );
}
