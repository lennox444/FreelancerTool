'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  useProjects,
  useProject,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
} from '@/lib/hooks/useProjects';
import { useCustomers } from '@/lib/hooks/useCustomers';
import { Project, ProjectStatus, InvoiceStatus, QuoteStatus } from '@/lib/types';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { ProfitAnalysisTab } from '@/components/projects/ProfitAnalysisTab';
import {
  Folder, Search, Trash2, Calendar, DollarSign, FileText, Users, Plus, X,
  TrendingUp, Edit2, StickyNote, Receipt, Lightbulb, Clock, Pause,
  CheckCircle2, XCircle, ChevronDown, Timer, BarChart2, Video, Link2,
  ClipboardList, Euro, LineChart,
} from 'lucide-react';
import PixelBlast from '@/components/landing/PixelBlast';
import StarBorder from '@/components/ui/StarBorder';
import SpotlightCard from '@/components/ui/SpotlightCard';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

// ─── Status config (single source of truth) ───────────────────────────────────

const STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string; dot: string; Icon: any }> = {
  [ProjectStatus.PLANNING]:  { label: 'Planung',      color: 'bg-blue-50 text-blue-700 border-blue-100',    dot: 'bg-blue-500',    Icon: Lightbulb    },
  [ProjectStatus.ACTIVE]:    { label: 'Aktiv',        color: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-500', Icon: Clock        },
  [ProjectStatus.ON_HOLD]:   { label: 'Pausiert',     color: 'bg-amber-50 text-amber-700 border-amber-100',  dot: 'bg-amber-500',   Icon: Pause        },
  [ProjectStatus.COMPLETED]: { label: 'Erledigt',     color: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400',   Icon: CheckCircle2 },
  [ProjectStatus.CANCELLED]: { label: 'Abgebrochen',  color: 'bg-red-50 text-red-700 border-red-100',       dot: 'bg-red-500',     Icon: XCircle      },
};

const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-600',
  SENT: 'bg-blue-50 text-blue-700',
  PARTIALLY_PAID: 'bg-amber-50 text-amber-700',
  PAID: 'bg-emerald-50 text-emerald-700',
  OVERDUE: 'bg-red-50 text-red-700',
};
const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  DRAFT: 'Entwurf', SENT: 'Gesendet', PARTIALLY_PAID: 'Teilzahlung', PAID: 'Bezahlt', OVERDUE: 'Überfällig',
};

function fmt(n: number) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n);
}
function fmtDate(s: string) {
  return new Intl.DateTimeFormat('de-DE').format(new Date(s));
}

// ─── Status badge (display only) ─────────────────────────────────────────────

function StatusBadge({ status }: { status: ProjectStatus }) {
  const { label, color, Icon } = STATUS_CONFIG[status];
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-bold uppercase tracking-wide', color)}>
      <Icon className="w-3 h-3" /> {label}
    </span>
  );
}

// ─── Status quick-picker ──────────────────────────────────────────────────────

function StatusPicker({
  status,
  onSelect,
  loading,
}: {
  status: ProjectStatus;
  onSelect: (s: ProjectStatus) => void;
  loading: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const { label, color, Icon } = STATUS_CONFIG[status];

  return (
    <div ref={ref} className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={loading}
        title="Status ändern"
        className={cn(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-bold uppercase tracking-wide transition-all',
          color,
          'hover:opacity-80 hover:shadow-sm',
          loading && 'opacity-50 cursor-wait',
        )}
      >
        <Icon className="w-3 h-3" />
        {label}
        <ChevronDown className={cn('w-2.5 h-2.5 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1.5 z-50 bg-white border border-slate-200 rounded-xl shadow-xl py-1 min-w-[160px]">
          {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
            <button
              key={val}
              onClick={() => { onSelect(val as ProjectStatus); setOpen(false); }}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors text-left',
                val === status ? 'bg-slate-50 text-slate-400 cursor-default' : 'text-slate-700 hover:bg-slate-50',
              )}
            >
              <span className={cn('w-2 h-2 rounded-full flex-shrink-0', cfg.dot)} />
              {cfg.label}
              {val === status && <span className="ml-auto text-[10px] text-slate-400">Aktuell</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ProjectsPage() {
  const searchParams = useSearchParams();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | ''>('');
  const [customerFilter, setCustomerFilter] = useState('');

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [drawerTab, setDrawerTab] = useState<'overview' | 'profit'>('overview');

  useEffect(() => {
    const p = searchParams.get('status');
    if (p && Object.values(ProjectStatus).includes(p as ProjectStatus)) setStatusFilter(p as ProjectStatus);
  }, [searchParams]);

  const { data: customers } = useCustomers();
  const { data: projects, isLoading } = useProjects({ search, status: statusFilter || undefined, customerId: customerFilter || undefined });
  const { data: selectedProject, isLoading: detailLoading } = useProject(selectedId ?? '');

  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const openDrawer = (id: string) => { setSelectedId(id); setIsEditing(false); setDrawerTab('overview'); };
  const closeDrawer = () => { setSelectedId(null); setIsEditing(false); setDrawerTab('overview'); };

  const handleCreate = async (data: any) => {
    try { await createProject.mutateAsync(data); setShowForm(false); } catch { /* handled */ }
  };

  const handleUpdate = async (data: any) => {
    if (!selectedId) return;
    try { await updateProject.mutateAsync({ id: selectedId, data }); setIsEditing(false); } catch { /* handled */ }
  };

  const handleStatusChange = async (id: string, status: ProjectStatus) => {
    try { await updateProject.mutateAsync({ id, data: { status } }); } catch { /* handled */ }
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!confirm('Möchten Sie dieses Projekt wirklich löschen?')) return;
    try {
      await deleteProject.mutateAsync(id);
      if (selectedId === id) closeDrawer();
      toast.success('Projekt gelöscht');
    } catch { toast.error('Fehler beim Löschen'); }
  };

  return (
    <div className="relative isolate min-h-full p-4 md:p-6">
      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-slate-50/50">
        <div className="absolute inset-0 w-full h-full opacity-[0.03]">
          <PixelBlast variant="square" pixelSize={6} color="#800040" patternScale={4} patternDensity={0.5} pixelSizeJitter={0.5} speed={0.2} transparent />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(128,0,64,0.05)_0%,transparent_50%)] pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 items-center justify-center text-[#800040]">
              <Folder className="w-7 h-7" />
            </div>
            <div className="h-12 w-px bg-slate-200 hidden sm:block mx-1" />
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Projekte</h1>
              <p className="text-slate-500 font-medium">Behalte den Überblick über deine aktuellen Vorhaben</p>
            </div>
          </div>
          <StarBorder onClick={() => setShowForm(!showForm)} className="rounded-full group" color={showForm ? '#94a3b8' : '#ff3366'} speed="4s" thickness={3}>
            <div className={cn('px-6 h-12 flex items-center justify-center rounded-full transition-all font-semibold text-sm shadow-lg gap-2',
              showForm ? 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-slate-200/20' : 'bg-[#800040] hover:bg-[#600030] text-white shadow-pink-900/20')}>
              {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              <span>{showForm ? 'Abbrechen' : 'Neues Projekt'}</span>
            </div>
          </StarBorder>
        </div>

        {/* Create form */}
        {showForm && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300">
            <SpotlightCard className="p-8 bg-white/90 backdrop-blur-md border border-slate-100 shadow-xl rounded-[2rem]" spotlightColor="rgba(128,0,64,0.08)">
              <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-[#800040]" /> Neues Projekt starten
              </h2>
              <ProjectForm onSubmit={handleCreate} loading={createProject.isPending} />
            </SpotlightCard>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#800040] transition-colors" />
            <input type="text" placeholder="Projektname oder Beschreibung suchen..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 h-12 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#800040]/10 focus:border-[#800040] transition-all shadow-sm" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-6 h-12 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#800040]/10 focus:border-[#800040] transition-all shadow-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2364748b%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25em_1.25em] bg-[right_1rem_center] bg-no-repeat pr-12">
            <option value="">Alle Status</option>
            {Object.entries(STATUS_CONFIG).map(([val, { label }]) => <option key={val} value={val}>{label}</option>)}
          </select>
          <select value={customerFilter} onChange={(e) => setCustomerFilter(e.target.value)}
            className="px-6 h-12 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#800040]/10 focus:border-[#800040] transition-all shadow-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2364748b%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25em_1.25em] bg-[right_1rem_center] bg-no-repeat pr-12 min-w-[200px]">
            <option value="">Alle Kunden</option>
            {customers?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-[#800040]/10 rounded-full" />
              <div className="absolute inset-0 border-4 border-t-[#800040] rounded-full animate-spin" />
            </div>
            <p className="text-slate-500 font-medium animate-pulse">Projekte werden geladen...</p>
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <SpotlightCard
                key={project.id}
                onClick={() => openDrawer(project.id)}
                className={cn(
                  'bg-white/90 backdrop-blur-md border shadow-sm p-6 rounded-2xl hover:shadow-md transition-all group flex flex-col cursor-pointer',
                  selectedId === project.id ? 'border-[#800040]/40 ring-2 ring-[#800040]/10' : 'border-slate-100 hover:border-slate-200',
                )}
                spotlightColor="rgba(128, 0, 64, 0.05)"
              >
                {/* Card top row: status picker + delete */}
                <div className="flex items-center justify-between mb-4" onClick={(e) => e.stopPropagation()}>
                  <StatusPicker
                    status={project.status}
                    onSelect={(s) => handleStatusChange(project.id, s)}
                    loading={updateProject.isPending && updateProject.variables?.id === project.id}
                  />
                  <button
                    onClick={(e) => handleDelete(project.id, e)}
                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    title="Löschen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Card body — clicking opens drawer */}
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-[#800040]/5 group-hover:text-[#800040] transition-colors flex-shrink-0">
                      <Folder className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-[#800040] transition-colors leading-tight pt-0.5">
                      {project.name}
                    </h3>
                  </div>

                  {project.description && (
                    <p className="text-sm text-slate-500 line-clamp-2 mb-4 ml-[52px]">{project.description}</p>
                  )}

                  <div className="space-y-2 ml-[52px]">
                    {project.customer && (
                      <div className="flex items-center gap-2 text-slate-500">
                        <Users className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="text-sm truncate">{project.customer.name}</span>
                      </div>
                    )}
                    {project.budget && (
                      <div className="flex items-center gap-2 text-slate-500">
                        <DollarSign className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="text-sm font-semibold text-slate-700">{fmt(project.budget)}</span>
                      </div>
                    )}
                    {(project.startDate || project.endDate) && (
                      <div className="flex items-center gap-2 text-slate-500">
                        <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="text-sm">
                          {project.startDate && fmtDate(project.startDate)}
                          {project.startDate && project.endDate && ' – '}
                          {project.endDate && fmtDate(project.endDate)}
                        </span>
                      </div>
                    )}
                    {project._count && project._count.invoices > 0 && (
                      <div className="flex items-center gap-2 text-slate-500">
                        <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="text-sm">{project._count.invoices} Rechnung{project._count.invoices !== 1 ? 'en' : ''}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Subtle click hint */}
                <p className="mt-4 text-xs text-slate-300 group-hover:text-[#800040]/50 transition-colors text-right font-medium">
                  Klicken zum Bearbeiten →
                </p>
              </SpotlightCard>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-[2rem] border border-slate-100 border-dashed">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
              <Folder className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Keine Projekte gefunden</h3>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">
              {search || statusFilter ? 'Passe deine Filter an oder suche nach einem anderen Projekt.' : 'Erstelle dein erstes Projekt, um deine Arbeit professionell zu organisieren.'}
            </p>
            {!search && !statusFilter && (
              <button onClick={() => setShowForm(true)} className="px-8 h-12 bg-[#800040] hover:bg-[#600030] text-white rounded-full transition-all font-semibold text-sm shadow-lg shadow-pink-900/20">
                Erstes Projekt erstellen
              </button>
            )}
          </div>
        )}
      </div>

      {/* ─── Detail / Edit Drawer ────────────────────────────────────────────── */}
      {selectedId && (
        <>
          <div className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm" onClick={closeDrawer} />

          <div className="fixed right-0 top-0 h-full w-full max-w-xl z-50 bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">

            {/* Drawer header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-[#800040]/10 rounded-xl flex-shrink-0">
                  <Folder className="w-5 h-5 text-[#800040]" />
                </div>
                <span className="font-bold text-slate-900 text-lg truncate">
                  {detailLoading ? 'Laden…' : (selectedProject?.name ?? '—')}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {!isEditing && selectedProject && (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-[#800040] hover:bg-[#600030] text-white rounded-full text-sm font-semibold transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Bearbeiten
                    </button>
                    <button
                      onClick={(e) => handleDelete(selectedProject.id, e)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      title="Löschen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
                {isEditing && (
                  <button onClick={() => setIsEditing(false)} className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-sm font-semibold transition-colors">
                    <X className="w-3.5 h-3.5" /> Abbrechen
                  </button>
                )}
                <button onClick={closeDrawer} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tab bar — only visible in view mode */}
            {!isEditing && selectedProject && (
              <div className="flex border-b border-slate-100 px-6">
                <button
                  onClick={() => setDrawerTab('overview')}
                  className={cn(
                    'flex items-center gap-1.5 px-1 py-3 text-sm font-semibold border-b-2 transition-colors mr-6',
                    drawerTab === 'overview'
                      ? 'border-[#800040] text-[#800040]'
                      : 'border-transparent text-slate-400 hover:text-slate-700',
                  )}
                >
                  <Folder className="w-3.5 h-3.5" /> Übersicht
                </button>
                <button
                  onClick={() => setDrawerTab('profit')}
                  className={cn(
                    'flex items-center gap-1.5 px-1 py-3 text-sm font-semibold border-b-2 transition-colors',
                    drawerTab === 'profit'
                      ? 'border-[#800040] text-[#800040]'
                      : 'border-transparent text-slate-400 hover:text-slate-700',
                  )}
                >
                  <LineChart className="w-3.5 h-3.5" /> Profit-Analyse
                </button>
              </div>
            )}

            {/* Drawer body */}
            <div className="flex-1 overflow-y-auto">
              {detailLoading ? (
                <div className="flex justify-center py-20">
                  <div className="w-10 h-10 border-4 border-[#800040]/20 border-t-[#800040] rounded-full animate-spin" />
                </div>
              ) : !selectedProject ? null : isEditing ? (
                <div className="p-6">
                  <ProjectForm initialData={selectedProject} onSubmit={handleUpdate} loading={updateProject.isPending} />
                </div>
              ) : drawerTab === 'profit' ? (
                <ProfitAnalysisTab projectId={selectedProject.id} />
              ) : (
                <ProjectDetail
                  project={selectedProject}
                  onStatusChange={(s) => handleStatusChange(selectedProject.id, s)}
                  statusLoading={updateProject.isPending}
                />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Helper sub-components ────────────────────────────────────────────────────

function InfoTile({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
      <div className="flex items-center gap-1.5 text-slate-400 mb-1.5">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-sm font-bold text-slate-900">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
        {icon} {title}
      </h4>
      {children}
    </div>
  );
}

// ─── Quote status helpers ─────────────────────────────────────────────────────

const QUOTE_STATUS_COLORS: Record<QuoteStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-600',
  SENT: 'bg-blue-50 text-blue-700',
  ACCEPTED: 'bg-emerald-50 text-emerald-700',
  REJECTED: 'bg-red-50 text-red-700',
  CONVERTED: 'bg-purple-50 text-purple-700',
};
const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  DRAFT: 'Entwurf', SENT: 'Gesendet', ACCEPTED: 'Angenommen', REJECTED: 'Abgelehnt', CONVERTED: 'Umgewandelt',
};

// ─── ProjectDetail ────────────────────────────────────────────────────────────

function ProjectDetail({
  project,
  onStatusChange,
  statusLoading,
}: {
  project: Project;
  onStatusChange: (s: ProjectStatus) => void;
  statusLoading: boolean;
}) {
  const stats = project.stats;

  return (
    <div className="p-6 space-y-7">

      {/* Status + created */}
      <div className="flex items-center justify-between">
        <StatusPicker status={project.status} onSelect={onStatusChange} loading={statusLoading} />
        <span className="text-xs text-slate-400">Erstellt {fmtDate(project.createdAt)}</span>
      </div>

      {/* Basic info tiles */}
      <div className="grid grid-cols-2 gap-3">
        {project.customer && (
          <InfoTile
            icon={<Users className="w-3.5 h-3.5" />}
            label="Kunde"
            value={project.customer.name}
            sub={project.customer.company ?? undefined}
          />
        )}
        {project.budget != null && (
          <InfoTile
            icon={<Euro className="w-3.5 h-3.5" />}
            label="Budget"
            value={fmt(project.budget)}
          />
        )}
        {project.startDate && (
          <InfoTile
            icon={<Calendar className="w-3.5 h-3.5" />}
            label="Startdatum"
            value={fmtDate(project.startDate)}
          />
        )}
        {project.endDate && (
          <InfoTile
            icon={<Calendar className="w-3.5 h-3.5" />}
            label="Enddatum"
            value={fmtDate(project.endDate)}
          />
        )}
      </div>

      {/* Key metric tiles */}
      {stats && (
        <Section icon={<BarChart2 className="w-3.5 h-3.5" />} title="Kennzahlen">
          <div className="grid grid-cols-2 gap-3">
            {/* Worked hours */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-50/50 border border-blue-100 rounded-xl p-3.5">
              <div className="flex items-center gap-1.5 text-blue-400 mb-1.5">
                <Timer className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold uppercase tracking-wider">Gearbeitet</span>
              </div>
              <p className="text-lg font-bold text-blue-900">
                {stats.totalHours.toFixed(1)} <span className="text-sm font-semibold text-blue-500">Std</span>
              </p>
            </div>

            {/* Effective hourly rate (budget ÷ hours) */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-50/50 border border-purple-100 rounded-xl p-3.5">
              <div className="flex items-center gap-1.5 text-purple-400 mb-1.5">
                <Euro className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold uppercase tracking-wider">Eff. Stundensatz</span>
              </div>
              {stats.effectiveHourlyRate != null ? (
                <p className="text-lg font-bold text-purple-900">
                  {fmt(stats.effectiveHourlyRate)}<span className="text-sm font-semibold text-purple-500">/Std</span>
                </p>
              ) : (
                <p className="text-sm text-purple-400 italic mt-1">Kein Budget</p>
              )}
            </div>

            {/* Billed / invoiced */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-50/50 border border-emerald-100 rounded-xl p-3.5">
              <div className="flex items-center gap-1.5 text-emerald-400 mb-1.5">
                <Receipt className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold uppercase tracking-wider">Fakturiert</span>
              </div>
              <p className="text-lg font-bold text-emerald-900">{fmt(stats.totalInvoiced)}</p>
              {stats.totalPaid > 0 && stats.totalPaid < stats.totalInvoiced && (
                <p className="text-xs text-emerald-600 mt-0.5">{fmt(stats.totalPaid)} bezahlt</p>
              )}
              {stats.billedHourlyRate != null && (
                <p className="text-xs text-emerald-500 mt-0.5">{fmt(stats.billedHourlyRate)}/Std</p>
              )}
            </div>

            {/* Budget utilization */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-50/50 border border-amber-100 rounded-xl p-3.5">
              <div className="flex items-center gap-1.5 text-amber-400 mb-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold uppercase tracking-wider">Budget-Nutzung</span>
              </div>
              {stats.budgetUsedPct != null ? (
                <>
                  <p className="text-lg font-bold text-amber-900">{stats.budgetUsedPct}%</p>
                  <div className="mt-1.5 h-1.5 bg-amber-100 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', stats.budgetUsedPct >= 100 ? 'bg-red-400' : stats.budgetUsedPct >= 75 ? 'bg-amber-400' : 'bg-emerald-400')}
                      style={{ width: `${Math.min(100, stats.budgetUsedPct)}%` }}
                    />
                  </div>
                </>
              ) : (
                <p className="text-sm text-amber-400 italic mt-1">Kein Budget</p>
              )}
            </div>
          </div>
        </Section>
      )}

      {/* Upcoming appointments */}
      {project.appointments && project.appointments.length > 0 && (
        <Section icon={<Calendar className="w-3.5 h-3.5" />} title="Nächste Termine">
          <div className="space-y-2">
            {project.appointments.map((apt) => {
              const start = new Date(apt.startTime);
              const end = new Date(apt.endTime);
              const diffDays = Math.ceil((start.getTime() - Date.now()) / 86400000);
              return (
                <div key={apt.id} className="flex items-start gap-3 bg-slate-50 border border-slate-100 rounded-xl p-3">
                  <div className="flex-shrink-0 w-10 text-center">
                    <p className="text-xs font-bold text-[#800040] uppercase">
                      {start.toLocaleDateString('de-DE', { month: 'short' })}
                    </p>
                    <p className="text-xl font-black text-slate-900 leading-tight">{start.getDate()}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{apt.title}</p>
                    <p className="text-xs text-slate-500">
                      {start.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} – {end.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr
                    </p>
                    {apt.contactName && <p className="text-xs text-slate-400 mt-0.5">{apt.contactName}</p>}
                  </div>
                  <div className="flex-shrink-0 flex flex-col items-end gap-1">
                    <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', diffDays <= 1 ? 'bg-red-50 text-red-600' : diffDays <= 7 ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600')}>
                      {diffDays === 0 ? 'Heute' : diffDays === 1 ? 'Morgen' : `in ${diffDays}d`}
                    </span>
                    {apt.meetingLink && (
                      <a href={apt.meetingLink} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                        className="p-1 text-slate-400 hover:text-blue-500 transition-colors" title="Meeting-Link">
                        <Video className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* Quotes */}
      {project.quotes && project.quotes.length > 0 && (
        <Section icon={<ClipboardList className="w-3.5 h-3.5" />} title="Angebote">
          <div className="space-y-2">
            {project.quotes.map((q) => (
              <div key={q.id} className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl p-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {q.quoteNumber ?? 'Angebot'}
                    </p>
                    <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0', QUOTE_STATUS_COLORS[q.status as QuoteStatus])}>
                      {QUOTE_STATUS_LABELS[q.status as QuoteStatus]}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{q.description}</p>
                </div>
                <p className="text-sm font-bold text-slate-900 flex-shrink-0">{fmt(q.amount)}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Invoices */}
      {project.invoices && project.invoices.length > 0 && (
        <Section icon={<Receipt className="w-3.5 h-3.5" />} title="Rechnungen">
          <div className="space-y-2">
            {project.invoices.map((inv) => (
              <div key={inv.id} className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl p-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">{inv.invoiceNumber ?? 'Rechnung'}</p>
                    <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0', INVOICE_STATUS_COLORS[inv.status])}>
                      {INVOICE_STATUS_LABELS[inv.status]}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Fällig: {fmtDate(inv.dueDate)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-slate-900">{fmt(inv.amount)}</p>
                  {inv.totalPaid != null && inv.totalPaid > 0 && inv.totalPaid < inv.amount && (
                    <p className="text-xs text-emerald-600">{fmt(inv.totalPaid)} bez.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Description */}
      {project.description && (
        <Section icon={<FileText className="w-3.5 h-3.5" />} title="Beschreibung">
          <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 border border-slate-100 rounded-xl p-4 whitespace-pre-wrap">
            {project.description}
          </p>
        </Section>
      )}

      {/* Notes */}
      {project.notes && (
        <Section icon={<StickyNote className="w-3.5 h-3.5" />} title="Notizen">
          <p className="text-sm text-slate-600 leading-relaxed bg-amber-50/50 border border-amber-100 rounded-xl p-4 whitespace-pre-wrap">
            {project.notes}
          </p>
        </Section>
      )}

    </div>
  );
}
