// src/screens/NewTask.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useNavigation,
  useRoute,
  NavigationProp,
  RouteProp,
} from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";

import {
  colors,
  shared,
  spacing,
  font,
  radius,
} from "../../styles/Globaltheme";
import { RootStackParamList } from "../../types/navigation";
import {
  CreateTaskDto,
  TaskType,
} from "../../features/crops/types/crops.types";
import { useCropDetail } from "../../features/crops/hooks/useCropDetail";

type Nav = NavigationProp<RootStackParamList>;
type RouteP = RouteProp<RootStackParamList, "NewTask">;

const TASK_TYPES: { type: TaskType; icon: string; label: string }[] = [
  { type: "Siembra", icon: "🌱", label: "Siembra" },
  { type: "Riego", icon: "💧", label: "Riego" },
  { type: "Fertilización", icon: "🧪", label: "Fertilización" },
  { type: "Cosecha", icon: "🌾", label: "Cosecha" },
];

const UNITS = ["Litros", "kg", "g", "ml", "unidades"];

export default function NewTask() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteP>();
  const { cropId, preselect } = route.params;

  const { addTask, loading } = useCropDetail(cropId);

  const [taskType, setTaskType] = useState<TaskType>(
    (preselect as TaskType) ?? "Riego",
  );
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [includeTime, setIncludeTime] = useState(false);
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState(UNITS[0]);

  const fmtDate = (d: Date) =>
    d.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const fmtTime = (d: Date) =>
    d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

  const fmtDateForApi = (d: Date) => {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const handleSubmit = async () => {
    const dto: CreateTaskDto = {
      cropId,
      type: taskType,
      date: fmtDateForApi(date),
      time: includeTime ? fmtTime(time) : undefined,
      description: description.trim() || undefined,
      quantity: quantity ? parseFloat(quantity) : undefined,
      unit: quantity ? unit : undefined,
    };

    try {
      await addTask(dto);
      Alert.alert("Tarea creada", "La tarea se ha registrado correctamente", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert("Error", "No se pudo crear la tarea. Inténtalo de nuevo.");
    }
  };

  return (
    <SafeAreaView style={shared.screen}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>← Volver</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Nueva Tarea</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Tipo de tarea */}
        <View style={shared.card}>
          <Text style={shared.sectionTitle}>Tipo de tarea</Text>
          <View style={styles.typeGrid}>
            {TASK_TYPES.map(({ type, icon, label }) => (
              <Pressable
                key={type}
                style={[
                  styles.typeCard,
                  taskType === type && styles.typeCardActive,
                ]}
                onPress={() => setTaskType(type)}
              >
                <Text style={styles.typeIcon}>{icon}</Text>
                <Text
                  style={[
                    styles.typeLabel,
                    taskType === type && styles.typeLabelActive,
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Fecha y hora */}
        <View style={shared.card}>
          <Text style={shared.sectionTitle}>Fecha y hora</Text>

          <Pressable
            style={styles.dateBtn}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateBtnLabel}>Fecha</Text>
            <Text style={styles.dateBtnValue}>📅 {fmtDate(date)}</Text>
          </Pressable>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === "ios" ? "inline" : "default"}
              onChange={(_, d) => {
                setShowDatePicker(Platform.OS === "ios");
                if (d) setDate(d);
              }}
            />
          )}

          <Pressable
            style={[styles.toggleRow, { marginTop: spacing.md }]}
            onPress={() => setIncludeTime((v) => !v)}
          >
            <Text style={styles.toggleLabel}>Añadir hora específica</Text>
            <View style={[styles.toggle, includeTime && styles.toggleOn]}>
              <View
                style={[
                  styles.toggleThumb,
                  includeTime && styles.toggleThumbOn,
                ]}
              />
            </View>
          </Pressable>

          {includeTime && (
            <>
              <Pressable
                style={[styles.dateBtn, { marginTop: spacing.sm }]}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={styles.dateBtnLabel}>Hora</Text>
                <Text style={styles.dateBtnValue}>🕐 {fmtTime(time)}</Text>
              </Pressable>

              {showTimePicker && (
                <DateTimePicker
                  value={time}
                  mode="time"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(_, t) => {
                    setShowTimePicker(Platform.OS === "ios");
                    if (t) setTime(t);
                  }}
                />
              )}
            </>
          )}
        </View>

        {/* Cantidad (opcional) */}
        <View style={shared.card}>
          <Text style={shared.sectionTitle}>Cantidad (opcional)</Text>
          <View style={styles.quantityRow}>
            <TextInput
              style={[shared.input, styles.quantityInput]}
              placeholder="Ej: 20"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              value={quantity}
              onChangeText={setQuantity}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.unitScroll}
            >
              {UNITS.map((u) => (
                <Pressable
                  key={u}
                  style={[styles.chip, unit === u && styles.chipActive]}
                  onPress={() => setUnit(u)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      unit === u && styles.chipTextActive,
                    ]}
                  >
                    {u}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Descripción */}
        <View style={shared.card}>
          <Text style={shared.sectionTitle}>Descripción (opcional)</Text>
          <TextInput
            style={[shared.input, styles.textarea]}
            placeholder="Notas sobre esta tarea..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={3}
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
          />
        </View>

        {/* Resumen */}
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Resumen</Text>
          <Text style={styles.summaryText}>
            {TASK_TYPES.find((t) => t.type === taskType)?.icon} {taskType} el{" "}
            {fmtDate(date)}
            {includeTime ? ` a las ${fmtTime(time)}` : ""}
            {quantity ? ` · ${quantity} ${unit}` : ""}
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            style={[shared.btnOutline, { flex: 1 }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={shared.btnOutlineText}>Cancelar</Text>
          </Pressable>
          <Pressable
            style={[shared.btnPrimary, { flex: 1, opacity: loading ? 0.7 : 1 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={shared.btnPrimaryText}>
              {loading ? "Guardando..." : "Guardar tarea"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xxxl },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  backBtn: {
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
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  typeCard: {
    flex: 1,
    minWidth: "45%",
    alignItems: "center",
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  typeCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryDim,
  },
  typeIcon: { fontSize: 28 },
  typeLabel: {
    fontSize: font.sm,
    fontWeight: "600",
    color: colors.textSecond,
  },
  typeLabelActive: { color: colors.primary },
  dateBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surfaceAlt,
  },
  dateBtnLabel: {
    fontSize: font.xs,
    color: colors.textMuted,
    fontWeight: "600",
    marginBottom: 4,
  },
  dateBtnValue: {
    fontSize: font.md,
    color: colors.textPrimary,
    fontWeight: "700",
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toggleLabel: {
    fontSize: font.sm,
    color: colors.textSecond,
    fontWeight: "600",
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.border,
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  toggleOn: { backgroundColor: colors.primary },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.white,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbOn: { alignSelf: "flex-end" },
  quantityRow: { gap: spacing.sm },
  quantityInput: { marginBottom: 0 },
  unitScroll: { maxHeight: 40 },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: font.sm, color: colors.textSecond, fontWeight: "600" },
  chipTextActive: { color: colors.white },
  textarea: { height: 90, paddingTop: spacing.md },
  summary: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.primaryDim,
    borderRadius: radius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  summaryTitle: {
    fontSize: font.xs,
    fontWeight: "700",
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  summaryText: {
    fontSize: font.sm,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
});
