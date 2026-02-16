import apiClient from './client';
import type { Invoice, ApiResponse, InvoiceStatus } from '../types';

export const invoicesApi = {
  getAll: async (params?: {
    status?: InvoiceStatus;
    customerId?: string;
    from?: string;
    to?: string;
  }): Promise<Invoice[]> => {
    const response = await apiClient.get<ApiResponse<Invoice[]>>('/invoices', {
      params,
    });
    return response.data.data;
  },

  getOne: async (id: string): Promise<Invoice> => {
    const response = await apiClient.get<ApiResponse<Invoice>>(`/invoices/${id}`);
    return response.data.data;
  },

  create: async (data: {
    customerId: string;
    amount: number;
    description: string;
    dueDate: string;
    issueDate?: string;
  }): Promise<Invoice> => {
    const response = await apiClient.post<ApiResponse<Invoice>>('/invoices', data);
    return response.data.data;
  },

  update: async (id: string, data: Partial<{
    customerId: string;
    amount: number;
    description: string;
    dueDate: string;
    issueDate?: string;
  }>): Promise<Invoice> => {
    const response = await apiClient.patch<ApiResponse<Invoice>>(`/invoices/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/invoices/${id}`);
  },

  send: async (id: string): Promise<Invoice> => {
    const response = await apiClient.post<ApiResponse<Invoice>>(`/invoices/${id}/send`);
    return response.data.data;
  },
};
