import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timeEntriesApi, CreateTimeEntryData, UpdateTimeEntryData, StartTimerData } from '../api/time-entries';
import toast from 'react-hot-toast';

export const useTimeEntries = (projectId?: string) => {
    return useQuery({
        queryKey: ['time-entries', projectId],
        queryFn: () => timeEntriesApi.getAll(projectId),
    });
};

export const useActiveTimeEntry = () => {
    return useQuery({
        queryKey: ['time-entries', 'active'],
        queryFn: () => timeEntriesApi.getActive(),
        refetchOnWindowFocus: true,
        staleTime: 0,
    });
};

export const useStartTimer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: StartTimerData) => timeEntriesApi.startTimer(data),
        onSuccess: (entry) => {
            queryClient.setQueryData(['time-entries', 'active'], entry);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Fehler beim Starten des Timers');
        },
    });
};

export const usePauseTimer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => timeEntriesApi.pauseTimer(id),
        onSuccess: (entry) => {
            queryClient.setQueryData(['time-entries', 'active'], entry);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Fehler beim Pausieren');
        },
    });
};

export const useResumeTimer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => timeEntriesApi.resumeTimer(id),
        onSuccess: (entry) => {
            queryClient.setQueryData(['time-entries', 'active'], entry);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Fehler beim Fortsetzen');
        },
    });
};

export const useStopTimer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => timeEntriesApi.stopTimer(id),
        onSuccess: () => {
            queryClient.setQueryData(['time-entries', 'active'], null);
            queryClient.invalidateQueries({ queryKey: ['time-entries'] });
            toast.success('Zeiteintrag gespeichert');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Fehler beim Stoppen des Timers');
        },
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
