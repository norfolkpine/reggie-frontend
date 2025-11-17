import { api } from '@/lib/api-client';
import { TeamInvitation, PaginatedInvitationList, PatchedInvitation } from '../types/api';

// Fetch a paginated list of invitations for a specific team
export const getTeamInvitations = async (teamSlug: string, page: number = 1) => {
  const response = await api.get(`/a/${teamSlug}/team/api/invitations/`, {
    params: { page: page.toString() }
  });
  return response as PaginatedInvitationList;
};

// Fetch a specific invitation by ID
export const getTeamInvitation = async (teamSlug: string, id: string) => {
  const response = await api.get(`/a/${teamSlug}/team/api/invitations/${id}/`);
  return response as TeamInvitation;
};

// Create a new invitation for a specific team
export const createTeamInvitation = async (teamSlug: string, invitation: Omit<Partial<TeamInvitation>, 'id' | 'created_at' | 'updated_at'>) => {
  const response = await api.post(`/a/${teamSlug}/team/api/invitations/`, invitation);
  return response as TeamInvitation;
};

// Update an existing invitation by ID
export const updateTeamInvitation = async (teamSlug: string, id: string, invitation: Omit<Partial<TeamInvitation>, 'id' | 'created_at' | 'updated_at'>) => {
  const response = await api.put(`/a/${teamSlug}/team/api/invitations/${id}/`, invitation);
  return response as TeamInvitation;
};

// Patch an existing invitation by ID
export const patchTeamInvitation = async (teamSlug: string, id: string, invitation: PatchedInvitation) => {
  const response = await api.patch(`/a/${teamSlug}/team/api/invitations/${id}/`, invitation);
  return response as TeamInvitation;
};

// Delete an invitation by ID
export const deleteTeamInvitation = async (teamSlug: string, id: string) => {
  await api.delete(`/a/${teamSlug}/team/api/invitations/${id}/`);
};