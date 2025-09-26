"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Pagination, PaginationContent, PaginationItem, PaginationEllipsis } from "@/components/ui/pagination";
import { ChevronDown } from "lucide-react";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  pageNums: number[];
  onPageChange: (pageNum: number) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onItemsPerPageChange: (value: number) => void;
}

export function PaginationControls({
  currentPage,
  totalPages,
  itemsPerPage,
  hasNextPage,
  hasPreviousPage,
  pageNums,
  onPageChange,
  onPreviousPage,
  onNextPage,
  onItemsPerPageChange
}: PaginationControlsProps) {
  return (
    <div className="flex items-center justify-between mt-4">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <Button
              variant="outline"
              size="sm"
              onClick={onPreviousPage}
              disabled={currentPage === 1 || !hasPreviousPage}
            >
              Previous
            </Button>
          </PaginationItem>

          {/* Show ellipsis before page numbers if needed */}
          {totalPages > 5 && currentPage > 3 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          {/* Page numbers */}
          {pageNums.map((pageNum) => (
            <PaginationItem key={pageNum}>
              <Button
                variant={currentPage === pageNum ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(pageNum)}
              >
                {pageNum}
              </Button>
            </PaginationItem>
          ))}

          {/* Show ellipsis after page numbers if needed */}
          {totalPages > 5 && currentPage < totalPages - 2 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          <PaginationItem>
            <Button
              variant="outline"
              size="sm"
              onClick={onNextPage}
              disabled={currentPage >= totalPages || !hasNextPage}
            >
              Next
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          Items per page:
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              {itemsPerPage}
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {[5, 10, 20, 50].map((value) => (
              <DropdownMenuItem
                key={value}
                onClick={() => onItemsPerPageChange(value)}
              >
                {value}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
