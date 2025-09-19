"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useMobileNav } from "@/contexts/mobile-nav-context";
import { cn } from "@/lib/utils";
import Sidebar from "@/components/sidebar";

export function MobileSidebarDrawer() {
  const { isOpen, close } = useMobileNav();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={close}
      />
      
      {/* Drawer */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-80 bg-background border-r transform transition-transform duration-300 ease-in-out md:hidden",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Reggie</h2>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={close}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Sidebar Content - Reusing the exact same sidebar component */}
          <div className="flex-1 overflow-hidden">
            <Sidebar isMobile={true} />
          </div>
        </div>
      </div>
    </>
  );
}
