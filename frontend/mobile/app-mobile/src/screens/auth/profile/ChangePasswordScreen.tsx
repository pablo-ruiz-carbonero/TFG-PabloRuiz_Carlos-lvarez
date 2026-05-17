// src/screens/auth/profile/ChangePasswordScreen.tsx

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
} from "../../../styles/Globaltheme";
import { RootStackParamList } from "../../../types/navigation";
import { useAuth } from "../../../features/auth/hooks/useAuth";

type Nav = NavigationProp<RootStackParamList>;

interface FieldErrors {
  current?: string;
  newPass?: string;
  confirm?: string;
}

function PasswordField({
  label,
  value,
  onChange,
  show,
  toggleShow,
  error,
  field,
  placeholder,
  onBlur,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  toggleShow: () => void;
  error?: string;
  field: string;
  placeholder: string;
  onBlur: () => void;
}) {
  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.passwordRow, !!error && styles.inputError]}>
        <TextInput
          style={styles.passwordInput}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={!show}
          onBlur={onBlur}
          autoCapitalize="none"
        />
        <Pressable onPress={toggleShow} style={styles.eyeBtn} hitSlop={8}>
          <Text style={styles.eyeIcon}>{show ? "🙈" : "👁️"}</Text>
        </Pressable>
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

export default function ChangePasswordScreen() {
  const navigation = useNavigation<Nav>();
  const { changePassword } = useAuth(); // ✅ usa el AuthContext

  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const strength = (() => {
    if (!newPass) return 0;
    let score = 0;
    if (newPass.length >= 8) score++;
    if (/[A-Z]/.test(newPass)) score++;
    if (/[0-9]/.test(newPass)) score++;
    if (/[^A-Za-z0-9]/.test(newPass)) score++;
    return score;
  })();

  const strengthLabel = ["", "Débil", "Regular", "Buena", "Fuerte"][strength];
  const strengthColor = [
    "",
    colors.error,
    colors.warning,
    colors.info,
    colors.success,
  ][strength];

  const validate = (): FieldErrors => {
    const e: FieldErrors = {};
    if (!current) e.current = "Introduce tu contraseña actual";
    if (!newPass) e.newPass = "Introduce una nueva contraseña";
    else if (newPass.length < 8) e.newPass = "Mínimo 8 caracteres";
    if (!confirm) e.confirm = "Confirma tu nueva contraseña";
    else if (confirm !== newPass) e.confirm = "Las contraseñas no coinciden";
    return e;
  };

  const handleBlur = (field: string) => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors(validate());
  };

  const hasError = (f: keyof FieldErrors) => touched[f] && !!errors[f];

  const handleSave = async () => {
    setTouched({ current: true, newPass: true, confirm: true });
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      setLoading(true);
      await changePassword({ currentPassword: current, newPassword: newPass }); // ✅
      Alert.alert(
        "✅ Contraseña actualizada",
        "Tu contraseña ha sido cambiada correctamente.",
        [{ text: "OK", onPress: () => navigation.goBack() }],
      );
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : "La contraseña actual no es correcta.";
      Alert.alert("Error", msg);
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
          <View style={styles.header}>
            <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
              <Text style={styles.backButton}>← Volver</Text>
            </Pressable>
            <Text style={styles.headerTitle}>Cambiar contraseña</Text>
            <View style={{ width: 60 }} />
          </View>

          <View style={styles.iconSection}>
            <View style={styles.iconBox}>
              <Text style={styles.iconEmoji}>🔒</Text>
            </View>
            <Text style={styles.iconSubtitle}>
              Elige una contraseña segura con al menos 8 caracteres
            </Text>
          </View>

          <View style={[shared.card, styles.section]}>
            <PasswordField
              label="Contraseña actual"
              field="current"
              value={current}
              onChange={setCurrent}
              show={showCurrent}
              toggleShow={() => setShowCurrent((o) => !o)}
              placeholder="Tu contraseña actual"
              onBlur={() => handleBlur("current")}
              error={hasError("current") ? errors.current : undefined}
            />
            <View style={styles.divider} />
            <PasswordField
              label="Nueva contraseña"
              field="newPass"
              value={newPass}
              onChange={setNewPass}
              show={showNew}
              toggleShow={() => setShowNew((o) => !o)}
              placeholder="Mínimo 8 caracteres"
              onBlur={() => handleBlur("newPass")}
              error={hasError("newPass") ? errors.newPass : undefined}
            />
            {newPass.length > 0 && (
              <View style={styles.strengthWrapper}>
                <View style={styles.strengthBars}>
                  {[1, 2, 3, 4].map((i) => (
                    <View
                      key={i}
                      style={[
                        styles.strengthBar,
                        {
                          backgroundColor:
                            i <= strength ? strengthColor : colors.border,
                        },
                      ]}
                    />
                  ))}
                </View>
                <Text style={[styles.strengthLabel, { color: strengthColor }]}>
                  {strengthLabel}
                </Text>
              </View>
            )}
            <View style={styles.divider} />
            <PasswordField
              label="Confirmar nueva contraseña"
              field="confirm"
              value={confirm}
              onChange={setConfirm}
              show={showConfirm}
              toggleShow={() => setShowConfirm((o) => !o)}
              placeholder="Repite la nueva contraseña"
              onBlur={() => handleBlur("confirm")}
              error={hasError("confirm") ? errors.confirm : undefined}
            />
          </View>

          <View style={[shared.card, styles.tipsCard]}>
            <Text style={styles.tipsTitle}>💡 Consejos de seguridad</Text>
            {[
              "Usa al menos 8 caracteres",
              "Combina mayúsculas y minúsculas",
              "Incluye números y símbolos",
              "No uses la misma contraseña en otros sitios",
            ].map((tip) => (
              <Text key={tip} style={styles.tipItem}>
                · {tip}
              </Text>
            ))}
          </View>

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
              <Text style={styles.btnSaveText}>Actualizar contraseña</Text>
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
  iconSection: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryDim,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  iconEmoji: { fontSize: 36 },
  iconSubtitle: {
    fontSize: font.sm,
    color: colors.textSecond,
    textAlign: "center",
  },
  section: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  fieldWrapper: { gap: spacing.sm },
  fieldLabel: {
    fontSize: font.sm,
    fontWeight: "700",
    color: colors.textSecond,
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingRight: spacing.md,
  },
  inputError: { borderColor: colors.error, backgroundColor: colors.errorDim },
  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: spacing.md,
    fontSize: font.md,
    color: colors.textPrimary,
  },
  eyeBtn: { padding: spacing.xs },
  eyeIcon: { fontSize: 18 },
  errorText: { color: colors.error, fontSize: font.xs },
  divider: { height: 1, backgroundColor: colors.border },
  strengthWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  strengthBars: { flexDirection: "row", gap: spacing.xs, flex: 1 },
  strengthBar: { height: 4, flex: 1, borderRadius: 2 },
  strengthLabel: {
    fontSize: font.xs,
    fontWeight: "700",
    width: 50,
    textAlign: "right",
  },
  tipsCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  tipsTitle: { fontSize: font.sm, fontWeight: "700", color: colors.textSecond },
  tipItem: { fontSize: font.sm, color: colors.textSecond, lineHeight: 22 },
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
