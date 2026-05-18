// src/components/PerfilMenu.tsx

import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { colors, radius, spacing, font } from "../styles/Globaltheme";
import { RootStackParamList } from "../types/navigation";
import { useAuth } from "../features/auth/hooks/useAuth";
import { getUserInitials } from "../features/auth/types/auth.types";

type Nav = NavigationProp<RootStackParamList>;

export default function PerfilMenu() {
  const navigation = useNavigation<Nav>();
  const { user, loading } = useAuth();

  // Mientras carga, mostrar spinner en lugar de "?"
  if (loading) {
    return (
      <View style={styles.avatar}>
        <ActivityIndicator size="small" color={colors.white} />
      </View>
    );
  }

  // ✅ Protección: user puede ser null en el primer render
  const initials = user ? getUserInitials(user) : "–";

  return (
    <Pressable
      style={({ pressed }) => [styles.avatar, pressed && { opacity: 0.8 }]}
      onPress={() => navigation.navigate("ProfileScreen")}
    >
      <Text style={styles.letter}>{initials}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.primaryDim,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  letter: {
    color: colors.white,
    fontWeight: "800",
    fontSize: font.md,
    letterSpacing: 0.5,
  },
});
