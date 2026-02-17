import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timeEntriesApi, CreateTimeEntryData, UpdateTimeEntryData } from '../api/time-entries';
import toast from 'react-hot-toast';

export const useTimeEntries = (projectId?: string) => {
    return useQuery({
        queryKey: ['time-entries', projectId],
        queryKeyHashFn: () => `time-entries-${projectId || 'all'}`,
        queryFn: () => timeEntriesApi.getAll(projectId),
    });
};

export const useCreateTimeEntry = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateTimeEntryData) => timeEntriesApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['time-entries'] });
            toast.success('Zeiteintrag erfolgreich erstellt');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Fehler beim Erstellen des Zeiteintrags');
        },
    });
};

export const useUpdateTimeEntry = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateTimeEntryData }) =>
            timeEntriesApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['time-entries'] });
            toast.success('Zeiteintrag erfolgreich aktualisiert');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Fehler beim Aktualisieren des Zeiteintrags');
        },
    });
};

export const useDeleteTimeEntry = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => timeEntriesApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['time-entries'] });
            toast.success('Zeiteintrag erfolgreich gelöscht');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Fehler beim Löschen des Zeiteintrags');
        },
    });
};
