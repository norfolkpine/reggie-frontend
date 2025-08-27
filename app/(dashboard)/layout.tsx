"use client";
import type React from "react";
import Sidebar from "@/components/sidebar";
import { PageHeader } from "@/components/ui/page-header";
import { HeaderProvider, useHeader } from "@/contexts/header-context";
import { useState, useEffect, useRef } from "react";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { customHeader, headerActions, headerCustomContent } = useHeader();
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
      <div className="bg-white rounded-xl border shadow-sm h-full overflow-auto">
        {customHeader}
        {children}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm h-full overflow-auto" ref={scrollContainerRef}>
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
      <div className={isScrolled ? 'pt-0' : 'pt-0'}>
        {children}
      </div>
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeView, setActiveView] = useState("chat");

  const handleViewChange = (view: string) => {
    setActiveView(view);
  };

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
