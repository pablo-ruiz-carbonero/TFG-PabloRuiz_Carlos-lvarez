// src/screens/auth/profile/ProfileScreen.tsx

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
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
import { getUserInitials } from "../../../features/auth/types/auth.types";
import { useCrops } from "../../../features/crops/hooks/useCrops";
import { useProducts } from "../../../features/products/hooks/useProducts";

type Nav = NavigationProp<RootStackParamList>;

interface MenuOption {
  id: string;
  label: string;
  icon: string;
  screen?: keyof RootStackParamList;
  danger?: boolean;
}

const MENU_OPTIONS: MenuOption[] = [
  {
    id: "edit",
    label: "Editar perfil",
    icon: "✏️",
    screen: "EditProfileScreen",
  },
  {
    id: "listings",
    label: "Mis anuncios",
    icon: "📦",
    screen: "MyListingsScreen",
  },
  {
    id: "notif",
    label: "Notificaciones",
    icon: "🔔",
    screen: "NotificationsScreen",
  },
  {
    id: "password",
    label: "Cambiar contraseña",
    icon: "🔒",
    screen: "ChangePasswordScreen",
  },
  { id: "logout", label: "Cerrar sesión", icon: "🚪", danger: true },
];

export default function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { user, logout } = useAuth();
  const { crops } = useCrops();
  const { myProducts } = useProducts();

  // ✅ Pantalla de carga en lugar de pantalla en blanco
  if (!user) {
    return (
      <SafeAreaView style={shared.screen}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const initials = getUserInitials(user);

  // Stats dinámicos desde los contextos
  const stats = [
    { label: "Cultivos", value: crops.length },
    { label: "Anuncios", value: myProducts.length },
  ];

  const handleMenuPress = (option: MenuOption) => {
    if (option.danger) {
      handleLogout();
      return;
    }
    if (option.screen) navigation.navigate(option.screen as any);
  };

  const handleLogout = () => {
    Alert.alert(
      "Cerrar sesión",
      "¿Estás seguro de que quieres cerrar sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cerrar sesión",
          style: "destructive",
          onPress: async () => {
            await logout(); // ✅ usa el logout del AuthContext
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={shared.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Perfil</Text>
        </View>

        {/* Avatar + datos */}
        <View style={[shared.card, styles.profileCard]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.profileName}>{user.name ?? "Sin nombre"}</Text>
          {user.role && (
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{user.role}</Text>
            </View>
          )}
          <Text style={styles.profileEmail}>{user.email}</Text>
          {user.location && (
            <Text style={styles.profileLocation}>📍 {user.location}</Text>
          )}
          {user.bio && <Text style={styles.profileBio}>{user.bio}</Text>}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {stats.map((s) => (
            <View key={s.label} style={[shared.card, styles.statBox]}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Menú */}
        <View style={[shared.card, styles.menuCard]}>
          {MENU_OPTIONS.map((option, index) => (
            <React.Fragment key={option.id}>
              {option.danger && <View style={styles.menuDivider} />}
              <Pressable
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed && { backgroundColor: colors.surfaceAlt },
                ]}
                onPress={() => handleMenuPress(option)}
              >
                <View style={styles.menuItemLeft}>
                  <View
                    style={[
                      styles.menuIconBox,
                      option.danger && styles.menuIconBoxDanger,
                    ]}
                  >
                    <Text style={styles.menuIcon}>{option.icon}</Text>
                  </View>
                  <Text
                    style={[
                      styles.menuLabel,
                      option.danger && styles.menuLabelDanger,
                    ]}
                  >
                    {option.label}
                  </Text>
                </View>
                {!option.danger && <Text style={styles.menuArrow}>→</Text>}
              </Pressable>
              {index < MENU_OPTIONS.length - 1 && !option.danger && (
                <View style={styles.itemSeparator} />
              )}
            </React.Fragment>
          ))}
        </View>

        <Text style={styles.versionText}>AgroLink v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: spacing.xxxl },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: font.xl,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  profileCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    alignItems: "center",
    paddingVertical: spacing.xxl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryDim,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: colors.primaryLight,
    marginBottom: spacing.md,
  },
  avatarText: { fontSize: font.xxl, fontWeight: "800", color: colors.primary },
  profileName: {
    fontSize: font.xl,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  roleBadge: {
    backgroundColor: colors.primaryDim,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 1,
    borderRadius: radius.full,
    marginBottom: spacing.sm,
  },
  roleBadgeText: {
    fontSize: font.sm,
    fontWeight: "700",
    color: colors.primary,
  },
  profileEmail: {
    fontSize: font.sm,
    color: colors.textSecond,
    marginBottom: spacing.xs,
  },
  profileLocation: { fontSize: font.sm, color: colors.textMuted },
  profileBio: {
    fontSize: font.sm,
    color: colors.textSecond,
    textAlign: "center",
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.md,
    marginBottom: 0,
  },
  statValue: {
    fontSize: font.xxl,
    fontWeight: "800",
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: { fontSize: font.xs, color: colors.textMuted, fontWeight: "600" },
  menuCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: 0,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
  },
  menuItemLeft: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primaryDim,
    alignItems: "center",
    justifyContent: "center",
  },
  menuIconBoxDanger: { backgroundColor: colors.errorDim },
  menuIcon: { fontSize: 18 },
  menuLabel: {
    fontSize: font.md,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  menuLabelDanger: { color: colors.error },
  menuArrow: { fontSize: font.md, color: colors.textMuted },
  itemSeparator: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing.lg + 36 + spacing.md,
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  versionText: {
    textAlign: "center",
    fontSize: font.xs,
    color: colors.textMuted,
    marginTop: spacing.lg,
  },
});
