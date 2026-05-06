// src/screens/NewTask.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useNavigation,
  useRoute,
  RouteProp,
  NavigationProp,
} from "@react-navigation/native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { colors, shared, spacing, font, radius } from "../styles/theme";
import { RootStackParamList } from "../types/navigation";
import { TaskType } from "../types/tasks";
import { tasksService } from "../services/tasksService";

type NewTaskRouteProp = RouteProp<RootStackParamList, "NewTask">;
type NewTaskNavProp = NavigationProp<RootStackParamList>;

const TASK_TYPES: { type: TaskType; emoji: string }[] = [
  { type: "Siembra", emoji: "🌱" },
  { type: "Riego", emoji: "💧" },
  { type: "Fertilización", emoji: "🧪" },
  { type: "Cosecha", emoji: "🌾" },
];

const UNITS = ["Litros", "kg", "g", "L/ha", "kg/ha", "ml"];

const isValidTime = (value: string): boolean => {
  if (!value) return true;
  const match = value.match(/^(\d{2}):(\d{2})$/);
  if (!match) return false;
  const [, h, m] = match.map(Number);
  return h >= 0 && h <= 23 && m >= 0 && m <= 59;
};

const formatTimeInput = (raw: string): string => {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
};

const dateToString = (d: Date): string =>
  d.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

interface FieldError {
  time?: string;
  quantity?: string;
}

export default function NewTask() {
  const navigation = useNavigation<NewTaskNavProp>();
  const route = useRoute<NewTaskRouteProp>();
  const { cropId } = route.params;

  const [selectedType, setSelectedType] = useState<TaskType>("Riego");
  const [date, setDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("Litros");
  const [unitMenuOpen, setUnitMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldError>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const onDateChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === "android") setShowDatePicker(false);
    if (event.type === "dismissed") {
      setShowDatePicker(false);
      return;
    }
    if (selected) setDate(selected);
  };

  const validate = (): FieldError => {
    const e: FieldError = {};
    if (time && !isValidTime(time)) e.time = "Formato inválido. Usa HH:MM";
    if (quantity && isNaN(Number(quantity.replace(",", ".")))) {
      e.quantity = "Introduce un número válido";
    }
    return e;
  };

  const handleBlur = (field: string) => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors(validate());
  };

  const handleSave = async () => {
    setTouched({ time: true, quantity: true });
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      setLoading(true);
      await tasksService.createTask({
        cropId,
        type: selectedType,
        date: dateToString(date),
        time: time || undefined,
        description: description.trim() || undefined,
        quantity: quantity ? Number(quantity.replace(",", ".")) : undefined,
        unit: quantity ? unit : undefined,
      });
      Alert.alert(
        "✅ Tarea registrada",
        `${selectedType} guardada correctamente`,
        [{ text: "OK", onPress: () => navigation.goBack() }],
      );
    } catch {
      Alert.alert("Error", "No se pudo guardar la tarea. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const hasError = (field: keyof FieldError) =>
    touched[field] && !!errors[field];

  return (
    <SafeAreaView style={shared.screen}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
              <Text style={styles.backButton}>← Volver</Text>
            </Pressable>
          </View>

          <View style={styles.titleContainer}>
            <Text style={styles.title}>Nueva tarea</Text>
            <Text style={styles.subtitle}>
              Registra una actividad en tu cultivo
            </Text>
          </View>

          {/* Tipo de tarea */}
          <View style={[shared.card, styles.section]}>
            <Text style={styles.fieldLabel}>Tipo de tarea</Text>
            <View style={styles.typeGrid}>
              {TASK_TYPES.map(({ type, emoji }) => (
                <Pressable
                  key={type}
                  style={[
                    styles.typeChip,
                    selectedType === type && styles.typeChipActive,
                  ]}
                  onPress={() => setSelectedType(type)}
                >
                  <Text style={styles.typeChipEmoji}>{emoji}</Text>
                  <Text
                    style={[
                      styles.typeChipText,
                      selectedType === type && styles.typeChipTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Fecha y Hora */}
          <View style={[shared.card, styles.section]}>
            <View style={styles.row}>
              {/* Fecha */}
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>
                  Fecha <Text style={styles.required}>*</Text>
                </Text>
                <Pressable
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateButtonIcon}>📅</Text>
                  <Text style={styles.dateButtonText}>
                    {dateToString(date)}
                  </Text>
                </Pressable>

                {/* Android: modal de calendario nativo */}
                {showDatePicker && Platform.OS === "android" && (
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display="calendar"
                    minimumDate={new Date(2000, 0, 1)}
                    maximumDate={new Date(2100, 11, 31)}
                    onChange={onDateChange}
                  />
                )}
              </View>

              {/* Hora */}
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>Hora (opcional)</Text>
                <TextInput
                  style={[styles.input, hasError("time") && styles.inputError]}
                  placeholder="HH:MM"
                  placeholderTextColor={colors.textMuted}
                  value={time}
                  onChangeText={(raw) => {
                    setTime(formatTimeInput(raw));
                    if (touched.time) setErrors(validate());
                  }}
                  onBlur={() => handleBlur("time")}
                  keyboardType="numeric"
                  maxLength={5}
                />
                {hasError("time") && (
                  <Text style={styles.errorText}>{errors.time}</Text>
                )}
              </View>
            </View>

            {/* iOS: calendario inline debajo de los campos */}
            {showDatePicker && Platform.OS === "ios" && (
              <View style={styles.iosPickerContainer}>
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="inline"
                  minimumDate={new Date(2000, 0, 1)}
                  maximumDate={new Date(2100, 11, 31)}
                  onChange={onDateChange}
                  locale="es-ES"
                  accentColor={colors.primary}
                />
                <Pressable
                  style={styles.iosPickerClose}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.iosPickerCloseText}>Confirmar fecha</Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* Descripción */}
          <View style={[shared.card, styles.section]}>
            <Text style={styles.fieldLabel}>Descripción (opcional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Detalles de la tarea..."
              placeholderTextColor={colors.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.charCount}>{description.length}/500</Text>
          </View>

          {/* Cantidad / Dosis */}
          <View style={[shared.card, styles.section]}>
            <Text style={styles.fieldLabel}>Cantidad / Dosis (opcional)</Text>
            <View style={styles.quantityRow}>
              <TextInput
                style={[
                  styles.input,
                  styles.quantityInput,
                  hasError("quantity") && styles.inputError,
                ]}
                placeholder="Ej: 25"
                placeholderTextColor={colors.textMuted}
                value={quantity}
                onChangeText={(v) => {
                  setQuantity(v);
                  if (touched.quantity) setErrors(validate());
                }}
                onBlur={() => handleBlur("quantity")}
                keyboardType="decimal-pad"
              />

              <View>
                <Pressable
                  style={styles.unitSelector}
                  onPress={() => setUnitMenuOpen((o) => !o)}
                >
                  <Text style={styles.unitSelectorText}>{unit}</Text>
                  <Text style={styles.unitArrow}>
                    {unitMenuOpen ? "▲" : "▼"}
                  </Text>
                </Pressable>

                {unitMenuOpen && (
                  <View style={styles.unitDropdown}>
                    {UNITS.map((u) => (
                      <Pressable
                        key={u}
                        style={[
                          styles.unitOption,
                          u === unit && styles.unitOptionActive,
                        ]}
                        onPress={() => {
                          setUnit(u);
                          setUnitMenuOpen(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.unitOptionText,
                            u === unit && styles.unitOptionTextActive,
                          ]}
                        >
                          {u}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            </View>
            {hasError("quantity") && (
              <Text style={styles.errorText}>{errors.quantity}</Text>
            )}
          </View>

          {/* Botón guardar */}
          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              pressed && { opacity: 0.85 },
              loading && { opacity: 0.7 },
            ]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.saveButtonText}>Guardar tarea</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: spacing.xxxl + spacing.xl },
  header: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  backButton: { color: colors.primary, fontSize: font.md, fontWeight: "600" },
  titleContainer: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  title: { fontSize: font.xxl, fontWeight: "800", color: colors.textPrimary },
  subtitle: {
    fontSize: font.sm,
    color: colors.textSecond,
    marginTop: spacing.xs,
  },
  section: { marginHorizontal: spacing.lg, marginBottom: spacing.md },
  fieldLabel: {
    fontSize: font.sm,
    fontWeight: "700",
    color: colors.textSecond,
    marginBottom: spacing.sm,
  },
  required: { color: colors.error },
  row: { flexDirection: "row", gap: spacing.md },
  halfField: { flex: 1 },

  dateButton: {
    height: 50,
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  dateButtonIcon: { fontSize: 16 },
  dateButtonText: {
    fontSize: font.md,
    color: colors.textPrimary,
    fontWeight: "600",
  },

  iosPickerContainer: {
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  iosPickerClose: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  iosPickerCloseText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: font.md,
  },

  input: {
    height: 50,
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    fontSize: font.md,
    color: colors.textPrimary,
  },
  inputError: { borderColor: colors.error, backgroundColor: colors.errorDim },
  errorText: { color: colors.error, fontSize: font.xs, marginTop: spacing.xs },
  textArea: { height: 100, paddingTop: spacing.md, textAlignVertical: "top" },
  charCount: {
    fontSize: font.xs,
    color: colors.textMuted,
    textAlign: "right",
    marginTop: spacing.xs,
  },

  typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  typeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  typeChipActive: {
    backgroundColor: colors.primaryDim,
    borderColor: colors.primary,
  },
  typeChipEmoji: { fontSize: 14 },
  typeChipText: {
    fontSize: font.sm,
    fontWeight: "600",
    color: colors.textSecond,
  },
  typeChipTextActive: { color: colors.primary },

  quantityRow: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "flex-start",
  },
  quantityInput: { flex: 1 },
  unitSelector: {
    height: 50,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minWidth: 95,
    justifyContent: "space-between",
  },
  unitSelectorText: {
    fontSize: font.sm,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  unitArrow: { fontSize: 10, color: colors.textMuted },
  unitDropdown: {
    position: "absolute",
    top: 54,
    right: 0,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    zIndex: 999,
    minWidth: 110,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  unitOption: { paddingVertical: spacing.md, paddingHorizontal: spacing.md },
  unitOptionActive: { backgroundColor: colors.primaryDim },
  unitOptionText: {
    fontSize: font.sm,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  unitOptionTextActive: { color: colors.primary, fontWeight: "700" },

  saveButton: {
    backgroundColor: colors.primary,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    paddingVertical: spacing.md + 2,
    borderRadius: radius.md,
    alignItems: "center",
  },
  saveButtonText: { color: colors.white, fontSize: font.md, fontWeight: "700" },
});
