import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { cropService } from '../services/cropService';
import { Crop, Activity, ActivityType, CropStatus } from '../types';
import { 
  Plus, Calendar, ArrowLeft, Trash2, X, AlertCircle, 
  Droplet, Leaf, Trophy, ShieldAlert, ThermometerSun
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export const Crops: React.FC = () => {
  const { user } = useAuth();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [cropToDelete, setCropToDelete] = useState<Crop | null>(null);
  const [activityToDelete, setActivityToDelete] = useState<{ cropId: string; activityId: string } | null>(null);

  // New crop form states
  const [newCropName, setNewCropName] = useState('');
  const [newCropVariety, setNewCropVariety] = useState('');
  const [newCropSoil, setNewCropSoil] = useState('');
  const [newCropArea, setNewCropArea] = useState('');
  const [newCropDate, setNewCropDate] = useState(new Date().toISOString().split('T')[0]);

  // New activity form states
  const [actType, setActType] = useState<ActivityType>('irrigation');
  const [actDate, setActDate] = useState(new Date().toISOString().split('T')[0]);
  const [actDetails, setActDetails] = useState('');
  const [actQty, setActQty] = useState('');
  const [actUnit, setActUnit] = useState('L');

  useEffect(() => {
    loadCrops();
  }, []);

  const loadCrops = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await cropService.getCrops(user.id);
      setCrops(data);
      // Update selected crop if it exists to refresh details
      if (selectedCrop) {
        const updatedSelected = data.find(c => c.id === selectedCrop.id);
        if (updatedSelected) {
          setSelectedCrop(updatedSelected);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newCropName || !newCropVariety || !newCropSoil || !newCropArea) return;

    try {
      await cropService.addCrop({
        name: newCropName,
        variety: newCropVariety,
        soilType: newCropSoil,
        area: parseFloat(newCropArea),
        plantingDate: newCropDate,
        status: 'growing',
        farmerId: user.id,
      });
      
      // Reset & reload
      setNewCropName('');
      setNewCropVariety('');
      setNewCropSoil('');
      setNewCropArea('');
      setNewCropDate(new Date().toISOString().split('T')[0]);
      setIsCropModalOpen(false);
      loadCrops();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCrop = async (cropId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este cultivo y todo su historial?')) return;
    try {
      await cropService.deleteCrop(cropId);
      setSelectedCrop(null);
      loadCrops();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (cropId: string, status: CropStatus) => {
    try {
      await cropService.updateCrop(cropId, { status });
      loadCrops();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCrop || !actDetails) return;

    try {
      await cropService.addActivity(selectedCrop.id, {
        type: actType,
        date: actDate,
        details: actDetails,
        quantity: actQty ? parseFloat(actQty) : undefined,
        unit: actQty ? actUnit : undefined,
      });

      // Reset & reload
      setActDetails('');
      setActQty('');
      setActDate(new Date().toISOString().split('T')[0]);
      setIsActivityModalOpen(false);
      loadCrops();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (!selectedCrop) return;
    if (!window.confirm('¿Estás seguro de que deseas eliminar este evento del historial?')) return;
    try {
      await cropService.deleteActivity(selectedCrop.id, activityId);
      loadCrops();
    } catch (err) {
      console.error(err);
    }
  };

  // Set default units based on activity type
  const handleActivityTypeChange = (type: ActivityType) => {
    setActType(type);
    if (type === 'irrigation') setActUnit('L');
    else if (type === 'fertilization') setActUnit('kg');
    else if (type === 'harvest') setActUnit('toneladas');
    else setActUnit('');
  };

  // Recharts: Water usage chart
  const getIrrigationChartData = () => {
    return crops.map(c => {
      const waterTotal = c.activities
        .filter(a => a.type === 'irrigation')
        .reduce((sum, a) => sum + (a.quantity || 0), 0);
      return {
        name: c.name,
        litros: waterTotal,
      };
    });
  };

  const getStatusBadge = (status: CropStatus) => {
    if (status === 'growing') return <span className="badge badge-success">Creciendo</span>;
    if (status === 'harvested') return <span className="badge badge-info">Cosechado</span>;
    return <span className="badge badge-danger">Fallido</span>;
  };

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'irrigation': return <Droplet size={14} style={{ color: 'var(--text-light)' }} />;
      case 'fertilization': return <Leaf size={14} style={{ color: 'var(--text-light)' }} />;
      case 'harvest': return <Trophy size={14} style={{ color: 'var(--text-light)' }} />;
      case 'pest': return <ShieldAlert size={14} style={{ color: 'var(--text-light)' }} />;
    }
  };

  const getActivityName = (type: ActivityType) => {
    const names: Record<ActivityType, string> = {
      irrigation: 'Riego',
      fertilization: 'Abonado / Fertilización',
      harvest: 'Cosecha',
      pest: 'Control de Plagas',
    };
    return names[type];
  };

  return (
    <div className="fade-in">
      {/* 1. LIST VIEW */}
      {!selectedCrop ? (
        <>
          <div className="crops-header">
            <div>
              <h2 className="crops-title-section" style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                <Leaf size={28} style={{ color: 'var(--primary)' }} />
                Mis Cultivos
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                Monitorea el progreso de tus campos y registra el historial de operaciones.
              </p>
            </div>
            <button className="btn btn-primary" onClick={() => setIsCropModalOpen(true)}>
              <Plus size={18} />
              Registrar Cultivo
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              Cargando tus campos...
            </div>
          ) : crops.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem', color: 'var(--text-muted)' }}>
              <Leaf size={48} style={{ margin: '0 auto 1rem', color: 'var(--border)' }} />
              <h3>No tienes cultivos registrados</h3>
              <p style={{ margin: '0.5rem 0 1.5rem' }}>Empieza por añadir tu primer campo agrícola para realizar su seguimiento.</p>
              <button className="btn btn-primary" onClick={() => setIsCropModalOpen(true)}>
                Registrar Cultivo
              </button>
            </div>
          ) : (
            <>
              {/* Crop Grid */}
              <div className="crop-card-grid">
                {crops.map(crop => (
                  <div key={crop.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div className="crop-card-header">
                        <div>
                          <h3 style={{ fontWeight: 700, fontSize: '1.2rem' }}>{crop.name}</h3>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Var. {crop.variety}</span>
                        </div>
                        {getStatusBadge(crop.status)}
                      </div>

                      <div className="crop-card-details">
                        <div className="crop-card-details-item">
                          <span>Superficie:</span>
                          <strong>{crop.area} Hectáreas</strong>
                        </div>
                        <div className="crop-card-details-item">
                          <span>Tipo de Suelo:</span>
                          <strong>{crop.soilType}</strong>
                        </div>
                        <div className="crop-card-details-item">
                          <span>Fecha Siembra:</span>
                          <strong>{new Date(crop.plantingDate).toLocaleDateString('es-ES')}</strong>
                        </div>
                        <div className="crop-card-details-item">
                          <span>Actividades:</span>
                          <strong>{crop.activities.length} eventos</strong>
                        </div>
                      </div>
                    </div>

                    <button 
                      className="btn btn-secondary btn-full btn-sm" 
                      style={{ marginTop: '1rem' }}
                      onClick={() => setSelectedCrop(crop)}
                    >
                      Ver Historial y Detalles
                    </button>
                  </div>
                ))}
              </div>

              {/* Water usage statistics graph */}
              <div className="card" style={{ marginTop: '2rem' }}>
                <h3 className="card-title">
                  <Droplet size={18} style={{ color: 'var(--info)' }} />
                  Consumo Total de Agua Estimado por Cultivo (Litros)
                </h3>
                <div style={{ width: '100%', height: '220px', marginTop: '1.5rem' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getIrrigationChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                      <Tooltip 
                        cursor={{ fill: 'var(--bg)', opacity: 0.5 }}
                        contentStyle={{ 
                          backgroundColor: 'var(--card)', 
                          borderColor: 'var(--border)', 
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--text)' 
                        }} 
                      />
                      <Bar dataKey="litros" fill="var(--info)" radius={[4, 4, 0, 0]} barSize={40} name="Litros de Agua" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </>
      ) : (
        /* 2. DETAIL VIEW */
        <div className="fade-in">
          <button className="btn btn-secondary btn-sm" onClick={() => setSelectedCrop(null)} style={{ marginBottom: '1.5rem' }}>
            <ArrowLeft size={16} />
            Volver a la lista
          </button>

          <div className="crops-header" style={{ alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>{selectedCrop.name}</h2>
                {getStatusBadge(selectedCrop.status)}
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                Sembrado el {new Date(selectedCrop.plantingDate).toLocaleDateString('es-ES')} • Hectáreas: {selectedCrop.area} ha
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {selectedCrop.status === 'growing' && (
                <button 
                  className="btn btn-secondary btn-sm" 
                  style={{ color: 'var(--primary)', borderColor: 'var(--primary)' }}
                  onClick={() => handleUpdateStatus(selectedCrop.id, 'harvested')}
                >
                  Marcar Cosechado
                </button>
              )}
              <button className="btn btn-danger btn-sm" onClick={() => setCropToDelete(selectedCrop)}>
                <Trash2 size={16} />
                Eliminar Cultivo
              </button>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.3fr 0.7fr',
            gap: '1.5rem'
          } as any} className="grid-cols-2">
            
            {/* Timeline Column */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 className="card-title" style={{ margin: 0 }}>Historial de Actividades</h3>
                <button className="btn btn-primary btn-sm" onClick={() => setIsActivityModalOpen(true)}>
                  <Plus size={16} />
                  Registrar Actividad
                </button>
              </div>

              {selectedCrop.activities.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                  <Calendar size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                  <p>Aún no has registrado ninguna actividad para este cultivo.</p>
                  <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Añade riegos, fertilizaciones o controles sanitarios.</p>
                </div>
              ) : (
                <div className="timeline">
                  {selectedCrop.activities
                    .sort((a,b) => b.date.localeCompare(a.date))
                    .map(act => (
                      <div key={act.id} className="timeline-item">
                        <div className={`timeline-marker ${act.type}`}>
                          {getActivityIcon(act.type)}
                        </div>
                        <div className="timeline-content">
                          <div className="timeline-header">
                            <span className="timeline-type">{getActivityName(act.type)}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span className="timeline-date">{new Date(act.date).toLocaleDateString('es-ES')}</span>
                              <button 
                                className="timeline-delete-btn" 
                                onClick={() => setActivityToDelete({ cropId: selectedCrop.id, activityId: act.id })}
                                title="Eliminar registro"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                          <p className="timeline-details">{act.details}</p>
                          {act.quantity && (
                            <div className={`timeline-quantity ${act.type}`}>
                              Cantidad: {act.quantity} {act.unit}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Stats Sidebar Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="card">
                <h3 className="card-title">Resumen Técnico</h3>
                <div className="crop-card-details" style={{ margin: 0, gap: '0.75rem' }}>
                  <div className="crop-card-details-item">
                    <span>Variedad sembrada:</span>
                    <strong>{selectedCrop.variety}</strong>
                  </div>
                  <div className="crop-card-details-item">
                    <span>Tipo de suelo:</span>
                    <strong>{selectedCrop.soilType}</strong>
                  </div>
                  <div className="crop-card-details-item">
                    <span>Total riegos:</span>
                    <strong>
                      {selectedCrop.activities.filter(a => a.type === 'irrigation').length} veces
                    </strong>
                  </div>
                  <div className="crop-card-details-item">
                    <span>Agua suministrada:</span>
                    <strong>
                      {selectedCrop.activities
                        .filter(a => a.type === 'irrigation')
                        .reduce((sum, a) => sum + (a.quantity || 0), 0)}{' '}
                      Litros
                    </strong>
                  </div>
                  <div className="crop-card-details-item">
                    <span>Fertilizantes aplicados:</span>
                    <strong>
                      {selectedCrop.activities
                        .filter(a => a.type === 'fertilization')
                        .reduce((sum, a) => sum + (a.quantity || 0), 0)}{' '}
                      kg
                    </strong>
                  </div>
                </div>
              </div>

              <div className="card" style={{ backgroundColor: 'var(--primary-subtle)', borderColor: 'rgba(82, 183, 136, 0.3)', color: 'var(--text)' }}>
                <h4 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', marginBottom: '0.5rem' }}>
                  <ThermometerSun size={18} style={{ color: 'var(--primary)' }} />
                  Recomendación Agrícola
                </h4>
                <p style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                  {selectedCrop.status === 'growing' 
                    ? 'Mantén un riego controlado basándote en la humedad del suelo. Los sensores locales recomiendan una frecuencia de 3 días con las temperaturas actuales.'
                    : 'Cultivo cosechado con éxito. Se recomienda rotar la tierra con leguminosas en la próxima campaña para recuperar los niveles de nitrógeno del suelo.'
                  }
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- ADD CROP MODAL --- */}
      {isCropModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 style={{ fontWeight: 700 }}>Registrar Nuevo Cultivo</h3>
              <button className="nav-icon-btn" onClick={() => setIsCropModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateCrop}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label" htmlFor="crop-name-input">Nombre del Cultivo</label>
                  <input 
                    id="crop-name-input"
                    type="text" 
                    className="form-control" 
                    placeholder="Ej. Trigo Harinero, Cebada, Tomates"
                    value={newCropName}
                    onChange={(e) => setNewCropName(e.target.value)}
                    required
                  />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="crop-variety-input">Variedad / Tipo</label>
                    <input 
                      id="crop-variety-input"
                      type="text" 
                      className="form-control" 
                      placeholder="Ej. Raf, Artur Nick"
                      value={newCropVariety}
                      onChange={(e) => setNewCropVariety(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="crop-soil-select">Tipo de Suelo</label>
                    <select 
                      id="crop-soil-select"
                      className="form-control"
                      value={newCropSoil}
                      onChange={(e) => setNewCropSoil(e.target.value)}
                      required
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Arcilloso">Arcilloso</option>
                      <option value="Arenoso">Arenoso</option>
                      <option value="Limoso">Limoso</option>
                      <option value="Franco">Franco</option>
                      <option value="Calizo">Calizo</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="crop-area-input">Superficie (Hectáreas)</label>
                    <input 
                      id="crop-area-input"
                      type="number" 
                      step="0.1" 
                      className="form-control" 
                      placeholder="Ej. 2.5"
                      value={newCropArea}
                      onChange={(e) => setNewCropArea(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="crop-date-input">Fecha de Siembra</label>
                    <input 
                      id="crop-date-input"
                      type="date" 
                      className="form-control"
                      value={newCropDate}
                      onChange={(e) => setNewCropDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsCropModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Registrar Campo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD ACTIVITY MODAL --- */}
      {isActivityModalOpen && selectedCrop && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 style={{ fontWeight: 700 }}>Registrar Actividad en {selectedCrop.name}</h3>
              <button className="nav-icon-btn" onClick={() => setIsActivityModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateActivity}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="activity-type-select">Tipo de Tarea</label>
                    <select 
                      id="activity-type-select"
                      className="form-control"
                      value={actType}
                      onChange={(e) => handleActivityTypeChange(e.target.value as ActivityType)}
                      required
                    >
                      <option value="irrigation">Riego</option>
                      <option value="fertilization">Fertilización</option>
                      <option value="pest">Control de Plagas</option>
                      <option value="harvest">Cosecha</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="activity-date-input">Fecha de Labor</label>
                    <input 
                      id="activity-date-input"
                      type="date" 
                      className="form-control"
                      value={actDate}
                      onChange={(e) => setActDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {(actType === 'irrigation' || actType === 'fertilization' || actType === 'harvest') && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="activity-quantity-input">Cantidad</label>
                      <input 
                        id="activity-quantity-input"
                        type="number" 
                        step="0.01" 
                        className="form-control" 
                        placeholder="Ej. 1000"
                        value={actQty}
                        onChange={(e) => setActQty(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="activity-unit-input">Unidad</label>
                      <input 
                        id="activity-unit-input"
                        type="text" 
                        className="form-control" 
                        value={actUnit}
                        onChange={(e) => setActUnit(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label" htmlFor="activity-details-textarea">Detalles y Observaciones</label>
                  <textarea 
                    id="activity-details-textarea"
                    rows={3} 
                    className="form-control" 
                    placeholder="Describe las labores realizadas, marca de productos utilizados, etc."
                    value={actDetails}
                    onChange={(e) => setActDetails(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsActivityModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Añadir Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CROP DELETE CONFIRM MODAL --- */}
      {cropToDelete && (
        <div className="modal-overlay" style={{ zIndex: 2000 }}>
          <div className="modal-card" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div className="modal-body" style={{ padding: '2rem 1.5rem' }}>
              <AlertCircle size={48} style={{ color: 'var(--danger)', marginBottom: '1rem', marginLeft: 'auto', marginRight: 'auto' }} />
              <h3 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>¿Eliminar Cultivo?</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                ¿Estás seguro de que deseas eliminar el cultivo <strong>{cropToDelete.name}</strong>? Esta acción no se puede deshacer.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setCropToDelete(null)}>
                  Cancelar
                </button>
                <button 
                  type="button"
                  className="btn btn-primary" 
                  style={{ backgroundColor: 'var(--danger)', borderColor: 'var(--danger)' }}
                  onClick={async () => {
                    try {
                      await cropService.deleteCrop(cropToDelete.id);
                      setCropToDelete(null);
                      setSelectedCrop(null);
                      loadCrops();
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- ACTIVITY DELETE CONFIRM MODAL --- */}
      {activityToDelete && (
        <div className="modal-overlay" style={{ zIndex: 2000 }}>
          <div className="modal-card" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div className="modal-body" style={{ padding: '2rem 1.5rem' }}>
              <AlertCircle size={48} style={{ color: 'var(--danger)', marginBottom: '1rem', marginLeft: 'auto', marginRight: 'auto' }} />
              <h3 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>¿Eliminar Actividad?</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                ¿Estás seguro de que deseas eliminar este evento del historial de actividades?
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setActivityToDelete(null)}>
                  Cancelar
                </button>
                <button 
                  type="button"
                  className="btn btn-primary" 
                  style={{ backgroundColor: 'var(--danger)', borderColor: 'var(--danger)' }}
                  onClick={async () => {
                    try {
                      await cropService.deleteActivity(activityToDelete.cropId, activityToDelete.activityId);
                      setActivityToDelete(null);
                      loadCrops();
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
