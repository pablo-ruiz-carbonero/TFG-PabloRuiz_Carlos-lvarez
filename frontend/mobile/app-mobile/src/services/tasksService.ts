// src/services/tasksService.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Task, CreateTaskRequest } from "../types/tasks";

const TASKS_KEY = "agrolink_tasks";

const loadAll = async (): Promise<Task[]> => {
  try {
    const raw = await AsyncStorage.getItem(TASKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveAll = async (tasks: Task[]): Promise<void> => {
  await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
};

export const tasksService = {
  /** Obtener todas las tareas de un cultivo */
  async getTasksByCrop(cropId: string): Promise<Task[]> {
    const all = await loadAll();
    return all
      .filter((t) => t.cropId === cropId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  /** Obtener el número de tareas pendientes de un cultivo */
  async getPendingCount(cropId: string): Promise<number> {
    const all = await loadAll();
    return all.filter((t) => t.cropId === cropId && t.status === "pendiente").length;
  },

  /** Crear tarea */
  async createTask(data: CreateTaskRequest): Promise<Task> {
    const all = await loadAll();
    const newTask: Task = {
      id: `task_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      ...data,
      status: "pendiente",
      createdAt: new Date().toISOString(),
    };
    await saveAll([...all, newTask]);
    return newTask;
  },

  /** Marcar tarea como completada / pendiente */
  async toggleStatus(taskId: string): Promise<Task> {
    const all = await loadAll();
    const idx = all.findIndex((t) => t.id === taskId);
    if (idx === -1) throw new Error("Tarea no encontrada");
    all[idx] = {
      ...all[idx],
      status: all[idx].status === "pendiente" ? "completada" : "pendiente",
    };
    await saveAll(all);
    return all[idx];
  },

  /** Eliminar tarea */
  async deleteTask(taskId: string): Promise<void> {
    const all = await loadAll();
    await saveAll(all.filter((t) => t.id !== taskId));
  },
};