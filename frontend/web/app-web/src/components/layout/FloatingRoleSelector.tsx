import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { ShieldCheck } from 'lucide-react';

export const FloatingRoleSelector: React.FC = () => {
  const { user, switchRole } = useAuth();

  // Show only if mock mode is on and user is logged in
  const isMock = import.meta.env.VITE_USE_MOCK_API === 'true';
  
  if (!isMock || !user) return null;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    switchRole(e.target.value as UserRole);
  };

  return (
    <div className="demo-role-switcher">
      <ShieldCheck size={18} style={{ color: 'var(--primary)' }} />
      <span className="demo-role-title">Demo Roles</span>
      <select 
        value={user.role} 
        onChange={handleChange}
        className="demo-role-select"
        title="Cambiar rol de demostración"
      >
        <option value="farmer">Agricultor (Juan)</option>
        <option value="distributor">Distribuidor (Carlos)</option>
        <option value="supplier">Proveedor (Ana)</option>
        <option value="admin">Administrador (Admin)</option>
      </select>
    </div>
  );
};
