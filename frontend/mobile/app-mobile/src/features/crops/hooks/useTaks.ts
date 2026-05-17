// src/features/tasks/hooks/useTasks.ts

import { createTaskRequest } from "../api/tasksApi";

export const useTasks = () => {

  const createTask = async (data: any) => {
    return await createTaskRequest(data);
  };

  return { createTask };
};