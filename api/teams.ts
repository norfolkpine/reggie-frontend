import { api } from '@/lib/api-client';
import { Team, PaginatedTeamList, PatchedTeam } from '../types/api';

export const getTeams = async (page: number = 1) => {
  const response = await api.get('/teams/', {
    params: { page: page.toString() }
  });
  return response as PaginatedTeamList;
};

export const getTeam = async (id: number) => {
  const response = await api.get(`/teams/${id}/`);
  return response as Team;
};

export const createTeam = async (team: Omit<Team, 'id' | 'created_at' | 'updated_at'>) => {
  const response = await api.post('/teams/', team);
  return response as Team;
};

export const updateTeam = async (id: number, team: Omit<Team, 'id' | 'created_at' | 'updated_at'>) => {
  const response = await api.put(`/teams/${id}/`, team);
  return response as Team;
};

export const patchTeam = async (id: number, team: PatchedTeam) => {
  const response = await api.post(`/teams/${id}/`, team);
  return response as Team;
};

export const deleteTeam = async (id: number) => {
  await api.delete(`/teams/${id}/`);
};