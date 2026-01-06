import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService, TaskFilters } from '../services/taskService';
import { TaskFormData } from '../types';
import { projectKeys } from './useProjects';

export const taskKeys = {
  all: ['tasks'] as const,
  list: (filters?: TaskFilters) => ['tasks', 'list', filters] as const,
  detail: (id: string) => ['tasks', id] as const,
};

export function useTasks(filters?: TaskFilters) {
  return useQuery({
    queryKey: taskKeys.list(filters),
    queryFn: () => taskService.getTasks(filters),
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => taskService.getTask(id),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: TaskFormData) => taskService.createTask(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      // Also invalidate the project to update task count
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.project) });
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TaskFormData> }) =>
      taskService.updateTask(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => taskService.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}

export function useToggleTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => taskService.toggleTask(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}
