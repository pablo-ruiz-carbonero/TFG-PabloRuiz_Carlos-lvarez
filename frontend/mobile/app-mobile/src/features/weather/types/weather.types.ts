// src/features/weather/types/weather.types.ts
// ✅ Fuente única de tipos para la feature Weather

// ─── Modelos de dominio ───────────────────────────────────────────────────────

export interface CurrentWeather {
  city: string;
  country: string;
  lat: number;
  lon: number;
  temp: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  humidity: number;       // %
  windSpeed: number;      // km/h
  windDeg: number;        // grados
  pressure: number;       // hPa
  visibility: number;     // km
  condition: string;      // descripción localizada
  conditionId: number;    // código OWM (800 = despejado, etc.)
  conditionEmoji: string;
  sunrise: string;        // HH:MM
  sunset: string;         // HH:MM
  fetchedAt: string;      // ISO timestamp
}

export interface ForecastDay {
  date: string;         // YYYY-MM-DD
  dayLabel: string;     // "Lun", "Mar"...
  emoji: string;
  high: number;
  low: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  conditionId: number;
}

export interface WeatherAlert {
  id: string;
  type: string;
  description: string;
  severity: AlertSeverity;
}

export type AlertSeverity = 'low' | 'medium' | 'high';

// Modelo completo (current + forecast + alerts agrícolas derivadas)
export interface WeatherData {
  current: CurrentWeather;
  forecast: ForecastDay[];   // 5 días
  alerts: WeatherAlert[];
}

// ─── DTOs / parámetros ────────────────────────────────────────────────────────

export interface FetchWeatherParams {
  city: string;
}

export interface FetchWeatherByCoordParams {
  lat: number;
  lon: number;
}

// ─── Estado del contexto ──────────────────────────────────────────────────────

export interface WeatherContextState {
  weatherData: WeatherData | null;
  currentCity: string;
  loading: boolean;
  error: string | null;
  fetchWeatherByCity: (city: string) => Promise<void>;
  fetchWeatherByCoords: (lat: number, lon: number) => Promise<void>;
  clearError: () => void;
}