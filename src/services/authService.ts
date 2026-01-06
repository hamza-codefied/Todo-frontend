import api from './api';
import { AuthResponse, LoginCredentials, RegisterCredentials } from '../types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', credentials);
    return response.data;
  },

  async getMe(): Promise<{ success: boolean; user: AuthResponse['user'] }> {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  getUser(): AuthResponse['user'] | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  setAuth(token: string, user: AuthResponse['user']): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  clearAuth(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
};
