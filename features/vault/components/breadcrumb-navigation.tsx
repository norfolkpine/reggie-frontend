"use client";

import { Button } from "@/components/ui/button";

interface BreadcrumbItem {
  id: number;
  name: string;
}

interface BreadcrumbNavigationProps {
  currentFolderId: number;
  breadcrumbs: BreadcrumbItem[];
  onBreadcrumbClick: (folderId: number) => void;
}

export function BreadcrumbNavigation({
  currentFolderId,
  breadcrumbs,
  onBreadcrumbClick
}: BreadcrumbNavigationProps) {
  return (
    <div
      className={`
        flex items-center space-x-2 text-sm text-muted-foreground mb-4 p-2 rounded
      `}
    >
      {(currentFolderId > 0 || breadcrumbs.length > 0) ? (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onBreadcrumbClick(0)}
            className="h-auto p-1 text-primary hover:text-primary/80"
          >
            Root
          </Button>
          {breadcrumbs.map((folder) => (
            <div key={folder.id} className="flex items-center">
              <span className="mx-1">/</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onBreadcrumbClick(folder.id)}
                className="h-auto p-1 text-primary hover:text-primary/80"
              >
                {folder.name}
              </Button>
            </div>
          ))}
        </>
      ) : (
        <span className="text-gray-500">Root folder</span>
      )}
    </div>
  );
}
