// src/features/crops/context/CropsContext.tsx

import React, { createContext, useState, useCallback } from "react";
import {
  Crop,
  CreateCropDto,
  UpdateCropDto,
  Parcel,
} from "../types/crops.types";
import {
  getAllCropsRequest,
  getCropByIdRequest,
  createCropRequest,
  updateCropRequest,
  deleteCropRequest,
  getParcelsRequest,
} from "../api/cropsApi";

// ─────────────────────────────────────────────────────────────
// 🚧 DEV MOCK — quitar cuando el backend esté listo
// ─────────────────────────────────────────────────────────────
const DEV_CROPS: Crop[] = [
  {
    id: "1",
    name: "Tomate",
    variety: "Cherry",
    cropType: "Hortalizas",
    parcelId: "1",
    parcelName: "Parcela Norte",
    surfaceArea: 0.5,
    seedDate: "2026-03-10",
    currentPhase: "Floración",
    expectedHarvest: "2026-06-20",
    daysOld: 66,
    notes: "Riego cada 2 días. Buen desarrollo.",
    tasksCount: 2,
    lastWatering: "2026-05-14T08:00:00Z",
    lastFertilization: "2026-05-01T08:00:00Z",
    expectedProduction: 300,
    irrigationDays: 2,
    fertilizationDays: 14,
    status: "active",
    createdAt: "2026-03-10T10:00:00Z",
    updatedAt: "2026-05-14T08:00:00Z",
  },
  {
    id: "2",
    name: "Pimiento",
    variety: "Rojo italiano",
    cropType: "Hortalizas",
    parcelId: "2",
    parcelName: "Parcela Sur",
    surfaceArea: 0.3,
    seedDate: "2026-04-01",
    currentPhase: "Crecimiento",
    daysOld: 44,
    tasksCount: 1,
    lastWatering: "2026-05-13T09:00:00Z",
    irrigationDays: 3,
    fertilizationDays: 21,
    status: "active",
    createdAt: "2026-04-01T10:00:00Z",
    updatedAt: "2026-05-13T09:00:00Z",
  },
  {
    id: "3",
    name: "Lechuga",
    variety: "Batavia",
    cropType: "Verduras",
    parcelId: "1",
    parcelName: "Parcela Norte",
    surfaceArea: 0.1,
    seedDate: "2026-04-20",
    currentPhase: "Plántula",
    daysOld: 25,
    tasksCount: 0,
    status: "active",
    createdAt: "2026-04-20T10:00:00Z",
    updatedAt: "2026-04-20T10:00:00Z",
  },
];

const DEV_PARCELS: Parcel[] = [
  { id: "1", name: "Parcela Norte", location: "Sector A", size: 1.2 },
  { id: "2", name: "Parcela Sur", location: "Sector B", size: 0.8 },
  { id: "3", name: "Invernadero", location: "Sector C", size: 0.3 },
];
// ─────────────────────────────────────────────────────────────

interface CropsContextType {
  crops: Crop[];
  parcels: Parcel[];
  loading: boolean;
  error: string | null;
  fetchCrops: () => Promise<void>;
  fetchParcels: () => Promise<void>;
  getCropById: (id: string) => Promise<Crop>;
  createCrop: (dto: CreateCropDto) => Promise<Crop>;
  updateCrop: (id: string, dto: UpdateCropDto) => Promise<Crop>;
  deleteCrop: (id: string) => Promise<void>;
}

export const CropsContext = createContext<CropsContextType | null>(null);

export const CropsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async <T,>(fn: () => Promise<T>): Promise<T> => {
    setError(null);
    setLoading(true);
    try {
      return await fn();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error inesperado";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const fetchCrops = useCallback(async () => {
    await run(async () => {
      // 🚧 DEV: usar mock si estamos en desarrollo sin backend
      if (__DEV__ && !process.env.EXPO_PUBLIC_API_URL?.includes("http")) {
        setCrops(DEV_CROPS);
        return;
      }
      const data = await getAllCropsRequest();
      setCrops(data);
    });
  }, []);

  const fetchParcels = useCallback(async () => {
    await run(async () => {
      if (__DEV__ && !process.env.EXPO_PUBLIC_API_URL?.includes("http")) {
        setParcels(DEV_PARCELS);
        return;
      }
      const data = await getParcelsRequest();
      setParcels(data);
    });
  }, []);

  const getCropById = async (id: string): Promise<Crop> => {
    // Primero intentar desde el estado local (evita request extra)
    const local = crops.find((c) => c.id === id);
    if (local) return local;

    return run(() => getCropByIdRequest(id));
  };

  const createCrop = async (dto: CreateCropDto): Promise<Crop> => {
    return run(async () => {
      // 🚧 DEV mock
      if (__DEV__ && !process.env.EXPO_PUBLIC_API_URL?.includes("http")) {
        const newCrop: Crop = {
          id: Date.now().toString(),
          name: dto.name,
          variety: dto.variety,
          cropType: dto.cropType,
          parcelId: dto.parcelId,
          parcelName:
            DEV_PARCELS.find((p) => p.id === dto.parcelId)?.name ?? "Parcela",
          surfaceArea: dto.surfaceArea,
          seedDate: dto.seedDate,
          currentPhase: "Plántula",
          daysOld: 0,
          notes: dto.notes,
          tasksCount: 0,
          status: "active",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setCrops((prev) => [newCrop, ...prev]);
        return newCrop;
      }

      const crop = await createCropRequest(dto);
      setCrops((prev) => [crop, ...prev]);
      return crop;
    });
  };

  const updateCrop = async (id: string, dto: UpdateCropDto): Promise<Crop> => {
    return run(async () => {
      const updated = await updateCropRequest(id, dto);
      setCrops((prev) => prev.map((c) => (c.id === id ? updated : c)));
      return updated;
    });
  };

  const deleteCrop = async (id: string): Promise<void> => {
    return run(async () => {
      if (__DEV__ && !process.env.EXPO_PUBLIC_API_URL?.includes("http")) {
        setCrops((prev) => prev.filter((c) => c.id !== id));
        return;
      }
      await deleteCropRequest(id);
      setCrops((prev) => prev.filter((c) => c.id !== id));
    });
  };

  return (
    <CropsContext.Provider
      value={{
        crops,
        parcels,
        loading,
        error,
        fetchCrops,
        fetchParcels,
        getCropById,
        createCrop,
        updateCrop,
        deleteCrop,
      }}
    >
      {children}
    </CropsContext.Provider>
  );
};
