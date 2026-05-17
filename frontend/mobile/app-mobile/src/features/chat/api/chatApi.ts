// src/features/chat/api/chatApi.ts
// Capa REST pura — cuando el backend esté listo, quitar el mock de chatStorage
// y descomentar los fetch. WebSocket se añade encima sin tocar esta capa.

import { ChatConversation, ChatMessage, CreateConversationDto } from "../types/chat.types";
import { getToken } from "../../auth/utils/tokenStorage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const authHeaders = async (): Promise<HeadersInit> => {
  const token = await getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `HTTP ${res.status}`);
  }
  return res.json();
};

// ─── Conversations ────────────────────────────────────────────────────────────

export const getConversationsRequest = async (): Promise<ChatConversation[]> => {
  const res = await fetch(`${API_URL}/conversations`, {
    headers: await authHeaders(),
  });
  return handleResponse(res);
};

export const getOrCreateConversationRequest = async (
  dto: CreateConversationDto
): Promise<ChatConversation> => {
  const res = await fetch(`${API_URL}/conversations`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({
      participant_id: dto.participantId,
      participant_name: dto.participantName,
      participant_initials: dto.participantInitials,
    }),
  });
  return handleResponse(res);
};

export const markAsReadRequest = async (conversationId: string): Promise<void> => {
  const res = await fetch(`${API_URL}/conversations/${conversationId}/read`, {
    method: "PATCH",
    headers: await authHeaders(),
  });
  if (!res.ok) console.warn("markAsRead failed silently");
};

// ─── Messages ─────────────────────────────────────────────────────────────────

export const getMessagesRequest = async (
  conversationId: string
): Promise<ChatMessage[]> => {
  const res = await fetch(`${API_URL}/conversations/${conversationId}/messages`, {
    headers: await authHeaders(),
  });
  return handleResponse(res);
};

export const sendMessageRequest = async (
  conversationId: string,
  text: string
): Promise<ChatMessage> => {
  const res = await fetch(
    `${API_URL}/conversations/${conversationId}/messages`,
    {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify({ text }),
    }
  );
  return handleResponse(res);
};