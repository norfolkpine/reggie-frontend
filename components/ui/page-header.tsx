"use client";

import { usePathname } from "next/navigation";
import { getPageTitle } from "@/lib/navigation";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  PanelLeft,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useSidebar } from "@/contexts/sidebar-context";

interface HeaderAction {
  label: string;
  onClick: () => void;
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "destructive"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  icon?: ReactNode;
}

interface PageHeaderProps {
  className?: string;
  actions?: HeaderAction[]; // Actions/buttons to display on the right side
  customContent?: ReactNode; // Custom content to display alongside the title
  showSidebarToggle?: boolean; // Whether to show the sidebar toggle button
}

export function PageHeader({
  className = "",
  actions = [],
  customContent,
}: PageHeaderProps) {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);
  const { isExpanded, toggleSidebar } = useSidebar();

  return (
    <div
      className={`p-4 flex items-center justify-between w-full ${className} border-b border-border`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
      <>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              title={isExpanded ? "Minimize sidebar" : "Expand sidebar"}
              onClick={toggleSidebar}
            >
              {isExpanded ? (
                <PanelLeftClose className="h-4 w-4" />
              ) : (
                <PanelLeftOpen className="h-4 w-4" />
              )}
            </Button>
            <div className="h-6 w-px bg-border"></div>
          </>
        {customContent
          ? customContent
          : pageTitle && (
              <h1 className="text-xl font-medium text-foreground">
                {pageTitle}
              </h1>
            )}
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
              {action.icon && action.label ? (
                <span className="mr-2">{action.icon}</span>
              ) : action.icon && !action.label ? (
                <span>{action.icon}</span>
              ) : null}
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
