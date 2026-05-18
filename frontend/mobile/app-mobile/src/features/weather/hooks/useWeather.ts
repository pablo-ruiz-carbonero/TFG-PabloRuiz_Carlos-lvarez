// src/features/weather/hooks/useWeather.ts

import { useContext } from 'react';
import { WeatherContext } from '../context/weatherContext';

export const useWeather = () => {
  const ctx = useContext(WeatherContext);
  if (!ctx) throw new Error('useWeather debe usarse dentro de WeatherProvider');
  return ctx;
};