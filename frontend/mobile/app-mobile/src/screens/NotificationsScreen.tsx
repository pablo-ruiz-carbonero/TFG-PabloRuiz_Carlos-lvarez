// src/screens/NotificationsScreen.tsx
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  ActivityIndicator,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useNavigation,
  NavigationProp,
  useFocusEffect,
} from "@react-navigation/native";
<<<<<<< HEAD
import { colors, shared, spacing, font, radius } from "../styles/Globaltheme";
=======
import { colors, shared, spacing, font, radius } from "../styles/theme";
>>>>>>> bde9bfa08138ad909d6680ffafd4d5a2bbf04f20
import { RootStackParamList } from "../types/navigation";

type Nav = NavigationProp<RootStackParamList>;

interface Notification {
  id: string;
  type: "tarea" | "clima" | "mensaje" | "sistema";
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const EMOJI: Record<string, string> = {
  tarea: "📋",
  clima: "🌤️",
  mensaje: "💬",
  sistema: "🔔",
};

const BG: Record<string, string> = {
  tarea: "#E8F5E9",
  clima: "#DBEAFE",
  mensaje: "#FEF3C7",
  sistema: "#F3F4F6",
};

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    type: "tarea",
    title: "Tarea pendiente",
    body: "Tienes 3 tareas de riego pendientes para hoy en Tomate Cherry.",
    time: "Hace 5 min",
    read: false,
  },
  {
    id: "n2",
    type: "clima",
    title: "Alerta meteorológica",
    body: "Riesgo de helada esta noche en Almería. T mínima: 2°C.",
    time: "Hace 1 h",
    read: false,
  },
  {
    id: "n3",
    type: "mensaje",
    title: "Nuevo mensaje",
    body: "AgroMar te ha enviado un mensaje: '¿Cuántos kg necesitas?'",
    time: "Hace 2 h",
    read: true,
  },
  {
    id: "n4",
    type: "tarea",
    title: "Cosecha próxima",
    body: "La Sandía Crimson Sweet está lista para cosechar en 15 días.",
    time: "Ayer",
    read: true,
  },
  {
    id: "n5",
    type: "sistema",
    title: "Bienvenido a AgroLink",
    body: "Tu cuenta está configurada. Comienza añadiendo tu primer cultivo.",
    time: "Hace 3 días",
    read: true,
  },
];

interface PrefItem {
  id: string;
  label: string;
  value: boolean;
}

export default function NotificationsScreen() {
  const navigation = useNavigation<Nav>();
  const [notifications, setNotifications] =
    useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [loading] = useState(false);
  const [prefs, setPrefs] = useState<PrefItem[]>([
    { id: "tareas", label: "Tareas y recordatorios", value: true },
    { id: "clima", label: "Alertas meteorológicas", value: true },
    { id: "mensajes", label: "Nuevos mensajes", value: true },
    { id: "mercado", label: "Actividad en el mercado", value: false },
  ]);

  const unread = notifications.filter((n) => !n.read).length;

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const markRead = (id: string) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );

  const togglePref = (id: string) =>
    setPrefs((prev) =>
      prev.map((p) => (p.id === id ? { ...p, value: !p.value } : p)),
    );

  const renderNotif = ({ item }: { item: Notification }) => (
    <Pressable
      style={[styles.notifItem, !item.read && styles.notifItemUnread]}
      onPress={() => markRead(item.id)}
    >
      <View style={[styles.notifIconBox, { backgroundColor: BG[item.type] }]}>
        <Text style={styles.notifIcon}>{EMOJI[item.type]}</Text>
      </View>
      <View style={styles.notifContent}>
        <View style={styles.notifHeader}>
          <Text
            style={[styles.notifTitle, !item.read && styles.notifTitleUnread]}
          >
            {item.title}
          </Text>
          {!item.read && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.notifBody} numberOfLines={2}>
          {item.body}
        </Text>
        <Text style={styles.notifTime}>{item.time}</Text>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={shared.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.backButton}>← Volver</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Notificaciones</Text>
        {unread > 0 ? (
          <Pressable onPress={markAllRead}>
            <Text style={styles.markAllText}>Leídas</Text>
          </Pressable>
        ) : (
          <View style={{ width: 50 }} />
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotif}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <>
            {unread > 0 && (
              <View style={styles.unreadBanner}>
                <Text style={styles.unreadBannerText}>
                  🔔 {unread} notificación{unread > 1 ? "es" : ""} sin leer
                </Text>
              </View>
            )}
            <Text style={styles.sectionLabel}>RECIENTES</Text>
          </>
        }
        ListFooterComponent={
          <View style={[shared.card, styles.prefsCard]}>
            <Text style={styles.prefsTitle}>⚙️ Preferencias</Text>
            {prefs.map((pref) => (
              <View key={pref.id} style={styles.prefRow}>
                <Text style={styles.prefLabel}>{pref.label}</Text>
                <Switch
                  value={pref.value}
                  onValueChange={() => togglePref(pref.id)}
                  trackColor={{
                    false: colors.border,
                    true: colors.primaryLight,
                  }}
                  thumbColor={pref.value ? colors.primary : colors.textMuted}
                />
              </View>
            ))}
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    color: colors.primary,
    fontSize: font.md,
    fontWeight: "600",
    width: 60,
  },
  headerTitle: {
    fontSize: font.lg,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  markAllText: { color: colors.primary, fontWeight: "700", fontSize: font.sm },
  listContent: { paddingBottom: spacing.xxxl },
  unreadBanner: {
    backgroundColor: colors.primaryDim,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  unreadBannerText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: font.sm,
  },
  sectionLabel: {
    fontSize: font.xs,
    fontWeight: "700",
    color: colors.textMuted,
    letterSpacing: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  notifItem: {
    flexDirection: "row",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
  },
  notifItemUnread: { backgroundColor: "#F0FBF0" },
  notifIconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  notifIcon: { fontSize: 20 },
  notifContent: { flex: 1 },
  notifHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: 2,
  },
  notifTitle: {
    fontSize: font.sm,
    fontWeight: "600",
    color: colors.textSecond,
    flex: 1,
  },
  notifTitleUnread: { fontWeight: "800", color: colors.textPrimary },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  notifBody: { fontSize: font.sm, color: colors.textSecond, lineHeight: 20 },
  notifTime: {
    fontSize: font.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  separator: { height: 1, backgroundColor: colors.border },
  prefsCard: { marginHorizontal: spacing.lg, marginTop: spacing.lg },
  prefsTitle: {
    fontSize: font.sm,
    fontWeight: "700",
    color: colors.textSecond,
    marginBottom: spacing.md,
  },
  prefRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
  },
  prefLabel: { fontSize: font.md, color: colors.textPrimary, flex: 1 },
});
