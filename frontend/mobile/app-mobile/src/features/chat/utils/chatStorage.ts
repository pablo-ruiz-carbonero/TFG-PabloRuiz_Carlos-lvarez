// src/features/chat/utils/chatStorage.ts
// Mock local con AsyncStorage — mismo comportamiento que el chatService original.
// Cuando el backend esté listo, ChatContext dejará de llamar aquí y usará chatApi.ts.

import AsyncStorage from "@react-native-async-storage/async-storage";
import { ChatConversation, ChatMessage } from "../types/chat.types";

const CONV_KEY = "agrolink_conversations";
const MSG_PREFIX = "agrolink_messages_";

// ─── Seed de conversaciones ───────────────────────────────────────────────────

const SEED_CONVERSATIONS: ChatConversation[] = [
  {
    id: "conv_1",
    participantId: "s1",
    participantName: "AgroMar",
    participantInitials: "AM",
    lastMessage: "¿Cuántos kg necesitas?",
    lastMessageTime: "10:30",
    unreadCount: 2,
    online: true,
  },
  {
    id: "conv_2",
    participantId: "s2",
    participantName: "CampoVerde",
    participantInitials: "CV",
    lastMessage: "Perfecto, te lo envío mañana.",
    lastMessageTime: "Ayer",
    unreadCount: 0,
    online: false,
  },
  {
    id: "conv_3",
    participantId: "u3",
    participantName: "Juan López",
    participantInitials: "JL",
    lastMessage: "Gracias por la consulta",
    lastMessageTime: "Lun",
    unreadCount: 0,
    online: false,
  },
];

const SEED_MESSAGES: Record<string, ChatMessage[]> = {
  conv_1: [
    {
      id: "m1",
      senderId: "s1",
      text: "Hola, ¿en qué puedo ayudarte?",
      timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
      read: true,
    },
    {
      id: "m2",
      senderId: "me",
      text: "Me interesa la semilla de tomate",
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      read: true,
    },
    {
      id: "m3",
      senderId: "s1",
      text: "¿Cuántos kg necesitas?",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: false,
    },
    {
      id: "m4",
      senderId: "me",
      text: "Unos 10 kg. ¿Precio en cantidad?",
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      read: true,
    },
    {
      id: "m5",
      senderId: "s1",
      text: "Sí, a partir de 5 kg te hago un descuento",
      timestamp: new Date(Date.now() - 900000).toISOString(),
      read: false,
    },
  ],
  conv_2: [
    {
      id: "m6",
      senderId: "me",
      text: "Buenos días, ¿tienen fertilizante NPK?",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      read: true,
    },
    {
      id: "m7",
      senderId: "s2",
      text: "Perfecto, te lo envío mañana.",
      timestamp: new Date(Date.now() - 82800000).toISOString(),
      read: true,
    },
  ],
  conv_3: [
    {
      id: "m8",
      senderId: "u3",
      text: "Gracias por la consulta",
      timestamp: new Date(Date.now() - 86400000 * 4).toISOString(),
      read: true,
    },
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const loadConversations = async (): Promise<ChatConversation[]> => {
  try {
    const raw = await AsyncStorage.getItem(CONV_KEY);
    if (raw) return JSON.parse(raw);
    await AsyncStorage.setItem(CONV_KEY, JSON.stringify(SEED_CONVERSATIONS));
    return SEED_CONVERSATIONS;
  } catch {
    return SEED_CONVERSATIONS;
  }
};

export const saveConversations = async (convs: ChatConversation[]) => {
  await AsyncStorage.setItem(CONV_KEY, JSON.stringify(convs));
};

export const loadMessages = async (convId: string): Promise<ChatMessage[]> => {
  try {
    const raw = await AsyncStorage.getItem(MSG_PREFIX + convId);
    if (raw) return JSON.parse(raw);
    const seed = SEED_MESSAGES[convId] ?? [];
    await AsyncStorage.setItem(MSG_PREFIX + convId, JSON.stringify(seed));
    return seed;
  } catch {
    return SEED_MESSAGES[convId] ?? [];
  }
};

export const saveMessages = async (convId: string, msgs: ChatMessage[]) => {
  await AsyncStorage.setItem(MSG_PREFIX + convId, JSON.stringify(msgs));
};