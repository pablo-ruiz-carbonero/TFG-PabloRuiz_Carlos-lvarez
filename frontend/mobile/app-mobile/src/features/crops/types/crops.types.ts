// src/features/crops/types/crops.types.ts
// ✅ Fuente única de tipos — elimina src/types/crops.ts y src/types/tasks.ts

// ─── Crops ────────────────────────────────────────────────────────────────────

export interface Crop {
  id: string;
  name: string;
  variety: string;
  cropType: string;
  parcelId: string;
  parcelName: string;
  surfaceArea: number; // hectáreas
  seedDate: string; // YYYY-MM-DD
  currentPhase: CropPhase;
  expectedHarvest?: string; // YYYY-MM-DD
  daysOld: number;
  notes?: string;
  tasksCount: number;
  lastWatering?: string;
  lastFertilization?: string;
  expectedProduction?: number;
  irrigationDays?: number;
  fertilizationDays?: number;
  status: CropStatus;
  createdAt: string;
  updatedAt: string;
}

export type CropPhase =
  | "Plántula"
  | "Crecimiento"
  | "Floración"
  | "Maduración"
  | "Cosecha";

export type CropStatus = "active" | "completed" | "archived";

export interface Parcel {
  id: string;
  name: string;
  location?: string;
  size: number; // hectáreas
}

export interface CreateCropDto {
  name: string;
  variety: string;
  cropType: string;
  parcelId: string;
  surfaceArea: number;
  seedDate: string;
  notes?: string;
}

export interface UpdateCropDto {
  name?: string;
  variety?: string;
  cropType?: string;
  parcelId?: string;
  surfaceArea?: number;
  seedDate?: string;
  currentPhase?: CropPhase;
  expectedHarvest?: string;
  notes?: string;
  status?: CropStatus;
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export type TaskType = "Siembra" | "Riego" | "Fertilización" | "Cosecha";
export type TaskStatus = "pendiente" | "completada";

export interface Task {
  id: string;
  cropId: string;
  type: TaskType;
  date: string; // DD/MM/YYYY
  time?: string; // HH:MM
  description?: string;
  quantity?: number;
  unit?: string;
  status: TaskStatus;
  createdAt: string;
}

export interface CreateTaskDto {
  cropId: string;
  type: TaskType;
  date: string;
  time?: string;
  description?: string;
  quantity?: number;
  unit?: string;
}
