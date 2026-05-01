import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Pressable,
} from "react-native";

const colores = ["#4f46e5", "#16a34a", "#f97316", "#dc2626", "#0ea5e9"];

export default function PerfilMenu({ user }: { user: any }) {
  const [menuVisible, setMenuVisible] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  // 🎨 Color fijo por usuario (no cambia cada render)
  const colorFondo = useRef(
    colores[Math.floor(Math.random() * colores.length)],
  ).current;

  // 🎬 Animación menú
  const toggleMenu = () => {
    setMenuVisible(!menuVisible);

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
      {/* AVATAR */}
      <TouchableOpacity onPress={toggleMenu}>
        {user?.photoURL ? (
          <Animated.Image
            source={{ uri: user.photoURL }}
            style={styles.avatarImg}
          />
        ) : (
          <View style={[styles.avatar, { backgroundColor: colorFondo }]}>
            <Text style={styles.letra}>{inicial}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* MENU */}
      {menuVisible && (
        <Animated.View
          style={[
            styles.menu,
            {
              transform: [
                {
                  scale: scaleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
              opacity: scaleAnim,
            },
          ]}
        >
          <Text style={styles.item}>Perfil</Text>
          <Pressable onPress={handleLogout}>
            <Text style={styles.item}>Configuracion</Text>
          </Pressable>
          <Pressable onPress={handleLogout}>
            <Text style={styles.item}>Cerrar sesión</Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-end",
    padding: 20,
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
  },

  letra: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },

  avatarImg: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
  },

  menu: {
    marginTop: 10,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    elevation: 6,
  },

  item: {
    paddingVertical: 8,
  },
});
