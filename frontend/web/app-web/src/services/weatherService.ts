import { WeatherData } from '../types';

const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5';

// Pre-defined regions for the default dropdown list
const MOCK_REGIONS_WEATHER: Record<string, Omit<WeatherData, 'forecast'>> = {
  'Sevilla, Andalucía': {
    temp: 24,
    tempMin: 14,
    tempMax: 31,
    humidity: 45,
    windSpeed: 12,
    description: 'despejado y soleado',
    icon: '01d',
    condition: 'Sunny',
  },
  'Zaragoza, Aragón': {
    temp: 18,
    tempMin: 9,
    tempMax: 22,
    humidity: 55,
    windSpeed: 28,
    description: 'viento moderado con nubes dispersas',
    icon: '03d',
    condition: 'Windy',
  },
  'Lérida, Cataluña': {
    temp: 16,
    tempMin: 8,
    tempMax: 20,
    humidity: 70,
    windSpeed: 8,
    description: 'niebla matinal, nublado por la tarde',
    icon: '50d',
    condition: 'Cloudy',
  },
  'Madrid, Centro': {
    temp: 19,
    tempMin: 10,
    tempMax: 24,
    humidity: 50,
    windSpeed: 10,
    description: 'cielo despejado',
    icon: '01d',
    condition: 'Sunny',
  }
};

const DEFAULT_REGION = 'Sevilla, Andalucía';

export const weatherService = {
  getWeather: async (
    regionName: string = DEFAULT_REGION,
    lat?: number,
    lon?: number
  ): Promise<WeatherData> => {
    // Read the key dynamically at request time to pick up live updates
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
    
    if (apiKey && apiKey.trim() !== '') {
      try {
        const units = 'metric';
        const lang = 'es';
        
        let currentWeatherUrl = '';
        let forecastUrl = '';

        if (lat !== undefined && lon !== undefined) {
          currentWeatherUrl = `${WEATHER_API_URL}/weather?lat=${lat}&lon=${lon}&units=${units}&lang=${lang}&appid=${apiKey}`;
          forecastUrl = `${WEATHER_API_URL}/forecast?lat=${lat}&lon=${lon}&units=${units}&lang=${lang}&appid=${apiKey}`;
        } else {
          // Clean the city query for OpenWeather (e.g. "Sevilla, Andalucía" -> "Sevilla")
          const cityName = regionName.split(',')[0].trim();
          currentWeatherUrl = `${WEATHER_API_URL}/weather?q=${encodeURIComponent(cityName)}&units=${units}&lang=${lang}&appid=${apiKey}`;
          forecastUrl = `${WEATHER_API_URL}/forecast?q=${encodeURIComponent(cityName)}&units=${units}&lang=${lang}&appid=${apiKey}`;
        }

        // 1. Current weather fetch
        const currentRes = await fetch(currentWeatherUrl);
        if (!currentRes.ok) throw new Error(`Weather fetch failed: ${currentRes.status}`);
        const currentData = await currentRes.json();

        // 2. Forecast fetch
        const forecastRes = await fetch(forecastUrl);
        if (!forecastRes.ok) throw new Error(`Forecast fetch failed: ${forecastRes.status}`);
        const forecastData = await forecastRes.json();

        // Group forecast items by date (YYYY-MM-DD)
        const readingsByDate: Record<string, any[]> = {};
        forecastData.list.forEach((item: any) => {
          const dateStr = item.dt_txt.split(' ')[0];
          if (!readingsByDate[dateStr]) {
            readingsByDate[dateStr] = [];
          }
          readingsByDate[dateStr].push(item);
        });

        // Filter and map to 1 reading per day (preferring 12:00:00 noon, fallback to first reading of that day)
        const dailyForecast: WeatherData['forecast'] = [];
        Object.keys(readingsByDate).sort().forEach((dateStr) => {
          const dayReadings = readingsByDate[dateStr];
          const noonReading = dayReadings.find((item: any) => item.dt_txt.includes('12:00:00')) || dayReadings[0];
          
          dailyForecast.push({
            date: dateStr,
            temp: Math.round(noonReading.main.temp),
            description: noonReading.weather[0].description,
            icon: noonReading.weather[0].icon,
          });
        });

        // Slice to 5 days
        const slicedForecast = dailyForecast.slice(0, 5);

        return {
          temp: Math.round(currentData.main.temp),
          tempMin: Math.round(currentData.main.temp_min),
          tempMax: Math.round(currentData.main.temp_max),
          humidity: currentData.main.humidity,
          windSpeed: Math.round(currentData.wind.speed * 3.6), // m/s to km/h
          description: currentData.weather[0].description,
          icon: currentData.weather[0].icon,
          condition: currentData.weather[0].main,
          forecast: slicedForecast,
        };
      } catch (err) {
        console.error('Error fetching real weather from OpenWeather, falling back to mock:', err);
      }
    }

    // --- Dynamic Mock Data Fallback ---
    // If the region exists in predefined mocks, use it. Otherwise, hash the name to generate realistic data.
    let mockBase: Omit<WeatherData, 'forecast'>;
    
    if (MOCK_REGIONS_WEATHER[regionName]) {
      mockBase = MOCK_REGIONS_WEATHER[regionName];
    } else {
      // Hashing city query to get consistent, pseudo-random coordinates and values
      const getSeed = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return Math.abs(hash);
      };

      const seed = getSeed(regionName);
      const mockTemp = 14 + (seed % 16); // 14 to 30
      const mockMin = mockTemp - 5 - (seed % 4);
      const mockMax = mockTemp + 5 + (seed % 4);
      const mockHumidity = 40 + (seed % 45); // 40 to 85
      const mockWind = 4 + (seed % 28); // 4 to 32
      
      const conditions = [
        { desc: 'cielo despejado', icon: '01d', cond: 'Clear' },
        { desc: 'nubes dispersas', icon: '02d', cond: 'Clouds' },
        { desc: 'nuboso', icon: '03d', cond: 'Clouds' },
        { desc: 'cubierto', icon: '04d', cond: 'Clouds' },
        { desc: 'lluvia ligera', icon: '10d', cond: 'Rain' },
        { desc: 'chubascos de lluvia', icon: '09d', cond: 'Rain' }
      ];
      
      const selectedCond = conditions[seed % conditions.length];

      mockBase = {
        temp: mockTemp,
        tempMin: mockMin,
        tempMax: mockMax,
        humidity: mockHumidity,
        windSpeed: mockWind,
        description: selectedCond.desc,
        icon: selectedCond.icon,
        condition: selectedCond.cond,
      };
    }
    
    // Generate dates starting today
    const forecast: WeatherData['forecast'] = [];
    const today = new Date();
    
    for (let i = 0; i < 5; i++) {
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + i);
      const dateString = nextDate.toISOString().split('T')[0];

      // Introduce slight weather pattern drift over the forecast days
      let temp = mockBase.temp + Math.sin(i * 1.5) * 3;
      let desc = mockBase.description;
      let icon = mockBase.icon;

      if (i === 2) {
        temp -= 2;
        desc = 'nublado con claros';
        icon = '03d';
      } else if (i === 3) {
        temp += 1;
        desc = 'posibilidad de llovizna';
        icon = '09d';
      }

      forecast.push({
        date: dateString,
        temp: Math.round(temp),
        description: desc,
        icon: icon,
      });
    }

    return {
      ...mockBase,
      forecast,
    };
  }
};
