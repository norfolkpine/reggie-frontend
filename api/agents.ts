import { api } from '@/lib/api-client';
import { Agent, PaginatedAgentList, PatchedAgent } from '../types/api';

export const getAgents = async (page: number = 1) => {
  const response = await api.get('/reggie/agents/', {
    params: { page: page.toString() },
  });
  return response.data as PaginatedAgentList;
};

export const getAgent = async (id: number) => {
  const response = await api.get(`/reggie/agents/${id}/`);
  return response.data as Agent;
};

export const createAgent = async (agent: Omit<Agent, 'id' | 'created_at' | 'updated_at'>) => {
  const response = await api.post('/reggie/agents/', agent);
  return response.data as Agent;
};

export const updateAgent = async (id: number, agent: Omit<Agent, 'id' | 'created_at' | 'updated_at'>) => {
  const response = await api.put(`/reggie/agents/${id}/`, agent);
  return response.data as Agent;
};

export const patchAgent = async (id: number, agent: PatchedAgent) => {
  const response = await api.patch(`/reggie/agents/${id}/`, agent);
  return response.data as Agent;
};

export const deleteAgent = async (id: number) => {
  await api.delete(`/reggie/agents/${id}/`);
};

export const getAgentInstructions = async (id: number) => {
  const response = await api.get(`/reggie/agents/${id}/instructions/`);
  return response.data as Agent;
};