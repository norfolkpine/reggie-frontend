"use client";

import { usePathname } from "next/navigation";
import { getPageTitle } from "@/lib/navigation";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface HeaderAction {
  label: string;
  onClick: () => void;
  variant?: "default" | "outline" | "secondary" | "destructive" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  icon?: ReactNode;
}

interface PageHeaderProps {
  className?: string;
  actions?: HeaderAction[]; // Actions/buttons to display on the right side
  customContent?: ReactNode; // Custom content to display alongside the title
}

export function PageHeader({ 
  className = "", 
  actions = [],
  customContent
}: PageHeaderProps) {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <div className={`h-16 px-6 flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-3">
        {customContent ? customContent : (pageTitle && <h1 className="text-xl font-semibold text-gray-900">{pageTitle}</h1>)}
      </div>

      {actions.length > 0 && (
        <div className="flex items-center gap-2">
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
  );
}
