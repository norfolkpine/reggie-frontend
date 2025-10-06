import { api } from '@/lib/api-client';
import { AgentInstruction } from '../types/api';

export const getInstructions = async () => {
  const response = await api.get('/opie/api/v1/instructions/');
  return response as AgentInstruction[];
};

export const getInstruction = async (id: number) => {
  const response = await api.get(`/opie/api/v1/instructions/${id}/`);
  return response as AgentInstruction;
};

export const createInstruction = async (instruction: Omit<Partial<AgentInstruction>, 'id' | 'created_at' | 'updated_at'>) => {
  const response = await api.post('/opie/api/v1/instructions/', instruction);
  return response as AgentInstruction;
};

export const updateInstruction = async (id: number, instruction: Omit<AgentInstruction, 'id' | 'created_at' | 'updated_at'>) => {
  const response = await api.put(`/opie/api/v1/instructions/${id}/`, instruction);
  return response as AgentInstruction;
};

export const patchInstruction = async (id: number, instruction: Partial<AgentInstruction>) => {
  const response = await api.post(`/opie/api/v1/instructions/${id}/`, instruction);
  return response as AgentInstruction;
};

export const deleteInstruction = async (id: number) => {
  await api.delete(`/opie/api/v1/instructions/${id}/`);
};