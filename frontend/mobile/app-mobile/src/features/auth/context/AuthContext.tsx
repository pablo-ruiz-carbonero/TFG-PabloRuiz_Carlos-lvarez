// src/features/auth/context/AuthContext.tsx

import React, { createContext, useEffect, useState } from "react";
import { User, UpdateProfileDto, ChangePasswordDto } from "../types/auth.types";
import {
  loginRequest,
  registerRequest,
  getMeRequest,
  updateProfileRequest,
  changePasswordRequest,
} from "../api/authApi";
import { saveToken, getToken, removeToken } from "../utils/tokenStorage";

// ─────────────────────────────────────────────────────────────
// 🚧 DEV BYPASS
// ─────────────────────────────────────────────────────────────
const DEV_BYPASS = __DEV__;

const DEV_USER: User = {
  id: "dev-001",
  email: "dev@agrolink.com",
  name: "Dev User",
  role: "Agricultor",
  location: "Sevilla",
  bio: "Usuario de desarrollo para pruebas.",
  phone: "+34 600 000 000",
};
// ─────────────────────────────────────────────────────────────

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isDevMode: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (dto: UpdateProfileDto) => Promise<void>;
  changePassword: (dto: ChangePasswordDto) => Promise<void>;
  devLogin: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bootstrap();
  }, []);

  const bootstrap = async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const userData = await getMeRequest(token);
      setUser(userData);
    } catch {
      await removeToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const data = await loginRequest({ email, password });
    await saveToken(data.accessToken);
    setUser(data.user);
  };

  const register = async (email: string, password: string, name?: string) => {
    const data = await registerRequest({ email, password, name });
    await saveToken(data.accessToken);
    setUser(data.user);
  };

  const logout = async () => {
    await removeToken();
    setUser(null);
  };

  // ✅ Actualiza perfil y refleja cambios en el contexto inmediatamente
  const updateProfile = async (dto: UpdateProfileDto) => {
    if (DEV_BYPASS) {
      setUser((prev) => (prev ? { ...prev, ...dto } : prev));
      return;
    }
    const token = await getToken();
    if (!token) throw new Error("No autenticado");
    const updated = await updateProfileRequest(token, dto);
    setUser(updated);
  };

  // ✅ Cambio de contraseña delegado al API
  const changePassword = async (dto: ChangePasswordDto) => {
    if (DEV_BYPASS) {
      // Simula éxito en dev sin llamada real
      await new Promise((r) => setTimeout(r, 600));
      return;
    }
    const token = await getToken();
    if (!token) throw new Error("No autenticado");
    await changePasswordRequest(token, dto);
  };

  const devLogin = () => {
    if (!DEV_BYPASS) return;
    setUser(DEV_USER);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isDevMode: DEV_BYPASS,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        devLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
