import { api } from '@/lib/api-client';
import { Invitation, PaginatedInvitationList, PatchedInvitation } from '../types/api';

export const getInvitations = async (page: number = 1) => {
  const response = await api.get('/invitations/', {
    params: { page: page.toString() }
  });
  return response as PaginatedInvitationList;
};

export const getInvitation = async (id: number) => {
  const response = await api.get(`/invitations/${id}/`);
  return response as Invitation;
};

export const createInvitation = async (invitation: Omit<Invitation, 'id' | 'created_at' | 'updated_at'>) => {
  const response = await api.post('/invitations/', invitation);
  return response as Invitation;
};

export const updateInvitation = async (id: number, invitation: Omit<Invitation, 'id' | 'created_at' | 'updated_at'>) => {
  const response = await api.put(`/invitations/${id}/`, invitation);
  return response as Invitation;
};

export const patchInvitation = async (id: number, invitation: PatchedInvitation) => {
  const response = await api.post(`/invitations/${id}/`, invitation);
  return response as Invitation;
};

export const deleteInvitation = async (id: number) => {
  await api.delete(`/invitations/${id}/`);
};