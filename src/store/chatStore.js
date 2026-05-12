import { create } from 'zustand';

export const useChatStore = create((set, get) => ({
  chats: [],
  activeChat: null,
  messages: {},
  typingUsers: {},
  onlineUsers: new Set(),
  
  setChats: (chats) => set({ chats }),
  addChat: (chat) => set((state) => ({
    chats: [chat, ...state.chats.filter(c => c._id !== chat._id)]
  })),
  updateChat: (chatId, updates) => set((state) => ({
    chats: state.chats.map(chat =>
      chat._id === chatId ? { ...chat, ...updates } : chat
    )
  })),
  setActiveChat: (chat) => set({ activeChat: chat }),
  setMessages: (chatId, messages) => set((state) => ({
    messages: { ...state.messages, [chatId]: messages }
  })),
  addMessage: (chatId, message) => set((state) => {
    const existingMessages = state.messages[chatId] || [];
    // Check if message already exists to prevent duplicates
    const messageExists = existingMessages.some(
      msg => msg._id === message._id || 
      (msg._id?.toString() === message._id?.toString())
    );
    
    if (messageExists) {
      return state; // Don't add duplicate
    }
    
    return {
      messages: {
        ...state.messages,
        [chatId]: [...existingMessages, message]
      }
    };
  }),
  setTyping: (chatId, userId, isTyping) => set((state) => ({
    typingUsers: {
      ...state.typingUsers,
      [chatId]: isTyping ? userId : null
    }
  })),
  setUserOnline: (userId, isOnline) => set((state) => {
    const onlineUsers = new Set(state.onlineUsers);
    if (isOnline) {
      onlineUsers.add(userId);
    } else {
      onlineUsers.delete(userId);
    }
    return { onlineUsers };
  })
}));

