import { api } from '@/lib/api-client';
import { Agent, PaginatedAgentList, PatchedAgent } from '../types/api';

export const getAgents = async (page: number = 1) => {
  const response = await api.get('/reggie/api/agents/', {
    params: { page: page.toString() },
  });
  return response as PaginatedAgentList;
};

export const getAgent = async (id: number) => {
  const response = await api.get(`/reggie/api/agents/${id}/`);
  return response.data as Agent;
};

export const createAgent = async (agent: Omit<Partial<Agent>, 'id' | 'created_at' | 'updated_at'>) => {
  const response = await api.post('/reggie/api/agents/', agent);
  return response.data as Agent;
};

export const updateAgent = async (id: number, agent: Omit<Agent, 'id' | 'created_at' | 'updated_at'>) => {
  const response = await api.put(`/reggie/api/agents/${id}/`, agent);
  return response.data as Agent;
};

export const patchAgent = async (id: number, agent: PatchedAgent) => {
  const response = await api.patch(`/reggie/api/agents/${id}/`, agent);
  return response.data as Agent;
};

export const deleteAgent = async (id: number) => {
  await api.delete(`/reggie/api/agents/${id}/`);
};

export const getAgentInstructions = async (id: number) => {
  const response = await api.get(`/reggie/api/agents/${id}/instructions/`);
  return response.data as Agent;
};