// src/features/auth/types/auth.types.ts
// ✅ User extendido con campos de perfil completo

export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role?: string;
  location?: string;
  bio?: string;
}

// Iniciales generadas a partir del nombre
export const getUserInitials = (user: User): string => {
  if (!user.name) return user.email.slice(0, 2).toUpperCase();
  return user.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
};

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name?: string;
}

export interface UpdateProfileDto {
  name?: string;
  phone?: string;
  role?: string;
  location?: string;
  bio?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}