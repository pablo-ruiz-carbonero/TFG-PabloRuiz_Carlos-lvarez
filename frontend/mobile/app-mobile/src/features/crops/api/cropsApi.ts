// src/features/crops/api/cropsApi.ts
// Capa de red pura — solo fetch, sin lógica de negocio

import {
  Crop,
  Parcel,
  CreateCropDto,
  UpdateCropDto,
} from "../types/crops.types";
import { mapCrop, mapParcel } from "../utils/cropMappers";
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

// ─── Crops ────────────────────────────────────────────────────────────────────

export const getAllCropsRequest = async (): Promise<Crop[]> => {
  const res = await fetch(`${API_URL}/crops`, {
    headers: await authHeaders(),
  });
  const data = await handleResponse(res);
  return data.map(mapCrop);
};

export const getCropByIdRequest = async (cropId: string): Promise<Crop> => {
  const res = await fetch(`${API_URL}/crops/${cropId}`, {
    headers: await authHeaders(),
  });
  const data = await handleResponse(res);
  return mapCrop(data);
};

export const createCropRequest = async (dto: CreateCropDto): Promise<Crop> => {
  const res = await fetch(`${API_URL}/crops`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({
      nombre: dto.name,
      variedad: dto.variety,
      tipo_cultivo: dto.cropType,
      parcela_id: parseInt(dto.parcelId),
      superficie: dto.surfaceArea,
      fecha_siembra: dto.seedDate,
      notas: dto.notes,
      fase_actual: "Plántula",
      dias_riego: 2,
      dias_fertilizacion: 7,
    }),
  });
  const data = await handleResponse(res);
  return mapCrop(data);
};

export const updateCropRequest = async (
  cropId: string,
  dto: UpdateCropDto,
): Promise<Crop> => {
  const body: any = {};
  if (dto.name) body.nombre = dto.name;
  if (dto.variety) body.variedad = dto.variety;
  if (dto.cropType) body.tipo_cultivo = dto.cropType;
  if (dto.parcelId) body.parcela_id = parseInt(dto.parcelId);
  if (dto.surfaceArea !== undefined) body.superficie = dto.surfaceArea;
  if (dto.seedDate) body.fecha_siembra = dto.seedDate;
  if (dto.currentPhase) body.fase_actual = dto.currentPhase;
  if (dto.expectedHarvest) body.fecha_cosecha_esperada = dto.expectedHarvest;
  if (dto.notes !== undefined) body.notas = dto.notes;
  if (dto.status) body.status = dto.status;

  const res = await fetch(`${API_URL}/crops/${cropId}`, {
    method: "PATCH",
    headers: await authHeaders(),
    body: JSON.stringify(body),
  });
  const data = await handleResponse(res);
  return mapCrop(data);
};

export const deleteCropRequest = async (cropId: string): Promise<void> => {
  const res = await fetch(`${API_URL}/crops/${cropId}`, {
    method: "DELETE",
    headers: await authHeaders(),
  });
  await handleResponse(res);
};

// ─── Parcels ──────────────────────────────────────────────────────────────────

export const getParcelsRequest = async (): Promise<Parcel[]> => {
  const res = await fetch(`${API_URL}/crops/parcels/list`, {
    headers: await authHeaders(),
  });
  const data = await handleResponse(res);
  return data.map(mapParcel);
};
