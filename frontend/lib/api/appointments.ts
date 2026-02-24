import apiClient from './client';
import type { ApiResponse, Appointment } from '../types';

export const appointmentsApi = {
    getAll: async (params?: { from?: string; to?: string; customerId?: string; projectId?: string }) => {
        const response = await apiClient.get<ApiResponse<Appointment[]>>('/appointments', { params });
        return response.data?.data || [];
    },

    getOne: async (id: string) => {
        const response = await apiClient.get<ApiResponse<Appointment>>(`/appointments/${id}`);
        return response.data.data;
    },

    create: async (data: Partial<Appointment>) => {
        const response = await apiClient.post<ApiResponse<Appointment>>('/appointments', data);
        return response.data.data;
    },

    update: async (id: string, data: Partial<Appointment>) => {
        const response = await apiClient.patch<ApiResponse<Appointment>>(`/appointments/${id}`, data);
        return response.data.data;
    },

    delete: async (id: string) => {
        const response = await apiClient.delete<ApiResponse<void>>(`/appointments/${id}`);
        return response.data;
    },
};
