// src/screens/ChatScreen.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useNavigation,
  useRoute,
  RouteProp,
  NavigationProp,
} from "@react-navigation/native";
import { colors, shared, spacing, font, radius } from "../styles/theme";
import { RootStackParamList } from "../types/navigation";
import { ChatMessage } from "../types/chat";
import { chatService } from "../services/chatService";

type RouteP = RouteProp<RootStackParamList, "ChatScreen">;
type Nav = NavigationProp<RootStackParamList>;

const MY_ID = "me";

function formatMsgTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isMe = msg.senderId === MY_ID;
  return (
    <View
      style={[
        styles.bubbleWrapper,
        isMe ? styles.bubbleWrapperMe : styles.bubbleWrapperOther,
      ]}
    >
      <View
        style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}
      >
        <Text
          style={[
            styles.bubbleText,
            isMe ? styles.bubbleTextMe : styles.bubbleTextOther,
          ]}
        >
          {msg.text}
        </Text>
      </View>
      <Text style={[styles.bubbleTime, isMe && { textAlign: "right" }]}>
        {formatMsgTime(msg.timestamp)}
        {isMe && (msg.read ? "  ✓✓" : "  ✓")}
      </Text>
    </View>
  );
}

export default function ChatScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteP>();
  const { conversationId, participantName, participantInitials, online } =
    route.params;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    loadMessages();
    chatService.markAsRead(conversationId);
  }, [conversationId]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await chatService.getMessages(conversationId);
      setMessages(data);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 100);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || sending) return;
    setInputText("");
    setSending(true);
    try {
      const newMsg = await chatService.sendMessage(conversationId, text);
      setMessages((prev) => [...prev, newMsg]);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={shared.screen}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Text style={styles.backButton}>←</Text>
          </Pressable>

          <View style={styles.headerCenter}>
            <View style={styles.headerAvatar}>
              <Text style={styles.headerAvatarText}>{participantInitials}</Text>
            </View>
            <View>
              <Text style={styles.headerName}>{participantName}</Text>
              <Text
                style={[
                  styles.headerStatus,
                  online && styles.headerStatusOnline,
                ]}
              >
                {online ? "● En línea" : "● Desconectado"}
              </Text>
            </View>
          </View>

          <View style={{ width: 40 }} />
        </View>

        {/* Mensajes */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <MessageBubble msg={item} />}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              listRef.current?.scrollToEnd({ animated: false })
            }
          />
        )}

        {/* Input */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            placeholder="Escribe un mensaje..."
            placeholderTextColor={colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />
          <Pressable
            style={({ pressed }) => [
              styles.sendBtn,
              (!inputText.trim() || sending) && styles.sendBtnDisabled,
              pressed && { opacity: 0.8 },
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.sendBtnText}>↑</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    fontSize: font.xl,
    color: colors.primary,
    fontWeight: "600",
    width: 40,
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flex: 1,
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primaryDim,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.primaryLight,
  },
  headerAvatarText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: font.sm,
  },
  headerName: {
    fontSize: font.md,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  headerStatus: { fontSize: font.xs, color: colors.textMuted, marginTop: 1 },
  headerStatusOnline: { color: "#4CAF50" },

  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  messagesList: {
    padding: spacing.lg,
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },

  bubbleWrapper: { maxWidth: "78%", marginVertical: spacing.xs },
  bubbleWrapperMe: { alignSelf: "flex-end" },
  bubbleWrapperOther: { alignSelf: "flex-start" },

  bubble: {
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  bubbleMe: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bubbleOther: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },

  bubbleText: { fontSize: font.md, lineHeight: 22 },
  bubbleTextMe: { color: colors.white },
  bubbleTextOther: { color: colors.textPrimary },

  bubbleTime: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 3,
    paddingHorizontal: spacing.xs,
  },

  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  textInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: font.md,
    color: colors.textPrimary,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: { backgroundColor: colors.border },
  sendBtnText: { color: colors.white, fontSize: font.lg, fontWeight: "800" },
});
