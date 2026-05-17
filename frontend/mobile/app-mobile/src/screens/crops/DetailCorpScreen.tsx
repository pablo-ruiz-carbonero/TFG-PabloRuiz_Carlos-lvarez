// src/screens/DetailCorpScreen.tsx

import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useRoute,
  RouteProp,
  useNavigation,
  NavigationProp,
  useFocusEffect,
} from "@react-navigation/native";
import { colors, shared, spacing, font, radius } from "../../styles/Globaltheme";
import { RootStackParamList } from "../../types/navigation";
import { Task, TaskType } from "../../features/crops/types/crops.types";
import { useCropDetail } from "../../features/crops/hooks/useCropDetail";

type RouteP = RouteProp<RootStackParamList, "DetailCorpScreen">;
type Nav = NavigationProp<RootStackParamList>;

const TASK_ICON: Record<TaskType, string> = {
  Siembra: "🌱",
  Riego: "💧",
  Fertilización: "🧪",
  Cosecha: "🌾",
};

const fmt = (iso?: string, opts?: Intl.DateTimeFormatOptions) =>
  iso ? new Date(iso).toLocaleDateString("es-ES", opts) : "No definida";

export default function DetailCorpScreen() {
  const route = useRoute<RouteP>();
  const navigation = useNavigation<Nav>();
  const { cropId } = route.params;

  const {
    crop,
    pendingTasks,
    completedTasks,
    loading,
    error,
    loadDetail,
    toggleTask,
    removeTask,
    removeCrop,
  } = useCropDetail(cropId);

  useFocusEffect(
    useCallback(() => {
      loadDetail();
    }, [cropId]),
  );

  const handleDeleteTask = (taskId: string) => {
    Alert.alert("Eliminar tarea", "¿Eliminar esta tarea?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => removeTask(taskId),
      },
    ]);
  };

  const handleDeleteCrop = () => {
    Alert.alert(
      "Eliminar cultivo",
      "¿Seguro que quieres eliminar este cultivo?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            await removeCrop();
            navigation.goBack();
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={shared.screen}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !crop) {
    return (
      <SafeAreaView style={shared.screen}>
        <View style={styles.center}>
          <Text style={styles.errorText}>
            {error ?? "Cultivo no encontrado"}
          </Text>
          <Pressable
            style={shared.btnPrimary}
            onPress={() => navigation.goBack()}
          >
            <Text style={shared.btnPrimaryText}>Volver</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={shared.screen}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>← Volver</Text>
          </Pressable>
          <View style={styles.phaseBadge}>
            <Text style={styles.phaseBadgeText}>{crop.currentPhase}</Text>
          </View>
        </View>

        {/* Title card */}
        <View style={[shared.card, styles.titleCard]}>
          <Text style={styles.cropName}>{crop.name}</Text>
          <Text style={styles.cropVariety}>{crop.variety}</Text>
          <View style={styles.typeTag}>
            <Text style={styles.typeTagText}>{crop.cropType}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatBox label="Edad" value={`${crop.daysOld}`} unit="días" />
          <StatBox
            label="Pendientes"
            value={`${pendingTasks.length}`}
            unit="tareas"
            alert={pendingTasks.length > 0}
          />
          <StatBox label="Superficie" value={`${crop.surfaceArea}`} unit="ha" />
        </View>

        {/* Dates */}
        <Section title="📅 Fechas">
          <DateRow
            label="Siembra"
            value={fmt(crop.seedDate, {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          />
          <DateRow
            label="Cosecha esperada"
            value={fmt(crop.expectedHarvest, {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            border
          />
        </Section>

        {/* Pending tasks */}
        <Section
          title="📋 Tareas pendientes"
          action={
            <Pressable
              style={styles.btnAddTask}
              onPress={() => navigation.navigate("NewTask", { cropId })}
            >
              <Text style={styles.btnAddTaskText}>+ Nueva</Text>
            </Pressable>
          }
        >
          {pendingTasks.length === 0 ? (
            <View style={styles.emptyTasks}>
              <Text style={styles.emptyTasksText}>
                Sin tareas pendientes 🎉
              </Text>
              <Text style={styles.emptyTasksSub}>
                Añade una para hacer seguimiento
              </Text>
            </View>
          ) : (
            pendingTasks.map((t) => (
              <TaskRow
                key={t.id}
                task={t}
                onToggle={() => toggleTask(t.id)}
                onDelete={() => handleDeleteTask(t.id)}
              />
            ))
          )}
        </Section>

        {/* Completed tasks */}
        {completedTasks.length > 0 && (
          <Section title={`✅ Completadas (${completedTasks.length})`}>
            {completedTasks.map((t) => (
              <TaskRow
                key={t.id}
                task={t}
                done
                onToggle={() => toggleTask(t.id)}
                onDelete={() => handleDeleteTask(t.id)}
              />
            ))}
          </Section>
        )}

        {/* Watering */}
        <Section title="💧 Riego">
          <View style={styles.infoRow}>
            <View>
              <Text style={styles.infoLabel}>Último riego</Text>
              <Text style={styles.infoValue}>
                {fmt(crop.lastWatering, { day: "numeric", month: "short" })}
              </Text>
            </View>
            {crop.irrigationDays && (
              <View style={styles.infoBadge}>
                <Text style={styles.infoBadgeText}>
                  Cada {crop.irrigationDays}d
                </Text>
              </View>
            )}
          </View>
          <Pressable
            style={[shared.btnPrimary, { marginTop: spacing.md }]}
            onPress={() => navigation.navigate("NewTask", { cropId })}
          >
            <Text style={shared.btnPrimaryText}>Registrar riego</Text>
          </Pressable>
        </Section>

        {/* Fertilization */}
        <Section title="🌱 Fertilización">
          <View style={styles.infoRow}>
            <View>
              <Text style={styles.infoLabel}>Última fertilización</Text>
              <Text style={styles.infoValue}>
                {fmt(crop.lastFertilization, {
                  day: "numeric",
                  month: "short",
                })}
              </Text>
            </View>
            {crop.fertilizationDays && (
              <View style={styles.infoBadge}>
                <Text style={styles.infoBadgeText}>
                  Cada {crop.fertilizationDays}d
                </Text>
              </View>
            )}
          </View>
          <Pressable
            style={[shared.btnPrimary, { marginTop: spacing.md }]}
            onPress={() => navigation.navigate("NewTask", { cropId })}
          >
            <Text style={shared.btnPrimaryText}>Registrar fertilización</Text>
          </Pressable>
        </Section>

        {/* Notes */}
        {crop.notes && (
          <Section title="📝 Notas">
            <Text style={styles.notes}>{crop.notes}</Text>
          </Section>
        )}

        {/* Location */}
        <Section title="📍 Parcela">
          <Text style={styles.infoValue}>{crop.parcelName}</Text>
        </Section>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [
              styles.btnSecondary,
              pressed && { opacity: 0.8 },
            ]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.btnSecondaryText}>Volver</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.btnDanger,
              pressed && { opacity: 0.8 },
            ]}
            onPress={handleDeleteCrop}
          >
            <Text style={styles.btnDangerText}>Eliminar</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <View style={[shared.card, styles.section]}>
      <View style={styles.sectionHeader}>
        <Text style={shared.sectionTitle}>{title}</Text>
        {action}
      </View>
      {children}
    </View>
  );
}

function StatBox({
  label,
  value,
  unit,
  alert,
}: {
  label: string;
  value: string;
  unit: string;
  alert?: boolean;
}) {
  return (
    <View style={[shared.card, styles.statBox]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, alert && styles.statValueAlert]}>
        {value}
      </Text>
      <Text style={styles.statUnit}>{unit}</Text>
    </View>
  );
}

function DateRow({
  label,
  value,
  border,
}: {
  label: string;
  value: string;
  border?: boolean;
}) {
  return (
    <View style={[styles.dateRow, border && styles.dateRowBorder]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function TaskRow({
  task,
  done,
  onToggle,
  onDelete,
}: {
  task: Task;
  done?: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <View style={[styles.taskRow, done && styles.taskRowDone]}>
      <Pressable style={styles.checkbox} onPress={onToggle}>
        {done ? (
          <View style={styles.checkboxFilled}>
            <Text style={styles.checkboxTick}>✓</Text>
          </View>
        ) : (
          <View style={styles.checkboxEmpty} />
        )}
      </Pressable>

      <View style={{ flex: 1 }}>
        <View style={styles.taskMeta}>
          <Text style={styles.taskIcon}>{TASK_ICON[task.type] ?? "📌"}</Text>
          <Text style={[styles.taskType, done && styles.taskTypeDone]}>
            {task.type}
          </Text>
          <Text style={styles.taskDate}>
            {task.date}
            {task.time ? ` · ${task.time}` : ""}
          </Text>
        </View>
        {task.description ? (
          <Text style={[styles.taskDesc, done && styles.taskDescDone]}>
            {task.description}
          </Text>
        ) : null}
        {task.quantity ? (
          <Text style={styles.taskQty}>
            {task.quantity} {task.unit}
          </Text>
        ) : null}
      </View>

      <Pressable onPress={onDelete} hitSlop={8}>
        <Text style={styles.deleteBtn}>✕</Text>
      </Pressable>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: {
    fontSize: font.md,
    color: colors.error,
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  backBtn: { color: colors.primary, fontSize: font.md, fontWeight: "600" },
  phaseBadge: {
    backgroundColor: colors.primaryDim,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  phaseBadgeText: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: font.sm,
  },
  titleCard: { marginHorizontal: spacing.lg, marginBottom: spacing.lg },
  cropName: {
    fontSize: font.xxxl,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  cropVariety: {
    fontSize: font.lg,
    color: colors.textSecond,
    marginTop: spacing.xs,
  },
  typeTag: {
    backgroundColor: colors.surface,
    alignSelf: "flex-start",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeTagText: {
    color: colors.textPrimary,
    fontWeight: "600",
    fontSize: font.sm,
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.md,
    marginBottom: 0,
  },
  statLabel: { fontSize: font.xs, color: colors.textMuted, fontWeight: "600" },
  statValue: {
    fontSize: font.xxl,
    fontWeight: "800",
    color: colors.primary,
    marginVertical: spacing.xs,
  },
  statValueAlert: { color: colors.warning },
  statUnit: { fontSize: font.xs, color: colors.textSecond },
  section: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  btnAddTask: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.md,
  },
  btnAddTaskText: { color: colors.white, fontSize: font.xs, fontWeight: "700" },
  dateRow: { paddingVertical: spacing.md },
  dateRowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  infoLabel: { fontSize: font.sm, color: colors.textSecond, fontWeight: "600" },
  infoValue: {
    fontSize: font.lg,
    color: colors.textPrimary,
    fontWeight: "700",
    marginTop: spacing.xs,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  infoBadge: {
    backgroundColor: colors.primaryDim,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  infoBadgeText: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: font.sm,
  },
  notes: {
    color: colors.textSecond,
    fontSize: font.md,
    lineHeight: 24,
    marginTop: spacing.sm,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  btnSecondary: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
  },
  btnSecondaryText: {
    color: colors.textPrimary,
    fontWeight: "600",
    fontSize: font.md,
  },
  btnDanger: {
    flex: 1,
    backgroundColor: colors.error,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
  },
  btnDangerText: { color: colors.white, fontWeight: "600", fontSize: font.md },
  emptyTasks: { paddingVertical: spacing.lg, alignItems: "center" },
  emptyTasksText: {
    fontSize: font.md,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  emptyTasksSub: {
    fontSize: font.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  taskRowDone: { opacity: 0.6 },
  checkbox: { paddingTop: 2 },
  checkboxEmpty: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  checkboxFilled: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxTick: { color: colors.white, fontSize: 11, fontWeight: "800" },
  taskMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    flexWrap: "wrap",
  },
  taskIcon: { fontSize: 14 },
  taskType: { fontSize: font.sm, fontWeight: "700", color: colors.textPrimary },
  taskTypeDone: { textDecorationLine: "line-through", color: colors.textMuted },
  taskDate: { fontSize: font.xs, color: colors.textMuted, marginLeft: "auto" },
  taskDesc: {
    fontSize: font.sm,
    color: colors.textSecond,
    marginTop: spacing.xs,
  },
  taskDescDone: { textDecorationLine: "line-through" },
  taskQty: {
    fontSize: font.xs,
    color: colors.primary,
    fontWeight: "600",
    marginTop: spacing.xs,
  },
  deleteBtn: {
    color: colors.textMuted,
    fontSize: font.sm,
    paddingLeft: spacing.sm,
  },
});
