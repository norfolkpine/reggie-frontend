"use client"

import * as React from "react"
import { ChevronsUpDown, Plus, Check } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

// Sample teams data
const teams = [
  {
    name: "Acme Inc",
    logo: "🏢",
    plan: "Pro Plan",
  },
  {
    name: "Personal",
    logo: "👤",
    plan: "Free Plan",
  },
  {
    name: "Startup Co",
    logo: "🚀",
    plan: "Team Plan",
  },
]

export function TeamSwitcher({ isCollapsed = false }) {
  const [activeTeam, setActiveTeam] = React.useState(teams[0])

  if (isCollapsed) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/10 text-primary text-xs">
              {activeTeam.logo}
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" side="right" className="w-56">
          <DropdownMenuLabel className="text-xs text-muted-foreground">Teams</DropdownMenuLabel>
          {teams.map((team, index) => (
            <DropdownMenuItem key={team.name} onClick={() => setActiveTeam(team)} className="gap-2 p-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-sm border text-sm">{team.logo}</div>
              <div className="flex-1">
                <p className="text-sm">{team.name}</p>
                <p className="text-xs text-muted-foreground">{team.plan}</p>
              </div>
              {activeTeam.name === team.name && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem className="gap-2 p-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md border bg-background">
              <Plus className="h-4 w-4" />
            </div>
            <div className="font-medium text-muted-foreground">Add team</div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
              {activeTeam.logo}
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="font-semibold">{activeTeam.name}</span>
              <span className="text-xs text-muted-foreground">{activeTeam.plan}</span>
            </div>
          </div>
          <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Teams</DropdownMenuLabel>
        {teams.map((team, index) => (
          <DropdownMenuItem key={team.name} onClick={() => setActiveTeam(team)} className="gap-2 p-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-sm border text-sm">{team.logo}</div>
            <div className="flex-1">
              <p className="text-sm">{team.name}</p>
              <p className="text-xs text-muted-foreground">{team.plan}</p>
            </div>
            {activeTeam.name === team.name && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 p-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md border bg-background">
            <Plus className="h-4 w-4" />
          </div>
          <div className="font-medium text-muted-foreground">Add team</div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

