// src/features/weather/context/WeatherContext.tsx

import React, { createContext, useState, useCallback } from 'react';
import { WeatherData, WeatherContextState } from '../types/weather.types';
import {
  getWeatherByCityRequest,
  getWeatherByCoordsRequest,
} from '../api/weatherApi';

// ─────────────────────────────────────────────────────────────────────────────
// Contexto
// ─────────────────────────────────────────────────────────────────────────────

export const WeatherContext = createContext<WeatherContextState | null>(null);

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

export const WeatherProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [currentCity, setCurrentCity]  = useState<string>('');
  const [loading, setLoading]          = useState<boolean>(false);
  const [error, setError]              = useState<string | null>(null);

  // ── Fetch por nombre de ciudad ──────────────────────────────────────────────
  const fetchWeatherByCity = useCallback(async (city: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getWeatherByCityRequest(city);
      setWeatherData(data);
      setCurrentCity(data.current.city);
    } catch (err: any) {
      const msg: string =
        err?.message === 'city not found'
          ? 'Ciudad no encontrada. Comprueba el nombre.'
          : err?.message ?? 'No se pudo obtener el clima.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch por coordenadas GPS ───────────────────────────────────────────────
  const fetchWeatherByCoords = useCallback(async (lat: number, lon: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getWeatherByCoordsRequest(lat, lon);
      setWeatherData(data);
      setCurrentCity(data.current.city);
    } catch (err: any) {
      setError(err?.message ?? 'No se pudo obtener el clima.');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <WeatherContext.Provider
      value={{
        weatherData,
        currentCity,
        loading,
        error,
        fetchWeatherByCity,
        fetchWeatherByCoords,
        clearError,
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
};