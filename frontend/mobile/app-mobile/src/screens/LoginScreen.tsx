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
import { login } from "../services/authService";
import { LoginRequest } from "../types/auth";
import { RootStackParamList } from "../types/navigation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors, shared, spacing, radius, font } from "../styles/theme";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Login">;

export default function LoginScreen(): JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const isValidEmail = (value: string) => value.includes("@");

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Completa todos los campos");
      return;
    }

    if (!isValidEmail(email)) {
      alert("Email inválido");
      return;
    }

    const loginData: LoginRequest = { email, password };
    setLoading(true);

    try {
      const response = await login(loginData);
      await AsyncStorage.setItem("token", response.token);
      setEmail("");
      setPassword("");
    } catch (error: any) {
      alert(error);
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
            <Text style={shared.subtitle}>Inicia sesión para continuar</Text>

            <TextInput
              style={shared.input}
              placeholder="Correo electrónico"
              placeholderTextColor={colors.textMuted}
              onChangeText={setEmail}
              value={email}
              keyboardType="email-address"
              autoCapitalize="none"
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
              onPress={() => alert("Funcionalidad de recuperación pronto...")}
              style={styles.forgotPasswordContainer}
            >
              <Text style={styles.forgotPasswordText}>
                ¿Olvidaste tu contraseña?
              </Text>
            </Pressable>

            <Pressable
              onPress={handleLogin}
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
                {loading ? "Ingresando..." : "Ingresar"}
              </Text>
            </Pressable>

            <Divider />

            <Pressable
              onPress={() => navigation.navigate("Register")}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            >
              <Text style={styles.bottomText}>
                ¿No tienes cuenta? <Text style={styles.linkText}>Regístrate aquí</Text>
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
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginBottom: spacing.lg,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: font.sm,
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
