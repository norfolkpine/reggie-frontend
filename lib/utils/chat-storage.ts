interface ChatState {
  id: string;
  agentCode: string | null;
}

const CHAT_STORAGE_KEY = 'selected_chat_state';

export const chatStorage = {
  getSelectedChat: (): ChatState | null => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(CHAT_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  setSelectedChat: (chatState: ChatState): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chatState));
  },

  clearSelectedChat: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(CHAT_STORAGE_KEY);
  },
}; 