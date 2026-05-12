import { io } from 'socket.io-client';
import { useChatStore } from '../store/chatStore';
import toast from 'react-hot-toast';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(token) {
    if (this.socket?.connected) return;

    this.socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket']
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('new-message', (data) => {
      const { messages, addMessage, updateChat } = useChatStore.getState();
      const { message, chatId } = data;

      addMessage(chatId, message);
      updateChat(chatId, {
        lastMessage: message,
        lastMessageAt: message.createdAt
      });

      // Show notification if not in active chat
      if (useChatStore.getState().activeChat?._id !== chatId) {
        toast.success(`New message from ${message.senderId.displayName}`);
      }
    });

    this.socket.on('chat-updated', (data) => {
      const { updateChat } = useChatStore.getState();
      updateChat(data.chatId, data);
    });

    this.socket.on('user-typing', (data) => {
      const { setTyping } = useChatStore.getState();
      setTyping(data.chatId, data.userId, data.isTyping);
    });

    this.socket.on('messages-read', (data) => {
      // Handle read receipts
      console.log('Messages read:', data);
    });

    this.socket.on('user-online', (data) => {
      const { setUserOnline } = useChatStore.getState();
      setUserOnline(data.userId, true);
    });

    this.socket.on('user-offline', (data) => {
      const { setUserOnline } = useChatStore.getState();
      setUserOnline(data.userId, false);
    });

    this.socket.on('error', (error) => {
      toast.error(error.message || 'Socket error');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  sendMessage(chatId, content, type = 'text', replyTo = null) {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    this.socket.emit('send-message', {
      chatId,
      content,
      type,
      replyTo
    });
  }

  typing(chatId, isTyping) {
    if (this.socket?.connected) {
      this.socket.emit('typing', { chatId, isTyping });
    }
  }

  markAsRead(chatId) {
    if (this.socket?.connected) {
      this.socket.emit('mark-read', { chatId });
    }
  }

  joinChat(chatId) {
    if (this.socket?.connected) {
      this.socket.emit('join-chat', chatId);
    }
  }

  leaveChat(chatId) {
    if (this.socket?.connected) {
      this.socket.emit('leave-chat', chatId);
    }
  }
}

export const socketService = new SocketService();

