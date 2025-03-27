import { Search } from '@/components/search'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Filter, Tag as TagIcon, Star } from 'lucide-react'

export function ProjectFilters({
  searchQuery,
  setSearchQuery,
  selectedTags,
  toggleTag,
  viewMode,
  setViewMode,
  allTags
}: {
  searchQuery: string
  setSearchQuery: (value: string) => void
  selectedTags: string[]
  toggleTag: (tag: string) => void
  viewMode: 'all' | 'starred'
  setViewMode: (mode: 'all' | 'starred') => void
  allTags: string[]
}) {
  return (
    <div className="p-4 border-b">
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Filter by tags:</span>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {allTags.map((tag) => (
          <Button
            key={tag}
            variant={selectedTags.includes(tag) ? 'default' : 'outline'}
            size="sm"
            className="rounded-full"
            onClick={() => toggleTag(tag)}
          >
            <TagIcon className="h-3.5 w-3.5 mr-1" />
            {tag}
          </Button>
        ))}
      </div>

      <div className="flex rounded-md overflow-hidden border w-fit">
        <Button
          variant={viewMode === 'all' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setViewMode('all')}
          className="rounded-none"
        >
          All Projects
        </Button>
        <Button
          variant={viewMode === 'starred' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setViewMode('starred')}
          className="rounded-none flex items-center gap-1"
        >
          <Star className="h-3.5 w-3.5" /> Starred
        </Button>
      </div>
    </div>
  )
}