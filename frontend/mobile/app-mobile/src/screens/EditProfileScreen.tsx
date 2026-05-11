// src/screens/EditProfileScreen.tsx
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
import { colors, shared, spacing, font, radius } from "../styles/theme";
import { RootStackParamList } from "../types/navigation";

type Nav = NavigationProp<RootStackParamList>;

const ROLES = [
  "Agricultor",
  "Técnico agrícola",
  "Distribuidor",
  "Cooperativa",
  "Otro",
];
const PROVINCES = [
  "Almería",
  "Cádiz",
  "Córdoba",
  "Granada",
  "Huelva",
  "Jaén",
  "Málaga",
  "Sevilla",
  "Madrid",
  "Barcelona",
  "Valencia",
  "Murcia",
  "Alicante",
  "Toledo",
  "Ciudad Real",
];

export default function EditProfileScreen() {
  const navigation = useNavigation<Nav>();

  const [name, setName] = useState("Carlos Aguilar");
  const [email, setEmail] = useState("carlos@agroink.es");
  const [phone, setPhone] = useState("+34 612 345 678");
  const [role, setRole] = useState("Agricultor");
  const [location, setLocation] = useState("Almería");
  const [bio, setBio] = useState(
    "Agricultor con 10 años de experiencia en cultivos hortícolas.",
  );
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "El nombre es obligatorio");
      return;
    }
    if (!email.trim()) {
      Alert.alert("Error", "El email es obligatorio");
      return;
    }
    try {
      setLoading(true);
      // TODO (backend): await authService.updateProfile({ name, email, phone, role, location, bio });
      await new Promise((r) => setTimeout(r, 600));
      Alert.alert(
        "✅ Perfil actualizado",
        "Tus datos han sido guardados correctamente.",
        [{ text: "OK", onPress: () => navigation.goBack() }],
      );
    } catch {
      Alert.alert("Error", "No se pudo actualizar el perfil.");
    } finally {
      setLoading(false);
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
            <Text style={styles.headerTitle}>Editar perfil</Text>
            <View style={{ width: 60 }} />
          </View>

          {/* Avatar editable */}
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>CA</Text>
            </View>
            <Pressable
              onPress={() =>
                Alert.alert("Próximamente", "Subida de foto disponible pronto.")
              }
            >
              <Text style={styles.changePhotoText}>Cambiar foto</Text>
            </Pressable>
          </View>

          {/* Nombre */}
          <View style={[shared.card, styles.section]}>
            <Text style={styles.fieldLabel}>
              Nombre completo <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Tu nombre"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={[styles.fieldLabel, { marginTop: spacing.md }]}>
              Teléfono
            </Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="+34 600 000 000"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
            />

            <Text style={[styles.fieldLabel, { marginTop: spacing.md }]}>
              Email <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="tu@email.com"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Rol */}
          <View style={[shared.card, styles.section]}>
            <Text style={styles.fieldLabel}>Rol</Text>
            <Pressable
              style={styles.selector}
              onPress={() => {
                setShowRolePicker((o) => !o);
                setShowLocationPicker(false);
              }}
            >
              <Text style={styles.selectorText}>👤 {role}</Text>
              <Text style={styles.arrow}>{showRolePicker ? "▲" : "▼"}</Text>
            </Pressable>
            {showRolePicker && (
              <View style={styles.dropdown}>
                {ROLES.map((r) => (
                  <Pressable
                    key={r}
                    style={[
                      styles.dropdownItem,
                      r === role && styles.dropdownItemActive,
                    ]}
                    onPress={() => {
                      setRole(r);
                      setShowRolePicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownText,
                        r === role && styles.dropdownTextActive,
                      ]}
                    >
                      {r}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}

            <Text style={[styles.fieldLabel, { marginTop: spacing.md }]}>
              Ubicación
            </Text>
            <Pressable
              style={styles.selector}
              onPress={() => {
                setShowLocationPicker((o) => !o);
                setShowRolePicker(false);
              }}
            >
              <Text style={styles.selectorText}>📍 {location}</Text>
              <Text style={styles.arrow}>{showLocationPicker ? "▲" : "▼"}</Text>
            </Pressable>
            {showLocationPicker && (
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
                      p === location && styles.dropdownItemActive,
                    ]}
                    onPress={() => {
                      setLocation(p);
                      setShowLocationPicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownText,
                        p === location && styles.dropdownTextActive,
                      ]}
                    >
                      {p}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Bio */}
          <View style={[shared.card, styles.section]}>
            <Text style={styles.fieldLabel}>Sobre mí (opcional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={bio}
              onChangeText={setBio}
              placeholder="Cuéntanos sobre tu actividad agrícola..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={300}
            />
            <Text style={styles.charCount}>{bio.length}/300</Text>
          </View>

          {/* Guardar */}
          <Pressable
            style={({ pressed }) => [
              styles.btnSave,
              pressed && { opacity: 0.85 },
              loading && { opacity: 0.7 },
            ]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.btnSaveText}>Guardar cambios</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: spacing.xxxl + spacing.xl },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
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
  avatarSection: { alignItems: "center", paddingVertical: spacing.xl },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primaryDim,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: colors.primaryLight,
    marginBottom: spacing.md,
  },
  avatarText: { fontSize: font.xxl, fontWeight: "800", color: colors.primary },
  changePhotoText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: font.sm,
  },
  section: { marginHorizontal: spacing.lg, marginBottom: spacing.md },
  fieldLabel: {
    fontSize: font.sm,
    fontWeight: "700",
    color: colors.textSecond,
    marginBottom: spacing.sm,
  },
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
  textArea: { height: 100, paddingTop: spacing.md, textAlignVertical: "top" },
  charCount: {
    fontSize: font.xs,
    color: colors.textMuted,
    textAlign: "right",
    marginTop: spacing.xs,
  },
  selector: {
    height: 50,
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectorText: {
    fontSize: font.md,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  arrow: { fontSize: 10, color: colors.textMuted },
  dropdown: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.sm,
    overflow: "hidden",
  },
  provinceDropdown: {
    maxHeight: 180,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.sm,
  },
  dropdownItem: { paddingVertical: spacing.md, paddingHorizontal: spacing.md },
  dropdownItemActive: { backgroundColor: colors.primaryDim },
  dropdownText: { fontSize: font.sm, color: colors.textPrimary },
  dropdownTextActive: { color: colors.primary, fontWeight: "700" },
  btnSave: {
    backgroundColor: colors.primary,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    paddingVertical: spacing.md + 2,
    borderRadius: radius.md,
    alignItems: "center",
  },
  btnSaveText: { color: colors.white, fontSize: font.md, fontWeight: "700" },
});
