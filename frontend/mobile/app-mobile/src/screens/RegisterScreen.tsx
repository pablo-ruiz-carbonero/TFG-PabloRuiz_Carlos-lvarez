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

export default function RegisterScreen(): JSX.Element {
  const navigation = useNavigation<any>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

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
            onChangeText={setEmail}
            value={email}
            keyboardType="default"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            onChangeText={setPassword}
            value={password}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Telefono"
            placeholderTextColor="#999"
            onChangeText={setPassword}
            value={password}
            keyboardType="phone-pad"
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
            onPress={() => navigation.navigate("Login")}
            style={({ pressed }) => [
              styles.btnRegister,
              { transform: [{ scale: pressed ? 0.96 : 1 }] },
            ]}
          >
            <Text style={styles.btnText}>Crear cuenta</Text>
          </Pressable>

          <Divider />

          <Pressable
            onPress={() => navigation.navigate("Login")}
            style={({ pressed }) => [
              styles.btnLogin,
              { opacity: pressed ? 0.6 : 1 },
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
