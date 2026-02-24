import apiClient from './client';
import type { Invoice, ApiResponse, InvoiceStatus } from '../types';

export const invoicesApi = {
  getAll: async (params?: {
    status?: InvoiceStatus;
    customerId?: string;
    from?: string;
    to?: string;
  }): Promise<Invoice[]> => {
    const response = await apiClient.get<ApiResponse<Invoice[]>>('/invoices', { params });
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
    projectId?: string;
    invoiceNumber?: string;
    isRecurring?: boolean;
    recurringInterval?: string;
    recurringStartDate?: string;
    recurringEndDate?: string;
    onlinePaymentEnabled?: boolean;
  }): Promise<Invoice> => {
    const response = await apiClient.post<ApiResponse<Invoice>>('/invoices', data);
    return response.data.data;
  },

  update: async (
    id: string,
    data: Partial<{
      customerId: string;
      amount: number;
      description: string;
      dueDate: string;
      issueDate?: string;
      projectId?: string;
      invoiceNumber?: string;
      isRecurring?: boolean;
      recurringInterval?: string;
      recurringStartDate?: string;
      recurringEndDate?: string;
      onlinePaymentEnabled?: boolean;
    }>,
  ): Promise<Invoice> => {
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

  sendEmail: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(`/invoices/${id}/send-email`);
    return response.data.data;
  },

  downloadPdf: (id: string) => {
    // Direct link for download
    return apiClient.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
  },

  getOverdue: async (): Promise<Invoice[]> => {
    const response = await apiClient.get<ApiResponse<Invoice[]>>('/invoices/overdue');
    return response.data.data;
  },

  getTimeEntries: async (invoiceId: string): Promise<any[]> => {
    const response = await apiClient.get<ApiResponse<any[]>>(`/invoices/${invoiceId}/time-entries`);
    return response.data.data;
  },

  setTimeEntries: async (invoiceId: string, timeEntryIds: string[]): Promise<{ linked: number }> => {
    const response = await apiClient.patch<ApiResponse<{ linked: number }>>(`/invoices/${invoiceId}/time-entries`, { timeEntryIds });
    return response.data.data;
  },

  downloadDATEV: async (year: number): Promise<void> => {
    const response = await apiClient.get(`/invoices/export/datev`, {
      params: { year },
      responseType: 'blob',
    });
    const url = URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `DATEV_Rechnungen_${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },
};
