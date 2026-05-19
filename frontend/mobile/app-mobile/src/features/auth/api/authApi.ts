// src/features/auth/api/authApi.ts

import {
  LoginDto,
  RegisterDto,
  AuthResponse,
  UpdateProfileDto,
  ChangePasswordDto,
  User,
} from "../types/auth.types";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// ── Helpers ──────────────────────────────────────────────────────────────────

const authHeaders = (token: string): HeadersInit => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

const handleResponse = async <T>(res: Response): Promise<T> => {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    // El backend devuelve { message: string } en los errores de NestJS
    const message = Array.isArray(err.message)
      ? err.message.join(", ")
      : (err.message ?? `Error HTTP ${res.status}`);
    throw new Error(message);
  }
  return res.json() as Promise<T>;
};

// ── Auth endpoints ────────────────────────────────────────────────────────────

export const loginRequest = async (data: LoginDto): Promise<AuthResponse> => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<AuthResponse>(res);
};

export const registerRequest = async (
  data: RegisterDto,
): Promise<AuthResponse> => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // FIX: se envían "nombre" y "telefono" tal como espera el backend
    body: JSON.stringify(data),
  });
  return handleResponse<AuthResponse>(res);
};

export const getMeRequest = async (token: string): Promise<User> => {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: authHeaders(token),
  });
  return handleResponse<User>(res);
};

export const updateProfileRequest = async (
  token: string,
  dto: UpdateProfileDto,
): Promise<User> => {
  const res = await fetch(`${API_URL}/auth/profile`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(dto),
  });
  return handleResponse<User>(res);
};

export const changePasswordRequest = async (
  token: string,
  dto: ChangePasswordDto,
): Promise<void> => {
  const res = await fetch(`${API_URL}/auth/change-password`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      current_password: dto.currentPassword,
      new_password: dto.newPassword,
    }),
  });
  await handleResponse<void>(res);
};
