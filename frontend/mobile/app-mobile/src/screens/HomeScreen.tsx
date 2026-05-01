import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PerfilMenu from "../components/PerfilMenu";
import WeatherCard from "../components/WeatherCard";
import WeatherScreen from "./WeatherScreen";

export default function HomeScreen({ navigation }: any) {
  const [fecha, setFecha] = useState(new Date());
  const [username, setUsername] = useState("");

  const user = {
    username,
    photoURL: null, // luego vendrá del backend
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setFecha(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const obtenerUsuario = async () => {
      // try {
      //   const res = await fetch("https://tu-api.com/user");
      //   const data = await res.json();
      //   setUsername(data.username);
      // } catch (error) {
      //   console.log(error);
      // }
      setUsername("Carlos");
    };
    obtenerUsuario();
  }, []);

  const partes = fecha
    .toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    .replace(" de ", " ")
    .replace(" de ", " ");

  const formato = partes.charAt(0).toUpperCase() + partes.slice(1);

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>Hola, {username}!</Text>
      <Text style={styles.subtitle}>{formato}</Text>
      <PerfilMenu user={user} />
      <WeatherCard navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "85%",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 20,
  }
});
