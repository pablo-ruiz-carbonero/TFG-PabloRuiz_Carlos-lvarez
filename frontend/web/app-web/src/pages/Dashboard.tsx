import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { weatherService } from '../services/weatherService';
import { cropService } from '../services/cropService';
import { marketService } from '../services/marketService';
import { chatService } from '../services/chatService';
import { WeatherData, Crop, Activity } from '../types';
import { 
  CloudSun, Wind, Droplets, ArrowUpRight, 
  Sprout, ShoppingBag, MessageSquare, Plus,
  Thermometer, Calendar, AlertTriangle, Navigation, Search
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  
  // Weather states
  const [region, setRegion] = useState('Sevilla, Andalucía');
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(null);
  const [searchCity, setSearchCity] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [gpsError, setGpsError] = useState<string | null>(null);
  
  // Business states
  const [crops, setCrops] = useState<Crop[]>([]);
  const [productsCount, setProductsCount] = useState(0);
  const [chatsCount, setChatsCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  // Load weather when region or coordinates change
  useEffect(() => {
    const fetchWeather = async () => {
      setWeatherLoading(true);
      try {
        let data;
        if (coordinates) {
          data = await weatherService.getWeather(region, coordinates.lat, coordinates.lon);
        } else {
          data = await weatherService.getWeather(region);
        }
        setWeather(data);
      } catch (err) {
        console.error(err);
      } finally {
        setWeatherLoading(false);
      }
    };
    fetchWeather();
  }, [region, coordinates]);

  const handleGeolocate = () => {
    setGpsError(null);
    if (!navigator.geolocation) {
      setGpsError('La geolocalización no está soportada por tu navegador.');
      setCoordinates({ lat: 37.3891, lon: -5.9845 });
      setRegion('Sevilla, Andalucía (Estimado)');
      return;
    }
    setWeatherLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setCoordinates({ lat, lon });
        setRegion(`Ubicación Detectada (${lat.toFixed(2)}, ${lon.toFixed(2)})`);
        setGpsError(null);
      },
      (error) => {
        console.error('Error getting location, using Zaragoza fallback:', error);
        setCoordinates({ lat: 41.6488, lon: -0.8891 });
        setRegion('Zaragoza, Aragón (Estimado)');
        
        let message = 'No se pudo acceder a tu GPS (tiempo de espera agotado). Mostrando Zaragoza.';
        if (error.code === error.PERMISSION_DENIED) {
          message = 'Permiso de ubicación denegado. Actívalo en tu navegador o escribe tu ciudad.';
        }
        setGpsError(message);
      },
      {
        enableHighAccuracy: false,
        timeout: 4500, // Wait up to 4.5 seconds before falling back
        maximumAge: 0
      }
    );
  };

  const handleSearchCitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCity.trim()) return;
    setCoordinates(null);
    setRegion(searchCity.trim());
    setSearchCity('');
  };

  // Load stats
  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        // Fetch all products
        const products = await marketService.getProducts();
        
        // Fetch chats
        const chats = await chatService.getChats(user.id);
        setChatsCount(chats.length);

        if (user.role === 'farmer' || user.role === 'admin') {
          const farmerCrops = await cropService.getCrops(user.id);
          setCrops(farmerCrops);
          
          // Count only user's products
          const myProducts = products.filter(p => p.sellerId === user.id);
          setProductsCount(myProducts.length);
        } else {
          // Distributors/Suppliers count their own products
          const myProducts = products.filter(p => p.sellerId === user.id);
          setProductsCount(myProducts.length);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, [user]);

  // Calculate upcoming tasks for Farmers
  const getUpcomingTasks = () => {
    if (crops.length === 0) return [];
    
    const tasks: { id: string; cropName: string; type: string; details: string; date: string; priority: 'high' | 'medium' | 'low' }[] = [];
    
    crops.forEach(crop => {
      if (crop.status === 'growing') {
        // Find last activities
        const lastIrrigation = crop.activities.filter(a => a.type === 'irrigation').sort((a,b) => b.date.localeCompare(a.date))[0];
        
        // Simulating recommendation: if last irrigation was > 4 days ago
        const daysSinceIrrigation = lastIrrigation 
          ? Math.floor((Date.now() - new Date(lastIrrigation.date).getTime()) / (1000 * 60 * 60 * 24))
          : 99;

        if (daysSinceIrrigation > 4) {
          tasks.push({
            id: `task-irr-${crop.id}`,
            cropName: crop.name,
            type: 'Riego recomendado',
            details: `Último riego hace ${daysSinceIrrigation === 99 ? 'mucho tiempo' : `${daysSinceIrrigation} días`}.`,
            date: 'Hoy mismo',
            priority: 'high'
          });
        }

        // Fertilization recommendations
        const lastFertilization = crop.activities.filter(a => a.type === 'fertilization').sort((a,b) => b.date.localeCompare(a.date))[0];
        const daysSinceFert = lastFertilization 
          ? Math.floor((Date.now() - new Date(lastFertilization.date).getTime()) / (1000 * 60 * 60 * 24))
          : 99;

        if (daysSinceFert > 30) {
          tasks.push({
            id: `task-fert-${crop.id}`,
            cropName: crop.name,
            type: 'Abonado mensual',
            details: `Aporte nutricional periódico recomendado.`,
            date: 'Esta semana',
            priority: 'medium'
          });
        }
      }
    });

    return tasks;
  };

  // Weather-based agricultural advice
  const getAgriculturalAdvice = (w: WeatherData) => {
    if (w.temp > 30) {
      return {
        text: 'Temperaturas elevadas. Planifica riegos a primera hora de la mañana o al atardecer para reducir la evaporación. Evita tratamientos foliares.',
        type: 'warning'
      };
    }
    if (w.windSpeed > 25) {
      return {
        text: 'Viento fuerte detectado. No se recomiendan tratamientos de pulverización (plaguicidas o abonos foliares) debido a la deriva del viento.',
        type: 'danger'
      };
    }
    if (w.humidity > 80 && w.temp > 15) {
      return {
        text: 'Alta humedad y calor medio: riesgo elevado de hongos (mildiu/oidio). Monitorea las hojas de tus cultivos y aplica preventivos si es necesario.',
        type: 'warning'
      };
    }
    return {
      text: 'Condiciones climáticas idóneas para labores generales del campo, laboreo de suelos y recolección.',
      type: 'success'
    };
  };

  const upcomingTasks = getUpcomingTasks();
  const weatherAdvice = weather ? getAgriculturalAdvice(weather) : null;

  // Formatting chart data
  const chartData = weather?.forecast.map(f => ({
    fecha: new Date(f.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }),
    temp: f.temp
  })) || [];

  return (
    <div className="fade-in">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Hola, {user?.name.split(' (')[0]} 👋</h1>
          <p>Bienvenido de nuevo. Aquí tienes el estado actual de tus operaciones agrícolas.</p>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>
          {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="metrics-grid">
        {(user?.role === 'farmer' || user?.role === 'admin') && (
          <div className="metric-card">
            <div className="metric-content">
              <span className="metric-title">Cultivos Activos</span>
              <span className="metric-value">
                {loadingStats ? '...' : crops.filter(c => c.status === 'growing').length}
              </span>
              <span className="metric-desc">
                De {loadingStats ? '...' : crops.length} registrados en total
              </span>
            </div>
            <div className="metric-icon-wrapper">
              <Sprout size={24} />
            </div>
          </div>
        )}

        {(user?.role === 'farmer' || user?.role === 'admin') && (
          <div className="metric-card">
            <div className="metric-content">
              <span className="metric-title">Superficie Total</span>
              <span className="metric-value">
                {loadingStats ? '...' : crops.reduce((sum, c) => sum + (c.status === 'growing' ? c.area : 0), 0).toFixed(1)}
              </span>
              <span className="metric-desc">Hectáreas en producción</span>
            </div>
            <div className="metric-icon-wrapper">
              <ArrowUpRight size={24} />
            </div>
          </div>
        )}

        {user?.role !== 'admin' && (
          <div className="metric-card">
            <div className="metric-content">
              <span className="metric-title">Mis Productos</span>
              <span className="metric-value">{loadingStats ? '...' : productsCount}</span>
              <span className="metric-desc">Anuncios activos en marketplace</span>
            </div>
            <div className="metric-icon-wrapper accent">
              <ShoppingBag size={24} />
            </div>
          </div>
        )}

        <div className="metric-card">
          <div className="metric-content">
            <span className="metric-title">Mensajes Nuevos</span>
            <span className="metric-value">{loadingStats ? '...' : chatsCount}</span>
            <span className="metric-desc">Bandeja de chats activos</span>
          </div>
          <div className="metric-icon-wrapper">
            <MessageSquare size={24} />
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)',
        gap: '1.5rem',
      } as any} className="grid-cols-2">
        
        {/* Left Column: Charts and Tasks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Recharts weather graph */}
          <div className="card">
            <h3 className="card-title">
              <Thermometer size={20} style={{ color: 'var(--primary)' }} />
              Evolución de Temperaturas (°C) - Pronóstico 5 Días
            </h3>
            
            {weatherLoading ? (
              <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Cargando gráfico...
              </div>
            ) : (
              <div style={{ width: '100%', height: '220px', marginTop: '1rem' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="fecha" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--card)', 
                        borderColor: 'var(--border)', 
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text)' 
                      }} 
                    />
                    <Area type="monotone" dataKey="temp" name="Temp (°C)" stroke="var(--primary)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTemp)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Role specific list (Farmer Tasks vs Marketplace Recommendations) */}
          {(user?.role === 'farmer' || user?.role === 'admin') ? (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 className="card-title" style={{ margin: 0 }}>
                  <Calendar size={20} style={{ color: 'var(--primary)' }} />
                  Tareas Agrícolas Recomendadas
                </h3>
                <Link to="/crops" className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.6rem' }}>
                  Ir a Cultivos
                </Link>
              </div>

              {upcomingTasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
                  🌻 Todo en orden. No tienes tareas urgentes pendientes de riego o fertilización.
                </div>
              ) : (
                <div className="quick-list">
                  {upcomingTasks.map(task => (
                    <div 
                      key={task.id} 
                      className={`quick-list-item ${task.priority === 'high' ? 'danger' : 'warning'}`}
                    >
                      <div className="quick-list-content">
                        <span className="quick-list-title">{task.type} - {task.cropName}</span>
                        <span className="quick-list-subtitle">{task.details}</span>
                      </div>
                      <span className={`badge ${task.priority === 'high' ? 'badge-danger' : 'badge-warning'}`}>
                        {task.date}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 className="card-title" style={{ margin: 0 }}>
                  <ShoppingBag size={20} style={{ color: 'var(--primary)' }} />
                  Marketplace Novedades
                </h3>
                <Link to="/marketplace" className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.6rem' }}>
                  Explorar Catálogo
                </Link>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                Accede al mercado para buscar insumos o negociar cosechas directamente con agricultores.
              </p>
              
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link to="/marketplace" style={{ flex: 1 }} className="btn btn-primary">
                  <ShoppingBag size={18} />
                  Buscar Cosechas / Maquinaria
                </Link>
                <Link to="/messages" style={{ flex: 1 }} className="btn btn-secondary">
                  <MessageSquare size={18} />
                  Abrir Mensajería
                </Link>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Weather widget */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="card weather-widget" style={{ minHeight: '450px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CloudSun size={24} />
                  <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Clima Agrícola</span>
                </div>
                
                <button 
                  type="button"
                  onClick={handleGeolocate}
                  className="weather-region-select"
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px', 
                    padding: '0.35rem 0.75rem', 
                    height: 'fit-content' 
                  }}
                  title="Detectar ubicación actual"
                >
                  <Navigation size={14} />
                  <span>GPS</span>
                </button>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <select 
                  value={region} 
                  onChange={(e) => {
                    setCoordinates(null);
                    setRegion(e.target.value);
                  }}
                  className="weather-region-select"
                  style={{ flex: 1, minWidth: '100px' }}
                >
                  <option value="Sevilla, Andalucía">Sevilla, AN</option>
                  <option value="Zaragoza, Aragón">Zaragoza, AR</option>
                  <option value="Lérida, Cataluña">Lérida, CT</option>
                  <option value="Madrid, Centro">Madrid, MD</option>
                  {region && !['Sevilla, Andalucía', 'Zaragoza, Aragón', 'Lérida, Cataluña', 'Madrid, Centro'].includes(region) && (
                    <option value={region}>{region.length > 15 ? region.slice(0, 15) + '...' : region}</option>
                  )}
                </select>

                <form 
                  onSubmit={handleSearchCitySubmit} 
                  style={{ display: 'flex', flex: 1.5, minWidth: '150px' }}
                >
                  <input 
                    type="text" 
                    placeholder="Ciudad..." 
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    className="weather-region-select"
                    style={{ 
                      flex: 1, 
                      borderRadius: '20px 0 0 20px', 
                      backgroundColor: 'rgba(255,255,255,0.1)', 
                      border: '1px solid rgba(255,255,255,0.25)', 
                      padding: '0.35rem 0.75rem',
                      color: 'white',
                      outline: 'none'
                    }}
                  />
                  <button 
                    type="submit" 
                    className="weather-region-select" 
                    style={{ 
                      borderRadius: '0 20px 20px 0', 
                      padding: '0.35rem 0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(255,255,255,0.2)'
                    }}
                  >
                    <Search size={14} />
                  </button>
                </form>
              </div>

              {gpsError && (
                <div style={{ 
                  backgroundColor: 'rgba(230, 57, 70, 0.15)', 
                  color: '#e63946', 
                  fontSize: '0.8rem', 
                  padding: '0.5rem 0.75rem', 
                  borderRadius: 'var(--radius-sm)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                  marginTop: '0.5rem'
                }}>
                  <span style={{ fontWeight: 500 }}>{gpsError}</span>
                  <button 
                    type="button"
                    onClick={() => setGpsError(null)} 
                    style={{ background: 'none', border: 'none', color: '#e63946', cursor: 'pointer', fontWeight: 'bold', padding: 0 }}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {weatherLoading ? (
              <div style={{ display: 'flex', height: '280px', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                <span>Cargando datos meteorológicos...</span>
              </div>
            ) : weather ? (
              <div style={{ display: 'flex', flexDirection: 'column', height: 'auto', justifyContent: 'space-between', flex: 1, marginTop: '1.5rem' }}>
                
                <div>
                  <div className="weather-main-info">
                    <div>
                      <div className="weather-temp">{weather.temp}°C</div>
                      <div style={{ fontSize: '0.9rem', textTransform: 'capitalize', fontWeight: 500, marginTop: '0.25rem', opacity: 0.9 }}>
                        {weather.description}
                      </div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                        Mín: {weather.tempMin}°C | Máx: {weather.tempMax}°C
                      </div>
                    </div>
                    {/* Render standard OpenWeather icon */}
                    <img 
                      src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`} 
                      alt={weather.description} 
                      style={{ width: '80px', height: '80px', filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.25))' }}
                    />
                  </div>

                  <div className="weather-grid-details">
                    <div className="weather-detail-item">
                      <Droplets size={16} />
                      <div>
                        <span>Humedad:</span> <strong>{weather.humidity}%</strong>
                      </div>
                    </div>
                    <div className="weather-detail-item">
                      <Wind size={16} />
                      <div>
                        <span>Viento:</span> <strong>{weather.windSpeed} km/h</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Agricultural Weather Advice */}
                {weatherAdvice && (
                  <div style={{
                    backgroundColor: weatherAdvice.type === 'success' ? 'rgba(45, 106, 79, 0.3)' : 
                                     weatherAdvice.type === 'danger' ? 'rgba(230, 57, 70, 0.25)' : 'rgba(217, 119, 6, 0.25)',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.82rem',
                    borderLeft: '4px solid',
                    borderLeftColor: weatherAdvice.type === 'success' ? 'var(--primary-light)' : 
                                     weatherAdvice.type === 'danger' ? 'var(--danger)' : 'var(--accent)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.5rem',
                    marginBottom: '1.5rem',
                    backdropFilter: 'blur(5px)'
                  }}>
                    <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{weatherAdvice.text}</span>
                  </div>
                )}

                {/* Forecast Row */}
                <div className="weather-forecast">
                  <div className="weather-forecast-title">Próximos Días</div>
                  <div className="weather-forecast-grid">
                    {weather.forecast.map((day, idx) => (
                      <div key={day.date} className="forecast-day-card">
                        <span className="forecast-day-name">
                          {idx === 0 ? 'Hoy' : new Date(day.date).toLocaleDateString('es-ES', { weekday: 'short' })}
                        </span>
                        <img 
                          src={`https://openweathermap.org/img/wn/${day.icon}.png`} 
                          alt={day.description} 
                          style={{ width: '32px', height: '32px' }}
                        />
                        <span className="forecast-day-temp">{day.temp}°</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : null}
          </div>

        </div>

      </div>
    </div>
  );
};
