// src/screens/crops/DetailCropScreen.tsx

import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useRoute,
  RouteProp,
  useNavigation,
  NavigationProp,
  useFocusEffect,
} from "@react-navigation/native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  colors,
  shared,
  spacing,
  font,
  radius,
} from "../../styles/Globaltheme";
import { RootStackParamList } from "../../types/navigation";
import {
  Task,
  TaskType,
  CropPhase,
} from "../../features/crops/types/crops.types";
import { useCropDetail } from "../../features/crops/hooks/useCropDetail";
import { useCrops } from "../../features/crops/hooks/useCrops";

type RouteP = RouteProp<RootStackParamList, "DetailCropScreen">;
type Nav = NavigationProp<RootStackParamList>;

type TaskIconName =
  | React.ComponentProps<typeof MaterialIcons>["name"]
  | React.ComponentProps<typeof MaterialCommunityIcons>["name"];

const TASK_ICON: Record<TaskType, { lib: "mi" | "mci"; name: string }> = {
  Siembra: { lib: "mci", name: "sprout" },
  Riego: { lib: "mi", name: "water-drop" },
  Fertilización: { lib: "mci", name: "flask-outline" },
  Cosecha: { lib: "mci", name: "corn" },
};

// Fases en orden de ciclo de vida
const PHASES: CropPhase[] = [
  "Plántula",
  "Crecimiento",
  "Floración",
  "Maduración",
  "Cosecha",
];

const PHASE_COLOR: Record<CropPhase, string> = {
  Plántula: "#4ade80",
  Crecimiento: "#22c55e",
  Floración: "#f59e0b",
  Maduración: "#ef4444",
  Cosecha: "#6366f1",
};

const fmt = (iso?: string, opts?: Intl.DateTimeFormatOptions) =>
  iso ? new Date(iso).toLocaleDateString("es-ES", opts) : "No definida";

function TaskIconComponent({
  type,
  size = 14,
}: {
  type: TaskType;
  size?: number;
}) {
  const def = TASK_ICON[type];
  if (!def)
    return (
      <MaterialIcons name="push-pin" size={size} color={colors.textSecond} />
    );
  if (def.lib === "mci") {
    return (
      <MaterialCommunityIcons
        name={
          def.name as React.ComponentProps<
            typeof MaterialCommunityIcons
          >["name"]
        }
        size={size}
        color={colors.textSecond}
      />
    );
  }
  return (
    <MaterialIcons
      name={def.name as React.ComponentProps<typeof MaterialIcons>["name"]}
      size={size}
      color={colors.textSecond}
    />
  );
}

export default function DetailCropScreen() {
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

  const { updateCrop } = useCrops();
  const [showPhaseModal, setShowPhaseModal] = useState(false);

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

  const handleChangePhase = async (phase: CropPhase) => {
    setShowPhaseModal(false);
    if (!crop || crop.currentPhase === phase) return;
    try {
      await updateCrop(cropId, { currentPhase: phase });
    } catch {
      Alert.alert("Error", "No se pudo cambiar la fase.");
    }
  };

  // Navega a NewTask con tipo pre-seleccionado
  const goToNewTask = (preselect?: TaskType) => {
    navigation.navigate("NewTask", { cropId, preselect });
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

  const phaseIndex = PHASES.indexOf(crop.currentPhase);

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
          {/* Fase — toca para cambiarla */}
          <Pressable
            style={[
              styles.phaseBadge,
              { backgroundColor: PHASE_COLOR[crop.currentPhase] + "22" },
            ]}
            onPress={() => setShowPhaseModal(true)}
          >
            <Text
              style={[
                styles.phaseBadgeText,
                { color: PHASE_COLOR[crop.currentPhase] },
              ]}
            >
              {crop.currentPhase}{" "}
              <MaterialIcons
                name="edit"
                size={12}
                color={PHASE_COLOR[crop.currentPhase]}
              />
            </Text>
          </Pressable>
        </View>

        {/* Title card */}
        <View style={[shared.card, styles.titleCard]}>
          <Text style={styles.cropName}>{crop.name}</Text>
          <Text style={styles.cropVariety}>{crop.variety}</Text>
          <View style={styles.typeTag}>
            <Text style={styles.typeTagText}>{crop.cropType}</Text>
          </View>
        </View>

        {/* Barra de progreso de fase */}
        <View style={[shared.card, styles.phaseProgress]}>
          <Text style={styles.phaseProgressTitle}>Progreso del ciclo</Text>
          <View style={styles.phaseTrack}>
            {PHASES.map((p, idx) => (
              <View key={p} style={styles.phaseStepWrapper}>
                <Pressable
                  style={[
                    styles.phaseStep,
                    idx <= phaseIndex && {
                      backgroundColor: PHASE_COLOR[p],
                      borderColor: PHASE_COLOR[p],
                    },
                  ]}
                  onPress={() => setShowPhaseModal(true)}
                >
                  {idx < phaseIndex && (
                    <Text style={styles.phaseStepTick}>✓</Text>
                  )}
                  {idx === phaseIndex && <View style={styles.phaseStepDot} />}
                </Pressable>
                <Text
                  style={[
                    styles.phaseStepLabel,
                    idx === phaseIndex && {
                      color: PHASE_COLOR[p],
                      fontWeight: "700",
                    },
                  ]}
                  numberOfLines={1}
                >
                  {p}
                </Text>
              </View>
            ))}
          </View>
          <Text style={styles.phaseHint}>Toca la fase para cambiarla</Text>
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
        <Section
          title="Fechas"
          titleIcon={
            <MaterialIcons
              name="calendar-today"
              size={16}
              color={colors.textSecond}
            />
          }
        >
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
          title="Tareas pendientes"
          titleIcon={
            <MaterialIcons
              name="assignment"
              size={16}
              color={colors.textSecond}
            />
          }
          action={
            <Pressable style={styles.btnAddTask} onPress={() => goToNewTask()}>
              <Text style={styles.btnAddTaskText}>+ Nueva</Text>
            </Pressable>
          }
        >
          {pendingTasks.length === 0 ? (
            <View style={styles.emptyTasks}>
              <MaterialIcons
                name="check-circle-outline"
                size={32}
                color={colors.primary}
              />
              <Text style={styles.emptyTasksText}>Sin tareas pendientes</Text>
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
          <Section
            title={`Completadas (${completedTasks.length})`}
            titleIcon={
              <MaterialIcons
                name="check-circle"
                size={16}
                color={colors.primary}
              />
            }
          >
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
        <Section
          title="Riego"
          titleIcon={
            <MaterialIcons
              name="water-drop"
              size={16}
              color={colors.textSecond}
            />
          }
        >
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
            onPress={() => goToNewTask("Riego")}
          >
            <MaterialIcons
              name="water-drop"
              size={16}
              color={colors.white}
              style={{ marginRight: spacing.xs }}
            />
            <Text style={shared.btnPrimaryText}>Registrar riego</Text>
          </Pressable>
        </Section>

        {/* Fertilization */}
        <Section
          title="Fertilización"
          titleIcon={
            <MaterialCommunityIcons
              name="flask-outline"
              size={16}
              color={colors.textSecond}
            />
          }
        >
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
            onPress={() => goToNewTask("Fertilización")}
          >
            <MaterialCommunityIcons
              name="flask-outline"
              size={16}
              color={colors.white}
              style={{ marginRight: spacing.xs }}
            />
            <Text style={shared.btnPrimaryText}>Registrar fertilización</Text>
          </Pressable>
        </Section>

        {/* Notes */}
        {crop.notes && (
          <Section
            title="Notas"
            titleIcon={
              <MaterialIcons name="notes" size={16} color={colors.textSecond} />
            }
          >
            <Text style={styles.notes}>{crop.notes}</Text>
          </Section>
        )}

        {/* Location */}
        <Section
          title="Parcela"
          titleIcon={
            <MaterialIcons
              name="location-on"
              size={16}
              color={colors.textSecond}
            />
          }
        >
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

      {/* Modal selector de fase */}
      <Modal
        visible={showPhaseModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPhaseModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowPhaseModal(false)}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Cambiar fase del cultivo</Text>
            <Text style={styles.modalSubtitle}>
              Las fases siguen el ciclo natural de la planta. Puedes avanzar o
              retroceder manualmente según lo que observes en el campo.
            </Text>
            {PHASES.map((phase) => (
              <Pressable
                key={phase}
                style={[
                  styles.phaseOption,
                  crop.currentPhase === phase && {
                    backgroundColor: PHASE_COLOR[phase] + "22",
                    borderColor: PHASE_COLOR[phase],
                  },
                ]}
                onPress={() => handleChangePhase(phase)}
              >
                <View
                  style={[
                    styles.phaseOptionDot,
                    { backgroundColor: PHASE_COLOR[phase] },
                  ]}
                />
                <Text
                  style={[
                    styles.phaseOptionText,
                    crop.currentPhase === phase && {
                      color: PHASE_COLOR[phase],
                      fontWeight: "700",
                    },
                  ]}
                >
                  {phase}
                </Text>
                {crop.currentPhase === phase && (
                  <Text
                    style={[
                      styles.phaseOptionCheck,
                      { color: PHASE_COLOR[phase] },
                    ]}
                  >
                    ✓ Actual
                  </Text>
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({
  title,
  titleIcon,
  action,
  children,
}: {
  title: string;
  titleIcon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <View style={[shared.card, styles.section]}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          {titleIcon}
          <Text
            style={[
              shared.sectionTitle,
              { marginLeft: titleIcon ? spacing.xs : 0 },
            ]}
          >
            {title}
          </Text>
        </View>
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
          <TaskIconComponent type={task.type} size={14} />
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
        <MaterialIcons name="close" size={16} color={colors.textMuted} />
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
  },
  phaseBadgeText: {
    fontWeight: "700",
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
  // ── Barra de progreso de fase
  phaseProgress: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  phaseProgressTitle: {
    fontSize: font.sm,
    fontWeight: "700",
    color: colors.textSecond,
    marginBottom: spacing.md,
  },
  phaseTrack: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  phaseStepWrapper: {
    flex: 1,
    alignItems: "center",
    gap: spacing.xs,
  },
  phaseStep: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  phaseStepTick: { color: colors.white, fontSize: 13, fontWeight: "800" },
  phaseStepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.white,
  },
  phaseStepLabel: {
    fontSize: 9,
    color: colors.textMuted,
    textAlign: "center",
    fontWeight: "600",
  },
  phaseHint: {
    fontSize: font.xs,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.sm,
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
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
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
  emptyTasks: {
    paddingVertical: spacing.lg,
    alignItems: "center",
    gap: spacing.sm,
  },
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
  // ── Modal de fase
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  modalTitle: {
    fontSize: font.lg,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  modalSubtitle: {
    fontSize: font.sm,
    color: colors.textSecond,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  phaseOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  phaseOptionDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  phaseOptionText: {
    flex: 1,
    fontSize: font.md,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  phaseOptionCheck: {
    fontSize: font.xs,
    fontWeight: "700",
  },
});
