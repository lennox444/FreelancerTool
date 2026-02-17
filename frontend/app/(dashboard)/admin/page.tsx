'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, Users, TrendingUp, Activity, Server, Database, Search, ChevronLeft, ChevronRight, Trash2, Lock, Unlock, RefreshCw } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/authStore';
import { UserRole } from '@/lib/types';
import { useRouter } from 'next/navigation';
import {
  getAdminUsers,
  getAdminMetrics,
  getAdminRevenue,
  getAdminHealth,
  patchUserPlan,
  patchUserTrial,
  patchUserSuspend,
  deleteAdminUser,
  type AdminUser,
} from '@/lib/api/admin';

// ─── Small helpers ────────────────────────────────────────────────────────────

function PlanBadge({ plan }: { plan: string }) {
  const isPro = plan === 'PRO';
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
        isPro ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'
      }`}
    >
      {isPro ? 'PRO' : 'FREE'}
    </span>
  );
}

function StatusBadge({ suspended }: { suspended: boolean }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
        suspended ? 'bg-red-700 text-red-100' : 'bg-emerald-800 text-emerald-200'
      }`}
    >
      {suspended ? 'Gesperrt' : 'Aktiv'}
    </span>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg bg-white/5 ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-3xl font-black text-white">{value}</div>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  const handleSearchChange = (v: string) => {
    setSearch(v);
    clearTimeout((window as any).__adminSearchTimer);
    (window as any).__adminSearchTimer = setTimeout(() => {
      setDebouncedSearch(v);
      setPage(1);
    }, 400);
  };

  // Role guard
  if (user && user.role !== UserRole.SUPER_ADMIN) {
    router.push('/dashboard');
    return null;
  }

  // ─── Queries ─────────────────────────────────────────────────────────────

  const usersQuery = useQuery({
    queryKey: ['admin-users', debouncedSearch, page],
    queryFn: () => getAdminUsers(debouncedSearch || undefined, page, 20),
    staleTime: 30_000,
  });

  const metricsQuery = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: getAdminMetrics,
    staleTime: 60_000,
  });

  const revenueQuery = useQuery({
    queryKey: ['admin-revenue'],
    queryFn: getAdminRevenue,
    staleTime: 60_000,
  });

  const healthQuery = useQuery({
    queryKey: ['admin-health'],
    queryFn: getAdminHealth,
    staleTime: 30_000,
  });

  // ─── Mutations ────────────────────────────────────────────────────────────

  const invalidateUsers = () =>
    queryClient.invalidateQueries({ queryKey: ['admin-users'] });

  const planMutation = useMutation({
    mutationFn: ({ id, plan }: { id: string; plan: string }) =>
      patchUserPlan(id, plan),
    onSuccess: invalidateUsers,
  });

  const trialMutation = useMutation({
    mutationFn: ({ id, days }: { id: string; days: number }) =>
      patchUserTrial(id, days),
    onSuccess: invalidateUsers,
  });

  const suspendMutation = useMutation({
    mutationFn: ({ id, suspend }: { id: string; suspend: boolean }) =>
      patchUserSuspend(id, suspend),
    onSuccess: invalidateUsers,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdminUser(id),
    onSuccess: invalidateUsers,
  });

  // ─── Handlers ─────────────────────────────────────────────────────────────

  function handlePlanChange(user: AdminUser, plan: string) {
    planMutation.mutate({ id: user.id, plan });
  }

  function handleTrialExtend(user: AdminUser, days: number) {
    trialMutation.mutate({ id: user.id, days });
  }

  function handleToggleSuspend(user: AdminUser) {
    suspendMutation.mutate({ id: user.id, suspend: !user.isSuspended });
  }

  function handleDelete(user: AdminUser) {
    if (window.confirm(`Account von ${user.email} unwiderruflich löschen?`)) {
      deleteMutation.mutate(user.id);
    }
  }

  // ─── Derived data ─────────────────────────────────────────────────────────

  const m = metricsQuery.data;
  const r = revenueQuery.data;
  const h = healthQuery.data;
  const u = usersQuery.data;

  const fmtEur = (n?: number) =>
    n != null ? `${n.toLocaleString('de-DE', { minimumFractionDigits: 0 })} €` : '—';

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-full p-6 bg-slate-950">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">Super Admin</h1>
            <p className="text-slate-400 text-sm">SaaS-Kontrolle & Metriken</p>
          </div>
          <button
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
              queryClient.invalidateQueries({ queryKey: ['admin-revenue'] });
              queryClient.invalidateQueries({ queryKey: ['admin-health'] });
              queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            }}
            className="ml-auto p-2 text-slate-500 hover:text-white transition-colors"
            title="Alle Daten neu laden"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* ── KPI Grid ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Gesamt-User"
            value={m?.totalUsers ?? '…'}
            sub={`+${m?.newUsersLast7 ?? '?'} letzte 7 Tage`}
            icon={Users}
            color="text-blue-400"
          />
          <StatCard
            label="MRR"
            value={r ? fmtEur(r.mrr) : '…'}
            sub={r?.stripeError ? 'Stripe nicht konfiguriert' : `ARR: ${fmtEur(r?.arr)}`}
            icon={TrendingUp}
            color="text-emerald-400"
          />
          <StatCard
            label="Conversion Trial→Pro"
            value={m ? `${m.conversionRate}%` : '…'}
            sub={`${m?.proUsers ?? '?'} PRO-User`}
            icon={Activity}
            color="text-orange-400"
          />
          <StatCard
            label="Aktive Subs (Stripe)"
            value={r?.activeSubscriptions ?? '…'}
            sub="live von Stripe"
            icon={Server}
            color="text-purple-400"
          />
        </div>

        {/* ── Middle: Metriken + Health ──────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Metriken */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
              <h2 className="text-lg font-bold text-white mb-4">SaaS-Metriken</h2>

              {/* Plan-Verteilung */}
              <div className="mb-6">
                <p className="text-xs text-slate-500 uppercase font-bold mb-2">Plan-Verteilung</p>
                <div className="flex gap-6">
                  <div>
                    <span className="text-2xl font-black text-white">{m?.freeTrialUsers ?? '…'}</span>
                    <p className="text-xs text-slate-500">FREE TRIAL</p>
                  </div>
                  <div>
                    <span className="text-2xl font-black text-blue-400">{m?.proUsers ?? '…'}</span>
                    <p className="text-xs text-slate-500">PRO</p>
                  </div>
                </div>
                {/* GRAPH_PLACEHOLDER: Recharts PieChart – FREE_TRIAL vs PRO Anteil. Daten: { name: 'FREE', value: m.freeTrialUsers }, { name: 'PRO', value: m.proUsers } */}
              </div>

              {/* Onboarding Rate */}
              <div className="mb-6">
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-400 uppercase">Onboarding abgeschlossen</span>
                  <span className="text-white">{m?.onboardingRate ?? '…'}%</span>
                </div>
                <progress
                  className="w-full h-2 rounded-full overflow-hidden accent-blue-500"
                  value={m?.onboardingRate ?? 0}
                  max={100}
                />
              </div>

              {/* Signup-Trend */}
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold mb-2">Signups letzte 14 Tage</p>
                {/* GRAPH_PLACEHOLDER: Recharts BarChart – Signups pro Tag, letzte 14 Tage. X: Datum (entry.date), Y: count (entry.count). Daten kommen aus m.signupTrend[] */}
                <div className="overflow-x-auto">
                  <table className="text-xs text-slate-400 w-full">
                    <tbody>
                      {m?.signupTrend?.slice(-7).map((entry) => (
                        <tr key={entry.date} className="border-t border-white/5">
                          <td className="py-1 pr-4 text-slate-500">{entry.date}</td>
                          <td className="py-1">
                            <span className="text-white font-bold">{entry.count}</span>
                            {entry.count > 0 && (
                              <span className="ml-2 text-blue-400">{'█'.repeat(Math.min(entry.count, 10))}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Health + Revenue Panel */}
          <div className="space-y-4">

            {/* Stripe Revenue */}
            <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
              <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Letzte Stripe-Zahlungen
              </h2>
              {r?.stripeError ? (
                <p className="text-xs text-red-400">{r.stripeError}</p>
              ) : (
                <ul className="space-y-2">
                  {(r?.lastPayments ?? []).slice(0, 5).map((p) => (
                    <li key={p.id} className="flex justify-between text-xs">
                      <span className="text-slate-400">
                        {new Date(p.date).toLocaleDateString('de-DE')}
                      </span>
                      <span className={`font-bold ${p.status === 'succeeded' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {p.amount.toFixed(2)} {p.currency.toUpperCase()}
                      </span>
                    </li>
                  ))}
                  {(!r || r.lastPayments.length === 0) && (
                    <li className="text-xs text-slate-600">Keine Zahlungen</li>
                  )}
                </ul>
              )}
            </div>

            {/* System Health */}
            <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
              <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-400" />
                System Health
              </h2>
              {h ? (
                <ul className="text-xs space-y-1 text-slate-400">
                  <li>Users: <span className="text-white font-bold">{h.db.users}</span></li>
                  <li>Kunden: <span className="text-white font-bold">{h.db.customers}</span></li>
                  <li>Projekte: <span className="text-white font-bold">{h.db.projects}</span></li>
                  <li>Rechnungen: <span className="text-white font-bold">{h.db.invoices}</span></li>
                  <li>Zeiteinträge: <span className="text-white font-bold">{h.db.timeEntries}</span></li>
                  <li className="pt-1 border-t border-white/10 mt-1">
                    Uptime: <span className="text-emerald-400 font-bold">{h.uptimeFormatted}</span>
                  </li>
                  <li>RAM: <span className="text-white font-bold">{h.memoryUsageMB} MB</span></li>
                  <li>Node: <span className="text-white font-bold">{h.nodeVersion}</span></li>
                </ul>
              ) : (
                <p className="text-xs text-slate-600">Lade…</p>
              )}
            </div>
          </div>
        </div>

        {/* ── User-Management-Tabelle ────────────────────────────────────── */}
        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
          <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              User-Management
              {u && (
                <span className="text-sm font-normal text-slate-500 ml-1">({u.total} gesamt)</span>
              )}
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Name oder E-Mail suchen…"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9 pr-4 h-10 w-64 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {usersQuery.isLoading ? (
              <p className="text-sm text-slate-500 py-8 text-center">Lade User…</p>
            ) : usersQuery.isError ? (
              <p className="text-sm text-red-400 py-8 text-center">Fehler beim Laden der User</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-500 border-b border-white/10">
                    <th className="pb-2 pr-4">User</th>
                    <th className="pb-2 pr-4">Plan</th>
                    <th className="pb-2 pr-4">Status</th>
                    <th className="pb-2 pr-4">Registriert</th>
                    <th className="pb-2">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {u?.users.map((usr) => (
                    <tr key={usr.id} className="hover:bg-white/5 transition-colors">
                      {/* Avatar + Name */}
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                            {usr.firstName[0]}{usr.lastName[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-white text-xs">
                              {usr.firstName} {usr.lastName}
                            </p>
                            <p className="text-slate-500 text-xs">{usr.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Plan Badge */}
                      <td className="py-3 pr-4">
                        <PlanBadge plan={usr.subscriptionPlan} />
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 pr-4">
                        <StatusBadge suspended={usr.isSuspended} />
                      </td>

                      {/* Registriert */}
                      <td className="py-3 pr-4 text-slate-500 text-xs">
                        {new Date(usr.createdAt).toLocaleDateString('de-DE')}
                      </td>

                      {/* Aktionen */}
                      <td className="py-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Plan ändern */}
                          <select
                            className="text-xs bg-white/10 border border-white/10 text-white rounded px-2 py-1 cursor-pointer"
                            defaultValue=""
                            onChange={(e) => {
                              if (e.target.value) {
                                handlePlanChange(usr, e.target.value);
                                e.target.value = '';
                              }
                            }}
                          >
                            <option value="" disabled>Plan…</option>
                            <option value="FREE_TRIAL">→ FREE</option>
                            <option value="PRO">→ PRO</option>
                          </select>

                          {/* Trial verlängern */}
                          <select
                            className="text-xs bg-white/10 border border-white/10 text-white rounded px-2 py-1 cursor-pointer"
                            defaultValue=""
                            onChange={(e) => {
                              if (e.target.value) {
                                handleTrialExtend(usr, parseInt(e.target.value));
                                e.target.value = '';
                              }
                            }}
                          >
                            <option value="" disabled>Trial +…</option>
                            <option value="7">+7 Tage</option>
                            <option value="14">+14 Tage</option>
                            <option value="30">+30 Tage</option>
                          </select>

                          {/* Suspend toggle */}
                          <button
                            onClick={() => handleToggleSuspend(usr)}
                            className={`p-1.5 rounded transition-colors ${
                              usr.isSuspended
                                ? 'text-emerald-400 hover:bg-emerald-900/30'
                                : 'text-yellow-400 hover:bg-yellow-900/30'
                            }`}
                            title={usr.isSuspended ? 'Entsperren' : 'Sperren'}
                          >
                            {usr.isSuspended ? (
                              <Unlock className="w-4 h-4" />
                            ) : (
                              <Lock className="w-4 h-4" />
                            )}
                          </button>

                          {/* Löschen */}
                          <button
                            onClick={() => handleDelete(usr)}
                            className="p-1.5 rounded text-red-500 hover:bg-red-900/30 transition-colors"
                            title="Account löschen"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {u?.users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500 text-sm">
                        Keine User gefunden
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {u && u.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
              <p className="text-xs text-slate-500">
                Seite {u.page} von {u.totalPages} ({u.total} User)
              </p>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="p-2 rounded bg-white/5 border border-white/10 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={page >= u.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-2 rounded bg-white/5 border border-white/10 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
