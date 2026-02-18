import apiClient from './client';
import type { Project, ProjectProfitability, ProjectProfitabilityHistoryItem, ProjectStatus, ApiResponse } from '../types';

interface CreateProjectData {
  name: string;
  description?: string;
  customerId?: string;
  status?: ProjectStatus;
  budget?: number;
  startDate?: string;
  endDate?: string;
  notes?: string;
}

interface UpdateProjectData extends Partial<CreateProjectData> {}

interface ProjectFilters {
  search?: string;
  status?: ProjectStatus;
  customerId?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export const projectsApi = {
  /**
   * Get all projects
   */
  getAll: async (params?: ProjectFilters): Promise<Project[]> => {
    const response = await apiClient.get<ApiResponse<Project[]>>(
      '/projects',
      { params }
    );
    return response.data.data;
  },

  /**
   * Get single project by ID
   */
  getOne: async (id: string): Promise<Project> => {
    const response = await apiClient.get<ApiResponse<Project>>(
      `/projects/${id}`
    );
    return response.data.data;
  },

  /**
   * Create new project
   */
  create: async (data: CreateProjectData): Promise<Project> => {
    const response = await apiClient.post<ApiResponse<Project>>(
      '/projects',
      data
    );
    return response.data.data;
  },

  /**
   * Update existing project
   */
  update: async (id: string, data: UpdateProjectData): Promise<Project> => {
    const response = await apiClient.patch<ApiResponse<Project>>(
      `/projects/${id}`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete project
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/projects/${id}`);
  },

  /**
   * Get profitability analysis for a project
   */
  getProfitability: async (id: string): Promise<ProjectProfitability> => {
    const response = await apiClient.get<ApiResponse<ProjectProfitability>>(
      `/projects/${id}/profitability`,
    );
    return response.data.data;
  },

  /**
   * Get monthly profitability history for a project (last N months)
   */
  getProfitabilityHistory: async (
    id: string,
    months = 6,
  ): Promise<ProjectProfitabilityHistoryItem[]> => {
    const response = await apiClient.get<ApiResponse<ProjectProfitabilityHistoryItem[]>>(
      `/projects/${id}/profitability/history`,
      { params: { months } },
    );
    return response.data.data;
  },
};
