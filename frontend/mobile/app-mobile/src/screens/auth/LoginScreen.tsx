// src/screens/LoginScreen.tsx

import React, { JSX, useEffect, useRef, useState } from "react";
import {
  Text,
  View,
  TextInput,
  Pressable,
  Animated,
  ImageBackground,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Divider from "../../components/Divider";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { useAuthForm } from "../../features/auth/hooks/useAuthForm";
import { RootStackParamList } from "../../types/navigation";
import { styles } from "../../styles/auth/login.styles";
import { shared, colors } from "../../styles/Globaltheme";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Login">;

export default function LoginScreen(): JSX.Element {
  const navigation = useNavigation<NavigationProp>();

  const { login, devLogin, isDevMode } = useAuth();
  const { loading, execute } = useAuthForm();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const isValidEmail = (value: string) => value.includes("@");

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("Campos incompletos", "Completa todos los campos");
      return;
    }
    if (!isValidEmail(email)) {
      Alert.alert("Email inválido", "Introduce un email válido");
      return;
    }
    execute(async () => {
      await login(email, password);
      setEmail("");
      setPassword("");
    });
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
      source={require("../../../assets/login-bg.webp")}
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
            <Text style={shared.title}>Agro Link</Text>
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
                ¿No tienes cuenta?{" "}
                <Text style={styles.linkText}>Regístrate aquí</Text>
              </Text>
            </Pressable>

            {/* 🚧 Solo visible en desarrollo */}
            {isDevMode && (
              <Pressable
                onPress={devLogin}
                style={({ pressed }) => ({
                  marginTop: 24,
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderStyle: "dashed",
                  borderColor: "#f59e0b",
                  backgroundColor: pressed
                    ? "rgba(245,158,11,0.15)"
                    : "rgba(245,158,11,0.08)",
                  alignItems: "center",
                })}
              >
                <Text
                  style={{
                    color: "#f59e0b",
                    fontSize: 12,
                    fontWeight: "600",
                    letterSpacing: 0.5,
                  }}
                >
                  🚧 Entrar sin backend (DEV)
                </Text>
              </Pressable>
            )}
          </Animated.View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}