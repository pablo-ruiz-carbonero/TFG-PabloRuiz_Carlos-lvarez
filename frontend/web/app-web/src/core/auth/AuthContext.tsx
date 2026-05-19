// src/core/auth/AuthContext.tsx

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { api } from "../api/axios";
import { getToken, saveToken, removeToken } from "./authStorage";

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface User {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;
  rol?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    nombre: string,
    email: string,
    password: string,
    telefono?: string,
  ) => Promise<void>;
  logout: () => void;
}

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restaura la sesión al cargar la app
  const bootstrap = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) return;
      // ✅ Verificamos que el token sigue siendo válido
      const { data } = await api.get<User>("/auth/me");
      setUser(data);
    } catch {
      removeToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const login = async (email: string, password: string) => {
    const { data } = await api.post<{ accessToken: string; user: User }>(
      "/auth/login",
      {
        email,
        password,
      },
    );
    // ✅ FIX: guardamos "accessToken" (antes se guardaba "token" que no existía en la respuesta)
    saveToken(data.accessToken);
    setUser(data.user);
  };

  const register = async (
    nombre: string,
    email: string,
    password: string,
    telefono?: string,
  ) => {
    const { data } = await api.post<{ accessToken: string; user: User }>(
      "/auth/register",
      {
        nombre,
        email,
        password,
        telefono,
      },
    );
    saveToken(data.accessToken);
    setUser(data.user);
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ── Hook de consumo ───────────────────────────────────────────────────────────

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
};
