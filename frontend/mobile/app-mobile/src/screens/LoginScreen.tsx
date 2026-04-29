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
import Divider from "../components/Divider";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { login } from "../services/authService";
import { LoginRequest } from "../types/auth";
import { RootStackParamList } from "../types/navigation";
import AsyncStorage from "@react-native-async-storage/async-storage";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Login">;

export default function LoginScreen(): JSX.Element {
  const navigation = useNavigation<NavigationProp>();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const slideAnim = useRef(new Animated.Value(50)).current;

  // Validación simple email
  const isValidEmail = (email: string) => {
    return email.includes("@");
  };

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Completa todos los campos");
      return;
    }

    if (!isValidEmail(email)) {
      alert("Email inválido");
      return;
    }

    const loginData: LoginRequest = {
      email,
      password,
    };

    setLoading(true);

    try {
      const response = await login(loginData);

      console.log("Usuario:", response.user);
      console.log("Token:", response.token);

      // Limpia inputs
      setEmail("");
      setPassword("");

      await AsyncStorage.setItem("token", response.token);
      
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
          <Text style={styles.title}>🌱 Agro Link</Text>

          <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            placeholderTextColor="#999"
            onChangeText={setEmail}
            value={email}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor="#999"
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

          {/* BOTÓN LOGIN */}

          <Pressable
            onPress={handleLogin}
            disabled={loading}
            style={({ pressed }) => [
              styles.btnLogin,

              {
                transform: [
                  {
                    scale: pressed ? 0.96 : 1,
                  },
                ],
              },

              loading && {
                opacity: 0.7,
              },
            ]}
          >
            <Text style={styles.btnText}>
              {loading ? "Ingresando..." : "Ingresar"}
            </Text>
          </Pressable>

          <Divider />

          <Pressable
            onPress={() => navigation.navigate("Register")}
            style={({ pressed }) => [
              styles.btnRegister,
              {
                opacity: pressed ? 0.6 : 1,
              },
            ]}
          >
            <Text style={styles.btnRegisterText}>
              ¿No tienes cuenta?{" "}
              <Text style={styles.btnRegisterTextBold}>Regístrate aquí</Text>
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "rgba(0,0,0,0.2)",
  },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 25,
    borderRadius: 20,
    alignItems: "center",

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#2E7D32",
    marginBottom: 5,
  },

  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 30,
  },

  input: {
    height: 50,
    backgroundColor: "#F9F9F9",
    borderColor: "#E0E0E0",
    borderWidth: 1,
    marginBottom: 15,
    width: "100%",
    paddingHorizontal: 15,
    borderRadius: 10,
    fontSize: 16,
    color: "#333",
  },

  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },

  forgotPasswordText: {
    color: "#2E7D32",
    fontWeight: "600",
    fontSize: 14,
  },

  btnLogin: {
    backgroundColor: "#2E7D32",
    paddingVertical: 15,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },

  btnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  btnRegister: {
    marginTop: 10,
    padding: 10,
  },

  btnRegisterText: {
    color: "#666",
    fontSize: 14,
  },

  btnRegisterTextBold: {
    color: "#2E7D32",
    fontWeight: "bold",
  },
});
