import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsApi } from '../api/appointments';

export function useAppointments(params?: { from?: string; to?: string; customerId?: string; projectId?: string }) {
    return useQuery({
        queryKey: ['appointments', params],
        queryFn: () => appointmentsApi.getAll(params),
    });
}

export function useAppointment(id: string) {
    return useQuery({
        queryKey: ['appointments', id],
        queryFn: () => appointmentsApi.getOne(id),
        enabled: !!id,
    });
}

export function useCreateAppointment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: appointmentsApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
        },
    });
}

export function useUpdateAppointment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => appointmentsApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
        },
    });
}

export function useDeleteAppointment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: appointmentsApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
        },
    });
}
