'use client';

import { ChevronRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collection } from '@/api/collections';

interface BreadcrumbNavigationProps {
  currentCollection: Collection | null;
  onNavigate: (collection: Collection | null) => void;
}

export function BreadcrumbNavigation({ currentCollection, onNavigate }: BreadcrumbNavigationProps) {
  if (!currentCollection) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Home className="h-4 w-4" />
        <span>All Files</span>
      </div>
    );
  }

  // Build breadcrumb path from the collection's full_path
  const pathParts = currentCollection.full_path.split('/').filter(Boolean);
  
  return (
    <div className="flex items-center gap-2 text-sm">
      <Button
        variant="ghost"
        size="sm"
        className="h-6 px-2 text-muted-foreground hover:text-foreground"
        onClick={() => onNavigate(null)}
      >
        <Home className="h-3 w-3 mr-1" />
        All Files
      </Button>
      
      {pathParts.map((part, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-muted-foreground hover:text-foreground"
            onClick={() => {
              // For now, we'll just navigate to the root since we don't have
              // the full ancestor chain. In a real implementation, you'd want
              // to store the full path or fetch ancestors.
              onNavigate(null);
            }}
          >
            {part}
          </Button>
        </div>
      ))}
    </div>
  );
}

