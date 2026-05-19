import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { marketService } from '../services/marketService';
import { Product } from '../types';
import { 
  User, Lock, ShoppingBag, Trash2, Save, 
  CheckCircle, AlertCircle, MapPin, Tag
} from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  
  // User info states
  const [name, setName] = useState(user?.name.split(' (')[0] || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [infoSuccess, setInfoSuccess] = useState(false);
  const [infoError, setInfoError] = useState<string | null>(null);
  const [infoLoading, setInfoLoading] = useState(false);

  // Password states
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdLoading, setPwdLoading] = useState(false);

   // Products states
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Sync state if user context updates (e.g. role switcher triggers name update)
  useEffect(() => {
    if (user) {
      setName(user.name.split(' (')[0]);
      setPhone(user.phone);
    }
  }, [user]);

  // Load user's marketplace products
  const loadMyProducts = async () => {
    if (!user) return;
    setProductsLoading(true);
    try {
      const allProducts = await marketService.getProducts();
      const userProducts = allProducts.filter(p => p.sellerId === user.id);
      setMyProducts(userProducts);
    } catch (err) {
      console.error('Error loading products', err);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    loadMyProducts();
  }, [user]);

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      setInfoError('Por favor, rellene todos los campos obligatorios.');
      return;
    }
    setInfoLoading(true);
    setInfoError(null);
    setInfoSuccess(false);

    try {
      await updateProfile(name, phone);
      setInfoSuccess(true);
      setTimeout(() => setInfoSuccess(false), 3000);
    } catch (err: any) {
      setInfoError(err.message || 'Error al actualizar el perfil.');
    } finally {
      setInfoLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setPwdError('Por favor, rellene todos los campos.');
      return;
    }
    if (password.length < 6) {
      setPwdError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setPwdError('Las contraseñas no coinciden.');
      return;
    }

    setPwdLoading(true);
    setPwdError(null);
    setPwdSuccess(false);

    try {
      await updateProfile(name, phone, password);
      setPassword('');
      setConfirmPassword('');
      setPwdSuccess(true);
      setTimeout(() => setPwdSuccess(false), 3000);
    } catch (err: any) {
      setPwdError(err.message || 'Error al actualizar la contraseña.');
    } finally {
      setPwdLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas retirar este producto del mercado?')) return;
    try {
      await marketService.deleteProduct(productId);
      setDeleteSuccess(true);
      setTimeout(() => setDeleteSuccess(false), 3000);
      // Reload products list
      loadMyProducts();
    } catch (err) {
      console.error('Error removing product', err);
    }
  };

  const getRoleLabel = (role?: string) => {
    const roles: Record<string, string> = {
      farmer: 'Agricultor',
      distributor: 'Distribuidor',
      supplier: 'Proveedor',
      admin: 'Administrador',
    };
    return role ? (roles[role] || role) : '';
  };

  return (
    <div className="fade-in">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Mi Perfil</h1>
          <p>Gestiona tu información de contacto, cambia de contraseña y administra tus publicaciones.</p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
        gap: '1.5rem',
        marginBottom: '2rem'
      } as any} className="grid-cols-2">
        
        {/* Left Column: Edit Info */}
        <div className="card">
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={20} style={{ color: 'var(--primary)' }} />
            Información del Perfil
          </h3>

          {infoSuccess && (
            <div className="auth-error" style={{ backgroundColor: 'rgba(45, 106, 79, 0.1)', borderColor: 'var(--primary-light)', color: 'var(--primary-dark)' }}>
              <CheckCircle size={18} style={{ flexShrink: 0 }} />
              <span>Perfil actualizado correctamente.</span>
            </div>
          )}

          {infoError && (
            <div className="auth-error">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{infoError}</span>
            </div>
          )}

          <form onSubmit={handleUpdateInfo} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="profile-name-input">Nombre Completo</label>
              <input 
                id="profile-name-input"
                type="text" 
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={infoLoading}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="profile-email-input">Correo Electrónico</label>
                <input 
                  id="profile-email-input"
                  type="email" 
                  className="form-control"
                  value={user?.email || ''}
                  disabled
                  title="El correo no se puede modificar"
                  style={{ cursor: 'not-allowed', backgroundColor: 'var(--bg)' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="profile-phone-input">Teléfono de Contacto</label>
                <input 
                  id="profile-phone-input"
                  type="tel" 
                  className="form-control"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  disabled={infoLoading}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Rol en AgroLink</label>
              <span className="badge badge-success" style={{ display: 'inline-block', fontSize: '0.9rem', padding: '0.4rem 0.8rem', textTransform: 'capitalize' }}>
                {getRoleLabel(user?.role)}
              </span>
            </div>

            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }} disabled={infoLoading}>
              <Save size={16} />
              {infoLoading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </form>
        </div>

        {/* Right Column: Update Password */}
        <div className="card">
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lock size={20} style={{ color: 'var(--accent)' }} />
            Seguridad (Cambiar Contraseña)
          </h3>

          {pwdSuccess && (
            <div className="auth-error" style={{ backgroundColor: 'rgba(45, 106, 79, 0.1)', borderColor: 'var(--primary-light)', color: 'var(--primary-dark)' }}>
              <CheckCircle size={18} style={{ flexShrink: 0 }} />
              <span>Contraseña actualizada correctamente.</span>
            </div>
          )}

          {pwdError && (
            <div className="auth-error">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{pwdError}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="new-password-input">Nueva Contraseña</label>
              <input 
                id="new-password-input"
                type="password" 
                className="form-control"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={pwdLoading}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirm-password-input">Confirmar Nueva Contraseña</label>
              <input 
                id="confirm-password-input"
                type="password" 
                className="form-control"
                placeholder="Repite la contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={pwdLoading}
              />
            </div>

            <button type="submit" className="btn btn-secondary" style={{ alignSelf: 'flex-start', marginTop: '1rem', color: 'var(--accent)', borderColor: 'var(--accent)' }} disabled={pwdLoading}>
              <Lock size={16} />
              {pwdLoading ? 'Actualizando...' : 'Cambiar Contraseña'}
            </button>
          </form>
        </div>

      </div>

      {/* Row 2: Manage My Products */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <ShoppingBag size={20} style={{ color: 'var(--primary)' }} />
          Mis Anuncios Publicados
        </h3>

        {deleteSuccess && (
          <div className="auth-error" style={{ backgroundColor: 'rgba(45, 106, 79, 0.1)', borderColor: 'var(--primary-light)', color: 'var(--primary-dark)', marginBottom: '1rem' }}>
            <CheckCircle size={18} style={{ flexShrink: 0 }} />
            <span>Anuncio retirado del mercado correctamente.</span>
          </div>
        )}

        {productsLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            Cargando tus productos...
          </div>
        ) : myProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            <Tag size={32} style={{ opacity: 0.3, margin: '0 auto 0.5rem' }} />
            No has publicado ningún producto en el marketplace todavía.
          </div>
        ) : (
          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Producto</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Categoría</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Precio Unitario</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Stock Disponible</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Localización</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {myProducts.map(prod => (
                  <tr key={prod.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{prod.title}</td>
                    <td style={{ padding: '1rem' }}>
                      <span className="badge badge-info" style={{ fontSize: '0.85rem' }}>
                        {prod.category === 'crops' ? 'Cosecha' : 
                         prod.category === 'seeds' ? 'Semillas' : 
                         prod.category === 'machinery' ? 'Maquinaria' : 'Insumos'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--primary)', fontWeight: 700 }}>
                      {prod.price} € / {prod.unit}
                    </td>
                    <td style={{ padding: '1rem' }}>{prod.stock} {prod.unit}</td>
                    <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '3px', borderBottom: 'none' } as any}>
                      <MapPin size={12} style={{ color: 'var(--text-muted)' }} />
                      {prod.location}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button 
                        className="btn btn-danger btn-sm"
                        style={{ padding: '0.25rem 0.5rem', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                        onClick={() => setProductToDelete(prod)}
                      >
                        <Trash2 size={14} />
                        Retirar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- PRODUCT DELETE CONFIRM MODAL --- */}
      {productToDelete && (
        <div className="modal-overlay" style={{ zIndex: 2000 }}>
          <div className="modal-card" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div className="modal-body" style={{ padding: '2rem 1.5rem' }}>
              <AlertCircle size={48} style={{ color: 'var(--danger)', marginBottom: '1rem', marginLeft: 'auto', marginRight: 'auto' }} />
              <h3 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>¿Retirar Anuncio?</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                ¿Estás seguro de que deseas retirar <strong>{productToDelete.title}</strong> de la venta?
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setProductToDelete(null)}>
                  Cancelar
                </button>
                <button 
                  type="button"
                  className="btn btn-primary" 
                  style={{ backgroundColor: 'var(--danger)', borderColor: 'var(--danger)' }}
                  onClick={async () => {
                    try {
                      await marketService.deleteProduct(productToDelete.id);
                      setProductToDelete(null);
                      setDeleteSuccess(true);
                      setTimeout(() => setDeleteSuccess(false), 3000);
                      loadMyProducts();
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
