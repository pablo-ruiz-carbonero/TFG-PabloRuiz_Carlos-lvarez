// src/screens/ChatListScreen.tsx
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useNavigation,
  NavigationProp,
  useFocusEffect,
} from "@react-navigation/native";
import { colors, shared, spacing, font, radius } from "../styles/theme";
import { RootStackParamList } from "../types/navigation";
import { ChatConversation } from "../types/chat";
import { chatService } from "../services/chatService";

type Nav = NavigationProp<RootStackParamList>;

function ConversationItem({
  item,
  onPress,
}: {
  item: ChatConversation;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.convItem, pressed && { opacity: 0.8 }]}
      onPress={onPress}
    >
      {/* Avatar */}
      <View style={styles.avatarWrapper}>
        <View style={shared.avatar}>
          <Text style={shared.avatarText}>{item.participantInitials}</Text>
        </View>
        {item.online && <View style={styles.onlineDot} />}
      </View>

      {/* Contenido */}
      <View style={styles.convContent}>
        <View style={styles.convHeader}>
          <Text style={styles.convName} numberOfLines={1}>
            {item.participantName}
          </Text>
          <Text style={styles.convTime}>{item.lastMessageTime}</Text>
        </View>
        <View style={styles.convFooter}>
          <Text
            style={[
              styles.convLastMsg,
              item.unreadCount > 0 && styles.convLastMsgBold,
            ]}
            numberOfLines={1}
          >
            {item.lastMessage || "Nueva conversación"}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

export default function ChatListScreen() {
  const navigation = useNavigation<Nav>();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [filtered, setFiltered] = useState<ChatConversation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadConversations();
    }, []),
  );

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await chatService.getConversations();
      setConversations(data);
      applySearch(data, searchQuery);
    } catch {
      // silencioso
    } finally {
      setLoading(false);
    }
  };

  const applySearch = (data: ChatConversation[], q: string) => {
    if (!q.trim()) {
      setFiltered(data);
      return;
    }
    setFiltered(
      data.filter((c) =>
        c.participantName.toLowerCase().includes(q.toLowerCase()),
      ),
    );
  };

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    applySearch(conversations, q);
  };

  const handleOpenChat = (conv: ChatConversation) => {
    navigation.navigate("ChatScreen", {
      conversationId: conv.id,
      participantName: conv.participantName,
      participantInitials: conv.participantInitials,
      online: conv.online,
    });
  };

  const totalUnread = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  return (
    <SafeAreaView style={shared.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Mensajes</Text>
          {totalUnread > 0 && (
            <View style={styles.totalUnreadBadge}>
              <Text style={styles.totalUnreadText}>{totalUnread}</Text>
            </View>
          )}
        </View>
        <Pressable
          style={({ pressed }) => [styles.btnNew, pressed && { opacity: 0.8 }]}
          onPress={() => navigation.navigate("MarketplaceScreen")}
        >
          <Text style={styles.btnNewText}>+ Nuevo</Text>
        </Pressable>
      </View>

      {/* Buscador */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar conversación..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={handleSearch}
          returnKeyType="search"
        />
      </View>

      {/* Lista */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={styles.emptyText}>No hay conversaciones</Text>
          <Text style={styles.emptySubtext}>
            Contacta con un vendedor desde el Mercado
          </Text>
          <Pressable
            style={styles.btnGoMarket}
            onPress={() => navigation.navigate("MarketplaceScreen")}
          >
            <Text style={styles.btnGoMarketText}>Ir al Mercado</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ConversationItem
              item={item}
              onPress={() => handleOpenChat(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  headerTitle: {
    fontSize: font.xl,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  totalUnreadBadge: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xs,
  },
  totalUnreadText: {
    color: colors.white,
    fontSize: font.xs,
    fontWeight: "700",
  },
  btnNew: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  btnNewText: { color: colors.white, fontWeight: "700", fontSize: font.sm },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  searchInput: {
    ...shared.input,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
  },
  listContent: { paddingBottom: spacing.xxxl },
  convItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
    backgroundColor: colors.surface,
  },
  avatarWrapper: { position: "relative" },
  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: colors.bg,
  },
  convContent: { flex: 1 },
  convHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  convName: {
    fontSize: font.md,
    fontWeight: "700",
    color: colors.textPrimary,
    flex: 1,
  },
  convTime: {
    fontSize: font.xs,
    color: colors.textMuted,
    marginLeft: spacing.sm,
  },
  convFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  convLastMsg: { fontSize: font.sm, color: colors.textSecond, flex: 1 },
  convLastMsgBold: { fontWeight: "700", color: colors.textPrimary },
  unreadBadge: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
    marginLeft: spacing.sm,
  },
  unreadBadgeText: {
    color: colors.white,
    fontSize: font.xs,
    fontWeight: "700",
  },
  separator: { height: 1, backgroundColor: colors.border, marginLeft: 72 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  emptyIcon: { fontSize: 48 },
  emptyText: {
    fontSize: font.lg,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  emptySubtext: {
    fontSize: font.sm,
    color: colors.textSecond,
    textAlign: "center",
    paddingHorizontal: spacing.xl,
  },
  btnGoMarket: {
    backgroundColor: colors.primary,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  btnGoMarketText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: font.md,
  },
});
