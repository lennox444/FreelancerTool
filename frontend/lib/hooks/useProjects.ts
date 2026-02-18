import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '../api/projects';
import type { Project, ProjectProfitability, ProjectProfitabilityHistoryItem, ProjectStatus } from '../types';
import toast from 'react-hot-toast';

interface ProjectFilters {
  search?: string;
  status?: ProjectStatus;
  customerId?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

/**
 * Fetch all projects
 */
export function useProjects(params?: ProjectFilters) {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => projectsApi.getAll(params),
  });
}

/**
 * Fetch single project
 */
export function useProject(id: string) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => projectsApi.getOne(id),
    enabled: !!id,
  });
}

/**
 * Create new project
 */
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Projekt erfolgreich erstellt');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Fehler beim Erstellen des Projekts'
      );
    },
  });
}

/**
 * Update existing project
 */
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      projectsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', variables.id] });
      toast.success('Projekt erfolgreich aktualisiert');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          'Fehler beim Aktualisieren des Projekts'
      );
    },
  });
}

/**
 * Fetch profitability analysis for a single project.
 * Only fires when `id` is non-empty and `enabled` is true (i.e. tab is visible).
 */
export function useProjectProfitability(id: string, enabled = true) {
  return useQuery<ProjectProfitability>({
    queryKey: ['projects', id, 'profitability'],
    queryFn: () => projectsApi.getProfitability(id),
    enabled: !!id && enabled,
    staleTime: 60_000, // re-fetch at most once per minute
  });
}

/**
 * Fetch monthly profitability history for a project.
 */
export function useProjectProfitabilityHistory(id: string, months = 6, enabled = true) {
  return useQuery<ProjectProfitabilityHistoryItem[]>({
    queryKey: ['projects', id, 'profitability', 'history', months],
    queryFn: () => projectsApi.getProfitabilityHistory(id, months),
    enabled: !!id && enabled,
    staleTime: 120_000,
  });
}

/**
 * Delete project
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Projekt erfolgreich gelöscht');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Fehler beim Löschen des Projekts'
      );
    },
  });
}
