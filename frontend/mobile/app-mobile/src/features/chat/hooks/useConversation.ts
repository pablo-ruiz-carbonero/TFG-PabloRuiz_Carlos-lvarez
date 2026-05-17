// src/features/chat/hooks/useConversation.ts
// Encapsula toda la lógica de una conversación concreta (ChatScreen)

import { useState, useCallback, useRef } from "react";
import { FlatList } from "react-native";
import { ChatMessage } from "../types/chat.types";
import { useChat } from "./useChat";

export const useConversation = (conversationId: string) => {
  const { getMessages, sendMessage, markAsRead } = useChat();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [inputText, setInputText] = useState("");
  const listRef = useRef<FlatList>(null);

  const scrollToEnd = (animated = false) => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated }), 80);
  };

  const loadMessages = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMessages(conversationId);
      setMessages(data);
      scrollToEnd(false);
    } finally {
      setLoading(false);
    }
    await markAsRead(conversationId);
  }, [conversationId]);

  const send = async () => {
    const text = inputText.trim();
    if (!text || sending) return;

    setInputText("");
    setSending(true);
    try {
      const newMsg = await sendMessage(conversationId, text);
      setMessages((prev) => [...prev, newMsg]);
      scrollToEnd(true);
    } finally {
      setSending(false);
    }
  };

  return {
    messages,
    loading,
    sending,
    inputText,
    setInputText,
    listRef,
    loadMessages,
    send,
  };
};