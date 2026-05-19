// src/core/api/interceptors.ts
// ⚠️ Importa este archivo UNA VEZ en main.tsx antes de montar la app.

import { api } from "./axios";
import { getToken, removeToken } from "../auth/authStorage";

// ── Request: inyecta el token en todas las peticiones ─────────────────────────
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response: maneja el 401 global (token caducado / inválido) ────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido o caducado — limpiamos y redirigimos al login
      removeToken();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);
