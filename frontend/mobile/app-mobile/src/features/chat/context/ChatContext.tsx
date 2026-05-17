// src/features/chat/context/ChatContext.tsx

import React, { createContext, useState, useCallback } from "react";
import { ChatConversation, ChatMessage, CreateConversationDto } from "../types/chat.types";
import {
  loadConversations,
  saveConversations,
  loadMessages,
  saveMessages,
} from "../utils/chatStorage";
import {
  getConversationsRequest,
  getMessagesRequest,
  sendMessageRequest,
  getOrCreateConversationRequest,
  markAsReadRequest,
} from "../api/chatApi";

const MY_ID = "me";
const isDev = () => __DEV__ && !process.env.EXPO_PUBLIC_API_URL?.includes("http");

// ─────────────────────────────────────────────────────────────────────────────

interface ChatContextType {
  conversations: ChatConversation[];
  loadingConversations: boolean;
  fetchConversations: () => Promise<void>;
  getMessages: (convId: string) => Promise<ChatMessage[]>;
  sendMessage: (convId: string, text: string) => Promise<ChatMessage>;
  markAsRead: (convId: string) => Promise<void>;
  getOrCreateConversation: (dto: CreateConversationDto) => Promise<ChatConversation>;
  updateConversationLastMessage: (convId: string, text: string) => void;
}

export const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(false);

  const fetchConversations = useCallback(async () => {
    setLoadingConversations(true);
    try {
      const data = isDev()
        ? await loadConversations()
        : await getConversationsRequest();
      setConversations(data);
    } catch {
      // silencioso — si falla no rompe la app
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  const getMessages = async (convId: string): Promise<ChatMessage[]> => {
    if (isDev()) return loadMessages(convId);
    return getMessagesRequest(convId);
  };

  const sendMessage = async (
    convId: string,
    text: string
  ): Promise<ChatMessage> => {
    if (isDev()) {
      const msgs = await loadMessages(convId);
      const newMsg: ChatMessage = {
        id: `m_${Date.now()}`,
        senderId: MY_ID,
        text,
        timestamp: new Date().toISOString(),
        read: true,
      };
      await saveMessages(convId, [...msgs, newMsg]);
      updateConversationLastMessage(convId, text);
      return newMsg;
    }

    const newMsg = await sendMessageRequest(convId, text);
    updateConversationLastMessage(convId, text);
    return newMsg;
  };

  const markAsRead = async (convId: string): Promise<void> => {
    if (isDev()) {
      const convs = await loadConversations();
      const updated = convs.map((c) =>
        c.id === convId ? { ...c, unreadCount: 0 } : c
      );
      await saveConversations(updated);
      setConversations(updated);

      const msgs = await loadMessages(convId);
      await saveMessages(convId, msgs.map((m) => ({ ...m, read: true })));
      return;
    }
    await markAsReadRequest(convId);
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, unreadCount: 0 } : c))
    );
  };

  const getOrCreateConversation = async (
    dto: CreateConversationDto
  ): Promise<ChatConversation> => {
    if (isDev()) {
      const convs = await loadConversations();
      const existing = convs.find((c) => c.participantId === dto.participantId);
      if (existing) return existing;

      const newConv: ChatConversation = {
        id: `conv_${Date.now()}`,
        participantId: dto.participantId,
        participantName: dto.participantName,
        participantInitials: dto.participantInitials,
        lastMessage: "",
        lastMessageTime: "",
        unreadCount: 0,
        online: false,
      };
      const updated = [newConv, ...convs];
      await saveConversations(updated);
      setConversations(updated);
      return newConv;
    }

    return getOrCreateConversationRequest(dto);
  };

  // Actualiza el último mensaje en la lista sin refetch
  const updateConversationLastMessage = (convId: string, text: string) => {
    const time = new Date().toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? { ...c, lastMessage: text, lastMessageTime: time, unreadCount: 0 }
          : c
      )
    );
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        loadingConversations,
        fetchConversations,
        getMessages,
        sendMessage,
        markAsRead,
        getOrCreateConversation,
        updateConversationLastMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};