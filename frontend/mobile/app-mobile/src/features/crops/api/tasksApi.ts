// src/features/crops/api/tasksApi.ts

import { Task, CreateTaskDto } from "../types/crops.types";
import { mapTask } from "../utils/cropMappers";
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

export const getTasksByCropRequest = async (
  cropId: string,
): Promise<Task[]> => {
  const res = await fetch(`${API_URL}/tasks/crop/${cropId}`, {
    headers: await authHeaders(),
  });
  const data = await handleResponse(res);
  return data.map((t: any) => mapTask(t, cropId));
};

export const getPendingCountRequest = async (
  cropId: string,
): Promise<number> => {
  const res = await fetch(`${API_URL}/tasks/crop/${cropId}/pending-count`, {
    headers: await authHeaders(),
  });
  if (!res.ok) return 0;
  return res.json();
};

export const createTaskRequest = async (dto: CreateTaskDto): Promise<Task> => {
  const res = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({
      cultivo_id: parseInt(dto.cropId),
      tipo: dto.type,
      fecha: dto.date,
      hora: dto.time,
      descripcion: dto.description,
      cantidad: dto.quantity,
      unidad: dto.unit,
    }),
  });
  const data = await handleResponse(res);
  return mapTask(data, dto.cropId);
};

export const toggleTaskStatusRequest = async (
  taskId: string,
  currentStatus: "pendiente" | "completada",
): Promise<Task> => {
  const newStatus = currentStatus === "pendiente" ? "completada" : "pendiente";
  const res = await fetch(`${API_URL}/tasks/${taskId}`, {
    method: "PATCH",
    headers: await authHeaders(),
    body: JSON.stringify({ status: newStatus }),
  });
  const data = await handleResponse(res);
  return mapTask(data);
};

export const deleteTaskRequest = async (taskId: string): Promise<void> => {
  const res = await fetch(`${API_URL}/tasks/${taskId}`, {
    method: "DELETE",
    headers: await authHeaders(),
  });
  await handleResponse(res);
};
