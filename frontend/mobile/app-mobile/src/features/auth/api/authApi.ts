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

const authHeaders = async (token: string): Promise<HeadersInit> => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
};

// ── Login ─────────────────────────────────────────────────────────────────────
export const loginRequest = async (data: LoginDto): Promise<AuthResponse> => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

// ── Register ──────────────────────────────────────────────────────────────────
export const registerRequest = async (
  data: RegisterDto,
): Promise<AuthResponse> => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

// ── Me ────────────────────────────────────────────────────────────────────────
export const getMeRequest = async (token: string): Promise<User> => {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: await authHeaders(token),
  });
  return handleResponse(res);
};

// ── Update Profile ────────────────────────────────────────────────────────────
export const updateProfileRequest = async (
  token: string,
  dto: UpdateProfileDto,
): Promise<User> => {
  const res = await fetch(`${API_URL}/auth/profile`, {
    method: "PATCH",
    headers: await authHeaders(token),
    body: JSON.stringify(dto),
  });
  return handleResponse(res);
};

// ── Change Password ───────────────────────────────────────────────────────────
export const changePasswordRequest = async (
  token: string,
  dto: ChangePasswordDto,
): Promise<void> => {
  const res = await fetch(`${API_URL}/auth/change-password`, {
    method: "POST",
    headers: await authHeaders(token),
    body: JSON.stringify({
      current_password: dto.currentPassword,
      new_password: dto.newPassword,
    }),
  });
  await handleResponse(res);
};
