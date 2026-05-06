// src/types/auth.ts

import { User } from "./user";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  email: string;
  telefono?: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user?: User;
}

export interface RegisterResponse {
  token: string;
}