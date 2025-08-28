"use client";
import type React from "react";
import Sidebar from "@/components/sidebar";
import { PageHeader } from "@/components/ui/page-header";
import { HeaderProvider, useHeader } from "@/contexts/header-context";
import { useState, useEffect, useRef } from "react";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { customHeader, headerActions, headerCustomContent } = useHeader();
  const [isScrolled, setIsScrolled] = useState(false);

  // Detect scroll position to change header styling
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 20;
      setIsScrolled(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // If custom header is provided, use it; otherwise use PageHeader with actions/content
  if (customHeader) {
    return (
      <div className="h-full flex flex-col border">
        <div className={`fixed ${isScrolled ? 'top-0' : 'top-2'} right-2 left-64 z-50 h-16 bg-white border-b border-border ${isScrolled ? '' : 'rounded-t-xl'} shadow-sm`}>
          {customHeader}
        </div>
        <div className="flex-1 pt-20 bg-white">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col border">
      <div className={`fixed ${isScrolled ? 'top-0' : 'top-2'} right-2 left-64 z-50 h-16 bg-white border-b border-border ${isScrolled ? '' : 'rounded-t-xl'} shadow-sm`}>
        <PageHeader 
          actions={headerActions || []}
          customContent={headerCustomContent}
        />
      </div>
      <div className="flex-1 pt-20 bg-white rounder-b-lg">
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
      <div className="h-screen flex-1 pt-2 pr-2 pb-2 ml-64">
        <HeaderProvider>
          <DashboardContent>{children}</DashboardContent>
        </HeaderProvider>
      </div>
    </div>
  );
}
