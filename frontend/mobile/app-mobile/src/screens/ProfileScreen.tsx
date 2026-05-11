// src/screens/ProfileScreen.tsx
import React, { useState, useCallback } from "react";
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
import {
  useNavigation,
  NavigationProp,
  useFocusEffect,
} from "@react-navigation/native";
import { colors, shared, spacing, font, radius } from "../styles/theme";
import { RootStackParamList } from "../types/navigation";

type Nav = NavigationProp<RootStackParamList>;

interface UserProfile {
  id: string;
  name: string;
  initials: string;
  role: string;
  email: string;
  location: string;
  stats: { crops: number; tasks: number; listings: number };
}

const MOCK_PROFILE: UserProfile = {
  id: "user_1",
  name: "Carlos Aguilar",
  initials: "CA",
  role: "Agricultor",
  email: "carlos@agroink.es",
  location: "Almería",
  stats: { crops: 3, tasks: 24, listings: 5 },
};

interface MenuOption {
  id: string;
  label: string;
  icon: string;
  screen?: keyof RootStackParamList;
  danger?: boolean;
  action?: "logout" | "navigate";
}

const MENU_OPTIONS: MenuOption[] = [
  {
    id: "edit",
    label: "Editar perfil",
    icon: "✏️",
    screen: "EditProfileScreen",
    action: "navigate",
  },
  {
    id: "listings",
    label: "Mis anuncios",
    icon: "📦",
    screen: "MyListingsScreen",
    action: "navigate",
  },
  {
    id: "notif",
    label: "Notificaciones",
    icon: "🔔",
    screen: "NotificationsScreen",
    action: "navigate",
  },
  {
    id: "password",
    label: "Cambiar contraseña",
    icon: "🔒",
    screen: "ChangePasswordScreen",
    action: "navigate",
  },
  {
    id: "logout",
    label: "Cerrar sesión",
    icon: "🚪",
    danger: true,
    action: "logout",
  },
];

export default function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, []),
  );

  const loadProfile = async () => {
    try {
      setLoading(true);
      // TODO (backend): const data = await authService.getMe();
      await new Promise((r) => setTimeout(r, 400));
      setProfile(MOCK_PROFILE);
    } catch {
      Alert.alert("Error", "No se pudo cargar el perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleMenuPress = (option: MenuOption) => {
    if (option.action === "logout") {
      handleLogout();
      return;
    }
    if (option.screen) {
      navigation.navigate(option.screen as any);
    }
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
            try {
              // TODO (backend): await authService.logout();
              // await AsyncStorage.removeItem("agrolink_token");
              navigation.reset({ index: 0, routes: [{ name: "Login" }] });
            } catch {
              Alert.alert("Error", "No se pudo cerrar sesión");
            }
          },
        },
      ],
    );
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

  if (!profile) return null;

  return (
    <SafeAreaView style={shared.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Perfil</Text>
        </View>

        <View style={[shared.card, styles.profileCard]}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{profile.initials}</Text>
            </View>
          </View>
          <Text style={styles.profileName}>{profile.name}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>{profile.role}</Text>
          </View>
          <Text style={styles.profileEmail}>{profile.email}</Text>
          <Text style={styles.profileLocation}>📍 {profile.location}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={[shared.card, styles.statBox]}>
            <Text style={styles.statValue}>{profile.stats.crops}</Text>
            <Text style={styles.statLabel}>Cultivos</Text>
          </View>
          <View style={[shared.card, styles.statBox]}>
            <Text style={styles.statValue}>{profile.stats.tasks}</Text>
            <Text style={styles.statLabel}>Tareas</Text>
          </View>
          <View style={[shared.card, styles.statBox]}>
            <Text style={styles.statValue}>{profile.stats.listings}</Text>
            <Text style={styles.statLabel}>Anuncios</Text>
          </View>
        </View>

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
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
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
  avatarContainer: { marginBottom: spacing.md },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryDim,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: colors.primaryLight,
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
