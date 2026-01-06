import api from './api';
import { Task, TasksResponse, TaskResponse, TaskFormData } from '../types';

export interface TaskFilters {
  project?: string;
  startDate?: string;
  endDate?: string;
  completed?: boolean;
  priority?: string;
}

export const taskService = {
  async getTasks(filters?: TaskFilters): Promise<Task[]> {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.project) params.append('project', filters.project);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.completed !== undefined) params.append('completed', String(filters.completed));
      if (filters.priority) params.append('priority', filters.priority);
    }

    const response = await api.get<TasksResponse>(`/tasks?${params.toString()}`);
    return response.data.data;
  },

  async getTask(id: string): Promise<Task> {
    const response = await api.get<TaskResponse>(`/tasks/${id}`);
    return response.data.data;
  },

  async createTask(data: TaskFormData): Promise<Task> {
    const response = await api.post<TaskResponse>('/tasks', data);
    return response.data.data;
  },

  async updateTask(id: string, data: Partial<TaskFormData>): Promise<Task> {
    const response = await api.put<TaskResponse>(`/tasks/${id}`, data);
    return response.data.data;
  },

  async deleteTask(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },

  async toggleTask(id: string): Promise<Task> {
    const response = await api.patch<TaskResponse>(`/tasks/${id}/toggle`);
    return response.data.data;
  }
};
