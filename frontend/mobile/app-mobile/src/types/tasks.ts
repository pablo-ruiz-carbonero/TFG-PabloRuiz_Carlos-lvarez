// src/types/tasks.ts

export type TaskType = "Siembra" | "Riego" | "Fertilización" | "Cosecha";
export type TaskStatus = "pendiente" | "completada";

export interface Task {
  id: string;
  cropId: string;
  type: TaskType;
  date: string;       // "DD/MM/YYYY"
  time?: string;      // "HH:MM"
  description?: string;
  quantity?: number;
  unit?: string;
  status: TaskStatus;
  createdAt: string;  // ISO
}

export interface CreateTaskRequest {
  cropId: string;
  type: TaskType;
  date: string;
  time?: string;
  description?: string;
  quantity?: number;
  unit?: string;
}