import { LoginRequest, RegisterRequest, AuthResponse, RegisterResponse } from "../types/auth";

const API_BASE_URL = "http://192.168.1.179:3000";

export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error en el login');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
};

export const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error en el registro');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error en register:', error);
    throw error;
  }
};
