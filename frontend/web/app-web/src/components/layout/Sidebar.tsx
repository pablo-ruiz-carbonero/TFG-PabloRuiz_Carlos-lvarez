import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Sprout, ShoppingBag, MessageSquare, ShieldAlert, User as UserIcon } from 'lucide-react';
import { UserRole } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const navItems: NavItem[] = [
    {
      name: 'Panel de Control',
      path: '/dashboard',
      icon: <LayoutDashboard size={20} />,
    },
    {
      name: 'Mis Cultivos',
      path: '/crops',
      icon: <Sprout size={20} />,
      allowedRoles: ['farmer', 'admin'],
    },
    {
      name: 'Mercado Agrícola',
      path: '/marketplace',
      icon: <ShoppingBag size={20} />,
    },
    {
      name: 'Mensajería',
      path: '/messages',
      icon: <MessageSquare size={20} />,
    },
    {
      name: 'Mi Perfil',
      path: '/profile',
      icon: <UserIcon size={20} />,
    },
  ];

  const filteredItems = navItems.filter(
    item => !item.allowedRoles || (user && item.allowedRoles.includes(user.role))
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          style={{
            position: 'fixed',
            top: 'var(--header-height)',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(3px)',
            zIndex: 85,
          }}
        />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-nav">
          {filteredItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </div>

        <div className="sidebar-footer">
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              <ShieldAlert size={14} />
              <span>Rol actual: {user.role.toUpperCase()}</span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
