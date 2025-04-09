import { api } from '@/lib/api-client';

export interface ChatSession {
  session_id: string;
  title: string;
  agent_id: string;
  created_at: string;
  updated_at: string;
}

interface PaginatedChatSessionList {
  count: number;
  next: string | null;
  previous: string | null;
  results: ChatSession[];
}

// ✅ Get paginated list of chat sessions
export const getChatSessions = async (page: number = 1): Promise<PaginatedChatSessionList> => {
  const response = await api.get('/reggie/api/v1/chat-sessions/', {
    params: { page: page.toString() },
  });
  return response.data as PaginatedChatSessionList;
};

// ✅ Get a single session by ID
export const getChatSession = async (sessionId: string): Promise<ChatSession> => {
  const response = await api.get(`/reggie/api/v1/chat-sessions/${sessionId}/`);
  return response.data as ChatSession;
};

export const createChatSession = async (session: { title: string; agent_id: string }): Promise<ChatSession> => {
  try {
    const response = await api.post('/reggie/api/v1/chat-sessions/', session);
    console.log("✅ createChatSession response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ createChatSession error:", error.response?.data || error.message);
    throw error;
  }
};


// ✅ Replace a session entirely
export const updateChatSession = async (
  sessionId: string,
  session: { title: string; agent_id: string }
): Promise<ChatSession> => {
  const response = await api.put(`/reggie/api/v1/chat-sessions/${sessionId}/`, session);
  return response.data as ChatSession;
};

// ✅ Partially update a session
export const patchChatSession = async (
  sessionId: string,
  session: Partial<{ title: string; agent_id: string }>
): Promise<ChatSession> => {
  const response = await api.patch(`/reggie/api/v1/chat-sessions/${sessionId}/`, session);
  return response.data as ChatSession;
};

// ✅ Delete a session
export const deleteChatSession = async (sessionId: string): Promise<void> => {
  await api.delete(`/reggie/api/v1/chat-sessions/${sessionId}/`);
};
