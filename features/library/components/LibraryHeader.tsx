import { Plus, Search, Filter, Users, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Team } from "../types"

interface LibraryHeaderProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  documentType: string
  teamFilter: string
  setTeamFilter: (team: string) => void
  teams: Team[]
}

export function LibraryHeader({
  searchQuery,
  setSearchQuery,
  documentType,
  teamFilter,
  setTeamFilter,
  teams,
}: LibraryHeaderProps) {
  return (
    <div className="p-4 border-b">
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents, legislation, or tax information..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          {documentType === "public" ? "Add to My Library" : "Upload Document"}
        </Button>
      </div>

      {/* Team filter for private documents */}
      {(documentType === "private" || documentType === "all") && (
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Team Filter:</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                {teamFilter === "all" ? "All Teams" : teamFilter === "personal" ? "Personal Documents" : teamFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTeamFilter("all")}>
                <Users className="h-4 w-4 mr-2" />
                All Teams
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTeamFilter("personal")}>
                <User className="h-4 w-4 mr-2" />
                Personal Documents
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {teams.map((team) => (
                <DropdownMenuItem key={team.id} onClick={() => setTeamFilter(team.name)}>
                  <span className="mr-2">{team.icon}</span>
                  {team.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  )
}