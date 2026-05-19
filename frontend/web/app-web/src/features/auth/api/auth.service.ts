// src/features/auth/api/auth.service.ts
// Las llamadas de login/register ahora viven en AuthContext.
// Este archivo se mantiene para peticiones puntuales que no necesitan estado.

import { api } from "../../../core/api/axios";

export interface MeResponse {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;
  rol?: string;
}

/** Obtiene el perfil del usuario autenticado. */
export const getMe = async (): Promise<MeResponse> => {
  const { data } = await api.get<MeResponse>("/auth/me");
  return data;
};
