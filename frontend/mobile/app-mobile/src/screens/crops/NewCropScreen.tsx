// src/screens/NewCorpScreen.tsx

import React, { useEffect, useState } from "react";
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
import { useNavigation, NavigationProp } from "@react-navigation/native";
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
  CreateCropDto,
  CropPhase,
} from "../../features/crops/types/crops.types";
import { useCrops } from "../../features/crops/hooks/useCrops";

type Nav = NavigationProp<RootStackParamList>;

const PHASES: CropPhase[] = [
  "Plántula",
  "Crecimiento",
  "Floración",
  "Maduración",
  "Cosecha",
];

const CROP_TYPES = [
  "Hortalizas",
  "Verduras",
  "Frutales",
  "Cereales",
  "Legumbres",
  "Aromáticas",
  "Otros",
];

export default function NewCorpScreen() {
  const navigation = useNavigation<Nav>();
  const { parcels, fetchParcels, createCrop, loading } = useCrops();

  const [name, setName] = useState("");
  const [variety, setVariety] = useState("");
  const [cropType, setCropType] = useState(CROP_TYPES[0]);
  const [parcelId, setParcelId] = useState("");
  const [surfaceArea, setSurfaceArea] = useState("");
  const [seedDate, setSeedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchParcels();
  }, []);

  useEffect(() => {
    if (parcels.length > 0 && !parcelId) {
      setParcelId(parcels[0].id);
    }
  }, [parcels]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Campo requerido", "El nombre del cultivo es obligatorio");
      return;
    }
    if (!variety.trim()) {
      Alert.alert("Campo requerido", "La variedad es obligatoria");
      return;
    }
    if (!parcelId) {
      Alert.alert("Campo requerido", "Selecciona una parcela");
      return;
    }
    if (!surfaceArea || isNaN(parseFloat(surfaceArea))) {
      Alert.alert(
        "Campo inválido",
        "Introduce una superficie válida en hectáreas",
      );
      return;
    }

    const dto: CreateCropDto = {
      name: name.trim(),
      variety: variety.trim(),
      cropType,
      parcelId,
      surfaceArea: parseFloat(surfaceArea),
      seedDate: seedDate.toISOString().split("T")[0],
      notes: notes.trim() || undefined,
    };

    try {
      await createCrop(dto);
      Alert.alert("Cultivo creado", `${name} se ha añadido correctamente`, [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert("Error", "No se pudo crear el cultivo. Inténtalo de nuevo.");
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
          <Text style={styles.headerTitle}>Nuevo Cultivo</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Datos básicos */}
        <View style={shared.card}>
          <Text style={shared.sectionTitle}>Datos básicos</Text>

          <FieldLabel>Nombre del cultivo *</FieldLabel>
          <TextInput
            style={shared.input}
            placeholder="Ej: Tomate, Lechuga..."
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
          />

          <FieldLabel>Variedad *</FieldLabel>
          <TextInput
            style={shared.input}
            placeholder="Ej: Cherry, Batavia..."
            placeholderTextColor={colors.textMuted}
            value={variety}
            onChangeText={setVariety}
          />

          <FieldLabel>Tipo de cultivo</FieldLabel>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipScroll}
          >
            {CROP_TYPES.map((t) => (
              <Pressable
                key={t}
                style={[styles.chip, cropType === t && styles.chipActive]}
                onPress={() => setCropType(t)}
              >
                <Text
                  style={[
                    styles.chipText,
                    cropType === t && styles.chipTextActive,
                  ]}
                >
                  {t}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Parcela */}
        <View style={shared.card}>
          <Text style={shared.sectionTitle}>Parcela</Text>

          {parcels.length === 0 ? (
            <Text style={styles.emptyNote}>
              No hay parcelas disponibles. Añade una desde el panel de parcelas.
            </Text>
          ) : (
            parcels.map((p) => (
              <Pressable
                key={p.id}
                style={[
                  styles.parcelRow,
                  parcelId === p.id && styles.parcelRowActive,
                ]}
                onPress={() => setParcelId(p.id)}
              >
                <View style={styles.parcelRadio}>
                  {parcelId === p.id && <View style={styles.parcelRadioFill} />}
                </View>
                <View>
                  <Text style={styles.parcelName}>{p.name}</Text>
                  {p.location && (
                    <Text style={styles.parcelLocation}>{p.location}</Text>
                  )}
                </View>
                <Text style={styles.parcelSize}>{p.size} ha</Text>
              </Pressable>
            ))
          )}

          <FieldLabel style={{ marginTop: spacing.md }}>
            Superficie a cultivar (ha) *
          </FieldLabel>
          <TextInput
            style={shared.input}
            placeholder="Ej: 0.5"
            placeholderTextColor={colors.textMuted}
            keyboardType="decimal-pad"
            value={surfaceArea}
            onChangeText={setSurfaceArea}
          />
        </View>

        {/* Fechas */}
        <View style={shared.card}>
          <Text style={shared.sectionTitle}>Fecha de siembra *</Text>

          <Pressable
            style={styles.dateBtn}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateBtnText}>
              📅{" "}
              {seedDate.toLocaleDateString("es-ES", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </Text>
          </Pressable>

          {showDatePicker && (
            <DateTimePicker
              value={seedDate}
              mode="date"
              display={Platform.OS === "ios" ? "inline" : "default"}
              maximumDate={new Date()}
              onChange={(_, date) => {
                setShowDatePicker(Platform.OS === "ios");
                if (date) setSeedDate(date);
              }}
            />
          )}
        </View>

        {/* Notas */}
        <View style={shared.card}>
          <Text style={shared.sectionTitle}>Notas (opcional)</Text>
          <TextInput
            style={[shared.input, styles.textarea]}
            placeholder="Observaciones, condiciones especiales..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={4}
            value={notes}
            onChangeText={setNotes}
            textAlignVertical="top"
          />
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
              {loading ? "Creando..." : "Crear cultivo"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FieldLabel({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: object;
}) {
  return <Text style={[styles.fieldLabel, style]}>{children}</Text>;
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
  fieldLabel: {
    fontSize: font.sm,
    fontWeight: "600",
    color: colors.textSecond,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  chipScroll: { marginBottom: spacing.md },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: { fontSize: font.sm, color: colors.textSecond, fontWeight: "600" },
  chipTextActive: { color: colors.white },
  emptyNote: {
    fontSize: font.sm,
    color: colors.textMuted,
    fontStyle: "italic",
    marginVertical: spacing.md,
  },
  parcelRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  parcelRowActive: {
    backgroundColor: colors.primaryDim,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
  },
  parcelRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  parcelRadioFill: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  parcelName: {
    fontSize: font.md,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  parcelLocation: { fontSize: font.xs, color: colors.textMuted, marginTop: 2 },
  parcelSize: {
    marginLeft: "auto",
    fontSize: font.sm,
    color: colors.primary,
    fontWeight: "600",
  },
  dateBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surfaceAlt,
  },
  dateBtnText: {
    fontSize: font.md,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  textarea: {
    height: 100,
    paddingTop: spacing.md,
    textAlignVertical: "top",
  },
  actions: {
    flexDirection: "row",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
});
