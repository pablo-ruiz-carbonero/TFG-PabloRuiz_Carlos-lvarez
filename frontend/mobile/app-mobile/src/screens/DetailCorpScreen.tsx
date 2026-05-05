// src/screens/DetailCorpScreen.tsx
import React, { useEffect, useState, useCallback } from "react";
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
import { colors, shared, spacing, font, radius } from "../styles/theme";
import { RootStackParamList } from "../types/navigation";
import { Crop } from "../types/crops";
import { Task } from "../types/tasks";
import { cropsService } from "../services/cropsService";
import { tasksService } from "../services/tasksService";

type DetailCorpScreenRouteProp = RouteProp<
  RootStackParamList,
  "DetailCorpScreen"
>;
type NavigationProp_DetailCrop = NavigationProp<RootStackParamList>;

const TASK_EMOJI: Record<string, string> = {
  Siembra: "🌱",
  Riego: "💧",
  Fertilización: "🧪",
  Cosecha: "🌾",
};

export default function DetailCorpScreen() {
  const route = useRoute<DetailCorpScreenRouteProp>();
  const navigation = useNavigation<NavigationProp_DetailCrop>();
  const { cropId } = route.params;

  const [crop, setCrop] = useState<Crop | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cropData, taskData] = await Promise.all([
        cropsService.getCropById(cropId),
        tasksService.getTasksByCrop(cropId),
      ]);
      setCrop(cropData);
      setTasks(taskData);
    } catch (error) {
      Alert.alert("Error", "No se pudo cargar el cultivo");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  // Recargar cada vez que la pantalla vuelve al foco (tras crear tarea)
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [cropId]),
  );

  const handleToggleTask = async (taskId: string) => {
    try {
      const updated = await tasksService.toggleStatus(taskId);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    } catch {
      Alert.alert("Error", "No se pudo actualizar la tarea");
    }
  };

  const handleDeleteTask = (taskId: string) => {
    Alert.alert("Eliminar tarea", "¿Eliminar esta tarea?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await tasksService.deleteTask(taskId);
            setTasks((prev) => prev.filter((t) => t.id !== taskId));
          } catch {
            Alert.alert("Error", "No se pudo eliminar la tarea");
          }
        },
      },
    ]);
  };

  const handleDelete = () => {
    Alert.alert(
      "Eliminar cultivo",
      "¿Estás seguro de que deseas eliminar este cultivo?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await cropsService.deleteCrop(cropId);
              Alert.alert("Éxito", "Cultivo eliminado", [
                {
                  text: "OK",
                  onPress: () => navigation.navigate("CropsScreen"),
                },
              ]);
            } catch {
              Alert.alert("Error", "No se pudo eliminar el cultivo");
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={shared.screen}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!crop) {
    return (
      <SafeAreaView style={shared.screen}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Cultivo no encontrado</Text>
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

  const seedDateFormatted = new Date(crop.seedDate).toLocaleDateString(
    "es-ES",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  );

  const harvestDateFormatted = crop.expectedHarvest
    ? new Date(crop.expectedHarvest).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "No definida";

  const lastWateringFormatted = crop.lastWatering
    ? new Date(crop.lastWatering).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Nunca";

  const pendingTasks = tasks.filter((t) => t.status === "pendiente");
  const completedTasks = tasks.filter((t) => t.status === "completada");

  return (
    <SafeAreaView style={shared.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Volver</Text>
          </Pressable>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{crop.currentPhase}</Text>
          </View>
        </View>

        {/* Title Card */}
        <View style={[shared.card, styles.titleCard]}>
          <Text style={styles.cropName}>{crop.name}</Text>
          <Text style={styles.cropVariety}>{crop.variety}</Text>
          <View style={styles.typeTag}>
            <Text style={styles.typeTagText}>{crop.cropType}</Text>
          </View>
        </View>

        {/* Key Info Grid */}
        <View style={styles.infoGrid}>
          <View style={[shared.card, styles.infoBox]}>
            <Text style={styles.infoBoxLabel}>Edad</Text>
            <Text style={styles.infoBoxValue}>{crop.daysOld || 0}</Text>
            <Text style={styles.infoBoxSubtitle}>días</Text>
          </View>
          <View style={[shared.card, styles.infoBox]}>
            <Text style={styles.infoBoxLabel}>Tareas</Text>
            <Text
              style={[
                styles.infoBoxValue,
                pendingTasks.length > 0 && styles.infoBoxValueAlert,
              ]}
            >
              {pendingTasks.length}
            </Text>
            <Text style={styles.infoBoxSubtitle}>pendientes</Text>
          </View>
          <View style={[shared.card, styles.infoBox]}>
            <Text style={styles.infoBoxLabel}>Superficie</Text>
            <Text style={styles.infoBoxValue}>{crop.surfaceArea}</Text>
            <Text style={styles.infoBoxSubtitle}>ha</Text>
          </View>
        </View>

        {/* Dates Section */}
        <View style={[shared.card, styles.section]}>
          <Text style={shared.sectionTitle}>📅 Fechas importantes</Text>
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Fecha de siembra</Text>
            <Text style={styles.dateValue}>{seedDateFormatted}</Text>
          </View>
          <View style={[styles.dateItem, styles.dateItemBorder]}>
            <Text style={styles.dateLabel}>Cosecha esperada</Text>
            <Text style={styles.dateValue}>{harvestDateFormatted}</Text>
          </View>
        </View>

        {/* ── TAREAS PENDIENTES ── */}
        <View style={[shared.card, styles.section]}>
          <View style={styles.sectionHeader}>
            <Text style={shared.sectionTitle}>📋 Tareas pendientes</Text>
            <Pressable
              style={styles.btnAddTask}
              onPress={() => navigation.navigate("NewTask", { cropId })}
            >
              <Text style={styles.btnAddTaskText}>+ Nueva tarea</Text>
            </Pressable>
          </View>

          {pendingTasks.length === 0 ? (
            <View style={styles.emptyTasks}>
              <Text style={styles.emptyTasksText}>
                Sin tareas pendientes 🎉
              </Text>
              <Text style={styles.emptyTasksSubtext}>
                Añade una tarea para hacer seguimiento de tu cultivo
              </Text>
            </View>
          ) : (
            pendingTasks.map((task) => (
              <View key={task.id} style={styles.taskItem}>
                <Pressable
                  style={styles.taskCheckbox}
                  onPress={() => handleToggleTask(task.id)}
                >
                  <View style={styles.checkboxEmpty} />
                </Pressable>
                <View style={styles.taskContent}>
                  <View style={styles.taskHeader}>
                    <Text style={styles.taskEmoji}>
                      {TASK_EMOJI[task.type] ?? "📌"}
                    </Text>
                    <Text style={styles.taskType}>{task.type}</Text>
                    <Text style={styles.taskDate}>
                      {task.date}
                      {task.time ? ` · ${task.time}` : ""}
                    </Text>
                  </View>
                  {task.description ? (
                    <Text style={styles.taskDescription}>
                      {task.description}
                    </Text>
                  ) : null}
                  {task.quantity ? (
                    <Text style={styles.taskQuantity}>
                      {task.quantity} {task.unit}
                    </Text>
                  ) : null}
                </View>
                <Pressable
                  style={styles.taskDelete}
                  onPress={() => handleDeleteTask(task.id)}
                  hitSlop={8}
                >
                  <Text style={styles.taskDeleteText}>✕</Text>
                </Pressable>
              </View>
            ))
          )}
        </View>

        {/* ── TAREAS COMPLETADAS ── */}
        {completedTasks.length > 0 && (
          <View style={[shared.card, styles.section]}>
            <Text style={shared.sectionTitle}>
              ✅ Completadas ({completedTasks.length})
            </Text>
            {completedTasks.map((task) => (
              <View
                key={task.id}
                style={[styles.taskItem, styles.taskItemDone]}
              >
                <Pressable
                  style={styles.taskCheckbox}
                  onPress={() => handleToggleTask(task.id)}
                >
                  <View style={styles.checkboxFilled}>
                    <Text style={styles.checkboxTick}>✓</Text>
                  </View>
                </Pressable>
                <View style={styles.taskContent}>
                  <View style={styles.taskHeader}>
                    <Text style={styles.taskEmoji}>
                      {TASK_EMOJI[task.type] ?? "📌"}
                    </Text>
                    <Text style={[styles.taskType, styles.taskTypeDone]}>
                      {task.type}
                    </Text>
                    <Text style={styles.taskDate}>{task.date}</Text>
                  </View>
                  {task.description ? (
                    <Text
                      style={[
                        styles.taskDescription,
                        styles.taskDescriptionDone,
                      ]}
                    >
                      {task.description}
                    </Text>
                  ) : null}
                </View>
                <Pressable
                  style={styles.taskDelete}
                  onPress={() => handleDeleteTask(task.id)}
                  hitSlop={8}
                >
                  <Text style={styles.taskDeleteText}>✕</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {/* Watering Section */}
        <View style={[shared.card, styles.section]}>
          <Text style={shared.sectionTitle}>💧 Riego</Text>
          <View style={styles.wateringItem}>
            <View>
              <Text style={styles.dateLabel}>Último riego</Text>
              <Text style={styles.dateValue}>{lastWateringFormatted}</Text>
            </View>
            {crop.irrigationDays && (
              <View style={styles.wateringBadge}>
                <Text style={styles.wateringBadgeText}>
                  Cada {crop.irrigationDays}d
                </Text>
              </View>
            )}
          </View>
          <Pressable
            style={[shared.btnPrimary, styles.actionButton]}
            onPress={() => navigation.navigate("NewTask", { cropId })}
          >
            <Text style={shared.btnPrimaryText}>Registrar riego</Text>
          </Pressable>
        </View>

        {/* Fertilization Section */}
        <View style={[shared.card, styles.section]}>
          <Text style={shared.sectionTitle}>🌱 Fertilización</Text>
          <View style={styles.wateringItem}>
            <View>
              <Text style={styles.dateLabel}>Última fertilización</Text>
              <Text style={styles.dateValue}>
                {crop.lastFertilization
                  ? new Date(crop.lastFertilization).toLocaleDateString(
                      "es-ES",
                      {
                        day: "numeric",
                        month: "short",
                      },
                    )
                  : "Nunca"}
              </Text>
            </View>
            {crop.fertilizationDays && (
              <View style={styles.wateringBadge}>
                <Text style={styles.wateringBadgeText}>
                  Cada {crop.fertilizationDays}d
                </Text>
              </View>
            )}
          </View>
          <Pressable
            style={[shared.btnPrimary, styles.actionButton]}
            onPress={() => navigation.navigate("NewTask", { cropId })}
          >
            <Text style={shared.btnPrimaryText}>Registrar fertilización</Text>
          </Pressable>
        </View>

        {/* Expected Production */}
        {crop.expectedProduction && (
          <View style={[shared.card, styles.section]}>
            <Text style={shared.sectionTitle}>📊 Producción esperada</Text>
            <Text style={styles.productionValue}>
              {crop.expectedProduction} kg
            </Text>
          </View>
        )}

        {/* Notes */}
        {crop.notes && (
          <View style={[shared.card, styles.section]}>
            <Text style={shared.sectionTitle}>📝 Notas</Text>
            <Text style={styles.notesText}>{crop.notes}</Text>
          </View>
        )}

        {/* Location */}
        <View style={[shared.card, styles.section]}>
          <Text style={shared.sectionTitle}>📍 Ubicación</Text>
          <Text style={styles.locationValue}>
            {crop.parcelName || crop.parcelId}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
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
            onPress={handleDelete}
          >
            <Text style={styles.btnDangerText}>Eliminar</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: spacing.xl },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: {
    fontSize: font.md,
    color: colors.textSecond,
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  backButton: { color: colors.primary, fontSize: font.md, fontWeight: "600" },
  headerBadge: {
    backgroundColor: colors.primaryDim,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  headerBadgeText: {
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
  infoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  infoBox: { flex: 1, alignItems: "center", paddingVertical: spacing.md },
  infoBoxLabel: {
    fontSize: font.xs,
    color: colors.textMuted,
    fontWeight: "600",
  },
  infoBoxValue: {
    fontSize: font.xxl,
    fontWeight: "800",
    color: colors.primary,
    marginVertical: spacing.xs,
  },
  infoBoxValueAlert: { color: colors.warning },
  infoBoxSubtitle: { fontSize: font.xs, color: colors.textSecond },
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
  dateItem: { paddingVertical: spacing.md },
  dateItemBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  dateLabel: { fontSize: font.sm, color: colors.textSecond, fontWeight: "600" },
  dateValue: {
    fontSize: font.lg,
    color: colors.textPrimary,
    fontWeight: "700",
    marginTop: spacing.xs,
  },
  wateringItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  wateringBadge: {
    backgroundColor: colors.primaryDim,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  wateringBadgeText: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: font.sm,
  },
  actionButton: { marginTop: spacing.md },
  productionValue: {
    fontSize: font.xxxl,
    fontWeight: "800",
    color: colors.primary,
    marginTop: spacing.sm,
  },
  notesText: {
    color: colors.textSecond,
    fontSize: font.md,
    lineHeight: 24,
    marginTop: spacing.sm,
  },
  locationValue: {
    fontSize: font.lg,
    color: colors.textPrimary,
    fontWeight: "600",
    marginTop: spacing.sm,
  },
  actionButtonsContainer: {
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
    backgroundColor: "#FF6B6B",
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
  },
  btnDangerText: { color: colors.white, fontWeight: "600", fontSize: font.md },

  // Task items
  emptyTasks: { paddingVertical: spacing.lg, alignItems: "center" },
  emptyTasksText: {
    fontSize: font.md,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  emptyTasksSubtext: {
    fontSize: font.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  taskItemDone: { opacity: 0.6 },
  taskCheckbox: { paddingTop: 2 },
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
  taskContent: { flex: 1 },
  taskHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    flexWrap: "wrap",
  },
  taskEmoji: { fontSize: 14 },
  taskType: { fontSize: font.sm, fontWeight: "700", color: colors.textPrimary },
  taskTypeDone: { textDecorationLine: "line-through", color: colors.textMuted },
  taskDate: { fontSize: font.xs, color: colors.textMuted, marginLeft: "auto" },
  taskDescription: {
    fontSize: font.sm,
    color: colors.textSecond,
    marginTop: spacing.xs,
  },
  taskDescriptionDone: { textDecorationLine: "line-through" },
  taskQuantity: {
    fontSize: font.xs,
    color: colors.primary,
    fontWeight: "600",
    marginTop: spacing.xs,
  },
  taskDelete: { paddingLeft: spacing.sm },
  taskDeleteText: { color: colors.textMuted, fontSize: font.sm },
});
