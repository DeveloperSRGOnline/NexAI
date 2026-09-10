import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useChatStore = create(
  devtools(
    (set) => ({
      chats: [],
      activeChatId: null,
      messages: [],
      isStreaming: false,
      error: null,

      setChats: (chats) => set({ chats }),
      setActiveChatId: (activeChatId) => set({ activeChatId }),
      setMessages: (messages) => set({ messages }),
      addMessage: (message) => set((s) => ({ messages: [...s.messages, message] })),
      setStreaming: (isStreaming) => set({ isStreaming }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    { name: 'chat-store' }
  )
);

export default useChatStore;
