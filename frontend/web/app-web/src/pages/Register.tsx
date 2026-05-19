import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, AlertCircle, Loader } from 'lucide-react';
import { UserRole } from '../types';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('farmer');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !phone || !role) {
      setError('Por favor, rellene todos los campos obligatorios.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await register(name, email, password, phone, role);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error al crear la cuenta. Inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ maxWidth: '520px' }}>
        <div className="auth-header">
          <div className="auth-logo">
            <Sprout size={36} />
            <span>Agro<span>Link</span></span>
          </div>
          <h1 className="auth-title">Crear Cuenta</h1>
          <p className="auth-subtitle">Regístrate para gestionar tus cultivos o comerciar</p>
        </div>

        {error && (
          <div className="auth-error">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="name-input">Nombre Completo</label>
            <input
              id="name-input"
              type="text"
              className="form-control"
              placeholder="Juan Pérez"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="email-input">Correo Electrónico</label>
              <input
                id="email-input"
                type="email"
                className="form-control"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="phone-input">Teléfono</label>
              <input
                id="phone-input"
                type="tel"
                className="form-control"
                placeholder="+34 600 000 000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="role-select">Tipo de Usuario</label>
              <select
                id="role-select"
                className="form-control"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                disabled={loading}
                required
              >
                <option value="farmer">Agricultor (Gestión y Venta)</option>
                <option value="distributor">Distribuidor (Compra y Contratación)</option>
                <option value="supplier">Proveedor (Venta de Insumos)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="password-input">Contraseña</label>
              <input
                id="password-input"
                type="password"
                className="form-control"
                placeholder="Mín. 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
            style={{ marginTop: '0.5rem', height: '48px' }}
          >
            {loading ? (
              <>
                <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Registrando cuenta...</span>
              </>
            ) : (
              'Crear mi Cuenta'
            )}
          </button>
        </form>

        <div className="auth-footer">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="auth-link">
            Inicia sesión aquí
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
