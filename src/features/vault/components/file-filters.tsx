"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import SearchInput from "@/components/ui/search-input";
import { Filter, ChevronDown } from "lucide-react";

interface FileFiltersProps {
  searchQuery: string;
  showAllFiles: boolean;
  activeFilters: string[];
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFilterChange: (filterType: string, checked: boolean) => void;
}

export function FileFilters({
  searchQuery,
  showAllFiles,
  activeFilters,
  onSearchChange,
  onFilterChange
}: FileFiltersProps) {

  const handleFilterChange = useCallback((filterType: string, checked: boolean) => {
    if (filterType === 'all') {
      onFilterChange('all', checked);
    } else if (filterType === 'doc') {
      // Handle Word documents (doc, docx)
      onFilterChange('doc', checked);
    } else if (filterType === 'xls') {
      // Handle Excel spreadsheets (xls, xlsx)
      onFilterChange('xls', checked);
    } else if (filterType === 'txt') {
      // Handle text files (txt, csv)
      onFilterChange('txt', checked);
    } else if (filterType === 'jpg') {
      // Handle images (jpg, jpeg, png)
      onFilterChange('jpg', checked);
    } else {
      // Handle single filters (pdf)
      onFilterChange(filterType, checked);
    }
  }, [onFilterChange]);

  return (
    <div className="flex items-center gap-2">
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9">
          <Filter className="mr-0 sm:mr-2 h-4 w-4" />
          <span className="button-text">Filter</span>
          <ChevronDown className="ml-0 sm:ml-1 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuCheckboxItem
          checked={showAllFiles}
          onCheckedChange={(checked) => handleFilterChange('all', checked)}
        >
          All Files
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={activeFilters.includes('pdf') || showAllFiles}
          onCheckedChange={(checked) => handleFilterChange('pdf', checked)}
        >
          PDF Documents
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={activeFilters.includes('doc') || activeFilters.includes('docx') || showAllFiles}
          onCheckedChange={(checked) => handleFilterChange('doc', checked)}
        >
          Word Documents
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={activeFilters.includes('xls') || activeFilters.includes('xlsx') || showAllFiles}
          onCheckedChange={(checked) => handleFilterChange('xls', checked)}
        >
          Excel Spreadsheets
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={activeFilters.includes('txt') || activeFilters.includes('csv') || showAllFiles}
          onCheckedChange={(checked) => handleFilterChange('txt', checked)}
        >
          Text Files
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={activeFilters.includes('jpg') || activeFilters.includes('jpeg') || activeFilters.includes('png') || showAllFiles}
          onCheckedChange={(checked) => handleFilterChange('jpg', checked)}
        >
          Images
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
  );
}
