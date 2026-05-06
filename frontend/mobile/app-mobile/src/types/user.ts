// src/types/user.ts

export interface User {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;
  rol?: string;
}