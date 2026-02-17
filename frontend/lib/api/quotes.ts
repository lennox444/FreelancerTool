import apiClient from './client';
import { Quote, QuoteStatus, ApiResponse } from '../types';

export const quotesApi = {
  getAll: (params?: { status?: QuoteStatus; customerId?: string }) =>
    apiClient.get<ApiResponse<Quote[]>>('/quotes', { params }).then((r) => r.data),

  getOne: (id: string) =>
    apiClient.get<ApiResponse<Quote>>(`/quotes/${id}`).then((r) => r.data),

  create: (data: {
    customerId: string;
    projectId?: string;
    amount: number;
    description: string;
    validUntil: string;
    quoteNumber?: string;
    notes?: string;
  }) => apiClient.post<ApiResponse<Quote>>('/quotes', data).then((r) => r.data),

  update: (id: string, data: Partial<{
    amount: number;
    description: string;
    validUntil: string;
    quoteNumber: string;
    notes: string;
    status: QuoteStatus;
  }>) => apiClient.patch<ApiResponse<Quote>>(`/quotes/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/quotes/${id}`).then((r) => r.data),

  send: (id: string) =>
    apiClient.post<ApiResponse<Quote>>(`/quotes/${id}/send`).then((r) => r.data),

  updateStatus: (id: string, status: QuoteStatus) =>
    apiClient.patch<ApiResponse<Quote>>(`/quotes/${id}/status`, { status }).then((r) => r.data),

  convertToInvoice: (id: string) =>
    apiClient.post(`/quotes/${id}/convert`).then((r) => r.data),

  sendEmail: (id: string) =>
    apiClient.post(`/quotes/${id}/send-email`).then((r) => r.data),

  getPdfUrl: (id: string) => `/api/quotes/${id}/pdf`,
};
