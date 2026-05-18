// src/screens/WeatherScreen.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Pantalla completa de clima conectada a WeatherContext + OpenWeatherMap
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

import { colors, shared, spacing, font, radius } from "../styles/Globaltheme";
import { RootStackParamList } from "../types/navigation";
import { useWeather } from "../features/weather/hooks/useWeather";
import { useWeatherLocation } from "../features/weather/hooks/useWeatherLocation";
import {
  AlertSeverity,
  ForecastDay,
  WeatherAlert,
} from "../features/weather/types/weather.types";

type Nav = NavigationProp<RootStackParamList>;

// ─── Helpers de color ─────────────────────────────────────────────────────────

const alertColor: Record<AlertSeverity, string> = {
  low: colors.info,
  medium: colors.warning,
  high: colors.error,
};
const alertBg: Record<AlertSeverity, string> = {
  low: colors.infoDim,
  medium: colors.warningDim,
  high: colors.errorDim,
};

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function ForecastItem({ day }: { day: ForecastDay }) {
  return (
    <View style={styles.forecastDay}>
      <Text style={styles.forecastDayName}>{day.dayLabel}</Text>
      <Text style={styles.forecastEmoji}>{day.emoji}</Text>
      <Text style={styles.forecastHigh}>{day.high}°</Text>
      <Text style={styles.forecastLow}>{day.low}°</Text>
    </View>
  );
}

function AlertItem({ alert }: { alert: WeatherAlert }) {
  return (
    <View
      style={[
        styles.alertItem,
        { backgroundColor: alertBg[alert.severity] ?? colors.warningDim },
      ]}
    >
      <View
        style={[
          styles.alertDot,
          { backgroundColor: alertColor[alert.severity] },
        ]}
      />
      <View style={styles.alertContent}>
        <Text style={[styles.alertType, { color: alertColor[alert.severity] }]}>
          {alert.type}
        </Text>
        <Text style={styles.alertDesc}>{alert.description}</Text>
      </View>
    </View>
  );
}

function StatBox({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ─── Pantalla principal ───────────────────────────────────────────────────────

export default function WeatherScreen() {
  const navigation = useNavigation<Nav>();

  const {
    weatherData,
    currentCity,
    loading,
    error,
    fetchWeatherByCity,
    clearError,
  } = useWeather();

  const { locating, locationError, requestLocation } = useWeatherLocation();

  const [locationInput, setLocationInput] = useState("");
  const [editingLocation, setEditingLocation] = useState(false);

  // Carga inicial: si no hay datos, busca la última ciudad o Sevilla por defecto
  useEffect(() => {
    if (!weatherData) {
      fetchWeatherByCity(currentCity || "Sevilla");
    }
  }, []);

  const handleSearch = () => {
    if (!locationInput.trim()) return;
    setEditingLocation(false);
    fetchWeatherByCity(locationInput.trim());
    setLocationInput("");
  };

  const isLoading = loading || locating;
  const displayError = error || locationError;
  const current = weatherData?.current;

  return (
    <SafeAreaView style={shared.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Text style={styles.backButton}>← Volver</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Clima</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* ── Selector de ubicación ──────────────────────────────────────── */}
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
                onSubmitEditing={handleSearch}
              />
              <Pressable style={styles.btnSearch} onPress={handleSearch}>
                <Text style={styles.btnSearchText}>Buscar</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.locationRow}>
              <Pressable
                style={styles.locationRowLeft}
                onPress={() => setEditingLocation(true)}
              >
                <Text style={styles.locationText}>
                  📍 {(current?.city ?? currentCity) || "..."}
                  {current?.country ? `, ${current.country}` : ""}
                </Text>
                <Text style={styles.locationChange}>Cambiar ubicación →</Text>
              </Pressable>
              <Pressable
                style={styles.gpsBtn}
                onPress={requestLocation}
                disabled={locating}
              >
                <Text style={styles.gpsBtnText}>{locating ? "..." : "🎯"}</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* ── Estados: loading / error / datos ──────────────────────────── */}
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Cargando clima...</Text>
          </View>
        ) : displayError ? (
          <View style={styles.center}>
            <Text style={styles.errorEmoji}>⚠️</Text>
            <Text style={styles.errorText}>{displayError}</Text>
            <Pressable
              style={styles.retryBtn}
              onPress={() => {
                clearError();
                fetchWeatherByCity(currentCity || "Sevilla");
              }}
            >
              <Text style={styles.retryBtnText}>Reintentar</Text>
            </Pressable>
          </View>
        ) : current ? (
          <>
            {/* ── Temperatura principal ─────────────────────────────────── */}
            <View style={[shared.card, styles.mainCard]}>
              <Text style={styles.mainTemp}>{current.temp}°C</Text>
              <View style={styles.conditionBadge}>
                <Text style={styles.conditionEmoji}>
                  {current.conditionEmoji}
                </Text>
                <Text style={styles.conditionText}>{current.condition}</Text>
              </View>
              <Text style={styles.feelsLike}>
                Sensación {current.feelsLike}°C · Mín {current.tempMin}° / Máx{" "}
                {current.tempMax}°
              </Text>
            </View>

            {/* ── Stats secundarias ─────────────────────────────────────── */}
            <View style={[shared.card, styles.statsCard]}>
              <StatBox
                icon="💧"
                label="Humedad"
                value={`${current.humidity}%`}
              />
              <View style={styles.statDivider} />
              <StatBox
                icon="💨"
                label="Viento"
                value={`${current.windSpeed} km/h`}
              />
              <View style={styles.statDivider} />
              <StatBox
                icon="👁️"
                label="Visib."
                value={`${current.visibility} km`}
              />
              <View style={styles.statDivider} />
              <StatBox icon="🌅" label="Amanecer" value={current.sunrise} />
              <View style={styles.statDivider} />
              <StatBox icon="🌇" label="Atardecer" value={current.sunset} />
            </View>

            {/* ── Previsión 5 días ──────────────────────────────────────── */}
            {weatherData!.forecast.length > 0 && (
              <View style={[shared.card, styles.section]}>
                <Text style={shared.sectionTitle}>Próximos 5 días</Text>
                <View style={styles.forecastRow}>
                  {weatherData!.forecast.map((day) => (
                    <ForecastItem key={day.date} day={day} />
                  ))}
                </View>
              </View>
            )}

            {/* ── Alertas agrícolas ─────────────────────────────────────── */}
            {weatherData!.alerts.length > 0 && (
              <View style={[shared.card, styles.section]}>
                <Text style={shared.sectionTitle}>Alertas agrícolas</Text>
                {weatherData!.alerts.map((alert) => (
                  <AlertItem key={alert.id} alert={alert} />
                ))}
              </View>
            )}

            {/* ── Timestamp de actualización ───────────────────────────── */}
            <View style={styles.updatedNote}>
              <Text style={styles.updatedText}>
                🔄 Actualizado{" "}
                {new Date(current.fetchedAt).toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                · Fuente: OpenWeatherMap
              </Text>
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: spacing.xxxl },

  // Header
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

  // Location selector
  locationCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  locationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  locationRowLeft: { flex: 1 },
  locationText: {
    fontSize: font.md,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  locationChange: {
    fontSize: font.sm,
    color: colors.primary,
    fontWeight: "600",
    marginTop: 2,
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
  btnSearchText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: font.sm,
  },
  gpsBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primaryDim,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.sm,
  },
  gpsBtnText: { fontSize: 18 },

  // Loading / error
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

  // Main card
  mainCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    alignItems: "center",
    paddingVertical: spacing.xxl,
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

  // Stats
  statsCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
  },
  statBox: { flex: 1, alignItems: "center", gap: 3 },
  statIcon: { fontSize: 18 },
  statValue: {
    fontSize: font.sm,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: font.xs,
    color: colors.textMuted,
    fontWeight: "600",
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.border,
  },

  // Forecast
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

  // Alerts
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

  // Updated note
  updatedNote: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.primaryDim,
    borderRadius: radius.md,
  },
  updatedText: {
    fontSize: font.xs,
    color: colors.primary,
    textAlign: "center",
    fontWeight: "600",
  },
});
