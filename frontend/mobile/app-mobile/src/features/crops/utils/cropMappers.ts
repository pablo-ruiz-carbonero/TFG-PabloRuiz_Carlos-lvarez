// src/features/crops/utils/cropMappers.ts
// Transforma las respuestas del backend (snake_case español) al modelo del frontend

import { Crop, Task, Parcel } from "../types/crops.types";

export const mapCrop = (raw: any): Crop => ({
  id: raw.id.toString(),
  name: raw.nombre,
  variety: raw.variedad,
  cropType: raw.tipo_cultivo,
  parcelId: raw.parcela_id?.toString() ?? "",
  parcelName: raw.parcela_nombre ?? `Parcela ${raw.parcela_id ?? "N/A"}`,
  surfaceArea: parseFloat(raw.superficie),
  seedDate: raw.fecha_siembra,
  currentPhase: raw.fase_actual ?? "Plántula",
  expectedHarvest: raw.fecha_cosecha_esperada,
  daysOld: Math.floor(
    (Date.now() - new Date(raw.fecha_siembra).getTime()) / 86_400_000,
  ),
  notes: raw.notas,
  tasksCount: raw.tareas_count ?? 0,
  lastWatering: raw.ultimo_riego,
  lastFertilization: raw.ultima_fertilizacion,
  expectedProduction: raw.produccion_esperada,
  irrigationDays: raw.dias_riego,
  fertilizationDays: raw.dias_fertilizacion,
  status: raw.status ?? "active",
  createdAt: raw.fecha_creacion,
  updatedAt: raw.updatedAt,
});

export const mapTask = (raw: any, cropId?: string): Task => ({
  id: raw.id.toString(),
  cropId: raw.cultivo_id?.toString() ?? cropId ?? "",
  type: raw.tipo,
  date: raw.fecha,
  time: raw.hora,
  description: raw.descripcion,
  quantity: raw.cantidad,
  unit: raw.unidad,
  status: raw.status,
  createdAt: raw.fecha_creacion,
});

export const mapParcel = (raw: any): Parcel => ({
  id: raw.id.toString(),
  name: raw.nombre,
  location: raw.ubicacion,
  size: parseFloat(raw.tamano),
});
