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
    <div className="group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full">
      <div className="group peer text-sidebar-foreground hidden md:block sticky top-0 h-svh">
        <Sidebar />
      </div>
      <div className="bg-sidebar-background relative flex w-full flex-1 flex-col md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2 p-4">
        <HeaderProvider>
          <DashboardContent>{children}</DashboardContent>
        </HeaderProvider>
      </div>
    </div>
  );
}
