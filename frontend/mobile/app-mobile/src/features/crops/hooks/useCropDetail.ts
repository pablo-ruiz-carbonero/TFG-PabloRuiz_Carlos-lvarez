// src/features/crops/hooks/useCropDetail.ts
// Encapsula toda la lógica de detalle de cultivo + gestión de tareas

import { useState, useCallback } from "react";
import { Crop, Task, CreateTaskDto } from "../types/crops.types";
import { useCrops } from "./useCrops";
import {
  getTasksByCropRequest,
  createTaskRequest,
  toggleTaskStatusRequest,
  deleteTaskRequest,
} from "../api/tasksApi";

// ─────────────────────────────────────────────────────────────
// 🚧 DEV MOCK tasks
// ─────────────────────────────────────────────────────────────
const DEV_TASKS: Record<string, Task[]> = {
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
// ─────────────────────────────────────────────────────────────

const isDevMode = () =>
  __DEV__ && !process.env.EXPO_PUBLIC_API_URL?.includes("http");

export const useCropDetail = (cropId: string) => {
  const { getCropById, deleteCrop } = useCrops();

  const [crop, setCrop] = useState<Crop | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cropData, taskData] = await Promise.all([
        getCropById(cropId),
        isDevMode()
          ? Promise.resolve(DEV_TASKS[cropId] ?? [])
          : getTasksByCropRequest(cropId),
      ]);
      setCrop(cropData);
      setTasks(taskData);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al cargar el cultivo");
    } finally {
      setLoading(false);
    }
  }, [cropId]);

  const addTask = async (dto: CreateTaskDto): Promise<void> => {
    if (isDevMode()) {
      const newTask: Task = {
        id: Date.now().toString(),
        ...dto,
        status: "pendiente",
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => [newTask, ...prev]);
      return;
    }
    const created = await createTaskRequest(dto);
    setTasks((prev) => [created, ...prev]);
  };

  const toggleTask = async (taskId: string): Promise<void> => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    if (isDevMode()) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status: t.status === "pendiente" ? "completada" : "pendiente",
              }
            : t,
        ),
      );
      return;
    }

    const updated = await toggleTaskStatusRequest(taskId, task.status);
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
  };

  const removeTask = async (taskId: string): Promise<void> => {
    if (isDevMode()) {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      return;
    }
    await deleteTaskRequest(taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const removeCrop = async (): Promise<void> => {
    await deleteCrop(cropId);
  };

  const pendingTasks = tasks.filter((t) => t.status === "pendiente");
  const completedTasks = tasks.filter((t) => t.status === "completada");

  return {
    crop,
    tasks,
    pendingTasks,
    completedTasks,
    loading,
    error,
    loadDetail,
    addTask,
    toggleTask,
    removeTask,
    removeCrop,
  };
};
