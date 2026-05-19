import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, AlertCircle, Loader } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Where to redirect after login (default to /dashboard)
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, rellene todos los campos.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión. Inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <Sprout size={36} />
            <span>Agro<span>Link</span></span>
          </div>
          <h1 className="auth-title">Iniciar Sesión</h1>
          <p className="auth-subtitle">Accede a tu panel agrícola y marketplace</p>
        </div>

        {error && (
          <div className="auth-error">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
            <label className="form-label" htmlFor="password-input">Contraseña</label>
            <input
              id="password-input"
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
            style={{ marginTop: '0.5rem', height: '48px' }}
          >
            {loading ? (
              <>
                <Loader size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                <span>Iniciando sesión...</span>
              </>
            ) : (
              'Entrar al Panel'
            )}
          </button>
        </form>

        <div className="auth-footer">
          ¿No tienes una cuenta?{' '}
          <Link to="/register" className="auth-link">
            Regístrate aquí
          </Link>
        </div>

        {/* Demo Credentials Box */}
        <div style={{
          backgroundColor: 'var(--bg)',
          borderRadius: 'var(--radius-sm)',
          padding: '1rem',
          border: '1px dashed var(--border)',
          fontSize: '0.8rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <strong style={{ color: 'var(--primary)', display: 'block', fontSize: '0.85rem' }}>
            Cuentas de prueba (Simulación):
          </strong>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <div>
              <span style={{ fontWeight: 600 }}>🌾 Agricultor:</span>
              <br />juan@agri.com / juan123
            </div>
            <div>
              <span style={{ fontWeight: 600 }}>🚚 Distribuidor:</span>
              <br />carlos@dist.com / carlos123
            </div>
            <div>
              <span style={{ fontWeight: 600 }}>⚙️ Proveedor:</span>
              <br />ana@prov.com / ana123
            </div>
            <div>
              <span style={{ fontWeight: 600 }}>🛡️ Administrador:</span>
              <br />admin@agro.com / admin123
            </div>
          </div>
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
