import { api } from '@/lib/api-client';
import { AgentTemplateResponse } from '@/types/api';

export const getAgentTemplates = async (): Promise<AgentTemplateResponse> => {
  const response = await api.get('/opie/api/v1/templates/');
  return response as AgentTemplateResponse;
}