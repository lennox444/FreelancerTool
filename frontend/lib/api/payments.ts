import apiClient from './client';
import type { ApiResponse, Payment } from '../types';

export const paymentsApi = {
  getAll: async (params?: { invoiceId?: string; from?: string; to?: string }) => {
    const response = await apiClient.get<ApiResponse<Payment[]>>('/payments', { params });
    return response.data.data;
  },

  getOne: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Payment>>(`/payments/${id}`);
    return response.data.data;
  },

  create: async (data: { invoiceId: string; amount: number; paymentDate?: string; note?: string }) => {
    const response = await apiClient.post<ApiResponse<Payment>>('/payments', data);
    return response.data.data;
  },

  update: async (id: string, data: { amount?: number; paymentDate?: string; note?: string }) => {
    const response = await apiClient.patch<ApiResponse<Payment>>(`/payments/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<void>>(`/payments/${id}`);
    return response.data;
  },
};
