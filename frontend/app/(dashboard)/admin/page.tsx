'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShieldCheck,
  Users,
  TrendingUp,
  Activity,
  Server,
  Database,
  Search,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Lock,
  Unlock,
  RefreshCw,
  CreditCard,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/authStore';
import { UserRole } from '@/lib/types';
import { useRouter } from 'next/navigation';
import PixelBlast from '@/components/landing/PixelBlast';
import SpotlightCard from '@/components/ui/SpotlightCard';
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
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${isPro
          ? 'bg-blue-50 text-blue-700 border-blue-200'
          : 'bg-slate-100 text-slate-600 border-slate-200'
        }`}
    >
      {isPro ? 'PRO' : 'FREE'}
    </span>
  );
}

function StatusBadge({ suspended }: { suspended: boolean }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${suspended
          ? 'bg-red-50 text-red-700 border-red-200'
          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
        }`}
    >
      {suspended ? 'Gesperrt' : 'Aktiv'}
    </span>
  );
}

function AdminStatCard({
  label,
  value,
  sub,
  icon: Icon,
  colorClass,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  colorClass: string;
}) {
  return (
    <SpotlightCard
      className="bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm p-6 rounded-3xl h-full flex flex-col justify-between group hover:shadow-md transition-all"
      spotlightColor="rgba(128, 0, 64, 0.05)"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-xl transition-colors ${colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div>
        <div className="text-3xl font-bold text-slate-900 tracking-tight mb-1">{value}</div>
        <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
        {sub && <p className="text-xs text-slate-400 font-medium">{sub}</p>}
      </div>
    </SpotlightCard>
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
    <div className="relative isolate min-h-full p-4 md:p-8 flex flex-col gap-8">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none rounded-3xl">
        <div className="absolute inset-0 w-full h-full opacity-30">
          <PixelBlast
            variant="square"
            pixelSize={6}
            color="#800040"
            patternScale={4}
            patternDensity={0.5}
            pixelSizeJitter={0.5}
            enableRipples
            rippleSpeed={0.3}
            rippleThickness={0.1}
            speed={0.2}
            transparent
          />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.8)_0%,rgba(248,250,252,0.95)_100%)]" />
      </div>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#800040]/10 rounded-xl">
              <ShieldCheck className="w-8 h-8 text-[#800040]" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Super Admin</h1>
          </div>
          <div className="hidden md:block w-px h-8 bg-slate-300"></div>
          <p className="text-slate-500 font-medium">SaaS-Kontrolle & Metriken</p>
        </div>
        <button
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
            queryClient.invalidateQueries({ queryKey: ['admin-revenue'] });
            queryClient.invalidateQueries({ queryKey: ['admin-health'] });
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
          }}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-slate-600 font-medium hover:bg-slate-50 hover:text-[#800040] transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* ── KPI Grid ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatCard
          label="Gesamt-User"
          value={m?.totalUsers ?? '…'}
          sub={`+${m?.newUsersLast7 ?? '?'} neue (7 Tage)`}
          icon={Users}
          colorClass="text-blue-600 bg-blue-50"
        />
        <AdminStatCard
          label="MRR"
          value={r ? fmtEur(r.mrr) : '…'}
          sub={r?.stripeError ? 'Stripe n.a.' : `ARR: ${fmtEur(r?.arr)}`}
          icon={TrendingUp}
          colorClass="text-emerald-600 bg-emerald-50"
        />
        <AdminStatCard
          label="Conversion Rate"
          value={m ? `${m.conversionRate}%` : '…'}
          sub={`${m?.proUsers ?? '?'} PRO-User`}
          icon={Activity}
          colorClass="text-orange-600 bg-orange-50"
        />
        <AdminStatCard
          label="Aktive Subs"
          value={r?.activeSubscriptions ?? '…'}
          sub="Stripe Live Metric"
          icon={Server}
          colorClass="text-[#800040] bg-pink-50"
        />
      </div>

      {/* ── Middle: Metriken + Health ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Metriken */}
        <div className="lg:col-span-2 h-full">
          <SpotlightCard
            className="bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm p-6 rounded-3xl h-full"
            spotlightColor="rgba(128, 0, 64, 0.05)"
          >
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#800040]" />
              SaaS Growth Metriken
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Plan-Verteilung */}
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold mb-3 tracking-wider">Plan-Verteilung</p>
                <div className="flex gap-8 items-end">
                  <div>
                    <span className="text-4xl font-black text-slate-800 tracking-tight">{m?.freeTrialUsers ?? '…'}</span>
                    <p className="text-xs font-semibold text-slate-400 mt-1">FREE TRIAL</p>
                  </div>
                  <div>
                    <span className="text-4xl font-black text-[#800040] tracking-tight">{m?.proUsers ?? '…'}</span>
                    <p className="text-xs font-semibold text-slate-400 mt-1">PRO</p>
                  </div>
                </div>
              </div>

              {/* Onboarding Rate */}
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold mb-3 tracking-wider">Onboarding Completion</p>
                <div className="mt-2">
                  <div className="flex justify-between text-sm font-bold mb-2">
                    <span className="text-slate-600">Rate</span>
                    <span className="text-slate-900">{m?.onboardingRate ?? '…'}%</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-[#800040] rounded-full"
                      style={{ width: `${m?.onboardingRate ?? 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <p className="text-xs text-slate-500 uppercase font-bold mb-4 tracking-wider">Signups (Letzte 14 Tage)</p>
              <div className="flex items-end justify-between h-24 gap-2">
                {m?.signupTrend?.slice(-14).map((entry, i) => {
                  const heightPercent = Math.min((entry.count / 10) * 100, 100);
                  return (
                    <div key={i} className="flex flex-col items-center justify-end h-full w-full group">
                      <div
                        className="w-full bg-slate-200 rounded-t-md group-hover:bg-[#800040]/60 transition-colors relative"
                        style={{ height: `${Math.max(heightPercent, 5)}%` }}
                      >
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          {entry.count}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-slate-400 uppercase font-medium">
                <span>Vor 14 Tagen</span>
                <span>Heute</span>
              </div>
            </div>
          </SpotlightCard>
        </div>

        {/* Health + Revenue Panel */}
        <div className="space-y-6">

          {/* New Revenue Feed (replacing Stripe payments with more elegant list) */}
          <SpotlightCard className="bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm p-6 rounded-3xl" spotlightColor="rgba(128, 0, 64, 0.05)">
            <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              Letzte Transaktionen
            </h2>
            {r?.stripeError ? (
              <p className="text-sm text-red-500 bg-red-50 p-3 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {r.stripeError}
              </p>
            ) : (
              <div className="space-y-3">
                {(r?.lastPayments ?? []).slice(0, 4).map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${p.status === 'succeeded' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                        {p.status === 'succeeded' ? <TrendingUp className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-700">{p.amount.toFixed(2)} {p.currency.toUpperCase()}</p>
                        <p className="text-[10px] text-slate-400">{new Date(p.date).toLocaleDateString('de-DE')}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.status === 'succeeded' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                      {p.status === 'succeeded' ? 'SUCCESS' : 'FAILED'}
                    </span>
                  </div>
                ))}
                {(!r || r.lastPayments.length === 0) && (
                  <p className="text-sm text-slate-400 italic">Keine Transaktionen gefunden.</p>
                )}
              </div>
            )}
          </SpotlightCard>

          {/* System Health */}
          <SpotlightCard className="bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm p-6 rounded-3xl" spotlightColor="rgba(128, 0, 64, 0.05)">
            <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-500" />
              System Status
            </h2>
            {h ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="block text-slate-400 mb-1">Users</span>
                    <span className="text-slate-900 font-bold">{h.db.users}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="block text-slate-400 mb-1">Projects</span>
                    <span className="text-slate-900 font-bold">{h.db.projects}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="block text-slate-400 mb-1">Invoices</span>
                    <span className="text-slate-900 font-bold">{h.db.invoices}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="block text-slate-400 mb-1">DB Size</span>
                    <span className="text-slate-900 font-bold">{h.memoryUsageMB} MB</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Uptime</span>
                  <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-md">{h.uptimeFormatted}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Node Version</span>
                  <span className="text-slate-700 font-bold">{h.nodeVersion}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400 animate-pulse">Lade Systemdaten...</p>
            )}
          </SpotlightCard>
        </div>
      </div>

      {/* ── User-Management-Tabelle ────────────────────────────────────── */}
      <SpotlightCard className="bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm p-6 rounded-3xl" spotlightColor="rgba(128, 0, 64, 0.05)">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#800040]" />
            User Management
            {u && (
              <span className="text-sm font-medium text-slate-400 ml-1">({u.total} total)</span>
            )}
          </h2>
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Name oder E-Mail suchen…"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 pr-4 h-10 w-full md:w-64 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#800040]/20 focus:border-[#800040] transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {usersQuery.isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#800040]"></div>
            </div>
          ) : usersQuery.isError ? (
            <p className="text-sm text-red-500 py-8 text-center bg-red-50 rounded-xl">Fehler beim Laden der User</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-slate-500 border-b border-slate-100 uppercase tracking-wider">
                  <th className="pb-3 pl-2">User</th>
                  <th className="pb-3">Plan</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 hidden sm:table-cell">Registriert</th>
                  <th className="pb-3 text-right pr-2">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {u?.users.map((usr) => (
                  <tr key={usr.id} className="group hover:bg-slate-50/80 transition-colors">
                    {/* Avatar + Name */}
                    <td className="py-4 pl-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0 shadow-sm">
                          {usr.firstName ? `${usr.firstName[0]}${usr.lastName[0]}` : <Users className="w-4 h-4 opacity-50" />}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">
                            {usr.firstName} {usr.lastName}
                          </p>
                          <p className="text-slate-500 text-xs">{usr.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Plan Badge */}
                    <td className="py-4">
                      <PlanBadge plan={usr.subscriptionPlan} />
                    </td>

                    {/* Status Badge */}
                    <td className="py-4">
                      <StatusBadge suspended={usr.isSuspended} />
                    </td>

                    {/* Registriert */}
                    <td className="py-4 hidden sm:table-cell text-slate-500 text-xs">
                      {new Date(usr.createdAt).toLocaleDateString('de-DE')}
                    </td>

                    {/* Aktionen */}
                    <td className="py-4 text-right pr-2">
                      <div className="flex items-center justify-end gap-2">
                        {/* Plan ändern */}
                        <select
                          className="text-xs bg-white border border-slate-200 text-slate-600 rounded-lg px-2 py-1.5 cursor-pointer hover:border-slate-300 focus:ring-2 focus:ring-[#800040]/10 outline-none"
                          defaultValue=""
                          onChange={(e) => {
                            if (e.target.value) {
                              handlePlanChange(usr, e.target.value);
                              e.target.value = '';
                            }
                          }}
                        >
                          <option value="" disabled>Plan</option>
                          <option value="FREE_TRIAL">FREE</option>
                          <option value="PRO">PRO</option>
                        </select>

                        {/* Trial verlängern */}
                        <select
                          className="text-xs bg-white border border-slate-200 text-slate-600 rounded-lg px-2 py-1.5 cursor-pointer hover:border-slate-300 focus:ring-2 focus:ring-[#800040]/10 outline-none w-20"
                          defaultValue=""
                          onChange={(e) => {
                            if (e.target.value) {
                              handleTrialExtend(usr, parseInt(e.target.value));
                              e.target.value = '';
                            }
                          }}
                        >
                          <option value="" disabled>Trial+</option>
                          <option value="7">+7 d</option>
                          <option value="14">+14 d</option>
                          <option value="30">+30 d</option>
                        </select>

                        <div className="h-4 w-px bg-slate-200 mx-1"></div>

                        {/* Suspend toggle */}
                        <button
                          onClick={() => handleToggleSuspend(usr)}
                          className={`p-1.5 rounded-lg transition-all ${usr.isSuspended
                              ? 'text-emerald-600 hover:bg-emerald-50'
                              : 'text-amber-500 hover:bg-amber-50'
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
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
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
                    <td colSpan={5} className="py-12 text-center text-slate-500 text-sm">
                      <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                      <p>Keine User gefunden.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {u && u.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-400 font-medium">
              Seite {u.page} von {u.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-[#800040] hover:border-[#800040] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= u.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-[#800040] hover:border-[#800040] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </SpotlightCard>
    </div>
  );
}
