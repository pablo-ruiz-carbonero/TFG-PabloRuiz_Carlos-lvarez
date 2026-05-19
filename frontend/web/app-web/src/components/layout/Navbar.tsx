import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Sun, Moon, Sprout, Menu } from 'lucide-react';
import { UserRole } from '../../types';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    // Check initial theme
    const theme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (theme === 'dark' || (!theme && systemPrefersDark)) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const getRoleLabel = (role: UserRole) => {
    const roles: Record<UserRole, string> = {
      farmer: 'Agricultor',
      distributor: 'Distribuidor',
      supplier: 'Proveedor',
      admin: 'Administrador',
    };
    return roles[role] || role;
  };

  return (
    <header className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="nav-icon-btn menu-toggle" onClick={onToggleSidebar}>
          <Menu size={24} />
        </button>
        <div className="nav-brand">
          <Sprout size={28} style={{ color: 'var(--primary)' }} />
          <span>Agro<span>Link</span></span>
        </div>
      </div>

      <div className="nav-actions">
        <button 
          className="nav-icon-btn" 
          onClick={toggleTheme} 
          title="Cambiar tema (Claro/Oscuro)"
          aria-label="Cambiar tema"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {user && (
          <>
            <div className="user-badge" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }} title="Ver mi perfil">
              <div className="user-avatar" title={user.name}>
                {getInitials(user.name)}
              </div>
              <div className="user-info-text" style={{ display: 'none', md: 'flex' } as any}>
                <span className="user-name">{user.name.split(' (')[0]}</span>
                <span className="user-role-label">{getRoleLabel(user.role)}</span>
              </div>
            </div>
            
            <button 
              className="nav-icon-btn" 
              onClick={logout} 
              title="Cerrar sesión"
              style={{ color: 'var(--danger)' }}
              aria-label="Cerrar sesión"
            >
              <LogOut size={20} />
            </button>
          </>
        )}
      </div>
    </header>
  );
};
