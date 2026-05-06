import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { colors, shared, spacing, font, radius } from "../styles/theme";
import { RootStackParamList } from "../types/navigation";
import { cropsService } from "../services/cropsService";
import { Parcel } from "../types/crops";

type NavigationProp_NewCrop = NavigationProp<RootStackParamList>;

const CROP_TYPES = [
  "Cereales",
  "Hortalizas",
  "Verduras",
  "Frutas",
  "Legumbres",
  "Tubérculos",
];

export default function NewCorpScreen() {
  const navigation = useNavigation<NavigationProp_NewCrop>();

  // Form state
  const [cropName, setCropName] = useState("");
  const [variety, setVariety] = useState("");
  const [cropType, setCropType] = useState("Hortalizas");
  const [parcelId, setParcelId] = useState("");
  const [surfaceArea, setSurfaceArea] = useState("");
  const [seedDate, setSeedDate] = useState("");
  const [notes, setNotes] = useState("");

  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadParcels();
  }, []);

  const loadParcels = async () => {
    try {
      const data = await cropsService.getParcels();
      setParcels(data);
      if (data.length > 0) {
        setParcelId(data[0].id);
      }
    } catch (error) {
      console.error("Error loading parcels:", error);
      Alert.alert("Error", "No se pudieron cargar las parcelas");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!cropName.trim()) {
      Alert.alert("Error", "Ingresa el nombre del cultivo");
      return false;
    }
    if (!variety.trim()) {
      Alert.alert("Error", "Ingresa la variedad");
      return false;
    }
    if (!parcelId) {
      Alert.alert("Error", "Selecciona una parcela");
      return false;
    }
    if (!surfaceArea.trim()) {
      Alert.alert("Error", "Ingresa la superficie en hectáreas");
      return false;
    }
    if (isNaN(parseFloat(surfaceArea))) {
      Alert.alert("Error", "La superficie debe ser un número válido");
      return false;
    }
    if (!seedDate.trim()) {
      Alert.alert("Error", "Ingresa la fecha de siembra (YYYY-MM-DD)");
      return false;
    }
    // Validar formato de fecha
    if (!/^\d{4}-\d{2}-\d{2}$/.test(seedDate)) {
      Alert.alert("Error", "Formato de fecha inválido. Usa YYYY-MM-DD");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await cropsService.createCrop({
        name: cropName,
        variety,
        cropType,
        parcelId,
        surfaceArea: parseFloat(surfaceArea),
        seedDate,
        notes: notes || undefined,
      });

      Alert.alert("Éxito", "Cultivo creado correctamente", [
        {
          text: "OK",
          onPress: () => navigation.navigate("CropsScreen"),
        },
      ]);
    } catch (error) {
      console.error("Error creating crop:", error);
      Alert.alert("Error", "No se pudo crear el cultivo");
    } finally {
      setSubmitting(false);
    }
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

  return (
    <SafeAreaView style={shared.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={shared.sectionTitle}>Nuevo Cultivo</Text>
          <Text style={styles.subtitle}>Completa los datos del cultivo</Text>
        </View>

        <View style={[shared.card, styles.card]}>
          {/* Crop Name */}
          <View style={styles.section}>
            <Text style={styles.label}>Nombre del cultivo</Text>
            <TextInput
              placeholder="Ej: Tomate, Pimiento..."
              placeholderTextColor={colors.textMuted}
              style={shared.input}
              value={cropName}
              onChangeText={setCropName}
            />
          </View>

          {/* Variety */}
          <View style={styles.section}>
            <Text style={styles.label}>Variedad</Text>
            <TextInput
              placeholder="Ej: Cherry, Red Berries..."
              placeholderTextColor={colors.textMuted}
              style={shared.input}
              value={variety}
              onChangeText={setVariety}
            />
          </View>

          {/* Crop Type */}
          <View style={styles.section}>
            <Text style={styles.label}>Tipo de cultivo</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={cropType}
                onValueChange={(itemValue) => setCropType(itemValue)}
                style={styles.picker}
                itemStyle={{ color: colors.textPrimary }}
              >
                {CROP_TYPES.map((type) => (
                  <Picker.Item key={type} label={type} value={type} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Parcel Selection */}
          <View style={styles.section}>
            <Text style={styles.label}>Parcela</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={parcelId}
                onValueChange={(itemValue) => setParcelId(itemValue)}
                style={styles.picker}
                itemStyle={{ color: colors.textPrimary }}
              >
                {parcels.map((parcel) => (
                  <Picker.Item
                    key={parcel.id}
                    label={`${parcel.name} (${parcel.size} ha)`}
                    value={parcel.id}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Surface Area */}
          <View style={styles.section}>
            <Text style={styles.label}>Superficie (ha)</Text>
            <TextInput
              placeholder="0.0"
              placeholderTextColor={colors.textMuted}
              style={shared.input}
              keyboardType="decimal-pad"
              value={surfaceArea}
              onChangeText={setSurfaceArea}
            />
          </View>

          {/* Seed Date */}
          <View style={styles.section}>
            <Text style={styles.label}>Fecha de siembra</Text>
            <TextInput
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textMuted}
              style={shared.input}
              value={seedDate}
              onChangeText={setSeedDate}
            />
            <Text style={styles.helperText}>Formato: 2026-05-04</Text>
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.label}>Notas (opcional)</Text>
            <TextInput
              placeholder="Notas adicionales sobre el cultivo..."
              placeholderTextColor={colors.textMuted}
              style={[shared.input, styles.notesInput]}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.btnCancel,
                pressed && { opacity: 0.8 },
              ]}
              onPress={() => navigation.goBack()}
              disabled={submitting}
            >
              <Text style={styles.btnCancelText}>Cancelar</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                shared.btnPrimary,
                { flex: 1 },
                pressed && { opacity: 0.8 },
                submitting && { opacity: 0.6 },
              ]}
              onPress={handleSave}
              disabled={submitting}
            >
              <Text style={shared.btnPrimaryText}>
                {submitting ? "Guardando..." : "Guardar cultivo"}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  subtitle: {
    color: colors.textSecond,
    fontSize: font.md,
    marginTop: spacing.xs,
  },
  card: {
    marginHorizontal: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  label: {
    color: colors.textPrimary,
    fontSize: font.sm,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.bg,
  },
  picker: {
    color: colors.textPrimary,
  },
  notesInput: {
    textAlignVertical: "top",
    minHeight: 100,
  },
  helperText: {
    color: colors.textMuted,
    fontSize: font.xs,
    marginTop: spacing.xs,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  btnCancel: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
  },
  btnCancelText: {
    color: colors.textPrimary,
    fontWeight: "600",
    fontSize: font.md,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

