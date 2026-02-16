import apiClient from './client';
import type { ApiResponse } from '../types';

export const dashboardApi = {
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
};
