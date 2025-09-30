"use client";

import { Button } from "@/components/ui/button";

interface PaginationControlsProps {
  hasNextPage: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
}

export function PaginationControls({
  hasNextPage,
  isLoadingMore = false,
  onLoadMore
}: PaginationControlsProps) {
  if (!onLoadMore || !hasNextPage) {
    return null;
  }

  return (
    <div className="flex items-center justify-center mt-4">
      <Button
        variant="outline"
        onClick={onLoadMore}
        disabled={isLoadingMore}
      >
        {isLoadingMore ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
            Loading...
          </>
        ) : (
          'Load More'
        )}
      </Button>
    </div>
  );
}
