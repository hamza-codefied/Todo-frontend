import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { todoService, TodoFilters } from '../services/todoService';
import { TodoFormData } from '../types';
import { taskKeys } from './useTasks';

export const todoKeys = {
  all: ['todos'] as const,
  list: (filters?: TodoFilters) => ['todos', 'list', filters] as const,
  detail: (id: string) => ['todos', id] as const,
};

export function useTodos(filters?: TodoFilters) {
  return useQuery({
    queryKey: todoKeys.list(filters),
    queryFn: () => todoService.getTodos(filters),
  });
}

export function useTodo(id: string) {
  return useQuery({
    queryKey: todoKeys.detail(id),
    queryFn: () => todoService.getTodo(id),
    enabled: !!id,
  });
}

export function useCreateTodo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: TodoFormData) => todoService.createTodo(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: todoKeys.all });
      // Also invalidate the task to update todo count
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(variables.task) });
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}

export function useUpdateTodo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TodoFormData> }) =>
      todoService.updateTodo(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: todoKeys.all });
      queryClient.invalidateQueries({ queryKey: todoKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}

export function useDeleteTodo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => todoService.deleteTodo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.all });
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}

export function useToggleTodo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => todoService.toggleTodo(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: todoKeys.all });
      queryClient.invalidateQueries({ queryKey: todoKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}
