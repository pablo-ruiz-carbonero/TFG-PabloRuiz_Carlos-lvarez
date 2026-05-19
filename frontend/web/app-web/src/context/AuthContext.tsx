import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { authService } from '../services/authService';
import { dbService } from '../services/mockDb';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, passwordHash: string) => Promise<void>;
  register: (name: string, email: string, passwordHash: string, phone: string, role: UserRole) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  updateProfile: (name: string, phone: string, password?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('agro_token');
      const cachedUser = localStorage.getItem('agro_user');

      if (token && cachedUser) {
        try {
          setUser(JSON.parse(cachedUser));
        } catch (e) {
          console.error('Error parsing cached user', e);
          localStorage.removeItem('agro_token');
          localStorage.removeItem('agro_user');
        }
      }
      setLoading(false);
    };

    initializeAuth();

    // Listen to global logout events (e.g. 401 responses)
    const handleLogoutEvent = () => {
      logout();
    };

    window.addEventListener('auth_logout', handleLogoutEvent);
    return () => {
      window.removeEventListener('auth_logout', handleLogoutEvent);
    };
  }, []);

  const login = async (email: string, passwordHash: string) => {
    setLoading(true);
    try {
      const response = await authService.login(email, passwordHash);
      setUser(response.user);
      localStorage.setItem('agro_token', response.token);
      localStorage.setItem('agro_user', JSON.stringify(response.user));
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, passwordHash: string, phone: string, role: UserRole) => {
    setLoading(true);
    try {
      const response = await authService.register(name, email, passwordHash, phone, role);
      setUser(response.user);
      localStorage.setItem('agro_token', response.token);
      localStorage.setItem('agro_user', JSON.stringify(response.user));
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('agro_token');
    localStorage.removeItem('agro_user');
  };

  // Facilitates testing roles in TFG presentations without re-registering
  const switchRole = (role: UserRole) => {
    if (!user) return;
    
    // In mock mode we can update the user directly
    const updatedUser: User = {
      ...user,
      name: `${user.name.split(' (')[0]} (${role.charAt(0).toUpperCase() + role.slice(1)})`,
      role,
    };
    setUser(updatedUser);
    localStorage.setItem('agro_user', JSON.stringify(updatedUser));

    // Update in local DB if user exists there
    if (import.meta.env.VITE_USE_MOCK_API === 'true') {
      const db = dbService.getUsers();
      const userInDb = db.find(u => u.id === user.id);
      if (userInDb) {
        userInDb.role = role;
        // Save back (mockDb works on internal save)
        const fullDb = JSON.parse(localStorage.getItem('agro_db') || '{}');
        fullDb.users = fullDb.users.map((u: any) => u.id === user.id ? { ...u, role } : u);
        localStorage.setItem('agro_db', JSON.stringify(fullDb));
      }
    }
  };

  const updateProfile = async (name: string, phone: string, password?: string) => {
    if (!user) return;
    setLoading(true);
    try {
      const updated = await authService.updateProfile(user.id, name, phone, password);
      // Retain the current presentation role/name formatting if role-switching was active
      const finalUser = {
        ...updated,
        role: user.role,
        name: user.name.includes('(') ? `${updated.name} (${user.role.charAt(0).toUpperCase() + user.role.slice(1)})` : updated.name
      };
      setUser(finalUser);
      localStorage.setItem('agro_user', JSON.stringify(finalUser));
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, switchRole, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
