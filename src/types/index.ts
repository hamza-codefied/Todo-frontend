export interface User {
  id: string;
  name: string;
  email: string;
}

// Project Types
export interface Project {
  _id: string;
  name: string;
  description?: string;
  eta: string;
  status: 'active' | 'completed' | 'on-hold';
  user: string;
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectFormData {
  name: string;
  description?: string;
  eta: string;
  status?: 'active' | 'completed' | 'on-hold';
}

export interface ProjectResponse {
  success: boolean;
  data: Project;
}

export interface ProjectsResponse {
  success: boolean;
  count: number;
  data: Project[];
}

// Task Types
export interface Task {
  _id: string;
  name: string;
  description?: string;
  moduleName: string;
  dueDate: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  project: {
    _id: string;
    name: string;
  } | string;
  user: string;
  totalTodos: number;
  completedTodos: number;
  totalEstimatedTime: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskFormData {
  name: string;
  description?: string;
  moduleName: string;
  dueDate: string;
  priority?: 'low' | 'medium' | 'high';
  project: string;
}

export interface TaskResponse {
  success: boolean;
  data: Task;
}

export interface TasksResponse {
  success: boolean;
  count: number;
  data: Task[];
}

// Todo Types
export interface Todo {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  estimatedTime: number;
  task: {
    _id: string;
    name: string;
    moduleName: string;
  } | string;
  user: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface TodoResponse {
  success: boolean;
  data: Todo;
}

export interface TodosResponse {
  success: boolean;
  count: number;
  data: Todo[];
}

export interface ApiError {
  success: boolean;
  message: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface TodoFormData {
  title: string;
  description?: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  estimatedTime?: number;
  task: string;
}

export interface DateFilter {
  startDate?: string;
  endDate?: string;
  createdFrom?: string;
  createdTo?: string;
}

