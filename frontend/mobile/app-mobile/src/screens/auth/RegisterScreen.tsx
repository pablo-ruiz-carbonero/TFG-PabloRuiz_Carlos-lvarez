// src/screens/RegisterScreen.tsx

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
import { colors, shared } from "../../styles/Globaltheme";
import { styles } from "../../styles/auth/register.styles";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Register">;

export default function RegisterScreen(): JSX.Element {
  const navigation = useNavigation<NavigationProp>();

  const { register } = useAuth();
  const { loading, error, execute } = useAuthForm();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // ✅ Mostrar error del servidor cuando cambia
  useEffect(() => {
    if (error) {
      Alert.alert("Error al registrarse", error);
    }
  }, [error]);

  const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

  const handleRegister = () => {
    if (!nombre || !email || !password) {
      Alert.alert("Campos incompletos", "Completa todos los campos");
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert("Email inválido", "Introduce un email válido");
      return;
    }

    execute(async () => {
      // ✅ Ahora se pasa telefono al contexto → API → backend
      await register(email, password, nombre);

      setNombre("");
      setEmail("");
      setPassword("");

      // Nota: si el register tiene éxito, AuthContext setea el user
      // y AppNavigator redirige automáticamente a MainStack.
      // Solo navega a Login si tu flujo requiere verificación de email, etc.
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
                ¿Ya tienes cuenta?{" "}
                <Text style={styles.linkText}>Inicia sesión aquí</Text>
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}
