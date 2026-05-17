// src/features/products/api/productsApi.ts

import { Product, CreateProductDto, UpdateProductDto } from "../types/products.types";
import { getToken } from "../../auth/utils/tokenStorage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const authHeaders = async (): Promise<HeadersInit> => {
  const token = await getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `HTTP ${res.status}`);
  }
  return res.json();
};

// ─────────────────────────────────────────────────────────────────────────────

export const getAllProductsRequest = async (): Promise<Product[]> => {
  const res = await fetch(`${API_URL}/products`, {
    headers: await authHeaders(),
  });
  return handleResponse(res);
};

export const getProductByIdRequest = async (id: string): Promise<Product> => {
  const res = await fetch(`${API_URL}/products/${id}`, {
    headers: await authHeaders(),
  });
  return handleResponse(res);
};

export const getMyProductsRequest = async (): Promise<Product[]> => {
  const res = await fetch(`${API_URL}/products/mine`, {
    headers: await authHeaders(),
  });
  return handleResponse(res);
};

export const createProductRequest = async (
  dto: CreateProductDto
): Promise<Product> => {
  const res = await fetch(`${API_URL}/products`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({
      nombre: dto.name,
      categoria: dto.category,
      precio: dto.price,
      unidad: dto.unit,
      stock: dto.stock,
      descripcion: dto.description,
      provincia: dto.province,
    }),
  });
  return handleResponse(res);
};

export const updateProductRequest = async (
  id: string,
  dto: UpdateProductDto
): Promise<Product> => {
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: "PATCH",
    headers: await authHeaders(),
    body: JSON.stringify(dto),
  });
  return handleResponse(res);
};

export const deleteProductRequest = async (id: string): Promise<void> => {
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: "DELETE",
    headers: await authHeaders(),
  });
  await handleResponse(res);
};