"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Team } from "@/types/api";

interface TeamListProps {
  teams: Team[];
  activeTeam: Team | null;
  onTeamSelect: (team: Team) => void;
  onBack: () => void;
}

export function TeamList({ teams, activeTeam, onTeamSelect, onBack }: TeamListProps) {
  return (
    <>
      {teams.map((team) => (
        <DropdownMenuItem
          key={team.name}
          className="py-2"
          onSelect={() => onTeamSelect(team)}
        >
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
              {team.name.charAt(0).toUpperCase()}
            </div>
            <div className="grid flex-1">
              <span className="font-medium truncate">{team.name}</span>
              <span className="text-xs text-muted-foreground">
                {team.subscription?.display_name ?? "Free Plan"}
              </span>
            </div>
            {activeTeam?.name === team.name && (
              <span className="ml-auto text-primary">✓</span>
            )}
          </div>
        </DropdownMenuItem>
      ))}
    </>
  );
}