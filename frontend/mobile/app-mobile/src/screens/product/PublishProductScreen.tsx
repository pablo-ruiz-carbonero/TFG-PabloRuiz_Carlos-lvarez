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
  Image,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
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

const MAX_IMAGES = 4;

interface FieldErrors {
  name?: string;
  price?: string;
  stock?: string;
  description?: string;
}

export default function PublishProductScreen() {
  const navigation = useNavigation<Nav>();
  const { createProduct, loading } = useProducts();

  const [name, setName] = useState("");
  const [category, setCategory] = useState<ProductCategory>("Semillas");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState<ProductUnit>("€/kg");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [province, setProvince] = useState("Sevilla");
  const [images, setImages] = useState<string[]>([]);
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [showProvincePicker, setShowProvincePicker] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // ── Imágenes ────────────────────────────────────────────────────────────────

  const pickImages = async () => {
    if (images.length >= MAX_IMAGES) {
      Alert.alert(
        "Límite alcanzado",
        `Máximo ${MAX_IMAGES} fotos por anuncio.`,
      );
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permiso denegado",
        "Necesitamos acceso a tu galería para añadir fotos.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: MAX_IMAGES - images.length,
      quality: 0.7,
      aspect: [4, 3],
    });

    if (!result.canceled) {
      const uris = result.assets.map((a) => a.uri);
      setImages((prev) => [...prev, ...uris].slice(0, MAX_IMAGES));
    }
  };

  const takePhoto = async () => {
    if (images.length >= MAX_IMAGES) {
      Alert.alert(
        "Límite alcanzado",
        `Máximo ${MAX_IMAGES} fotos por anuncio.`,
      );
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permiso denegado",
        "Necesitamos acceso a la cámara para hacer fotos.",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      aspect: [4, 3],
    });

    if (!result.canceled) {
      setImages((prev) => [...prev, result.assets[0].uri].slice(0, MAX_IMAGES));
    }
  };

  const removeImage = (uri: string) => {
    setImages((prev) => prev.filter((i) => i !== uri));
  };

  const handleAddPhoto = () => {
    Alert.alert("Añadir foto", "¿Cómo quieres añadir la imagen?", [
      { text: "Galería", onPress: pickImages },
      { text: "Cámara", onPress: takePhoto },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  // ── Validación ──────────────────────────────────────────────────────────────

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
        images,
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
          // Necesario para que los dropdowns con position:absolute no queden
          // recortados por el ScrollView en Android
          nestedScrollEnabled
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

          {/* ── Fotos ─────────────────────────────────────────────────────── */}
          <View style={[shared.card, styles.section]}>
            <Text style={styles.fieldLabel}>
              Fotos{" "}
              <Text style={styles.hint}>
                ({images.length}/{MAX_IMAGES})
              </Text>
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photoStrip}
            >
              {/* Miniaturas de imágenes seleccionadas */}
              {images.map((uri) => (
                <View key={uri} style={styles.thumbWrapper}>
                  <Image source={{ uri }} style={styles.thumb} />
                  <Pressable
                    style={styles.thumbDelete}
                    onPress={() => removeImage(uri)}
                    hitSlop={6}
                  >
                    <Text style={styles.thumbDeleteText}>✕</Text>
                  </Pressable>
                </View>
              ))}

              {/* Botón añadir (visible si no se alcanzó el límite) */}
              {images.length < MAX_IMAGES && (
                <Pressable
                  style={({ pressed }) => [
                    styles.addPhotoBtn,
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={handleAddPhoto}
                >
                  <Text style={styles.addPhotoIcon}>📷</Text>
                  <Text style={styles.addPhotoText}>
                    {images.length === 0 ? "Añadir fotos" : "Añadir más"}
                  </Text>
                </Pressable>
              )}
            </ScrollView>

            <Text style={styles.photoHint}>
              Hasta {MAX_IMAGES} fotos · Toca una miniatura para eliminarla
            </Text>
          </View>

          {/* ── Nombre ────────────────────────────────────────────────────── */}
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

          {/* ── Categoría ─────────────────────────────────────────────────── */}
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

          {/* ── Precio + Unidad ───────────────────────────────────────────── */}
          {/*
            FIX: el dropdown de unidad estaba tapado por las cards siguientes
            porque el zIndex no se propagaba correctamente en React Native.
            Solución: elevamos el zIndex de toda esta sección y usamos
            overflow: visible para que el dropdown absoluto sea visible
            fuera de los límites de su contenedor.
          */}
          <View style={[shared.card, styles.section, styles.priceSection]}>
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

              {/* Selector de unidad — zIndex elevado para que el dropdown
                  flote por encima de las cards inferiores */}
              <View style={styles.unitWrapper}>
                <Pressable
                  style={[
                    styles.unitSelector,
                    showUnitPicker && styles.unitSelectorOpen,
                  ]}
                  onPress={() => {
                    setShowUnitPicker((o) => !o);
                    setShowProvincePicker(false);
                  }}
                >
                  <Text style={styles.unitSelectorText}>{unit}</Text>
                  <Text style={styles.arrow}>{showUnitPicker ? "▲" : "▼"}</Text>
                </Pressable>

                {showUnitPicker && (
                  <View style={styles.unitDropdown}>
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

          {/* ── Stock ─────────────────────────────────────────────────────── */}
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

          {/* ── Descripción ───────────────────────────────────────────────── */}
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

          {/* ── Provincia ─────────────────────────────────────────────────── */}
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

          {/* ── Publicar ──────────────────────────────────────────────────── */}
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
              <Text style={styles.btnPublishText}>Publicar anuncio</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

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

  // ── Fotos
  photoStrip: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  thumbWrapper: {
    width: 90,
    height: 90,
    borderRadius: radius.md,
    overflow: "hidden",
    position: "relative",
  },
  thumb: { width: "100%", height: "100%", borderRadius: radius.md },
  thumbDelete: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  thumbDeleteText: { color: colors.white, fontSize: 10, fontWeight: "800" },
  addPhotoBtn: {
    width: 90,
    height: 90,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: "dashed",
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  addPhotoIcon: { fontSize: 24 },
  addPhotoText: {
    fontSize: font.xs,
    color: colors.textMuted,
    fontWeight: "600",
    textAlign: "center",
  },
  photoHint: {
    fontSize: font.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },

  // ── Campos
  fieldLabel: {
    fontSize: font.sm,
    fontWeight: "700",
    color: colors.textSecond,
    marginBottom: spacing.sm,
  },
  hint: { fontWeight: "400", color: colors.textMuted },
  required: { color: colors.error },
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

  // ── Precio + Unidad (FIX zIndex)
  priceSection: {
    // Elevamos esta card por encima de todas las que vienen después
    zIndex: 20,
    overflow: "visible",
  },
  priceRow: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "flex-start",
    // overflow visible para que el dropdown no quede recortado
    overflow: "visible",
  },
  priceInput: { flex: 1 },
  unitWrapper: {
    // Contenedor con zIndex propio y overflow visible
    zIndex: 20,
    overflow: "visible",
  },
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
  unitSelectorOpen: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryDim,
  },
  unitSelectorText: {
    fontSize: font.sm,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  arrow: { fontSize: 10, color: colors.textMuted },
  // El dropdown flota encima con position absolute + zIndex alto
  unitDropdown: {
    position: "absolute",
    top: 54,
    right: 0,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    zIndex: 100,
    minWidth: 110,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 20,
  },

  // ── Provincia
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
  provinceDropdown: {
    maxHeight: 200,
    marginTop: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dropdownItem: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  dropdownItemActive: { backgroundColor: colors.primaryDim },
  dropdownText: {
    fontSize: font.sm,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  dropdownTextActive: { color: colors.primary, fontWeight: "700" },

  // ── Publicar
  btnPublish: {
    backgroundColor: colors.primary,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    paddingVertical: spacing.md + 2,
    borderRadius: radius.md,
    alignItems: "center",
  },
  btnPublishText: {
    color: colors.white,
    fontSize: font.md,
    fontWeight: "700",
  },
});
