import apiClient from './client';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  subscriptionPlan: string;
  subscriptionStatus: string;
  trialEndsAt: string | null;
  createdAt: string;
  isSuspended: boolean;
  stripeCustomerId: string | null;
}

export interface AdminUserDetail extends AdminUser {
  updatedAt: string;
  subscriptionEndsAt: string | null;
  _count: { customers: number; projects: number; invoices: number };
}

export interface AdminUsersResponse {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SignupTrendEntry {
  date: string;
  count: number;
}

export interface AdminMetrics {
  totalUsers: number;
  newUsersLast7: number;
  newUsersLast30: number;
  proUsers: number;
  freeTrialUsers: number;
  conversionRate: number;
  onboardingRate: number;
  signupTrend: SignupTrendEntry[];
}

export interface LastPayment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  date: string;
  description: string | null;
}

export interface AdminRevenue {
  mrr: number;
  arr: number;
  activeSubscriptions: number;
  lastPayments: LastPayment[];
  stripeError?: string;
}

export interface AdminHealth {
  db: {
    users: number;
    customers: number;
    projects: number;
    invoices: number;
    payments: number;
    timeEntries: number;
  };
  uptime: number;
  uptimeFormatted: string;
  nodeVersion: string;
  memoryUsageMB: number;
}

// ─── API Calls ────────────────────────────────────────────────────────────────

export async function getAdminUsers(
  search?: string,
  page = 1,
  limit = 20,
): Promise<AdminUsersResponse> {
  const params: Record<string, string | number> = { page, limit };
  if (search) params.search = search;
  const { data } = await apiClient.get('/admin/users', { params });
  return data;
}

export async function getAdminUserDetail(id: string): Promise<AdminUserDetail> {
  const { data } = await apiClient.get(`/admin/users/${id}`);
  return data;
}

export async function patchUserPlan(id: string, plan: string): Promise<void> {
  await apiClient.patch(`/admin/users/${id}/plan`, { plan });
}

export async function patchUserTrial(id: string, days: number): Promise<void> {
  await apiClient.patch(`/admin/users/${id}/trial`, { days });
}

export async function patchUserSuspend(id: string, suspend: boolean): Promise<void> {
  await apiClient.patch(`/admin/users/${id}/status`, { suspend });
}

export async function deleteAdminUser(id: string): Promise<void> {
  await apiClient.delete(`/admin/users/${id}`);
}

export async function getAdminMetrics(): Promise<AdminMetrics> {
  const { data } = await apiClient.get('/admin/metrics');
  return data;
}

export async function getAdminRevenue(): Promise<AdminRevenue> {
  const { data } = await apiClient.get('/admin/revenue');
  return data;
}

export async function getAdminHealth(): Promise<AdminHealth> {
  const { data } = await apiClient.get('/admin/health');
  return data;
}
