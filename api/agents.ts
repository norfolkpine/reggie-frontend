import { api } from '@/lib/api-client';
import { Agent, PaginatedAgentList, PatchedAgent } from '../types/api';

interface StreamChatResponse {
  token: string;
  markdown: boolean;
}

export const getAgents = async (page: number = 1) => {
  const response = await api.get('/opie/api/v1/agents/', {
    params: { page: page.toString() },
  });
  return response as PaginatedAgentList;
};

export const getAgent = async (id: number) => {
  const response = await api.get(`/opie/api/v1/agents/${id}/`);
  return response as Agent;
};

export const createAgent = async (agent: Omit<Partial<Agent>, 'id' | 'created_at' | 'updated_at'>) => {
  const response = await api.post('/opie/api/v1/agents/', agent);
  return response as Agent;
};

export const updateAgent = async (id: number, agent: Omit<Partial<Agent>, 'id' | 'created_at' | 'updated_at'>) => {
  const response = await api.put(`/opie/api/v1/agents/${id}/`, agent);
  return response as Agent;
};

export const patchAgent = async (id: number, agent: PatchedAgent) => {
  const response = await api.patch(`/opie/api/v1/agents/${id}/`, agent);
  return response as Agent;
};

export const deleteAgent = async (id: number) => {
  await api.delete(`/opie/api/v1/agents/${id}/`);
};

export const getAgentInstructions = async (id: number) => {
  const response = await api.get(`/opie/api/v1/agents/${id}/instructions/`);
  return response as Agent;
};

interface StreamChatRequest {
  agent_id: string;
  message: string;
  session_id: string;
}

export const getAgentStreamChat = async (message: string, agentId: string, sessionId: string) => {
  const response = await api.post('/opie/api/v1/chat/stream/', {
    agent_id: agentId,
    message,
    session_id: sessionId,
  });
  return response.data;
};

export const createStreamChatMessage = (message: string, agentId: string, sessionId: string): StreamChatRequest => {
  return {
    agent_id: agentId,
    message,
    session_id: sessionId,
  };
};

export const parseStreamData = (data: string): StreamChatResponse | null => {
  if (data === '[DONE]') return null;
  
  try {
    const parsed = JSON.parse(data);
    return parsed as StreamChatResponse;
  } catch (error) {
    console.error('Error parsing stream data:', error);
    return null;
  }
};