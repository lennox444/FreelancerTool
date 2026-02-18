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

export interface StartTimerData {
    projectId?: string;
    description?: string;
}

export const timeEntriesApi = {
    // ─── Active Timer ──────────────────────────────────────────────
    startTimer: async (data: StartTimerData = {}): Promise<TimeEntry> => {
        const response = await apiClient.post<ApiResponse<TimeEntry>>(
            '/time-entries/start',
            data,
        );
        return response.data.data;
    },

    getActive: async (): Promise<TimeEntry | null> => {
        const response = await apiClient.get<ApiResponse<TimeEntry | null>>(
            '/time-entries/active',
        );
        return response.data.data;
    },

    pauseTimer: async (id: string): Promise<TimeEntry> => {
        const response = await apiClient.post<ApiResponse<TimeEntry>>(
            `/time-entries/${id}/pause`,
        );
        return response.data.data;
    },

    resumeTimer: async (id: string): Promise<TimeEntry> => {
        const response = await apiClient.post<ApiResponse<TimeEntry>>(
            `/time-entries/${id}/resume`,
        );
        return response.data.data;
    },

    stopTimer: async (id: string): Promise<TimeEntry> => {
        const response = await apiClient.post<ApiResponse<TimeEntry>>(
            `/time-entries/${id}/stop`,
        );
        return response.data.data;
    },

    // ─── Standard CRUD ─────────────────────────────────────────────
    getAll: async (projectId?: string): Promise<TimeEntry[]> => {
        const response = await apiClient.get<ApiResponse<TimeEntry[]>>(
            '/time-entries',
            { params: { projectId } }
        );
        return response.data.data;
    },

    getOne: async (id: string): Promise<TimeEntry> => {
        const response = await apiClient.get<ApiResponse<TimeEntry>>(
            `/time-entries/${id}`
        );
        return response.data.data;
    },

    create: async (data: CreateTimeEntryData): Promise<TimeEntry> => {
        const response = await apiClient.post<ApiResponse<TimeEntry>>(
            '/time-entries',
            data
        );
        return response.data.data;
    },

    update: async (id: string, data: UpdateTimeEntryData): Promise<TimeEntry> => {
        const response = await apiClient.patch<ApiResponse<TimeEntry>>(
            `/time-entries/${id}`,
            data
        );
        return response.data.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/time-entries/${id}`);
    },
};
