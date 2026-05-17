// src/screens/product/PublishProductScreen.tsx

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
import { useNavigation, NavigationProp } from "@react-navigation/native";
import {
  colors,
  shared,
  spacing,
  font,
  radius,
} from "../../styles/Globaltheme";
import { RootStackParamList } from "../../types/navigation";
import {
  ProductCategory,
  ProductUnit,
} from "../../features/products/types/products.types";
import { useProducts } from "../../features/products/hooks/useProducts";

type Nav = NavigationProp<RootStackParamList>;

const CATEGORIES: ProductCategory[] = [
  "Semillas",
  "Fertilizantes",
  "Maquinaria",
  "Fitosanitarios",
  "Otros",
];
const UNITS: ProductUnit[] = ["€/kg", "€/u", "€/L", "€/ha", "€/saco"];
const CATEGORY_EMOJI: Record<string, string> = {
  Semillas: "🌱",
  Fertilizantes: "🧪",
  Maquinaria: "🚜",
  Fitosanitarios: "🛡️",
  Otros: "📦",
};
const PROVINCES = [
  "Álava",
  "Albacete",
  "Alicante",
  "Almería",
  "Asturias",
  "Ávila",
  "Badajoz",
  "Barcelona",
  "Burgos",
  "Cáceres",
  "Cádiz",
  "Cantabria",
  "Castellón",
  "Ciudad Real",
  "Córdoba",
  "Cuenca",
  "Gerona",
  "Granada",
  "Guadalajara",
  "Guipúzcoa",
  "Huelva",
  "Huesca",
  "Islas Baleares",
  "Jaén",
  "La Coruña",
  "La Rioja",
  "Las Palmas",
  "León",
  "Lérida",
  "Lugo",
  "Madrid",
  "Málaga",
  "Murcia",
  "Navarra",
  "Orense",
  "Palencia",
  "Pontevedra",
  "Salamanca",
  "Santa Cruz de Tenerife",
  "Segovia",
  "Sevilla",
  "Soria",
  "Tarragona",
  "Teruel",
  "Toledo",
  "Valencia",
  "Valladolid",
  "Vizcaya",
  "Zamora",
  "Zaragoza",
];

interface FieldErrors {
  name?: string;
  price?: string;
  stock?: string;
  description?: string;
}

export default function PublishProductScreen() {
  const navigation = useNavigation<Nav>();
  const { createProduct, loading } = useProducts(); // ✅ usa el contexto

  const [name, setName] = useState("");
  const [category, setCategory] = useState<ProductCategory>("Semillas");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState<ProductUnit>("€/kg");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [province, setProvince] = useState("Sevilla");
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [showProvincePicker, setShowProvincePicker] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validate = (): FieldErrors => {
    const e: FieldErrors = {};
    if (!name.trim()) e.name = "El nombre es obligatorio";
    else if (name.trim().length < 3) e.name = "Mínimo 3 caracteres";
    if (!price) e.price = "El precio es obligatorio";
    else if (
      isNaN(Number(price.replace(",", "."))) ||
      Number(price.replace(",", ".")) <= 0
    )
      e.price = "Introduce un precio válido";
    if (!stock) e.stock = "El stock es obligatorio";
    else if (!Number.isInteger(Number(stock)) || Number(stock) <= 0)
      e.stock = "Introduce una cantidad entera válida";
    if (!description.trim()) e.description = "La descripción es obligatoria";
    else if (description.trim().length < 10)
      e.description = "Mínimo 10 caracteres";
    return e;
  };

  const handleBlur = (field: string) => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors(validate());
  };

  const hasError = (field: keyof FieldErrors) =>
    touched[field] && !!errors[field];

  const handlePublish = async () => {
    setTouched({ name: true, price: true, stock: true, description: true });
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      await createProduct({
        name: name.trim(),
        category,
        price: Number(price.replace(",", ".")),
        unit,
        stock: Number(stock),
        description: description.trim(),
        province,
      });
      Alert.alert(
        "✅ Producto publicado",
        "Tu producto ya está visible en el mercado.",
        [{ text: "Ver mercado", onPress: () => navigation.goBack() }],
      );
    } catch {
      Alert.alert(
        "Error",
        "No se pudo publicar el producto. Inténtalo de nuevo.",
      );
    }
  };

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
            <Text style={styles.title}>Nuevo anuncio</Text>
            <Text style={styles.subtitle}>
              Publica tu producto en el mercado
            </Text>
          </View>

          {/* Foto placeholder */}
          <View style={[shared.card, styles.section]}>
            <Pressable style={styles.photoBox}>
              <Text style={styles.photoIcon}>📷</Text>
              <Text style={styles.photoText}>Añadir fotos</Text>
              <Text style={styles.photoSub}>
                Toca para seleccionar imágenes
              </Text>
            </Pressable>
          </View>

          {/* Nombre */}
          <View style={[shared.card, styles.section]}>
            <Text style={styles.fieldLabel}>
              Nombre del producto <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, hasError("name") && styles.inputError]}
              placeholder="Ej: Semilla de tomate cherry"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={(v) => {
                setName(v);
                if (touched.name) setErrors(validate());
              }}
              onBlur={() => handleBlur("name")}
              maxLength={80}
            />
            {hasError("name") && (
              <Text style={styles.errorText}>{errors.name}</Text>
            )}
          </View>

          {/* Categoría */}
          <View style={[shared.card, styles.section]}>
            <Text style={styles.fieldLabel}>Categoría</Text>
            <View style={styles.chipGrid}>
              {CATEGORIES.map((cat) => (
                <Pressable
                  key={cat}
                  style={[styles.chip, category === cat && styles.chipActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={styles.chipEmoji}>{CATEGORY_EMOJI[cat]}</Text>
                  <Text
                    style={[
                      styles.chipText,
                      category === cat && styles.chipTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Precio + Unidad */}
          <View style={[shared.card, styles.section]}>
            <Text style={styles.fieldLabel}>
              Precio <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.priceRow}>
              <TextInput
                style={[
                  styles.input,
                  styles.priceInput,
                  hasError("price") && styles.inputError,
                ]}
                placeholder="0,00"
                placeholderTextColor={colors.textMuted}
                value={price}
                onChangeText={(v) => {
                  setPrice(v);
                  if (touched.price) setErrors(validate());
                }}
                onBlur={() => handleBlur("price")}
                keyboardType="decimal-pad"
              />
              <View>
                <Pressable
                  style={styles.unitSelector}
                  onPress={() => {
                    setShowUnitPicker((o) => !o);
                    setShowProvincePicker(false);
                  }}
                >
                  <Text style={styles.unitSelectorText}>{unit}</Text>
                  <Text style={styles.arrow}>{showUnitPicker ? "▲" : "▼"}</Text>
                </Pressable>
                {showUnitPicker && (
                  <View style={styles.dropdown}>
                    {UNITS.map((u) => (
                      <Pressable
                        key={u}
                        style={[
                          styles.dropdownItem,
                          u === unit && styles.dropdownItemActive,
                        ]}
                        onPress={() => {
                          setUnit(u);
                          setShowUnitPicker(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.dropdownText,
                            u === unit && styles.dropdownTextActive,
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
            {hasError("price") && (
              <Text style={styles.errorText}>{errors.price}</Text>
            )}
          </View>

          {/* Stock */}
          <View style={[shared.card, styles.section]}>
            <Text style={styles.fieldLabel}>
              Stock disponible <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, hasError("stock") && styles.inputError]}
              placeholder="Cantidad disponible"
              placeholderTextColor={colors.textMuted}
              value={stock}
              onChangeText={(v) => {
                setStock(v);
                if (touched.stock) setErrors(validate());
              }}
              onBlur={() => handleBlur("stock")}
              keyboardType="number-pad"
            />
            {hasError("stock") && (
              <Text style={styles.errorText}>{errors.stock}</Text>
            )}
          </View>

          {/* Descripción */}
          <View style={[shared.card, styles.section]}>
            <Text style={styles.fieldLabel}>
              Descripción <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                hasError("description") && styles.inputError,
              ]}
              placeholder="Descripción del producto..."
              placeholderTextColor={colors.textMuted}
              value={description}
              onChangeText={(v) => {
                setDescription(v);
                if (touched.description) setErrors(validate());
              }}
              onBlur={() => handleBlur("description")}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />
            <View style={styles.descFooter}>
              {hasError("description") ? (
                <Text style={styles.errorText}>{errors.description}</Text>
              ) : (
                <View />
              )}
              <Text style={styles.charCount}>{description.length}/500</Text>
            </View>
          </View>

          {/* Provincia */}
          <View style={[shared.card, styles.section]}>
            <Text style={styles.fieldLabel}>Ubicación</Text>
            <Pressable
              style={styles.provinceSelector}
              onPress={() => {
                setShowProvincePicker((o) => !o);
                setShowUnitPicker(false);
              }}
            >
              <Text style={styles.provinceSelectorText}>📍 {province}</Text>
              <Text style={styles.arrow}>{showProvincePicker ? "▲" : "▼"}</Text>
            </Pressable>
            {showProvincePicker && (
              <ScrollView
                style={styles.provinceDropdown}
                nestedScrollEnabled
                showsVerticalScrollIndicator
              >
                {PROVINCES.map((p) => (
                  <Pressable
                    key={p}
                    style={[
                      styles.dropdownItem,
                      p === province && styles.dropdownItemActive,
                    ]}
                    onPress={() => {
                      setProvince(p);
                      setShowProvincePicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownText,
                        p === province && styles.dropdownTextActive,
                      ]}
                    >
                      {p}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Publicar */}
          <Pressable
            style={({ pressed }) => [
              styles.btnPublish,
              pressed && { opacity: 0.85 },
              loading && { opacity: 0.7 },
            ]}
            onPress={handlePublish}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.btnPublishText}>Publicar</Text>
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
  photoBox: {
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: "dashed",
    borderRadius: radius.lg,
    paddingVertical: spacing.xxl,
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.surfaceAlt,
  },
  photoIcon: { fontSize: 32 },
  photoText: {
    fontSize: font.md,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  photoSub: { fontSize: font.xs, color: colors.textMuted },
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
  textArea: { height: 110, paddingTop: spacing.md, textAlignVertical: "top" },
  descFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.xs,
  },
  charCount: { fontSize: font.xs, color: colors.textMuted, textAlign: "right" },
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
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
  chipActive: {
    backgroundColor: colors.primaryDim,
    borderColor: colors.primary,
  },
  chipEmoji: { fontSize: 13 },
  chipText: { fontSize: font.sm, fontWeight: "600", color: colors.textSecond },
  chipTextActive: { color: colors.primary },
  priceRow: { flexDirection: "row", gap: spacing.sm, alignItems: "flex-start" },
  priceInput: { flex: 1 },
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
    minWidth: 90,
    justifyContent: "space-between",
  },
  unitSelectorText: {
    fontSize: font.sm,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  arrow: { fontSize: 10, color: colors.textMuted },
  provinceSelector: {
    height: 50,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  provinceSelectorText: {
    fontSize: font.md,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  dropdown: {
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
  provinceDropdown: {
    maxHeight: 200,
    marginTop: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dropdownItem: { paddingVertical: spacing.md, paddingHorizontal: spacing.md },
  dropdownItemActive: { backgroundColor: colors.primaryDim },
  dropdownText: {
    fontSize: font.sm,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  dropdownTextActive: { color: colors.primary, fontWeight: "700" },
  btnPublish: {
    backgroundColor: colors.primary,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    paddingVertical: spacing.md + 2,
    borderRadius: radius.md,
    alignItems: "center",
  },
  btnPublishText: { color: colors.white, fontSize: font.md, fontWeight: "700" },
});
