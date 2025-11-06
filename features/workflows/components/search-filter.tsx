"use client";

import { Button } from "@/components/ui/button";
import SearchInput from "@/components/ui/search-input";

interface SearchFilterProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeCategory?: string;
  setActiveCategory?: (category: string) => void;
  categories?: string[];
}

export function SearchFilter({
  searchQuery,
  setSearchQuery,
  activeCategory,
  setActiveCategory,
  categories,
}: SearchFilterProps) {
  return (
    <div className="p-4 border-b">
      <SearchInput
        placeholder="Search for specialized agents..."
        value={searchQuery}
        className="mb-4"
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className="flex flex-wrap gap-2">
        {categories?.map((category) => (
          <Button
            key={category}
            variant={activeCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(category)}
            className="rounded-full"
          >
            {category}
          </Button>
        ))}
      </div>
    </div>
  );
}
