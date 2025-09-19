"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useMobileNav } from "@/contexts/mobile-nav-context";
import { PageHeader } from "@/components/ui/page-header";
import { cn } from "@/lib/utils";

interface MobileHeaderProps {
  className?: string;
  actions?: any[];
  customContent?: React.ReactNode;
}

export function MobileHeader({ 
  className, 
  actions = [], 
  customContent 
}: MobileHeaderProps) {
  const { toggle } = useMobileNav();

  return (
    <div className={cn("md:hidden", className)}>
      <div className="p-4 flex items-center justify-between w-full bg-background border-b">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={toggle}
          >
            <Menu className="h-5 w-5" />
          </Button>
          {customContent || <h1 className="text-xl font-medium text-foreground">Reggie</h1>}
        </div>

        {actions.length > 0 && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || "default"}
                size={action.size || "sm"}
                onClick={action.onClick}
              >
                {action.icon && <span className="mr-2">{action.icon}</span>}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
