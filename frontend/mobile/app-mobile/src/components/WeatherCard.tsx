import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

export default function WeatherCard({ navigation}: { navigation: any; }) {
  const weather = {
    temp: 24,
    condition: "Soleado",
    city: "Sevilla",
  };

  return (
    <Pressable
      style={styles.card}
      onPress={() => navigation.navigate("WeatherScreen")}
    >
      <Text style={styles.city}>{weather.city}</Text>
      <Text style={styles.temp}>{weather.temp}°</Text>
      <Text style={styles.condition}>{weather.condition}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 140,
    height: 140,
    backgroundColor: "#0ea5e9",
    borderRadius: 16,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  city: {
    color: "white",
    fontWeight: "bold",
  },
  temp: {
    fontSize: 32,
    color: "white",
    fontWeight: "bold",
  },
  condition: {
    color: "white",
    marginTop: 4,
  },
});