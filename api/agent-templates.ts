import { api } from '@/lib/api-client';
import { AgentTemplateResponse } from '@/types/api';

export const getAgentTemplates = async (): Promise<AgentTemplateResponse> => {
  const response = await api.get('/reggie/api/v1/agent-templates/');
  return response as AgentTemplateResponse;
}