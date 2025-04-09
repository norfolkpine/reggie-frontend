import { api } from '@/lib/api-client';
import { Agent, PaginatedAgentList, PatchedAgent } from '../types/api';

export const getAgents = async (page: number = 1) => {
  const response = await api.get('/reggie/api/v1/agents/', {
    params: { page: page.toString() },
  });
  return response as PaginatedAgentList;
};

export const getAgent = async (id: number) => {
  const response = await api.get(`/reggie/api/v1/agents/${id}/`);
  return response.data as Agent;
};

export const createAgent = async (agent: Omit<Partial<Agent>, 'id' | 'created_at' | 'updated_at'>) => {
  const response = await api.post('/reggie/api/v1/agents/', agent);
  return response.data as Agent;
};

export const updateAgent = async (id: number, agent: Omit<Agent, 'id' | 'created_at' | 'updated_at'>) => {
  const response = await api.put(`/reggie/api/v1/agents/${id}/`, agent);
  return response.data as Agent;
};

export const patchAgent = async (id: number, agent: PatchedAgent) => {
  const response = await api.patch(`/reggie/api/v1/agents/${id}/`, agent);
  return response.data as Agent;
};

export const deleteAgent = async (id: number) => {
  await api.delete(`/reggie/api/v1/agents/${id}/`);
};

export const getAgentInstructions = async (id: number) => {
  const response = await api.get(`/reggie/api/v1/agents/${id}/instructions/`);
  return response.data as Agent;
};

export const getAgentStreamChat = () => {
  const protocol = window.location.protocol; // 'http:' or 'https:'
  const host = window.location.host;         // e.g. 'localhost:8000'
  return `${protocol}//${host}/reggie/api/v1/agent/stream-chat/`;
};
