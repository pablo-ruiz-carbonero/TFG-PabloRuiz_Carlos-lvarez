import { api } from './api';
import { dbService } from './mockDb';
import { User } from '../types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true';

// Helper to simulate network latency in mock mode
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  login: async (email: string, passwordHash: string): Promise<{ user: User; token: string }> => {
    if (USE_MOCK) {
      await delay(600);
      const res = dbService.login(email, passwordHash);
      if (!res) {
        throw new Error('Credenciales incorrectas (Email o contraseña no válidos)');
      }
      return res;
    } else {
      // In NestJS, login standard payload is { email, password }
      return api.post('/auth/login', { email, password: passwordHash });
    }
  },

  register: async (name: string, email: string, passwordHash: string, phone: string, role: 'farmer' | 'distributor' | 'supplier' | 'admin'): Promise<{ user: User; token: string }> => {
    if (USE_MOCK) {
      await delay(800);
      // Validate unique email in mock database
      const dbUsers = dbService.getUsers();
      if (dbUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('El correo electrónico ya está registrado');
      }
      return dbService.register(name, email, passwordHash, phone, role);
    } else {
      // NestJS register standard payload
      return api.post('/auth/register', { name, email, password: passwordHash, phone, role });
    }
  },

  getProfile: async (): Promise<User> => {
    if (USE_MOCK) {
      await delay(100);
      const cached = localStorage.getItem('agro_user');
      if (!cached) throw new Error('No session');
      return JSON.parse(cached);
    } else {
      return api.get('/auth/profile');
    }
  },

  updateProfile: async (userId: string, name: string, phone: string, password?: string): Promise<User> => {
    if (USE_MOCK) {
      await delay(500);
      const fullDb = JSON.parse(localStorage.getItem('agro_db') || '{}');
      const userIndex = fullDb.users.findIndex((u: any) => u.id === userId);
      if (userIndex === -1) throw new Error('Usuario no encontrado');

      const updatedUser = {
        ...fullDb.users[userIndex],
        name,
        phone,
      };

      if (password) {
        updatedUser.password = password;
      }

      fullDb.users[userIndex] = updatedUser;
      localStorage.setItem('agro_db', JSON.stringify(fullDb));
      return { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email, phone: updatedUser.phone, role: updatedUser.role };
    } else {
      return api.patch('/auth/profile', { name, phone, password });
    }
  }
};
