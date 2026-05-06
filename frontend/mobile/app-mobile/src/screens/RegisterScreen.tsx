import React, { JSX, useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  Animated,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Divider from "../components/Divider";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { register } from "../services/authService";
import { RegisterRequest } from "../types/auth";
import { RootStackParamList } from "../types/navigation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors, shared, spacing, radius, font } from "../styles/theme";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Register">;

export default function RegisterScreen(): JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const isValidEmail = (value: string) => value.includes("@");

  const handleRegister = async () => {
    if (!nombre || !email || !telefono || !password) {
      alert("Completa todos los campos");
      return;
    }

    if (!isValidEmail(email)) {
      alert("Email inválido");
      return;
    }

    const registerData: RegisterRequest = { nombre, email, telefono, password };
    setLoading(true);

    try {
      const response = await register(registerData);
      await AsyncStorage.setItem("token", response.token);
      setNombre("");
      setEmail("");
      setTelefono("");
      setPassword("");
      navigation.navigate("Login");
    } catch (error: any) {
      alert(error.message || "Error en el registro");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <ImageBackground
      source={require("../../assets/login-bg.webp")}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Animated.View
            style={[
              styles.card,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={shared.title}>🌱 Agro Link</Text>
            <Text style={shared.subtitle}>Crear cuenta</Text>

            <TextInput
              style={shared.input}
              placeholder="Nombre completo"
              placeholderTextColor={colors.textMuted}
              onChangeText={setNombre}
              value={nombre}
            />

            <TextInput
              style={shared.input}
              placeholder="Email"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={setEmail}
              value={email}
            />

            <TextInput
              style={shared.input}
              placeholder="Teléfono"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
              onChangeText={setTelefono}
              value={telefono}
            />

            <TextInput
              style={shared.input}
              placeholder="Contraseña"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              onChangeText={setPassword}
              value={password}
            />

            <Pressable
              onPress={handleRegister}
              disabled={loading}
              style={({ pressed }) => [
                shared.btnPrimary,
                {
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                  opacity: loading ? 0.7 : 1,
                },
              ]}
            >
              <Text style={shared.btnPrimaryText}>
                {loading ? "Creando cuenta..." : "Crear cuenta"}
              </Text>
            </Pressable>

            <Divider />

            <Pressable
              onPress={() => navigation.navigate("Login")}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            >
              <Text style={styles.bottomText}>
                ¿Ya tienes cuenta? <Text style={styles.linkText}>Inicia sesión aquí</Text>
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  bottomText: {
    textAlign: "center",
    color: colors.textSecond,
    fontSize: font.sm,
  },
  linkText: {
    color: colors.primary,
    fontWeight: "700",
  },
});
