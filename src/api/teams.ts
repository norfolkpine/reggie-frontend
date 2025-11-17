import { api } from '@/lib/api-client';
import { Team, PaginatedTeamList, PatchedTeam } from '../types/api';

export const getTeams = async (page: number = 1, search?: string) => {
  const params: Record<string, string> = { page: page.toString() };
  if (search) {
    params.search = search;
  }
  const response = await api.get('/teams/api/teams/', {
    params
  });
  return response as PaginatedTeamList;
};

export const getTeam = async (id: number) => {
  const response = await api.get(`/teams/api/teams/${id}/`);
  return response as Team;
};

export const createTeam = async (team: Omit<Partial<Team>, 'id' | 'created_at' | 'updated_at'>) => {
  const response = await api.post('/teams/api/teams/', team);
  return response as Team;
};

export const updateTeam = async (id: number, team: Omit<Partial<Team>, 'id' | 'created_at' | 'updated_at'>) => {
  const response = await api.put(`/teams/api/teams/${id}/`, team);
  return response as Team;
};

export const patchTeam = async (id: number, team: PatchedTeam) => {
  const response = await api.post(`/teams/api/teams/${id}/`, team);
  return response as Team;
};

export const deleteTeam = async (id: number) => {
  await api.delete(`/teams/api/teams/${id}/`);
};