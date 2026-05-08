// src/services/chatService.ts
// ─────────────────────────────────────────────────────────────────────────────
// Mock local. Cuando el backend NestJS esté listo, sustituye cada método por
// una llamada fetch/axios a tu API REST o WebSocket.
// ─────────────────────────────────────────────────────────────────────────────
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ChatConversation, ChatMessage } from "../types/chat";

const CONV_KEY = "agrolink_conversations";
const MSG_PREFIX = "agrolink_messages_";

// ── Seed de conversaciones de ejemplo ────────────────────────────────────────
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

// ── Helpers de storage ────────────────────────────────────────────────────────
const loadConversations = async (): Promise<ChatConversation[]> => {
  try {
    const raw = await AsyncStorage.getItem(CONV_KEY);
    if (raw) return JSON.parse(raw);
    // Primera carga: seed
    await AsyncStorage.setItem(CONV_KEY, JSON.stringify(SEED_CONVERSATIONS));
    return SEED_CONVERSATIONS;
  } catch {
    return SEED_CONVERSATIONS;
  }
};

const saveConversations = async (convs: ChatConversation[]) => {
  await AsyncStorage.setItem(CONV_KEY, JSON.stringify(convs));
};

const loadMessages = async (convId: string): Promise<ChatMessage[]> => {
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

const saveMessages = async (convId: string, msgs: ChatMessage[]) => {
  await AsyncStorage.setItem(MSG_PREFIX + convId, JSON.stringify(msgs));
};

// ── API pública ───────────────────────────────────────────────────────────────
export const chatService = {
  // TODO (NestJS): GET /conversations
  async getConversations(): Promise<ChatConversation[]> {
    await new Promise((r) => setTimeout(r, 300));
    return loadConversations();
  },

  // TODO (NestJS): GET /conversations/:id/messages
  async getMessages(convId: string): Promise<ChatMessage[]> {
    await new Promise((r) => setTimeout(r, 200));
    return loadMessages(convId);
  },

  // TODO (NestJS): POST /conversations/:id/messages  (o WebSocket emit)
  async sendMessage(convId: string, text: string): Promise<ChatMessage> {
    const msgs = await loadMessages(convId);
    const newMsg: ChatMessage = {
      id: `m_${Date.now()}`,
      senderId: "me",
      text,
      timestamp: new Date().toISOString(),
      read: true,
    };
    await saveMessages(convId, [...msgs, newMsg]);

    // Actualizar último mensaje en la conversación
    const convs = await loadConversations();
    const idx = convs.findIndex((c) => c.id === convId);
    if (idx !== -1) {
      convs[idx].lastMessage = text;
      convs[idx].lastMessageTime = new Date().toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      });
      convs[idx].unreadCount = 0;
      await saveConversations(convs);
    }
    return newMsg;
  },

  // TODO (NestJS): POST /conversations  { participantId }
  async getOrCreateConversation(
    participantId: string,
    participantName: string,
    participantInitials: string,
  ): Promise<ChatConversation> {
    const convs = await loadConversations();
    const existing = convs.find((c) => c.participantId === participantId);
    if (existing) return existing;

    const newConv: ChatConversation = {
      id: `conv_${Date.now()}`,
      participantId,
      participantName,
      participantInitials,
      lastMessage: "",
      lastMessageTime: "",
      unreadCount: 0,
      online: false,
    };
    await saveConversations([newConv, ...convs]);
    return newConv;
  },

  // TODO (NestJS): PATCH /conversations/:id/read
  async markAsRead(convId: string): Promise<void> {
    const convs = await loadConversations();
    const idx = convs.findIndex((c) => c.id === convId);
    if (idx !== -1) {
      convs[idx].unreadCount = 0;
      await saveConversations(convs);
    }
    const msgs = await loadMessages(convId);
    const updated = msgs.map((m) => ({ ...m, read: true }));
    await saveMessages(convId, updated);
  },
};
