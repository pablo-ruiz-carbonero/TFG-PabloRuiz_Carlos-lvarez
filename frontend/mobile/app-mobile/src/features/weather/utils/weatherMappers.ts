// src/features/weather/utils/weatherMappers.ts
// Transforma la respuesta cruda de OpenWeatherMap al modelo de dominio

import {
  CurrentWeather,
  ForecastDay,
  WeatherAlert,
  AlertSeverity,
  WeatherData,
} from "../types/weather.types";

// ─── Emoji por código OWM ────────────────────────────────────────────────────
// https://openweathermap.org/weather-conditions

export const owmCodeToEmoji = (id: number): string => {
  if (id >= 200 && id < 300) return "⛈️"; // tormenta
  if (id >= 300 && id < 400) return "🌦️"; // llovizna
  if (id >= 500 && id < 510) return "🌧️"; // lluvia
  if (id === 511) return "🌨️"; // lluvia helada
  if (id >= 520 && id < 532) return "🌧️"; // chubascos
  if (id >= 600 && id < 700) return "❄️"; // nieve
  if (id >= 700 && id < 800) return "🌫️"; // niebla/neblina
  if (id === 800) return "☀️"; // despejado
  if (id === 801) return "🌤️"; // pocas nubes
  if (id === 802) return "⛅"; // nubes dispersas
  if (id >= 803) return "☁️"; // nublado
  return "🌡️";
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmtTime = (unix: number, offsetSecs: number): string => {
  const date = new Date((unix + offsetSecs) * 1000);
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
};

const fmtDayLabel = (dateStr: string): string => {
  const date = new Date(dateStr + "T12:00:00");
  return date
    .toLocaleDateString("es-ES", { weekday: "short" })
    .replace(".", "")
    .replace(/^\w/, (c) => c.toUpperCase()); // "Lun", "Mar"...
};

// ─── Current weather ─────────────────────────────────────────────────────────

export const mapCurrentWeather = (raw: any): CurrentWeather => {
  const offset: number = raw.timezone ?? 0;
  const weather = raw.weather?.[0] ?? {};
  return {
    city: raw.name ?? "Desconocido",
    country: raw.sys?.country ?? "",
    lat: raw.coord?.lat ?? 0,
    lon: raw.coord?.lon ?? 0,
    temp: Math.round(raw.main?.temp ?? 0),
    feelsLike: Math.round(raw.main?.feels_like ?? 0),
    tempMin: Math.round(raw.main?.temp_min ?? 0),
    tempMax: Math.round(raw.main?.temp_max ?? 0),
    humidity: raw.main?.humidity ?? 0,
    windSpeed: Math.round((raw.wind?.speed ?? 0) * 3.6), // m/s → km/h
    windDeg: raw.wind?.deg ?? 0,
    pressure: raw.main?.pressure ?? 0,
    visibility: Math.round((raw.visibility ?? 0) / 1000),
    condition: weather.description
      ? weather.description.charAt(0).toUpperCase() +
        weather.description.slice(1)
      : "Sin datos",
    conditionId: weather.id ?? 800,
    conditionEmoji: owmCodeToEmoji(weather.id ?? 800),
    sunrise: fmtTime(raw.sys?.sunrise ?? 0, offset),
    sunset: fmtTime(raw.sys?.sunset ?? 0, offset),
    fetchedAt: new Date().toISOString(),
  };
};

// ─── Forecast (5 días a partir de /forecast — lista de 3h) ───────────────────

export const mapForecast = (raw: any): ForecastDay[] => {
  // OWM /forecast devuelve entradas cada 3h; agrupamos por día (YYYY-MM-DD)
  const byDay: Record<string, any[]> = {};

  (raw.list ?? []).forEach((entry: any) => {
    const date = entry.dt_txt?.slice(0, 10) as string;
    if (!byDay[date]) byDay[date] = [];
    byDay[date].push(entry);
  });

  const today = new Date().toISOString().slice(0, 10);

  return Object.entries(byDay)
    .filter(([date]) => date > today) // excluir hoy (ya tenemos current)
    .slice(0, 5)
    .map(([date, entries]) => {
      const temps = entries.map((e) => e.main?.temp ?? 0);
      const humidity = entries.map((e) => e.main?.humidity ?? 0);
      const winds = entries.map((e) => (e.wind?.speed ?? 0) * 3.6);

      // Condición más representativa: la entrada de mediodía o la primera
      const midday =
        entries.find((e) => e.dt_txt?.includes("12:00:00")) ?? entries[0];
      const weather = midday.weather?.[0] ?? {};

      return {
        date,
        dayLabel: fmtDayLabel(date),
        emoji: owmCodeToEmoji(weather.id ?? 800),
        high: Math.round(Math.max(...temps)),
        low: Math.round(Math.min(...temps)),
        humidity: Math.round(
          humidity.reduce((a, b) => a + b, 0) / humidity.length,
        ),
        windSpeed: Math.round(Math.max(...winds)),
        condition: weather.description
          ? weather.description.charAt(0).toUpperCase() +
            weather.description.slice(1)
          : "Sin datos",
        conditionId: weather.id ?? 800,
      };
    });
};

// ─── Alertas agrícolas derivadas (heurística) ─────────────────────────────────
// OWM gratuito no incluye alertas; las derivamos del forecast

export const deriveAgriculturalAlerts = (
  forecast: ForecastDay[],
): WeatherAlert[] => {
  const alerts: WeatherAlert[] = [];

  forecast.forEach((day, i) => {
    // Riesgo de helada
    if (day.low <= 2) {
      alerts.push({
        id: `frost-${i}`,
        type: "Riesgo de helada",
        description: `${day.dayLabel} por la noche · T mín: ${day.low}°C`,
        severity: day.low <= 0 ? "high" : "medium",
      });
    }

    // Lluvia intensa
    if (day.conditionId >= 502 && day.conditionId <= 531) {
      alerts.push({
        id: `rain-${i}`,
        type: "Lluvia intensa",
        description: `${day.dayLabel} · ${day.condition}`,
        severity: "medium",
      });
    }

    // Tormenta
    if (day.conditionId >= 200 && day.conditionId < 300) {
      alerts.push({
        id: `storm-${i}`,
        type: "Tormenta eléctrica",
        description: `${day.dayLabel} · Evita trabajos en exterior`,
        severity: "high",
      });
    }

    // Viento fuerte
    if (day.windSpeed >= 50) {
      alerts.push({
        id: `wind-${i}`,
        type: "Viento fuerte",
        description: `${day.dayLabel} · Ráfagas de hasta ${day.windSpeed} km/h`,
        severity: day.windSpeed >= 70 ? "high" : "medium",
      });
    }

    // Calor extremo
    if (day.high >= 38) {
      alerts.push({
        id: `heat-${i}`,
        type: "Calor extremo",
        description: `${day.dayLabel} · T máx: ${day.high}°C · Riesgo de estrés hídrico`,
        severity: day.high >= 42 ? "high" : "medium",
      });
    }
  });

  return alerts;
};

// ─── Composición final ────────────────────────────────────────────────────────

export const mapWeatherData = (
  currentRaw: any,
  forecastRaw: any,
): WeatherData => {
  const current = mapCurrentWeather(currentRaw);
  const forecast = mapForecast(forecastRaw);
  const alerts = deriveAgriculturalAlerts(forecast);
  return { current, forecast, alerts };
};
