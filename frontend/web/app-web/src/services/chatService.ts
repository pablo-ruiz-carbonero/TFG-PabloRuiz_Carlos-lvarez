import { api } from './api';
import { dbService } from './mockDb';
import { Chat, Message } from '../types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true';
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const chatService = {
  getChats: async (userId: string): Promise<Chat[]> => {
    if (USE_MOCK) {
      await delay(400);
      return dbService.getChats(userId);
    } else {
      return api.get(`/chats/user/${userId}`);
    }
  },

  sendMessage: async (senderId: string, receiverId: string, content: string): Promise<Message> => {
    if (USE_MOCK) {
      await delay(200);
      return dbService.sendMessage(senderId, receiverId, content);
    } else {
      return api.post('/chats/messages', { senderId, receiverId, content });
    }
  },

  markAsRead: async (chatId: string, currentUserId: string): Promise<void> => {
    if (USE_MOCK) {
      dbService.markAsRead(chatId, currentUserId);
      return;
    } else {
      return api.put(`/chats/${chatId}/read`, { userId: currentUserId });
    }
  }
};
