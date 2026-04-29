import { LoginRequest, RegisterRequest } from "../types/auth";

export const login = async (data: LoginRequest) => {
  return new Promise<any>((resolve) => {
    setTimeout(() => {
      resolve({
        user: {
          id: 1,
          name: "Pablo",
          email: data.email,
        },
        token: "fake-token-123",
      });
    }, 1000);
  });
};

export const register = async (data: RegisterRequest) => {
  return new Promise<any>((resolve) => {
    setTimeout(() => {
      resolve({
        message: "Usuario creado",
        token: "fake-token-123",
      });
    }, 1000);
  });
};
