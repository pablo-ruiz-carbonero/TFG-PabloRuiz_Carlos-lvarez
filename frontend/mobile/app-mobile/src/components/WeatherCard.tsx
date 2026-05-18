// src/components/WeatherCard.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Card de clima para HomeScreen — conectada a WeatherContext.
// Si no hay datos todavía los carga automáticamente.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { colors, spacing, font, radius } from "../styles/Globaltheme";
import { RootStackParamList } from "../types/navigation";
import { useWeather } from "../features/weather/hooks/useWeather";

type Nav = NavigationProp<RootStackParamList>;

function StatItem({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function WeatherCard() {
  const navigation = useNavigation<Nav>();
  const { weatherData, loading, error, fetchWeatherByCity, currentCity } =
    useWeather();

  // Carga inicial si aún no hay datos (el HomeScreen no necesita saber nada)
  useEffect(() => {
    if (!weatherData && !loading) {
      fetchWeatherByCity(currentCity || "Sevilla");
    }
  }, []);

  const current = weatherData?.current;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
      onPress={() => navigation.navigate("WeatherScreen")}
    >
      {loading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={colors.white} size="small" />
          <Text style={styles.loadingText}>Cargando clima...</Text>
        </View>
      ) : error || !current ? (
        <View style={styles.loadingRow}>
          <Text style={styles.errorText}>
            ⚠️ {error ?? "Sin datos de clima"}
          </Text>
        </View>
      ) : (
        <>
          {/* Fila superior */}
          <View style={styles.topRow}>
            <View>
              <Text style={styles.label}>☁️ Clima actual</Text>
              <Text style={styles.city}>
                📍 {current.city}
                {current.country ? `, ${current.country}` : ""}
              </Text>
            </View>
            <View style={styles.conditionBadge}>
              <Text style={styles.conditionEmoji}>
                {current.conditionEmoji}
              </Text>
              <Text style={styles.conditionText}>{current.condition}</Text>
            </View>
          </View>

          {/* Temperatura */}
          <Text style={styles.temp}>{current.temp}°C</Text>

          {/* Stats inferiores */}
          <View style={styles.statsRow}>
            <StatItem icon="🌡️" label={`Sens. ${current.feelsLike}°`} />
            <StatItem icon="💧" label={`Humedad ${current.humidity}%`} />
            <StatItem icon="💨" label={`Viento ${current.windSpeed} km/h`} />
          </View>

          <Text style={styles.tapHint}>
            Toca para ver el pronóstico completo →
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  loadingText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: font.sm,
  },
  errorText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: font.sm,
    fontWeight: "600",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  label: {
    color: "rgba(255,255,255,0.75)",
    fontSize: font.xs,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  city: {
    color: colors.white,
    fontSize: font.md,
    fontWeight: "700",
  },
  conditionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
  },
  conditionEmoji: { fontSize: 14 },
  conditionText: {
    color: colors.white,
    fontSize: font.sm,
    fontWeight: "700",
  },
  temp: {
    fontSize: 52,
    fontWeight: "900",
    color: colors.white,
    lineHeight: 58,
    marginVertical: spacing.sm,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  statIcon: { fontSize: 11 },
  statLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: font.xs,
    fontWeight: "600",
  },
  tapHint: {
    color: "rgba(255,255,255,0.5)",
    fontSize: font.xs,
    marginTop: spacing.md,
    textAlign: "right",
  },
});
