// src/features/chat/types/chat.types.ts
// ✅ Fuente única — elimina src/types/chat.ts

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string; // ISO
  read: boolean;
}

export interface ChatConversation {
  id: string;
  participantId: string;
  participantName: string;
  participantInitials: string;
  lastMessage: string;
  lastMessageTime: string; // "10:30" | "Ayer" | "Lun"
  unreadCount: number;
  online: boolean;
}

export interface SendMessageDto {
  conversationId: string;
  text: string;
}

export interface CreateConversationDto {
  participantId: string;
  participantName: string;
  participantInitials: string;
}