import apiClient from './client';
import { Expense, ExpenseCategory, ExpenseSummary, ApiResponse } from '../types';

export const expensesApi = {
  getAll: (params?: { category?: ExpenseCategory; from?: string; to?: string }) =>
    apiClient.get<ApiResponse<Expense[]>>('/expenses', { params }).then((r) => r.data),

  getOne: (id: string) =>
    apiClient.get<ApiResponse<Expense>>(`/expenses/${id}`).then((r) => r.data),

  create: (data: {
    amount: number;
    description: string;
    category: ExpenseCategory;
    date?: string;
    receiptUrl?: string;
    notes?: string;
  }) => apiClient.post<ApiResponse<Expense>>('/expenses', data).then((r) => r.data),

  update: (id: string, data: Partial<{
    amount: number;
    description: string;
    category: ExpenseCategory;
    date: string;
    receiptUrl: string;
    notes: string;
  }>) => apiClient.patch<ApiResponse<Expense>>(`/expenses/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/expenses/${id}`).then((r) => r.data),

  getSummary: (year?: number) =>
    apiClient
      .get<ApiResponse<ExpenseSummary>>('/expenses/summary', { params: { year } })
      .then((r) => r.data),
};
