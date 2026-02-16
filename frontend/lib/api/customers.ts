import apiClient from './client';
import type { Customer, ApiResponse } from '../types';

export const customersApi = {
  getAll: async (params?: {
    search?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
  }): Promise<Customer[]> => {
    const response = await apiClient.get<ApiResponse<Customer[]>>('/customers', {
      params,
    });
    return response.data.data;
  },

  getOne: async (id: string): Promise<Customer> => {
    const response = await apiClient.get<ApiResponse<Customer>>(`/customers/${id}`);
    return response.data.data;
  },

  create: async (data: {
    name: string;
    company?: string;
    email: string;
    defaultPaymentTerms?: number;
    notes?: string;
  }): Promise<Customer> => {
    const response = await apiClient.post<ApiResponse<Customer>>('/customers', data);
    return response.data.data;
  },

  update: async (id: string, data: Partial<{
    name: string;
    company?: string;
    email: string;
    defaultPaymentTerms?: number;
    notes?: string;
  }>): Promise<Customer> => {
    const response = await apiClient.patch<ApiResponse<Customer>>(`/customers/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/customers/${id}`);
  },
};
