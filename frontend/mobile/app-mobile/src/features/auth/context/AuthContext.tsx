// src/features/auth/context/AuthContext.tsx

import React, { createContext, useCallback, useEffect, useState } from "react";
import {
  User,
  UpdateProfileDto,
  ChangePasswordDto,
  RegisterDto,
} from "../types/auth.types";
import {
  loginRequest,
  registerRequest,
  getMeRequest,
  updateProfileRequest,
  changePasswordRequest,
} from "../api/authApi";
import { saveToken, getToken, removeToken } from "../utils/tokenStorage";

// ─────────────────────────────────────────────────────────────────────────────
// DEV BYPASS — solo activo en desarrollo (__DEV__ = true en Expo)
// ─────────────────────────────────────────────────────────────────────────────
const DEV_BYPASS = __DEV__;

const DEV_USER: User = {
  id: 0,
  email: "dev@agrolink.com",
  nombre: "Dev User",
  telefono: "+34 600 000 000",
  rol: "Agricultor",
};

// ─────────────────────────────────────────────────────────────────────────────

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isDevMode: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (dto: RegisterDto) => Promise<void>;
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
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Carga la sesión guardada al arrancar la app
  const bootstrap = useCallback(async () => {
    try {
      const saved = await getToken();
      if (!saved) return;
      // Verificamos que el token sigue siendo válido contra /auth/me
      const userData = await getMeRequest(saved);
      setToken(saved);
      setUser(userData);
    } catch {
      // Token caducado o inválido — limpiamos
      await removeToken();
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const login = async (email: string, password: string) => {
    const data = await loginRequest({ email, password });
    // FIX PRINCIPAL: el backend devuelve "accessToken", no "token"
    await saveToken(data.accessToken);
    setToken(data.accessToken);
    setUser(data.user);
  };

  const register = async (dto: RegisterDto) => {
    const data = await registerRequest(dto);
    // FIX: mismo campo "accessToken"
    await saveToken(data.accessToken);
    setToken(data.accessToken);
    setUser(data.user);
  };

  const logout = async () => {
    await removeToken();
    setUser(null);
    setToken(null);
  };

  const updateProfile = async (dto: UpdateProfileDto) => {
    if (DEV_BYPASS && !token) {
      setUser((prev) => (prev ? { ...prev, ...dto } : prev));
      return;
    }
    const saved = token ?? (await getToken());
    if (!saved) throw new Error("No autenticado");
    const updated = await updateProfileRequest(saved, dto);
    setUser(updated);
  };

  const changePassword = async (dto: ChangePasswordDto) => {
    if (DEV_BYPASS && !token) {
      await new Promise((r) => setTimeout(r, 600));
      return;
    }
    const saved = token ?? (await getToken());
    if (!saved) throw new Error("No autenticado");
    await changePasswordRequest(saved, dto);
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
        token,
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
