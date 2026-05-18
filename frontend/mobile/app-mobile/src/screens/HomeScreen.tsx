// src/screens/HomeScreen.tsx

import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, NavigationProp } from "@react-navigation/native";

import PerfilMenu from "../components/PerfilMenu";
import WeatherCard from "../components/WeatherCard";
import { colors, shared, spacing, font, radius } from "../styles/Globaltheme";
import { RootStackParamList } from "../types/navigation";

import { useAuth } from "../features/auth/hooks/useAuth";
import { useCrops } from "../features/crops/hooks/useCrops";
import { useChat } from "../features/chat/hooks/useChat";

type Nav = NavigationProp<RootStackParamList>;

const TASK_ICON: Record<string, string> = {
  Riego: "💧",
  Siembra: "🌱",
  Fertilización: "🧪",
  Cosecha: "🌾",
};

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();

  const { user } = useAuth();
  const { crops, fetchCrops } = useCrops();
  const { conversations, fetchConversations } = useChat();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    fetchCrops();
    fetchConversations();
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const activeCrops = crops.filter((c) => c.status === "active");
  const pendingTasksTotal = crops.reduce((acc, c) => acc + c.tasksCount, 0);
  const unreadMessages = conversations.reduce(
    (acc, c) => acc + c.unreadCount,
    0,
  );

  const recentActivity = crops
    .filter((c) => c.tasksCount > 0)
    .slice(0, 3)
    .map((c) => ({
      id: c.id,
      icon: "📋",
      title: `${c.tasksCount} tarea${c.tasksCount > 1 ? "s" : ""} pendiente${c.tasksCount > 1 ? "s" : ""}`,
      subtitle: `${c.name} · ${c.currentPhase}`,
      screen: "DetailCorpScreen" as const,
      params: { cropId: c.id },
    }));

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Buenos días" : hour < 20 ? "Buenas tardes" : "Buenas noches";

  const firstName =
    user?.name?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "agricultor";

  const dateStr = new Date()
    .toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })
    .replace(/^\w/, (c) => c.toUpperCase());

  const anim = { opacity: fadeAnim, transform: [{ translateY: slideAnim }] };

  return (
    <SafeAreaView style={shared.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>
            {greeting}, {firstName} 👋
          </Text>
          <Text style={styles.date}>{dateStr}</Text>
        </View>
        <PerfilMenu />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Clima */}
        <Animated.View style={anim}>
          <WeatherCard />
        </Animated.View>

        {/* Stats rápidos */}
        <Animated.View style={[shared.card, styles.statsCard, anim]}>
          <Text style={shared.sectionTitle}>Resumen de hoy</Text>
          <View style={styles.statsRow}>
            <StatBox
              value={activeCrops.length}
              label="Cultivos activos"
              icon="🌿"
              color={colors.primary}
              onPress={() =>
                navigation.navigate("BottomNav", { screen: "Crops" })
              }
            />
            <StatBox
              value={pendingTasksTotal}
              label="Tareas pendientes"
              icon="📋"
              color={pendingTasksTotal > 0 ? colors.warning : colors.primary}
              onPress={() =>
                navigation.navigate("BottomNav", { screen: "Crops" })
              }
            />
            <StatBox
              value={unreadMessages}
              label="Mensajes nuevos"
              icon="💬"
              color={unreadMessages > 0 ? colors.info : colors.primary}
              onPress={() =>
                navigation.navigate("BottomNav", { screen: "Chats" })
              }
            />
          </View>
        </Animated.View>

        {/* Accesos rápidos */}
        <Animated.View style={[shared.card, anim]}>
          <Text style={shared.sectionTitle}>Accesos rápidos</Text>
          <View style={styles.quickRow}>
            <QuickAction
              icon="🌱"
              label="Nuevo cultivo"
              onPress={() => navigation.navigate("NewCorpScreen")}
            />
            <QuickAction
              icon="🛒"
              label="Mercado"
              onPress={() =>
                navigation.navigate("BottomNav", { screen: "MarketPlace" })
              }
            />
            <QuickAction
              icon="☁️"
              label="Clima"
              onPress={() => navigation.navigate("WeatherScreen")}
            />
            <QuickAction
              icon="📦"
              label="Mis anuncios"
              onPress={() => navigation.navigate("MyListingsScreen")}
            />
          </View>
        </Animated.View>

        {/* Actividad reciente */}
        <Animated.View style={[shared.card, anim]}>
          <View style={styles.sectionHeader}>
            <Text style={shared.sectionTitle}>Actividad reciente</Text>
            <Pressable
              onPress={() =>
                navigation.navigate("BottomNav", { screen: "Crops" })
              }
            >
              <Text style={styles.seeAll}>Ver todo →</Text>
            </Pressable>
          </View>

          {recentActivity.length === 0 ? (
            <View style={styles.emptyActivity}>
              <Text style={styles.emptyActivityIcon}>🎉</Text>
              <Text style={styles.emptyActivityText}>
                Sin tareas pendientes
              </Text>
              <Text style={styles.emptyActivitySub}>Todo al día por hoy</Text>
            </View>
          ) : (
            recentActivity.map((item) => (
              <Pressable
                key={item.id}
                style={({ pressed }) => [
                  styles.activityItem,
                  pressed && { opacity: 0.8 },
                ]}
                onPress={() => navigation.navigate(item.screen, item.params)}
              >
                <View style={styles.activityDot}>
                  <Text style={styles.activityDotIcon}>{item.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.activityTitle}>{item.title}</Text>
                  <Text style={styles.activitySubtitle}>{item.subtitle}</Text>
                </View>
                <Text style={styles.activityArrow}>→</Text>
              </Pressable>
            ))
          )}
        </Animated.View>

        {/* Cultivos activos */}
        {activeCrops.length > 0 && (
          <Animated.View style={[shared.card, anim]}>
            <View style={styles.sectionHeader}>
              <Text style={shared.sectionTitle}>Mis cultivos</Text>
              <Pressable
                onPress={() =>
                  navigation.navigate("BottomNav", { screen: "Crops" })
                }
              >
                <Text style={styles.seeAll}>Ver todos →</Text>
              </Pressable>
            </View>

            {activeCrops.slice(0, 3).map((crop) => (
              <Pressable
                key={crop.id}
                style={({ pressed }) => [
                  styles.cropRow,
                  pressed && { opacity: 0.8 },
                ]}
                onPress={() =>
                  navigation.navigate("DetailCorpScreen", { cropId: crop.id })
                }
              >
                <View style={styles.cropIcon}>
                  <Text style={{ fontSize: 20 }}>🌿</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cropName}>{crop.name}</Text>
                  <Text style={styles.cropMeta}>
                    {crop.variety} · {crop.currentPhase}
                  </Text>
                </View>
                <View
                  style={[
                    styles.phaseBadge,
                    { backgroundColor: colors.primaryDim },
                  ]}
                >
                  <Text
                    style={[styles.phaseBadgeText, { color: colors.primary }]}
                  >
                    {crop.daysOld}d
                  </Text>
                </View>
              </Pressable>
            ))}
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatBox({
  value,
  label,
  icon,
  color,
  onPress,
}: {
  value: number;
  label: string;
  icon: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.statBox, pressed && { opacity: 0.8 }]}
      onPress={onPress}
    >
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Pressable>
  );
}

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.quickAction, pressed && { opacity: 0.8 }]}
      onPress={onPress}
    >
      <View style={styles.quickActionIcon}>
        <Text style={{ fontSize: 22 }}>{icon}</Text>
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </Pressable>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  greeting: { fontSize: font.xl, fontWeight: "800", color: colors.textPrimary },
  date: { marginTop: spacing.xs, color: colors.textSecond, fontSize: font.sm },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
    paddingTop: spacing.md,
  },
  statsCard: { marginBottom: spacing.md },
  statsRow: { flexDirection: "row", gap: spacing.sm },
  statBox: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: "center",
    gap: spacing.xs,
  },
  statIcon: { fontSize: 20 },
  statValue: { fontSize: font.xxl, fontWeight: "800" },
  statLabel: {
    fontSize: font.xs,
    color: colors.textMuted,
    fontWeight: "600",
    textAlign: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  seeAll: { fontSize: font.sm, color: colors.primary, fontWeight: "600" },
  quickRow: { flexDirection: "row", justifyContent: "space-between" },
  quickAction: { alignItems: "center", gap: spacing.sm, flex: 1 },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryDim,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionLabel: {
    fontSize: font.xs,
    color: colors.textSecond,
    fontWeight: "600",
    textAlign: "center",
  },
  emptyActivity: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  emptyActivityIcon: { fontSize: 36 },
  emptyActivityText: {
    fontSize: font.md,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  emptyActivitySub: { fontSize: font.sm, color: colors.textMuted },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  activityDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryDim,
    alignItems: "center",
    justifyContent: "center",
  },
  activityDotIcon: { fontSize: 16 },
  activityTitle: {
    fontSize: font.sm,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  activitySubtitle: {
    fontSize: font.xs,
    color: colors.textSecond,
    marginTop: 2,
  },
  activityArrow: { color: colors.textMuted, fontSize: font.md },
  cropRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cropIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primaryDim,
    alignItems: "center",
    justifyContent: "center",
  },
  cropName: { fontSize: font.sm, fontWeight: "700", color: colors.textPrimary },
  cropMeta: { fontSize: font.xs, color: colors.textSecond, marginTop: 2 },
  phaseBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  phaseBadgeText: { fontSize: font.xs, fontWeight: "700" },
});
