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
import { register } from "../services/authService";
import { RegisterRequest } from "../types/auth";
import { RootStackParamList } from "../types/navigation";
import AsyncStorage from "@react-native-async-storage/async-storage";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Register">;

export default function RegisterScreen(): JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const isValidEmail = (email: string) => email.includes("@");

  const handleRegister = async () => {
    if (!name || !email || !phone || !password) {
      alert("Completa todos los campos");
      return;
    }

    if (!isValidEmail(email)) {
      alert("Email inválido");
      return;
    }

    const registerData: RegisterRequest = {
      name,
      email,
      phone,
      password,
    };

    setLoading(true);

    try {
      const response = await register(registerData);

      console.log(response);

      // Limpia campos
      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
      await AsyncStorage.setItem("token", response.token);

      navigation.navigate("Login");
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

          <Text style={styles.subtitle}>Crear cuenta</Text>

          <TextInput
            style={styles.input}
            placeholder="Nombre completo"
            placeholderTextColor="#999"
            onChangeText={setName}
            value={name}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={setEmail}
            value={email}
          />

          <TextInput
            style={styles.input}
            placeholder="Teléfono"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            onChangeText={setPhone}
            value={phone}
          />

          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor="#999"
            secureTextEntry
            onChangeText={setPassword}
            value={password}
          />

          {/* BOTÓN REGISTER */}

          <Pressable
            onPress={handleRegister}
            disabled={loading}
            style={({ pressed }) => [
              styles.btnRegister,

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
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </Text>
          </Pressable>

          <Divider />

          <Pressable
            onPress={() => navigation.navigate("Login")}
            style={({ pressed }) => [
              styles.btnLogin,
              {
                opacity: pressed ? 0.6 : 1,
              },
            ]}
          >
            <Text style={styles.btnLoginText}>
              ¿Ya tienes cuenta?{" "}
              <Text style={styles.btnLoginTextBold}>Inicia sesión aquí</Text>
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
    backgroundColor: "rgba(0,0,0,0.2)", // 👈 mejora legibilidad
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 25,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
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
  btnRegister: {
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
  btnLogin: {
    marginTop: 10,
    padding: 10,
  },
  btnLoginText: {
    color: "#666",
    fontSize: 14,
  },
  btnLoginTextBold: {
    color: "#2E7D32",
    fontWeight: "bold",
  },
});
