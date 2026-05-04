import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated, Pressable } from "react-native";
import { colors, shared, radius, spacing, font } from "../styles/theme";

const avatarColors = [colors.primary, colors.primaryLight, "#16a34a", "#0ea5e9"];

export default function PerfilMenu({ user }: { user: any }) {
  const [menuVisible, setMenuVisible] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const colorFondo = useRef(avatarColors[Math.floor(Math.random() * avatarColors.length)]).current;

  const toggleMenu = () => {
    setMenuVisible((value) => !value);
    Animated.spring(scaleAnim, {
      toValue: menuVisible ? 0 : 1,
      useNativeDriver: true,
    }).start();
  };

  const inicial = user?.username?.charAt(0).toUpperCase() || "?";

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleMenu} style={styles.touchable}>
        {user?.photoURL ? (
          <Animated.Image source={{ uri: user.photoURL }} style={styles.avatarImg} />
        ) : (
          <View style={[styles.avatar, { backgroundColor: colorFondo }]}> 
            <Text style={styles.letter}>{inicial}</Text>
          </View>
        )}
      </TouchableOpacity>

      {menuVisible && (
        <Animated.View
          style={[
            styles.menu,
            {
              transform: [
                {
                  scale: scaleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.84, 1],
                  }),
                },
              ],
              opacity: scaleAnim,
            },
          ]}
        >
          {['Perfil', 'Configuración', 'Cerrar sesión'].map((item) => (
            <Pressable key={item} onPress={handleLogout} style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}>
              <Text style={styles.menuText}>{item}</Text>
            </Pressable>
          ))}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-end",
    padding: spacing.sm,
  },
  touchable: {
    borderRadius: radius.full,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.surface,
  },
  letter: {
    color: colors.white,
    fontWeight: "800",
    fontSize: font.lg,
  },
  avatarImg: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  menu: {
    marginTop: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    minWidth: 140,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 6,
  },
  menuItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  menuItemPressed: {
    backgroundColor: colors.primaryDim,
  },
  menuText: {
    color: colors.textPrimary,
    fontSize: font.sm,
  },
});
