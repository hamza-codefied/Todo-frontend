import api from './api';
import { Todo, TodosResponse, TodoResponse, TodoFormData, DateFilter } from '../types';

export interface TodoFilters extends DateFilter {
  task?: string;
  completed?: boolean;
  priority?: string;
}

export const todoService = {
  async getTodos(filters?: TodoFilters): Promise<Todo[]> {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.task) params.append('task', filters.task);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.createdFrom) params.append('createdFrom', filters.createdFrom);
      if (filters.createdTo) params.append('createdTo', filters.createdTo);
      if (filters.completed !== undefined) params.append('completed', String(filters.completed));
      if (filters.priority) params.append('priority', filters.priority);
    }

    const response = await api.get<TodosResponse>(`/todos?${params.toString()}`);
    return response.data.data;
  },

  async getTodo(id: string): Promise<Todo> {
    const response = await api.get<TodoResponse>(`/todos/${id}`);
    return response.data.data;
  },

  async createTodo(data: TodoFormData): Promise<Todo> {
    const response = await api.post<TodoResponse>('/todos', data);
    return response.data.data;
  },

  async updateTodo(id: string, data: Partial<TodoFormData>): Promise<Todo> {
    const response = await api.put<TodoResponse>(`/todos/${id}`, data);
    return response.data.data;
  },

  async deleteTodo(id: string): Promise<void> {
    await api.delete(`/todos/${id}`);
  },

  async toggleTodo(id: string): Promise<Todo> {
    const response = await api.patch<TodoResponse>(`/todos/${id}/toggle`);
    return response.data.data;
  }
};

