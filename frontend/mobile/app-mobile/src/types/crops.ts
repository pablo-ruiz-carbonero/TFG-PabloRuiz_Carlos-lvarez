// src/types/crops.ts

export interface Crop {
  id: string;
  name: string;
  variety: string;
  cropType: string;
  parcelId: string;
  parcelName?: string;
  surfaceArea: number; // en hectáreas
  seedDate: string; // YYYY-MM-DD
  currentPhase: string; // "Plántula", "Crecimiento", "Floración", etc.
  expectedHarvest?: string; // YYYY-MM-DD
  daysOld?: number;
  notes?: string;
  tasksCount: number;
  lastWatering?: string; // ISO date
  lastFertilization?: string; // ISO date
  expectedProduction?: number; // kg or tons
  irrigationDays?: number;
  fertilizationDays?: number;
  image?: string;
  status: 'active' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface CreateCropRequest {
  name: string;
  variety: string;
  cropType: string;
  parcelId: string;
  surfaceArea: number;
  seedDate: string;
  notes?: string;
}

export interface UpdateCropRequest {
  name?: string;
  variety?: string;
  cropType?: string;
  parcelId?: string;
  surfaceArea?: number;
  seedDate?: string;
  currentPhase?: string;
  expectedHarvest?: string;
  notes?: string;
  status?: 'active' | 'completed' | 'archived';
}

export interface Parcel {
  id: string;
  name: string;
  location?: string;
  size: number; // hectáreas
}
