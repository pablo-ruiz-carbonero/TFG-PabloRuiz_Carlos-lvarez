// src/services/tasksService.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Task, CreateTaskRequest } from "../types/tasks";

const API_BASE_URL = "http://192.168.1.179:3000";

const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem("token");
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export const tasksService = {
  /** Obtener todas las tareas de un cultivo */
  async getTasksByCrop(cropId: string): Promise<Task[]> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/tasks/crop/${cropId}`, {
        headers,
      });

      if (!response.ok) {
        throw new Error('Error al obtener tareas');
      }

      const tasks = await response.json();

      // Transformar datos del backend al formato del frontend
      return tasks.map((task: any) => ({
        id: task.id.toString(),
        cropId: cropId,
        type: task.tipo as any,
        date: task.fecha,
        time: task.hora,
        description: task.descripcion,
        quantity: task.cantidad,
        unit: task.unidad,
        status: task.status,
        createdAt: task.fecha_creacion,
      }));
    } catch (error) {
      console.error("Error fetching tasks:", error);
      throw error;
    }
  },

  /** Obtener el número de tareas pendientes de un cultivo */
  async getPendingCount(cropId: string): Promise<number> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/tasks/crop/${cropId}/pending-count`, {
        headers,
      });

      if (!response.ok) {
        throw new Error('Error al obtener contador de tareas pendientes');
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching pending count:", error);
      return 0;
    }
  },

  /** Crear tarea */
  async createTask(data: CreateTaskRequest): Promise<Task> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          cultivo_id: parseInt(data.cropId),
          tipo: data.type,
          fecha: data.date,
          hora: data.time,
          descripcion: data.description,
          cantidad: data.quantity,
          unidad: data.unit,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear tarea');
      }

      const task = await response.json();

      return {
        id: task.id.toString(),
        cropId: data.cropId,
        type: task.tipo,
        date: task.fecha,
        time: task.hora,
        description: task.descripcion,
        quantity: task.cantidad,
        unit: task.unidad,
        status: task.status,
        createdAt: task.fecha_creacion,
      };
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  },

  /** Actualizar tarea */
  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    try {
      const headers = await getAuthHeaders();
      const updateData: any = {};

      if (updates.type) updateData.tipo = updates.type;
      if (updates.date) updateData.fecha = updates.date;
      if (updates.time !== undefined) updateData.hora = updates.time;
      if (updates.description !== undefined) updateData.descripcion = updates.description;
      if (updates.quantity !== undefined) updateData.cantidad = updates.quantity;
      if (updates.unit !== undefined) updateData.unidad = updates.unit;
      if (updates.status) updateData.status = updates.status;

      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar tarea');
      }

      const task = await response.json();

      return {
        id: task.id.toString(),
        cropId: updates.cropId || '',
        type: task.tipo,
        date: task.fecha,
        time: task.hora,
        description: task.descripcion,
        quantity: task.cantidad,
        unit: task.unidad,
        status: task.status,
        createdAt: task.fecha_creacion,
      };
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  },

  /** Eliminar tarea */
  async deleteTask(taskId: string): Promise<void> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar tarea');
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  },

  /** Marcar tarea como completada / pendiente */
  async toggleStatus(taskId: string): Promise<Task> {
    try {
      // Primero obtener la tarea actual
      const headers = await getAuthHeaders();
      const getResponse = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        headers,
      });

      if (!getResponse.ok) {
        throw new Error('Error al obtener tarea');
      }

      const currentTask = await getResponse.json();
      const newStatus = currentTask.status === 'pendiente' ? 'completada' : 'pendiente';

      // Luego actualizar el status
      const updateResponse = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: newStatus }),
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.message || 'Error al actualizar status de tarea');
      }

      const updatedTask = await updateResponse.json();

      return {
        id: updatedTask.id.toString(),
        cropId: '', // No tenemos esta info en la respuesta
        type: updatedTask.tipo,
        date: updatedTask.fecha,
        time: updatedTask.hora,
        description: updatedTask.descripcion,
        quantity: updatedTask.cantidad,
        unit: updatedTask.unidad,
        status: updatedTask.status,
        createdAt: updatedTask.fecha_creacion,
      };
    } catch (error) {
      console.error("Error toggling task status:", error);
      throw error;
    }
  },
};