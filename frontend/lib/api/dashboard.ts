import apiClient from './client';
import type { ApiResponse, DashboardOverview } from '../types';

export const dashboardApi = {
  getOverview: async (): Promise<DashboardOverview> => {
    const response = await apiClient.get<ApiResponse<DashboardOverview>>('/dashboard/overview');
    return response.data.data;
  },

  getStats: async () => {
    const response = await apiClient.get<ApiResponse<any>>('/dashboard/stats');
    return response.data.data;
  },

  getCashflow: async () => {
    const response = await apiClient.get<ApiResponse<any>>('/dashboard/cashflow');
    return response.data.data;
  },

  getOverdue: async () => {
    const response = await apiClient.get<ApiResponse<any[]>>('/dashboard/overdue');
    return response.data.data;
  },

  getRevenueTrend: async (months: number = 6) => {
    const response = await apiClient.get<ApiResponse<any[]>>('/dashboard/revenue-trend', { params: { months } });
    return response.data.data;
  },
};
