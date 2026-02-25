'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  useProjects,
  useProject,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  useProjectProfitability,
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
import { motion, AnimatePresence } from 'framer-motion';
import PixelBlast from '@/components/landing/PixelBlast';
import StarBorder from '@/components/ui/StarBorder';
import SpotlightCard from '@/components/ui/SpotlightCard';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

// ─── Status config (single source of truth) ───────────────────────────────────

const STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string; dot: string; Icon: any }> = {
  [ProjectStatus.PLANNING]: { label: 'Planung', color: 'bg-blue-50 text-blue-700 border-blue-100', dot: 'bg-blue-500', Icon: Lightbulb },
  [ProjectStatus.ACTIVE]: { label: 'Aktiv', color: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-500', Icon: Clock },
  [ProjectStatus.ON_HOLD]: { label: 'Pausiert', color: 'bg-amber-50 text-amber-700 border-amber-100', dot: 'bg-amber-500', Icon: Pause },
  [ProjectStatus.COMPLETED]: { label: 'Erledigt', color: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400', Icon: CheckCircle2 },
  [ProjectStatus.CANCELLED]: { label: 'Abgebrochen', color: 'bg-red-50 text-red-700 border-red-100', dot: 'bg-red-500', Icon: XCircle },
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

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { type: 'spring' as const, stiffness: 320, damping: 26, delay },
  };
}

// ─── Profitability badge ──────────────────────────────────────────────────────

function ProfitabilityBadge({ projectId }: { projectId: string }) {
  const { data, isLoading } = useProjectProfitability(projectId);
  if (isLoading || !data) return null;

  const colors: Record<string, string> = {
    GREEN: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    YELLOW: 'bg-amber-50 text-amber-700 border-amber-200',
    RED: 'bg-red-50 text-red-700 border-red-200',
  };
  const dots: Record<string, string> = {
    GREEN: 'bg-emerald-500', YELLOW: 'bg-amber-400', RED: 'bg-red-500',
  };
  const color = colors[data.riskLevel] ?? colors.YELLOW;
  const dot = dots[data.riskLevel] ?? dots.YELLOW;

  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-bold', color)}>
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dot)} />
      {data.hourlyRateReal > 0 ? `${Math.round(data.hourlyRateReal)} €/Std.` : 'n/a'}
    </span>
  );
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
              <span className={cn('w-2 h-2 rounded-full shrink-0', cfg.dot)} />
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

  // Stats
  const allProjects = projects ?? [];
  const activeCount = allProjects.filter(p => p.status === ProjectStatus.ACTIVE).length;
  const planningCount = allProjects.filter(p => p.status === ProjectStatus.PLANNING).length;
  const completedCount = allProjects.filter(p => p.status === ProjectStatus.COMPLETED).length;
  const totalBudget = allProjects.reduce((s, p) => s + (p.budget ?? 0), 0);

  const statTiles = [
    { label: 'Projekte', value: `${allProjects.length}`, icon: Folder, color: 'text-[#800040]', bg: 'bg-[#800040]/5', border: 'border-[#800040]/10' },
    { label: 'Aktiv', value: `${activeCount}`, icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { label: 'Planung', value: `${planningCount}`, icon: Lightbulb, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { label: 'Abgeschlossen', value: `${completedCount}`, icon: CheckCircle2, color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200' },
  ];

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
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#800040]/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/4 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-20">
          <PixelBlast variant="square" pixelSize={5} color="#800040" patternScale={5} patternDensity={0.4} pixelSizeJitter={0.5} enableRipples rippleSpeed={0.2} rippleThickness={0.08} speed={0.15} transparent />
        </div>
        <div className="absolute inset-0 bg-linear-to-br from-slate-50 via-white/80 to-slate-50/50" />
      </div>

      <div className="space-y-6">
        {/* Header */}
        <motion.div {...fadeUp(0)} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-[#800040] to-[#E60045] p-[1.5px] shadow-lg shadow-rose-900/10">
                <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                  <Folder className="w-4 h-4 text-[#800040]" />
                </div>
              </div>
              <h1 className="text-2xl font-black tracking-tighter text-slate-900 uppercase italic">Projekte</h1>
            </div>
            <p className="text-slate-500 text-sm mt-0.5">Behalte den Überblick über deine aktuellen Vorhaben</p>
          </div>
          <StarBorder onClick={() => setShowForm(!showForm)} color={showForm ? '#94a3b8' : '#ff3366'} speed="4s" thickness={2}>
            <div className={cn(
              'px-5 h-11 flex items-center gap-2 rounded-full transition-all font-black text-[11px] uppercase tracking-widest shadow-lg',
              showForm
                ? 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-slate-200/20'
                : 'bg-[#800040] hover:bg-[#600030] text-white shadow-rose-900/20'
            )}>
              {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{showForm ? 'Abbrechen' : 'Neues Projekt'}</span>
            </div>
          </StarBorder>
        </motion.div>

        {/* Stats tiles */}
        {allProjects.length > 0 && (
          <motion.div {...fadeUp(0.05)} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {statTiles.map((tile, i) => (
              <motion.div key={tile.label} {...fadeUp(i * 0.04)} className={cn('flex items-center gap-3 p-4 rounded-2xl border', tile.bg, tile.border)}>
                <div className={cn('p-2 rounded-xl bg-white/80 shrink-0', tile.color)}>
                  <tile.icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 truncate">{tile.label}</p>
                  <p className="font-black text-slate-900 tabular-nums truncate">{tile.value}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Create form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            >
              <SpotlightCard className="bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-[1.8rem] p-8 shadow-xl" spotlightColor="rgba(128,0,64,0.08)">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-[#800040] to-[#E60045] p-[1.5px] shadow-lg shadow-rose-900/10">
                    <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-[#800040]" />
                    </div>
                  </div>
                  <h2 className="text-xl font-black text-slate-900 uppercase italic tracking-tight">Neues Projekt starten</h2>
                </div>
                <ProjectForm onSubmit={handleCreate} loading={createProject.isPending} />
              </SpotlightCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters */}
        <motion.div {...fadeUp(0.1)} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#800040] transition-colors" />
            <input
              type="text"
              placeholder="Projektname oder Beschreibung suchen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 h-11 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#800040]/10 focus:border-[#800040] transition-all shadow-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-5 h-11 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl text-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#800040]/10 focus:border-[#800040] transition-all shadow-sm min-w-[160px]"
          >
            <option value="">Alle Status</option>
            {Object.entries(STATUS_CONFIG).map(([val, { label }]) => <option key={val} value={val}>{label}</option>)}
          </select>
          <select
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
            className="px-5 h-11 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl text-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#800040]/10 focus:border-[#800040] transition-all shadow-sm min-w-[180px]"
          >
            <option value="">Alle Kunden</option>
            {customers?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </motion.div>

        {/* Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 border-4 border-[#800040]/10 rounded-full" />
              <div className="absolute inset-0 border-4 border-t-[#800040] rounded-full animate-spin" />
            </div>
            <p className="text-slate-500 text-sm font-black uppercase tracking-widest animate-pulse">Projekte werden geladen...</p>
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.04, 0.3), duration: 0.2 }}
              >
                <SpotlightCard
                  onClick={() => openDrawer(project.id)}
                  className={cn(
                    'bg-white/95 backdrop-blur-xl border rounded-[1.8rem] p-6 hover:shadow-lg transition-all group flex flex-col cursor-pointer h-full',
                    selectedId === project.id
                      ? 'border-[#800040]/40 ring-2 ring-[#800040]/10 shadow-md'
                      : 'border-slate-200/80 shadow-sm',
                  )}
                  spotlightColor="rgba(128, 0, 64, 0.05)"
                >
                  {/* Card top row: status picker + profitability badge + delete */}
                  <div className="flex items-center justify-between mb-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusPicker
                        status={project.status}
                        onSelect={(s) => handleStatusChange(project.id, s)}
                        loading={updateProject.isPending && updateProject.variables?.id === project.id}
                      />
                      <ProfitabilityBadge projectId={project.id} />
                    </div>
                    <button
                      onClick={(e) => handleDelete(project.id, e)}
                      className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                      title="Löschen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Card body — clicking opens drawer */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-[#800040]/5 group-hover:text-[#800040] transition-colors shrink-0">
                        <Folder className="w-5 h-5" />
                      </div>
                      <h3 className="text-sm font-black text-slate-900 group-hover:text-[#800040] transition-colors leading-tight pt-0.5 uppercase tracking-tight">
                        {project.name}
                      </h3>
                    </div>

                    {project.description && (
                      <p className="text-sm text-slate-500 line-clamp-2 mb-4 ml-[52px] leading-relaxed">{project.description}</p>
                    )}

                    <div className="space-y-2 ml-[52px]">
                      {project.customer && (
                        <div className="flex items-center gap-2 text-slate-500">
                          <Users className="w-3.5 h-3.5 shrink-0" />
                          <span className="text-sm truncate">{project.customer.name}</span>
                        </div>
                      )}
                      {project.budget && (
                        <div className="flex items-center gap-2 text-slate-500">
                          <DollarSign className="w-3.5 h-3.5 shrink-0" />
                          <span className="text-sm font-black text-slate-700 tabular-nums">{fmt(project.budget)}</span>
                        </div>
                      )}
                      {(project.startDate || project.endDate) && (
                        <div className="flex items-center gap-2 text-slate-500">
                          <Calendar className="w-3.5 h-3.5 shrink-0" />
                          <span className="text-sm">
                            {project.startDate && fmtDate(project.startDate)}
                            {project.startDate && project.endDate && ' – '}
                            {project.endDate && fmtDate(project.endDate)}
                          </span>
                        </div>
                      )}
                      {project._count && project._count.invoices > 0 && (
                        <div className="flex items-center gap-2 text-slate-500">
                          <FileText className="w-3.5 h-3.5 shrink-0" />
                          <span className="text-sm">{project._count.invoices} Rechnung{project._count.invoices !== 1 ? 'en' : ''}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Subtle click hint */}
                  <p className="mt-4 text-[10px] text-slate-300 group-hover:text-[#800040]/50 transition-colors text-right font-black uppercase tracking-widest">
                    Details anzeigen →
                  </p>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div {...fadeUp(0.15)}>
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mb-5 border-2 border-dashed border-slate-200">
                <Folder className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-black uppercase italic tracking-tight text-slate-900">Keine Projekte gefunden</h3>
              <p className="text-slate-500 mt-2 text-sm max-w-xs mx-auto">
                {search || statusFilter ? 'Passe deine Filter an oder suche nach einem anderen Projekt.' : 'Erstelle dein erstes Projekt, um deine Arbeit professionell zu organisieren.'}
              </p>
              {!search && !statusFilter && (
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-6 px-6 h-10 bg-[#800040] hover:bg-[#600030] text-white rounded-full transition-all font-black text-[11px] uppercase tracking-widest shadow-lg shadow-rose-900/20"
                >
                  Erstes Projekt erstellen
                </button>
              )}
            </div>
          </motion.div>
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
                <div className="p-2 bg-[#800040]/10 rounded-xl shrink-0">
                  <Folder className="w-5 h-5 text-[#800040]" />
                </div>
                <span className="font-black text-slate-900 text-base uppercase tracking-tight truncate">
                  {detailLoading ? 'Laden…' : (selectedProject?.name ?? '—')}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!isEditing && selectedProject && (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-[#800040] hover:bg-[#600030] text-white rounded-full text-xs font-black uppercase tracking-widest transition-colors"
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
                  <button onClick={() => setIsEditing(false)} className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-black uppercase tracking-widest transition-colors">
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
                    'flex items-center gap-1.5 px-1 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-colors mr-6',
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
                    'flex items-center gap-1.5 px-1 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-colors',
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
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-sm font-bold text-slate-900">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
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
  const router = useRouter();
  const stats = project.stats;

  return (
    <div className="p-6 space-y-7">

      {/* Status + created */}
      <div className="flex items-center justify-between">
        <StatusPicker status={project.status} onSelect={onStatusChange} loading={statusLoading} />
        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Erstellt {fmtDate(project.createdAt)}</span>
      </div>

      {/* Basic info tiles */}
      <div className="grid grid-cols-2 gap-3">
        {project.customer && (
          <button
            onClick={() => router.push(`/customers?id=${project.customer!.id}`)}
            className="text-left hover:ring-2 hover:ring-[#800040]/20 rounded-xl transition-all group/tile"
            title="Zum Kunden"
          >
            <InfoTile
              icon={<Users className="w-3.5 h-3.5" />}
              label="Kunde  →"
              value={project.customer.name}
              sub={project.customer.company ?? undefined}
            />
          </button>
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
            <button
              onClick={() => router.push(`/time-tracking?projectId=${project.id}`)}
              className="bg-linear-to-br from-blue-50 to-blue-50/50 border border-blue-100 rounded-xl p-3.5 text-left hover:border-blue-300 hover:shadow-sm transition-all group/tile"
              title="Zur Zeiterfassung"
            >
              <div className="flex items-center gap-1.5 text-blue-400 mb-1.5">
                <Timer className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-widest">Gearbeitet</span>
                <Link2 className="w-3 h-3 ml-auto opacity-0 group-hover/tile:opacity-100 transition-opacity" />
              </div>
              <p className="text-lg font-black text-blue-900">
                {stats.totalHours.toFixed(1)} <span className="text-sm font-black text-blue-500">Std.</span>
              </p>
            </button>

            {/* Effective hourly rate (budget ÷ hours) */}
            <div className="bg-linear-to-br from-purple-50 to-purple-50/50 border border-purple-100 rounded-xl p-3.5">
              <div className="flex items-center gap-1.5 text-purple-400 mb-1.5">
                <Euro className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-widest">Eff. Stundensatz</span>
              </div>
              {stats.effectiveHourlyRate != null ? (
                <p className="text-lg font-black text-purple-900">
                  {fmt(stats.effectiveHourlyRate)}<span className="text-sm font-black text-purple-500">/Std.</span>
                </p>
              ) : (
                <p className="text-sm text-purple-400 italic mt-1">Kein Budget</p>
              )}
            </div>

            {/* Billed / invoiced */}
            <div className="bg-linear-to-br from-emerald-50 to-emerald-50/50 border border-emerald-100 rounded-xl p-3.5">
              <div className="flex items-center gap-1.5 text-emerald-400 mb-1.5">
                <Receipt className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-widest">Fakturiert</span>
              </div>
              <p className="text-lg font-black text-emerald-900">{fmt(stats.totalInvoiced)}</p>
              {stats.totalPaid > 0 && stats.totalPaid < stats.totalInvoiced && (
                <p className="text-xs text-emerald-600 mt-0.5">{fmt(stats.totalPaid)} bezahlt</p>
              )}
              {stats.billedHourlyRate != null && (
                <p className="text-xs text-emerald-500 mt-0.5">{fmt(stats.billedHourlyRate)}/Std.</p>
              )}
            </div>

            {/* Budget utilization */}
            <div className="bg-linear-to-br from-amber-50 to-amber-50/50 border border-amber-100 rounded-xl p-3.5">
              <div className="flex items-center gap-1.5 text-amber-400 mb-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-widest">Budget-Nutzung</span>
              </div>
              {stats.budgetUsedPct != null ? (
                <>
                  <p className="text-lg font-black text-amber-900">{stats.budgetUsedPct}%</p>
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
                <button
                  key={apt.id}
                  onClick={() => router.push(`/appointments?projectId=${project.id}&date=${start.toISOString().split('T')[0]}`)}
                  className="w-full flex items-start gap-3 bg-slate-50 border border-slate-100 rounded-xl p-3 hover:border-[#800040]/30 hover:bg-[#800040]/5 transition-all text-left group"
                  title="Zum Kalender"
                >
                  <div className="shrink-0 w-10 text-center">
                    <p className="text-xs font-black text-[#800040] uppercase">
                      {start.toLocaleDateString('de-DE', { month: 'short' })}
                    </p>
                    <p className="text-xl font-black text-slate-900 leading-tight">{start.getDate()}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-slate-900 truncate group-hover:text-[#800040] transition-colors uppercase tracking-tight">{apt.title}</p>
                    <p className="text-xs text-slate-500">
                      {start.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} – {end.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr
                    </p>
                    {apt.contactName && <p className="text-xs text-slate-400 mt-0.5">{apt.contactName}</p>}
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-1" onClick={(e) => e.stopPropagation()}>
                    <span className={cn('text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest', diffDays <= 1 ? 'bg-red-50 text-red-600' : diffDays <= 7 ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600')}>
                      {diffDays === 0 ? 'Heute' : diffDays === 1 ? 'Morgen' : `in ${diffDays} ${diffDays === 1 ? 'Tag' : 'Tage'}`}
                    </span>
                    {apt.meetingLink && (
                      <a href={apt.meetingLink} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                        className="p-1 text-slate-400 hover:text-blue-500 transition-colors" title="Meeting-Link">
                        <Video className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </button>
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
              <button
                key={q.id}
                onClick={() => router.push(`/quotes?projectId=${project.id}`)}
                className="w-full flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl p-3 hover:border-[#800040]/30 hover:bg-[#800040]/5 transition-all text-left group"
                title="Zu den Angeboten"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-black text-slate-900 truncate group-hover:text-[#800040] transition-colors uppercase tracking-tight">
                      {q.quoteNumber ?? 'Angebot'}
                    </p>
                    <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0', QUOTE_STATUS_COLORS[q.status as QuoteStatus])}>
                      {QUOTE_STATUS_LABELS[q.status as QuoteStatus]}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{q.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <p className="text-sm font-black text-slate-900 tabular-nums">{fmt(q.amount)}</p>
                  <Link2 className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#800040] transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </Section>
      )}

      {/* Invoices */}
      {project.invoices && project.invoices.length > 0 && (
        <Section icon={<Receipt className="w-3.5 h-3.5" />} title="Rechnungen">
          <div className="space-y-2">
            {project.invoices.map((inv) => (
              <button
                key={inv.id}
                onClick={() => router.push(`/invoices?projectId=${project.id}`)}
                className="w-full flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl p-3 hover:border-[#800040]/30 hover:bg-[#800040]/5 transition-all text-left group"
                title="Zu den Rechnungen"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-black text-slate-900 group-hover:text-[#800040] transition-colors uppercase tracking-tight">
                      {inv.invoiceNumber ?? 'Rechnung'}
                    </p>
                    <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0', INVOICE_STATUS_COLORS[inv.status])}>
                      {INVOICE_STATUS_LABELS[inv.status]}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Fällig: {fmtDate(inv.dueDate)}</p>
                </div>
                <div className="text-right shrink-0 flex items-center gap-2">
                  <div>
                    <p className="text-sm font-black text-slate-900 tabular-nums">{fmt(inv.amount)}</p>
                    {inv.totalPaid != null && inv.totalPaid > 0 && inv.totalPaid < inv.amount && (
                      <p className="text-xs text-emerald-600">{fmt(inv.totalPaid)} bez.</p>
                    )}
                  </div>
                  <Link2 className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#800040] transition-colors" />
                </div>
              </button>
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
