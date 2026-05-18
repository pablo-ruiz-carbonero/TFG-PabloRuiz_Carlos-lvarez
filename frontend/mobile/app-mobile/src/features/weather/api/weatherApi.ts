// src/features/weather/api/weatherApi.ts
// Capa de red pura — solo fetch contra OpenWeatherMap, sin lógica de negocio

import { mapWeatherData } from "../utils/weatherMappers";
import { WeatherData } from "../types/weather.types";

// ─── Configuración ────────────────────────────────────────────────────────────
// Añade EXPO_PUBLIC_OWM_KEY a tu .env:
//   EXPO_PUBLIC_OWM_KEY=tu_api_key_aqui

const OWM_KEY = process.env.EXPO_PUBLIC_OWM_KEY ?? "";
const OWM_BASE = "https://api.openweathermap.org/data/2.5";
const LANG = "es";
const UNITS = "metric"; // °C, km/h (después convertimos m/s → km/h en el mapper)

// ─── Helper de respuesta ─────────────────────────────────────────────────────

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    // OWM devuelve { cod, message } en errores
    throw new Error((err as any).message ?? `HTTP ${res.status}`);
  }
  return res.json();
};

// ─── Llamadas individuales ────────────────────────────────────────────────────

const fetchCurrentByCity = async (city: string): Promise<any> => {
  const url = `${OWM_BASE}/weather?q=${encodeURIComponent(city)}&appid=${OWM_KEY}&units=${UNITS}&lang=${LANG}`;
  const res = await fetch(url);
  return handleResponse(res);
};

const fetchCurrentByCoords = async (lat: number, lon: number): Promise<any> => {
  const url = `${OWM_BASE}/weather?lat=${lat}&lon=${lon}&appid=${OWM_KEY}&units=${UNITS}&lang=${LANG}`;
  const res = await fetch(url);
  return handleResponse(res);
};

const fetchForecastByCity = async (city: string): Promise<any> => {
  const url = `${OWM_BASE}/forecast?q=${encodeURIComponent(city)}&appid=${OWM_KEY}&units=${UNITS}&lang=${LANG}&cnt=40`;
  const res = await fetch(url);
  return handleResponse(res);
};

const fetchForecastByCoords = async (
  lat: number,
  lon: number,
): Promise<any> => {
  const url = `${OWM_BASE}/forecast?lat=${lat}&lon=${lon}&appid=${OWM_KEY}&units=${UNITS}&lang=${LANG}&cnt=40`;
  const res = await fetch(url);
  return handleResponse(res);
};

// ─── API pública (retorna modelos de dominio) ─────────────────────────────────

export const getWeatherByCityRequest = async (
  city: string,
): Promise<WeatherData> => {
  const [currentRaw, forecastRaw] = await Promise.all([
    fetchCurrentByCity(city),
    fetchForecastByCity(city),
  ]);
  return mapWeatherData(currentRaw, forecastRaw);
};

export const getWeatherByCoordsRequest = async (
  lat: number,
  lon: number,
): Promise<WeatherData> => {
  const [currentRaw, forecastRaw] = await Promise.all([
    fetchCurrentByCoords(lat, lon),
    fetchForecastByCoords(lat, lon),
  ]);
  return mapWeatherData(currentRaw, forecastRaw);
};
