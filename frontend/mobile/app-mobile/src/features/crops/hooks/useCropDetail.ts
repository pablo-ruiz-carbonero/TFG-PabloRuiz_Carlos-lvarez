// src/features/crops/hooks/useCropDetail.ts
// Ahora solo es una vista sobre el estado del CropsContext — no tiene
// estado propio de tareas, por eso las tareas persisten entre pantallas.

import { useCallback } from "react";
import { Crop, Task, CreateTaskDto } from "../types/crops.types";
import { useCrops } from "./useCrops";

export const useCropDetail = (cropId: string) => {
  const {
    crops,
    tasks: allTasks,
    loading,
    error,
    getCropById,
    deleteCrop,
    loadTasksForCrop,
    addTask,
    toggleTask,
    removeTask,
  } = useCrops();

  // Cultivo sacado del estado global (sin petición extra)
  const crop: Crop | null = crops.find((c) => c.id === cropId) ?? null;

  // Tareas del cultivo actual
  const tasks: Task[] = allTasks[cropId] ?? [];
  const pendingTasks = tasks.filter((t) => t.status === "pendiente");
  const completedTasks = tasks.filter((t) => t.status === "completada");

  const loadDetail = useCallback(async () => {
    // Carga el cultivo si no está en contexto (poco frecuente)
    if (!crop) await getCropById(cropId);
    // Carga las tareas desde el contexto (merge-safe)
    await loadTasksForCrop(cropId);
  }, [cropId, crop]);

  const handleAddTask = async (dto: CreateTaskDto): Promise<void> => {
    await addTask(dto);
  };

  const handleToggleTask = async (taskId: string): Promise<void> => {
    await toggleTask(cropId, taskId);
  };

  const handleRemoveTask = async (taskId: string): Promise<void> => {
    await removeTask(cropId, taskId);
  };

  const removeCrop = async (): Promise<void> => {
    await deleteCrop(cropId);
  };

  return {
    crop,
    tasks,
    pendingTasks,
    completedTasks,
    loading,
    error,
    loadDetail,
    addTask: handleAddTask,
    toggleTask: handleToggleTask,
    removeTask: handleRemoveTask,
    removeCrop,
  };
};
