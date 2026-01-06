import api from './api';
import { Project, ProjectsResponse, ProjectResponse, ProjectFormData } from '../types';

export const projectService = {
  async getProjects(): Promise<Project[]> {
    const response = await api.get<ProjectsResponse>('/projects');
    return response.data.data;
  },

  async getProject(id: string): Promise<Project> {
    const response = await api.get<ProjectResponse>(`/projects/${id}`);
    return response.data.data;
  },

  async createProject(data: ProjectFormData): Promise<Project> {
    const response = await api.post<ProjectResponse>('/projects', data);
    return response.data.data;
  },

  async updateProject(id: string, data: Partial<ProjectFormData>): Promise<Project> {
    const response = await api.put<ProjectResponse>(`/projects/${id}`, data);
    return response.data.data;
  },

  async deleteProject(id: string): Promise<void> {
    await api.delete(`/projects/${id}`);
  }
};
