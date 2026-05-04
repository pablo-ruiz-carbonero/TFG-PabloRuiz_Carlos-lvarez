import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, shared, spacing, font } from "../styles/theme";

export default function WeatherScreen() {
  return (
    <SafeAreaView style={shared.screen}>
      <View style={[shared.card, styles.card]}>
        <Text style={styles.title}>🌤️ Clima detallado</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Temperatura</Text>
          <Text style={styles.value}>24°</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Humedad</Text>
          <Text style={styles.value}>60%</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Viento</Text>
          <Text style={styles.value}>12 km/h</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: spacing.lg,
  },
  title: {
    fontSize: font.xxl,
    color: colors.primary,
    fontWeight: "800",
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    color: colors.textSecond,
    fontSize: font.md,
  },
  value: {
    color: colors.textPrimary,
    fontSize: font.md,
    fontWeight: "700",
  },
});