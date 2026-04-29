// src/types/user.ts

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string; // opcional
}