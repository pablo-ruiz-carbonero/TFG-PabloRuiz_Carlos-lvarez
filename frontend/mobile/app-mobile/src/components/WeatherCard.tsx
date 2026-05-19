// src/components/WeatherCard.tsx

import React, { useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors, spacing, font, radius } from "../styles/Globaltheme";
import { RootStackParamList } from "../types/navigation";
import { useWeather } from "../features/weather/hooks/useWeather";

type Nav = NavigationProp<RootStackParamList>;

function StatItem({
  icon,
  label,
}: {
  icon: React.ComponentProps<typeof MaterialIcons>["name"];
  label: string;
}) {
  return (
    <View style={styles.statItem}>
      <MaterialIcons name={icon} size={13} color="rgba(255,255,255,0.8)" />
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function WeatherCard() {
  const navigation = useNavigation<Nav>();
  const { weatherData, loading, error, fetchWeatherByCity, currentCity } =
    useWeather();

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
          <MaterialIcons
            name="warning"
            size={16}
            color="rgba(255,255,255,0.85)"
          />
          <Text style={styles.errorText}> {error ?? "Sin datos de clima"}</Text>
        </View>
      ) : (
        <>
          {/* Fila superior */}
          <View style={styles.topRow}>
            <View>
              <View style={styles.labelRow}>
                <MaterialIcons
                  name="cloud"
                  size={12}
                  color="rgba(255,255,255,0.75)"
                />
                <Text style={styles.label}> Clima actual</Text>
              </View>
              <View style={styles.cityRow}>
                <MaterialIcons
                  name="location-on"
                  size={14}
                  color={colors.white}
                />
                <Text style={styles.city}>
                  {current.city}
                  {current.country ? `, ${current.country}` : ""}
                </Text>
              </View>
            </View>
            <View style={styles.conditionBadge}>
              <Text style={styles.conditionText}>{current.condition}</Text>
            </View>
          </View>

          {/* Temperatura */}
          <Text style={styles.temp}>{current.temp}°C</Text>

          {/* Stats inferiores */}
          <View style={styles.statsRow}>
            <StatItem icon="thermostat" label={`Sens. ${current.feelsLike}°`} />
            <StatItem
              icon="water-drop"
              label={`Humedad ${current.humidity}%`}
            />
            <StatItem icon="air" label={`Viento ${current.windSpeed} km/h`} />
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
  loadingText: { color: "rgba(255,255,255,0.8)", fontSize: font.sm },
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
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  label: {
    color: "rgba(255,255,255,0.75)",
    fontSize: font.xs,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  cityRow: { flexDirection: "row", alignItems: "center" },
  city: { color: colors.white, fontSize: font.md, fontWeight: "700" },
  conditionBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
  },
  conditionText: { color: colors.white, fontSize: font.sm, fontWeight: "700" },
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
  statItem: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
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
