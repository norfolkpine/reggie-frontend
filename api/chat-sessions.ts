import { api } from '@/lib/api-client';

export interface ChatSession {
  session_id: string;
  title: string;
  agent_code: string;
  agent_id: string;
  created_at: string;
  updated_at: string;
}

export type UserFeedbackType = 'good' | 'bad';

export interface Feedback {
  id: string;
  user: string;
  feedback_type: UserFeedbackType;
  feedback_text: string;
  created_at: string;
}

export interface ChatMessage {
  role: string;
  content: string;
  id: string | null;
  timestamp: string | null;
  feedback: Feedback[]; // Array of feedback objects, defaults to []
}

interface PaginatedChatSessionList {
  count: number;
  next: string | null;
  previous: string | null;
  results: ChatSession[];
}

interface PaginatedChatMessageList {
  count: number;
  next: string | null;
  previous: string | null;
  results: ChatMessage[];
}


export const getChatSessions = async (page: number = 1, agentId?: string) => {
  const params: { page: string; agent_id?: string } = { page: page.toString() };
  if (agentId) {
    params.agent_id = agentId;
  }
  const response = await api.get('/reggie/api/v1/chat-sessions/', { params });
  return response as PaginatedChatSessionList;
};

export const getChatSession = async (sessionId: string) => {
  const response = await api.get(`/reggie/api/v1/chat-sessions/${sessionId}/`);
  return response as ChatSession;
};

export const createChatSession = async (session: Omit<Partial<ChatSession>, 'session_id' | 'created_at' | 'updated_at'>) => {
  const response = await api.post('/reggie/api/v1/chat-sessions/', session);
  return response as ChatSession;
};

export const updateChatSession = async (sessionId: string, session: Omit<ChatSession, 'session_id' | 'created_at' | 'updated_at'>) => {
  const response = await api.put(`/reggie/api/v1/chat-sessions/${sessionId}/`, session);
  return response as ChatSession;
};

export const patchChatSession = async (sessionId: string, session: Partial<Omit<ChatSession, 'session_id' | 'created_at' | 'updated_at'>>) => {
  const response = await api.patch(`/reggie/api/v1/chat-sessions/${sessionId}/`, session);
  return response as ChatSession;
};

export const deleteChatSession = async (sessionId: string) => {
  await api.delete(`/reggie/api/v1/chat-sessions/${sessionId}/`);
};

export const getChatSessionMessage = async (sessionId: string) => {
  const response = await api.get(`/reggie/api/v1/chat-sessions/${sessionId}/messages/`);
  return response as PaginatedChatMessageList;
};
