import api from './api';

export interface DashboardStats {
  projects: {
    total: number;
    active: number;
    completed: number;
    statusDistribution: {
      active: number;
      completed: number;
      onHold: number;
    };
  };
  tasks: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
    priorityDistribution: {
      high: number;
      medium: number;
      low: number;
    };
  };
  todos: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
    priorityDistribution: {
      high: number;
      medium: number;
      low: number;
    };
  };
  recentActivity: {
    projects: number;
    tasks: number;
    todos: number;
  };
  completionRate: {
    tasks: number;
    todos: number;
  };
}

interface StatsResponse {
  success: boolean;
  data: DashboardStats;
}

export const statsService = {
  async getStats(): Promise<DashboardStats> {
    const response = await api.get<StatsResponse>('/stats');
    return response.data.data;
  }
};
