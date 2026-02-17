import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardApi.getStats(),
    refetchInterval: 60000, // Refresh every minute
  });
}

export function useDashboardCashflow() {
  return useQuery({
    queryKey: ['dashboard', 'cashflow'],
    queryFn: () => dashboardApi.getCashflow(),
  });
}

export function useDashboardRevenueTrend(months: number = 6) {
  return useQuery({
    queryKey: ['dashboard', 'revenue-trend', months],
    queryFn: () => dashboardApi.getRevenueTrend(months),
  });
}

export function useDashboardOverdue() {
  return useQuery({
    queryKey: ['dashboard', 'overdue'],
    queryFn: () => dashboardApi.getOverdue(),
  });
}
