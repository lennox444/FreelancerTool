import apiClient from './client';
import { Expense, ExpenseCategory, ExpenseSummary, RecurringInterval, ApiResponse } from '../types';

type RecurringFields = {
  isRecurring?: boolean;
  recurringInterval?: RecurringInterval;
  recurringStartDate?: string;
  recurringEndDate?: string;
};

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
  } & RecurringFields) => apiClient.post<ApiResponse<Expense>>('/expenses', data).then((r) => r.data),

  update: (id: string, data: Partial<{
    amount: number;
    description: string;
    category: ExpenseCategory;
    date: string;
    receiptUrl: string;
    notes: string;
  } & RecurringFields>) => apiClient.patch<ApiResponse<Expense>>(`/expenses/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/expenses/${id}`).then((r) => r.data),

  getSummary: (year?: number, month?: number) =>
    apiClient
      .get<ApiResponse<ExpenseSummary>>('/expenses/summary', { params: { year, month } })
      .then((r) => r.data),

  getSubscriptions: () =>
    apiClient.get<ApiResponse<Expense[]>>('/expenses/subscriptions').then((r) => r.data),

  downloadDATEV: async (year: number): Promise<void> => {
    const response = await apiClient.get(`/expenses/export/datev`, {
      params: { year },
      responseType: 'blob',
    });
    const url = URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `DATEV_Ausgaben_${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },
};
