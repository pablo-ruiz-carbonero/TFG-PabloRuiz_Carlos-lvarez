// src/features/auth/types/auth.types.ts

// FIX: los campos coinciden EXACTAMENTE con lo que devuelve el backend.
//    Antes: "name", "phone" → Ahora: "nombre", "telefono" (igual que la BD)
export interface User {
  id: number;
  email: string;
  nombre?: string;
  telefono?: string;
  rol?: string;
}

// Helper para mostrar iniciales en avatar
export const getUserInitials = (user: User): string => {
  if (!user.nombre) return user.email.slice(0, 2).toUpperCase();
  return user.nombre
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
};

// FIX: el campo del token es "accessToken" (antes "token")
export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface LoginDto {
  email: string;
  password: string;
}

// FIX: "nombre" y "telefono" coinciden con el RegisterDto del backend
export interface RegisterDto {
  email: string;
  password: string;
  nombre?: string;
  telefono?: string;
}

export interface UpdateProfileDto {
  nombre?: string;
  telefono?: string;
  rol?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}
