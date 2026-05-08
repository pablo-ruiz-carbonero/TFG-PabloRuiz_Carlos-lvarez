// src/screens/WeatherScreen.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Estructura completa lista para conectar a OpenWeatherMap u otra API.
// Busca los comentarios "TODO (API)" para ver qué hay que reemplazar.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { colors, shared, spacing, font, radius } from "../styles/theme";
import { RootStackParamList } from "../types/navigation";

type Nav = NavigationProp<RootStackParamList>;

// ── Tipos ─────────────────────────────────────────────────────────────────────
interface DayForecast {
  day: string; // "Jue", "Vie"...
  emoji: string;
  high: number;
  low: number;
}

interface WeatherAlert {
  id: string;
  type: string;
  description: string;
  severity: "low" | "medium" | "high";
}

interface WeatherData {
  city: string;
  country: string;
  temp: number;
  feelsLike: number;
  condition: string;
  conditionEmoji: string;
  humidity: number;
  windSpeed: number;
  forecast: DayForecast[];
  alerts: WeatherAlert[];
}

// ── Mock (reemplazar por llamada real) ────────────────────────────────────────
const MOCK_WEATHER: WeatherData = {
  city: "Almería",
  country: "España",
  temp: 22,
  feelsLike: 20,
  condition: "Soleado",
  conditionEmoji: "☀️",
  humidity: 45,
  windSpeed: 12,
  forecast: [
    { day: "Jue", emoji: "⛅", high: 24, low: 15 },
    { day: "Vie", emoji: "🌤️", high: 21, low: 14 },
    { day: "Sáb", emoji: "🌧️", high: 17, low: 13 },
    { day: "Dom", emoji: "⛅", high: 19, low: 12 },
    { day: "Lun", emoji: "☀️", high: 23, low: 14 },
  ],
  alerts: [
    {
      id: "a1",
      type: "Riesgo de helada",
      description: "Sábado por la noche · T mín: 2°C",
      severity: "high",
    },
  ],
};

// TODO (API): reemplazar esta función por fetch a OpenWeatherMap
// const API_KEY = process.env.EXPO_PUBLIC_OWM_KEY;
// async function fetchWeather(city: string): Promise<WeatherData> {
//   const res = await fetch(
//     `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric&lang=es`
//   );
//   const json = await res.json();
//   return mapOwmToWeatherData(json); // mapear al formato WeatherData
// }

async function fetchWeatherMock(city: string): Promise<WeatherData> {
  await new Promise((r) => setTimeout(r, 700));
  return { ...MOCK_WEATHER, city };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const alertColor: Record<string, string> = {
  low: colors.info,
  medium: colors.warning,
  high: colors.error,
};
const alertBg: Record<string, string> = {
  low: colors.infoDim,
  medium: colors.warningDim,
  high: colors.errorDim,
};

// ── Componente ────────────────────────────────────────────────────────────────
export default function WeatherScreen() {
  const navigation = useNavigation<Nav>();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationInput, setLocationInput] = useState("");
  const [editingLocation, setEditingLocation] = useState(false);
  const [currentCity, setCurrentCity] = useState("Almería");
  const [error, setError] = useState("");

  useEffect(() => {
    loadWeather(currentCity);
  }, []);

  const loadWeather = async (city: string) => {
    try {
      setLoading(true);
      setError("");
      // TODO (API): cambiar fetchWeatherMock por fetchWeather cuando la API esté lista
      const data = await fetchWeatherMock(city);
      setWeather(data);
      setCurrentCity(city);
    } catch {
      setError("No se pudo obtener el clima. Comprueba la ciudad.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeLocation = () => {
    if (!locationInput.trim()) return;
    setEditingLocation(false);
    loadWeather(locationInput.trim());
    setLocationInput("");
  };

  return (
    <SafeAreaView style={shared.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Text style={styles.backButton}>← Volver</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Clima</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Selector de ubicación */}
        <View style={[shared.card, styles.locationCard]}>
          {editingLocation ? (
            <View style={styles.locationEditRow}>
              <TextInput
                style={styles.locationInput}
                placeholder="Escribe una ciudad..."
                placeholderTextColor={colors.textMuted}
                value={locationInput}
                onChangeText={setLocationInput}
                autoFocus
                returnKeyType="search"
                onSubmitEditing={handleChangeLocation}
              />
              <Pressable
                style={styles.btnSearch}
                onPress={handleChangeLocation}
              >
                <Text style={styles.btnSearchText}>Buscar</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={styles.locationRow}
              onPress={() => setEditingLocation(true)}
            >
              <Text style={styles.locationText}>📍 {currentCity}</Text>
              <Text style={styles.locationChange}>Cambiar ubicación...</Text>
            </Pressable>
          )}
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Cargando clima...</Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={styles.errorEmoji}>⚠️</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable
              style={styles.retryBtn}
              onPress={() => loadWeather(currentCity)}
            >
              <Text style={styles.retryBtnText}>Reintentar</Text>
            </Pressable>
          </View>
        ) : weather ? (
          <>
            {/* Temperatura principal */}
            <View style={[shared.card, styles.mainCard]}>
              <Text style={styles.cityName}>
                {weather.city}, {weather.country}
              </Text>
              <Text style={styles.mainTemp}>{weather.temp}°C</Text>
              <View style={styles.conditionBadge}>
                <Text style={styles.conditionEmoji}>
                  {weather.conditionEmoji}
                </Text>
                <Text style={styles.conditionText}>{weather.condition}</Text>
              </View>
              <Text style={styles.feelsLike}>
                Humedad {weather.humidity}% · Viento {weather.windSpeed} km/h
              </Text>
            </View>

            {/* Previsión 5 días */}
            <View style={[shared.card, styles.section]}>
              <Text style={shared.sectionTitle}>Próximos 5 días</Text>
              <View style={styles.forecastRow}>
                {weather.forecast.map((day) => (
                  <View key={day.day} style={styles.forecastDay}>
                    <Text style={styles.forecastDayName}>{day.day}</Text>
                    <Text style={styles.forecastEmoji}>{day.emoji}</Text>
                    <Text style={styles.forecastHigh}>{day.high}°</Text>
                    <Text style={styles.forecastLow}>{day.low}°</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Alertas agrícolas */}
            {weather.alerts.length > 0 && (
              <View style={[shared.card, styles.section]}>
                <Text style={shared.sectionTitle}>Alertas agrícolas</Text>
                {weather.alerts.map((alert) => (
                  <View
                    key={alert.id}
                    style={[
                      styles.alertItem,
                      {
                        backgroundColor:
                          alertBg[alert.severity] ?? colors.warningDim,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.alertDot,
                        { backgroundColor: alertColor[alert.severity] },
                      ]}
                    />
                    <View style={styles.alertContent}>
                      <Text
                        style={[
                          styles.alertType,
                          { color: alertColor[alert.severity] },
                        ]}
                      >
                        {alert.type}
                      </Text>
                      <Text style={styles.alertDesc}>{alert.description}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Nota API */}
            <View style={styles.apiNote}>
              <Text style={styles.apiNoteText}>
                🔌 Datos de ejemplo · Conecta tu API key en weatherService para
                datos reales
              </Text>
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: spacing.xxxl },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    color: colors.primary,
    fontSize: font.md,
    fontWeight: "600",
    width: 60,
  },
  headerTitle: {
    fontSize: font.xl,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  locationCard: { marginHorizontal: spacing.lg, marginBottom: spacing.md },
  locationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  locationText: {
    fontSize: font.md,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  locationChange: {
    fontSize: font.sm,
    color: colors.primary,
    fontWeight: "600",
  },
  locationEditRow: { flexDirection: "row", gap: spacing.sm },
  locationInput: {
    flex: 1,
    height: 44,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: font.md,
    color: colors.textPrimary,
  },
  btnSearch: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  btnSearchText: { color: colors.white, fontWeight: "700", fontSize: font.sm },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: spacing.xxxl,
    gap: spacing.md,
  },
  loadingText: { color: colors.textSecond, fontSize: font.md },
  errorEmoji: { fontSize: 48 },
  errorText: {
    color: colors.error,
    fontSize: font.md,
    textAlign: "center",
    paddingHorizontal: spacing.xl,
  },
  retryBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  retryBtnText: { color: colors.white, fontWeight: "700", fontSize: font.md },

  mainCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    alignItems: "center",
    paddingVertical: spacing.xxl,
  },
  cityName: {
    fontSize: font.md,
    color: colors.textSecond,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  mainTemp: {
    fontSize: 72,
    fontWeight: "900",
    color: colors.primary,
    lineHeight: 80,
  },
  conditionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.primaryDim,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    marginTop: spacing.md,
  },
  conditionEmoji: { fontSize: 18 },
  conditionText: {
    fontSize: font.md,
    fontWeight: "700",
    color: colors.primary,
  },
  feelsLike: {
    fontSize: font.sm,
    color: colors.textSecond,
    marginTop: spacing.md,
  },

  section: { marginHorizontal: spacing.lg, marginBottom: spacing.md },
  forecastRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
  forecastDay: { flex: 1, alignItems: "center", gap: spacing.xs },
  forecastDayName: {
    fontSize: font.xs,
    color: colors.textMuted,
    fontWeight: "700",
  },
  forecastEmoji: { fontSize: 22 },
  forecastHigh: {
    fontSize: font.sm,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  forecastLow: { fontSize: font.xs, color: colors.textMuted },

  alertItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.sm,
  },
  alertDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  alertContent: { flex: 1 },
  alertType: { fontSize: font.sm, fontWeight: "700" },
  alertDesc: { fontSize: font.xs, color: colors.textSecond, marginTop: 2 },

  apiNote: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.infoDim,
    borderRadius: radius.md,
  },
  apiNoteText: { fontSize: font.xs, color: colors.info, textAlign: "center" },
});
