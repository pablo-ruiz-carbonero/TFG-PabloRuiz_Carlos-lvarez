// src/screens/CropsScreen.tsx

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useNavigation,
  useFocusEffect,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { colors, shared, spacing, font, radius } from "../../styles/Globaltheme";
import { RootStackParamList } from "../../types/navigation";
import { Crop } from "../../features/crops/types/crops.types";
import { useCrops } from "../../features/crops/hooks/useCrops";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function CropsScreen() {
  const navigation = useNavigation<Nav>();
  const { crops, loading, error, fetchCrops } = useCrops();
  const [query, setQuery] = useState("");

  useFocusEffect(
    useCallback(() => {
      fetchCrops();
    }, []),
  );

  const filtered = query.trim()
    ? crops.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.variety.toLowerCase().includes(query.toLowerCase()),
      )
    : crops;

  const renderCard = ({ item }: { item: Crop }) => {
    const seedDate = new Date(item.seedDate).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    });

    return (
      <Pressable
        style={({ pressed }) => [styles.card, pressed && { opacity: 0.8 }]}
        onPress={() =>
          navigation.navigate("DetailCropScreen", { cropId: item.id })
        }
      >
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cropName}>{item.name}</Text>
            <Text style={styles.cropVariety}>{item.variety}</Text>
          </View>
          <View style={styles.phaseBadge}>
            <Text style={styles.phaseBadgeText}>{item.currentPhase}</Text>
          </View>
        </View>

        <View style={styles.cardStats}>
          <StatItem label="Siembra" value={seedDate} />
          <StatItem label="Edad" value={`${item.daysOld}d`} />
          <StatItem
            label="Tareas"
            value={String(item.tasksCount)}
            alert={item.tasksCount > 0}
          />
          <StatItem label="Parcela" value={item.parcelName} truncate />
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.footerDetail}>
            {item.surfaceArea} ha · {item.cropType}
          </Text>
          {item.tasksCount > 0 ? (
            <View style={styles.pendingPill}>
              <Text style={styles.pendingPillText}>
                {item.tasksCount} pendiente{item.tasksCount > 1 ? "s" : ""}
              </Text>
            </View>
          ) : (
            <Text style={styles.footerAction}>Ver detalles →</Text>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={shared.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Cultivos</Text>
        <Pressable
          style={({ pressed }) => [styles.btnNew, pressed && { opacity: 0.8 }]}
          onPress={() => navigation.navigate("NewCropScreen")}
        >
          <Text style={styles.btnNewText}>+ Nuevo</Text>
        </Pressable>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Buscar cultivo..."
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryBtn} onPress={fetchCrops}>
            <Text style={styles.retryBtnText}>Reintentar</Text>
          </Pressable>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>
            {query ? "Sin resultados" : "No hay cultivos aún"}
          </Text>
          {!query && (
            <Pressable
              style={styles.btnCreate}
              onPress={() => navigation.navigate("NewCropScreen")}
            >
              <Text style={styles.btnCreateText}>Crear primer cultivo</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderCard}
          contentContainerStyle={{ paddingBottom: spacing.xl }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

function StatItem({
  label,
  value,
  alert,
  truncate,
}: {
  label: string;
  value: string;
  alert?: boolean;
  truncate?: boolean;
}) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text
        style={[styles.statValue, alert && styles.statValueAlert]}
        numberOfLines={truncate ? 1 : undefined}
      >
        {value}
      </Text>
    </View>
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
  title: { fontSize: font.xl, fontWeight: "800", color: colors.textPrimary },
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
    marginBottom: 0,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  cropName: { fontSize: font.lg, fontWeight: "700", color: colors.textPrimary },
  cropVariety: {
    fontSize: font.sm,
    color: colors.textSecond,
    marginTop: spacing.xs,
  },
  phaseBadge: {
    backgroundColor: colors.primaryDim,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  phaseBadgeText: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: font.xs,
  },
  cardStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  statLabel: { fontSize: font.xs, color: colors.textMuted, fontWeight: "600" },
  statValue: {
    fontSize: font.md,
    color: colors.textPrimary,
    fontWeight: "700",
    marginTop: spacing.xs,
  },
  statValueAlert: { color: colors.warning },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerDetail: { fontSize: font.xs, color: colors.textSecond },
  footerAction: { color: colors.primary, fontWeight: "600", fontSize: font.sm },
  pendingPill: {
    backgroundColor: colors.warningDim,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  pendingPillText: {
    color: colors.warning,
    fontSize: font.xs,
    fontWeight: "700",
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: {
    fontSize: font.md,
    color: colors.error,
    marginBottom: spacing.lg,
  },
  emptyText: {
    fontSize: font.md,
    color: colors.textSecond,
    marginBottom: spacing.lg,
  },
  retryBtn: {
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  retryBtnText: { color: colors.primary, fontWeight: "600" },
  btnCreate: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  btnCreateText: { color: colors.white, fontWeight: "700", fontSize: font.md },
});