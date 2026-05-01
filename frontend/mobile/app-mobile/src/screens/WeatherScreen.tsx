import React from "react";
import { View, Text } from "react-native";

export default function WeatherScreen() {
  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24 }}>🌤️ Clima detallado</Text>

      <Text>Temperatura: 24°</Text>
      <Text>Humedad: 60%</Text>
      <Text>Viento: 12 km/h</Text>
    </View>
  );
}