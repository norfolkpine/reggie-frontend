import { Team } from "@/types/api";

const TEAM_STORAGE_KEY = 'active_team';

export const teamStorage = {
  getActiveTeam: (): Team | null => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(TEAM_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  setActiveTeam: (team: Team | null): void => {
    if (typeof window === 'undefined') return;
    if (team) {
      localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(team));
    } else {
      localStorage.removeItem(TEAM_STORAGE_KEY);
    }
  },
};