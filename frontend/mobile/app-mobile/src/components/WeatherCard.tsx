import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors, shared, spacing, font, radius } from "../styles/theme";

export default function WeatherCard({ navigation }: { navigation: any }) {
  const weather = {
    temp: 24,
    condition: "Soleado",
    city: "Sevilla",
  };

  return (
    <Pressable style={[shared.card, styles.card]} onPress={() => navigation.navigate("WeatherScreen")}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.label}>Clima actual</Text>
          <Text style={styles.city}>{weather.city}</Text>
        </View>
        <Text style={styles.condition}>{weather.condition}</Text>
      </View>
      <Text style={styles.temp}>{weather.temp}°</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  label: {
    color: colors.primary,
    fontSize: font.sm,
    fontWeight: "700",
  },
  city: {
    color: colors.textPrimary,
    fontSize: font.lg,
    fontWeight: "800",
  },
  temp: {
    fontSize: font.xxxl,
    color: colors.primary,
    fontWeight: "900",
  },
  condition: {
    color: colors.textSecond,
    fontSize: font.sm,
  },
});