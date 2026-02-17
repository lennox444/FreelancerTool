import apiClient from './client';
import type { TimeEntry, ApiResponse } from '../types';

export interface CreateTimeEntryData {
    projectId?: string;
    description?: string;
    duration: number;
    pauseDuration?: number;
    startTime: string;
    endTime?: string;
}

export interface UpdateTimeEntryData extends Partial<CreateTimeEntryData> { }

export const timeEntriesApi = {
    /**
     * Get all time entries
     */
    getAll: async (projectId?: string): Promise<TimeEntry[]> => {
        const response = await apiClient.get<ApiResponse<TimeEntry[]>>(
            '/time-entries',
            { params: { projectId } }
        );
        return response.data.data;
    },

    /**
     * Get single time entry by ID
     */
    getOne: async (id: string): Promise<TimeEntry> => {
        const response = await apiClient.get<ApiResponse<TimeEntry>>(
            `/time-entries/${id}`
        );
        return response.data.data;
    },

    /**
     * Create new time entry
     */
    create: async (data: CreateTimeEntryData): Promise<TimeEntry> => {
        const response = await apiClient.post<ApiResponse<TimeEntry>>(
            '/time-entries',
            data
        );
        return response.data.data;
    },

    /**
     * Update existing time entry
     */
    update: async (id: string, data: UpdateTimeEntryData): Promise<TimeEntry> => {
        const response = await apiClient.patch<ApiResponse<TimeEntry>>(
            `/time-entries/${id}`,
            data
        );
        return response.data.data;
    },

    /**
     * Delete time entry
     */
    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/time-entries/${id}`);
    },
};
