// src/features/weather/hooks/useWeatherLocation.ts
// Hook auxiliar: pide permisos GPS y dispara fetchWeatherByCoords

import { useState, useCallback } from "react";
import * as Location from "expo-location";
import { useWeather } from "./useWeather";

interface UseWeatherLocationReturn {
  locating: boolean;
  locationError: string | null;
  requestLocation: () => Promise<void>;
}

export const useWeatherLocation = (): UseWeatherLocationReturn => {
  const { fetchWeatherByCoords } = useWeather();
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const requestLocation = useCallback(async () => {
    try {
      setLocating(true);
      setLocationError(null);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationError("Permiso de ubicación denegado.");
        return;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      await fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
    } catch (err: any) {
      setLocationError(err?.message ?? "No se pudo obtener la ubicación.");
    } finally {
      setLocating(false);
    }
  }, [fetchWeatherByCoords]);

  return { locating, locationError, requestLocation };
};
