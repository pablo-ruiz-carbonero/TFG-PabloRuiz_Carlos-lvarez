// src/features/crops/context/CropsContext.tsx

import React, { createContext, useState, useCallback } from "react";
import {
  Crop,
  CreateCropDto,
  UpdateCropDto,
  Parcel,
  Task,
  CreateTaskDto,
} from "../types/crops.types";
import {
  getAllCropsRequest,
  getCropByIdRequest,
  createCropRequest,
  updateCropRequest,
  deleteCropRequest,
  getParcelsRequest,
} from "../api/cropsApi";
import {
  getTasksByCropRequest,
  createTaskRequest,
  toggleTaskStatusRequest,
  deleteTaskRequest,
} from "../api/tasksApi";

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

// Tasks mock iniciales — almacenadas en contexto para persistir entre pantallas
const DEV_TASKS_INITIAL: Record<string, Task[]> = {
  "1": [
    {
      id: "t1",
      cropId: "1",
      type: "Riego",
      date: "15/05/2026",
      time: "08:00",
      description: "Riego por goteo programado",
      quantity: 20,
      unit: "Litros",
      status: "pendiente",
      createdAt: "2026-05-14T10:00:00Z",
    },
    {
      id: "t2",
      cropId: "1",
      type: "Fertilización",
      date: "10/05/2026",
      description: "Abono nitrogenado",
      quantity: 5,
      unit: "kg",
      status: "completada",
      createdAt: "2026-05-09T10:00:00Z",
    },
  ],
  "2": [
    {
      id: "t3",
      cropId: "2",
      type: "Riego",
      date: "14/05/2026",
      status: "pendiente",
      createdAt: "2026-05-13T10:00:00Z",
    },
  ],
};

const isDev = () => __DEV__ && process.env.EXPO_PUBLIC_USE_MOCK === "true";
// ─────────────────────────────────────────────────────────────

interface CropsContextType {
  crops: Crop[];
  parcels: Parcel[];
  tasks: Record<string, Task[]>;
  loading: boolean;
  error: string | null;
  fetchCrops: () => Promise<void>;
  fetchParcels: () => Promise<void>;
  getCropById: (id: string) => Promise<Crop>;
  createCrop: (dto: CreateCropDto) => Promise<Crop>;
  updateCrop: (id: string, dto: UpdateCropDto) => Promise<Crop>;
  deleteCrop: (id: string) => Promise<void>;
  loadTasksForCrop: (cropId: string) => Promise<void>;
  addTask: (dto: CreateTaskDto) => Promise<Task>;
  toggleTask: (cropId: string, taskId: string) => Promise<void>;
  removeTask: (cropId: string, taskId: string) => Promise<void>;
}

export const CropsContext = createContext<CropsContextType | null>(null);

export const CropsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [tasks, setTasks] = useState<Record<string, Task[]>>(
    isDev() ? DEV_TASKS_INITIAL : {},
  );
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
      if (isDev()) {
        await new Promise((r) => setTimeout(r, 300));
        setCrops((prev) => {
          const prevIds = new Set(prev.map((c) => c.id));
          const newMocks = DEV_CROPS.filter((c) => !prevIds.has(c.id));
          return prev.length === 0 ? DEV_CROPS : [...prev, ...newMocks];
        });
        return;
      }
      const data = await getAllCropsRequest();
      setCrops(data);
    });
  }, []);

  const fetchParcels = useCallback(async () => {
    await run(async () => {
      if (isDev()) {
        await new Promise((r) => setTimeout(r, 200));
        setParcels(DEV_PARCELS);
        return;
      }
      const data = await getParcelsRequest();
      setParcels(data);
    });
  }, []);

  const getCropById = async (id: string): Promise<Crop> => {
    const local = crops.find((c) => c.id === id);
    if (local) return local;
    if (isDev()) {
      const found = DEV_CROPS.find((c) => c.id === id);
      if (found) return found;
      throw new Error("Cultivo no encontrado");
    }
    return run(() => getCropByIdRequest(id));
  };

  const createCrop = async (dto: CreateCropDto): Promise<Crop> => {
    return run(async () => {
      if (isDev()) {
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
        setTasks((prev) => ({ ...prev, [newCrop.id]: [] }));
        return newCrop;
      }
      const crop = await createCropRequest(dto);
      setCrops((prev) => [crop, ...prev]);
      setTasks((prev) => ({ ...prev, [crop.id]: [] }));
      return crop;
    });
  };

  const updateCrop = async (id: string, dto: UpdateCropDto): Promise<Crop> => {
    return run(async () => {
      if (isDev()) {
        const existing = crops.find((c) => c.id === id);
        if (!existing) throw new Error("Cultivo no encontrado");
        const updated: Crop = {
          ...existing,
          ...dto,
          updatedAt: new Date().toISOString(),
        };
        setCrops((prev) => prev.map((c) => (c.id === id ? updated : c)));
        return updated;
      }
      const updated = await updateCropRequest(id, dto);
      setCrops((prev) => prev.map((c) => (c.id === id ? updated : c)));
      return updated;
    });
  };

  const deleteCrop = async (id: string): Promise<void> => {
    return run(async () => {
      if (isDev()) {
        setCrops((prev) => prev.filter((c) => c.id !== id));
        setTasks((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        return;
      }
      await deleteCropRequest(id);
      setCrops((prev) => prev.filter((c) => c.id !== id));
    });
  };

  // ── Tareas ──────────────────────────────────────────────────────────────────

  const loadTasksForCrop = useCallback(async (cropId: string) => {
    if (isDev()) {
      setTasks((prev) => ({
        ...prev,
        [cropId]: prev[cropId] ?? DEV_TASKS_INITIAL[cropId] ?? [],
      }));
      return;
    }
    const data = await getTasksByCropRequest(cropId);
    setTasks((prev) => ({ ...prev, [cropId]: data }));
  }, []);

  const addTask = async (dto: CreateTaskDto): Promise<Task> => {
    if (isDev()) {
      const newTask: Task = {
        id: `task_${Date.now()}`,
        ...dto,
        status: "pendiente",
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => ({
        ...prev,
        [dto.cropId]: [newTask, ...(prev[dto.cropId] ?? [])],
      }));
      setCrops((prev) =>
        prev.map((c) =>
          c.id === dto.cropId ? { ...c, tasksCount: c.tasksCount + 1 } : c,
        ),
      );
      return newTask;
    }
    const created = await createTaskRequest(dto);
    setTasks((prev) => ({
      ...prev,
      [dto.cropId]: [created, ...(prev[dto.cropId] ?? [])],
    }));
    return created;
  };

  const toggleTask = async (cropId: string, taskId: string): Promise<void> => {
    const cropTasks = tasks[cropId] ?? [];
    const task = cropTasks.find((t) => t.id === taskId);
    if (!task) return;

    if (isDev()) {
      setTasks((prev) => ({
        ...prev,
        [cropId]: (prev[cropId] ?? []).map((t) =>
          t.id === taskId
            ? {
                ...t,
                status: t.status === "pendiente" ? "completada" : "pendiente",
              }
            : t,
        ),
      }));
      return;
    }
    const updated = await toggleTaskStatusRequest(taskId, task.status);
    setTasks((prev) => ({
      ...prev,
      [cropId]: (prev[cropId] ?? []).map((t) =>
        t.id === taskId ? updated : t,
      ),
    }));
  };

  const removeTask = async (cropId: string, taskId: string): Promise<void> => {
    if (isDev()) {
      setTasks((prev) => ({
        ...prev,
        [cropId]: (prev[cropId] ?? []).filter((t) => t.id !== taskId),
      }));
      setCrops((prev) =>
        prev.map((c) =>
          c.id === cropId
            ? { ...c, tasksCount: Math.max(0, c.tasksCount - 1) }
            : c,
        ),
      );
      return;
    }
    await deleteTaskRequest(taskId);
    setTasks((prev) => ({
      ...prev,
      [cropId]: (prev[cropId] ?? []).filter((t) => t.id !== taskId),
    }));
  };

  return (
    <CropsContext.Provider
      value={{
        crops,
        parcels,
        tasks,
        loading,
        error,
        fetchCrops,
        fetchParcels,
        getCropById,
        createCrop,
        updateCrop,
        deleteCrop,
        loadTasksForCrop,
        addTask,
        toggleTask,
        removeTask,
      }}
    >
      {children}
    </CropsContext.Provider>
  );
};
