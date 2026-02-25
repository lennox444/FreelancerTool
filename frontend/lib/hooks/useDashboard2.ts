import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard';
import { expensesApi } from '../api/expenses';
import { projectsApi } from '../api/projects';
import { useAuthStore } from '../stores/authStore';
import type { WarningSignal } from '../types';

export function useDashboardOverview() {
  return useQuery({
    queryKey: ['dashboard2', 'overview'],
    queryFn: () => dashboardApi.getOverview(),
    staleTime: 2 * 60 * 1000,
  });
}

export function useCashflowForecast2() {
  return useQuery({
    queryKey: ['dashboard2', 'cashflow'],
    queryFn: () => dashboardApi.getCashflow(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useExpenseSummary2(year?: number) {
  const currentYear = year ?? new Date().getFullYear();
  return useQuery({
    queryKey: ['dashboard2', 'expense-summary', currentYear],
    queryFn: () => expensesApi.getSummary(currentYear).then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });
}

export function useActiveProjects2() {
  return useQuery({
    queryKey: ['dashboard2', 'active-projects'],
    queryFn: () => projectsApi.getAll({ status: 'ACTIVE' as any }),
    staleTime: 5 * 60 * 1000,
  });
}

export function useTaxCalendar(year?: number) {
  const currentYear = year ?? new Date().getFullYear();
  // Tax calendar is derived client-side from tax savings data — no extra API call needed.
  return useQuery({
    queryKey: ['dashboard2', 'tax-calendar', currentYear],
    queryFn: () => dashboardApi.getOverview(),
    staleTime: 10 * 60 * 1000,
    select: (data) => data.taxSavings,
  });
}

export function useOverdueInvoices2() {
  return useQuery({
    queryKey: ['dashboard2', 'overdue'],
    queryFn: () => dashboardApi.getOverdue(),
    staleTime: 2 * 60 * 1000,
  });
}

export function useTrialWarning(): WarningSignal | null {
  const user = useAuthStore((s) => s.user);
  if (!user?.trialEndsAt) return null;
  const daysLeft = Math.ceil(
    (new Date(user.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  if (daysLeft > 7) return null;
  return {
    type: 'trial_ending',
    severity: 'warning',
    message: `Dein Testzeitraum endet in ${Math.max(0, daysLeft)} Tag(en) — jetzt upgraden`,
    link: '/settings/billing',
  };
}
