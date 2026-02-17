'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  useProjects,
  useCreateProject,
  useDeleteProject,
} from '@/lib/hooks/useProjects';
import { useCustomers } from '@/lib/hooks/useCustomers';
import { ProjectStatus } from '@/lib/types';
import { ProjectStatusBadge } from '@/components/projects/ProjectStatusBadge';
import { ProjectForm } from '@/components/projects/ProjectForm';
import {
  Folder,
  Search,
  Trash2,
  Calendar,
  DollarSign,
  FileText,
  Users,
  Plus,
  X,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import PixelBlast from '@/components/landing/PixelBlast';
import StarBorder from '@/components/ui/StarBorder';
import SpotlightCard from '@/components/ui/SpotlightCard';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ProjectsPage() {
  const searchParams = useSearchParams();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | ''>('');
  const [customerFilter, setCustomerFilter] = useState<string>('');

  // Init filter from URL
  useEffect(() => {
    const statusParam = searchParams.get('status');
    if (statusParam && Object.values(ProjectStatus).includes(statusParam as ProjectStatus)) {
      setStatusFilter(statusParam as ProjectStatus);
    }
  }, [searchParams]);

  const { data: customers } = useCustomers();

  const { data: projects, isLoading } = useProjects({
    search,
    status: statusFilter || undefined,
    customerId: customerFilter || undefined,
  });
  const createProject = useCreateProject();
  const deleteProject = useDeleteProject();

  const handleCreate = async (data: any) => {
    try {
      await createProject.mutateAsync(data);
      setShowForm(false);
      toast.success('Projekt erfolgreich erstellt');
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Möchten Sie dieses Projekt wirklich löschen?')) return;
    try {
      await deleteProject.mutateAsync(id);
      toast.success('Projekt gelöscht');
    } catch (error) {
      toast.error('Fehler beim Löschen');
    }
  };

  return (
    <div className="relative isolate min-h-full p-4 md:p-6">
      {/* Background with specific wine-red theme */}
      <div className="fixed inset-0 -z-10 bg-slate-50/50">
        <div className="absolute inset-0 w-full h-full opacity-[0.03]">
          <PixelBlast
            variant="square"
            pixelSize={6}
            color="#800040"
            patternScale={4}
            patternDensity={0.5}
            pixelSizeJitter={0.5}
            speed={0.2}
            transparent
          />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(128,0,64,0.05)_0%,transparent_50%)] pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 items-center justify-center text-[#800040]">
              <Folder className="w-7 h-7" />
            </div>
            <div className="h-12 w-px bg-slate-200 hidden sm:block mx-1"></div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Projekte</h1>
              <p className="text-slate-500 font-medium">Behalte den Überblick über deine aktuellen Vorhaben</p>
            </div>
          </div>

          <StarBorder onClick={() => setShowForm(!showForm)} className="rounded-full group" color={showForm ? "#94a3b8" : "#ff3366"} speed="4s" thickness={3}>
            <div className={cn(
              "px-6 h-12 flex items-center justify-center rounded-full transition-all font-semibold text-sm shadow-lg gap-2",
              showForm
                ? "bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-slate-200/20"
                : "bg-[#800040] hover:bg-[#600030] text-white shadow-pink-900/20"
            )}>
              {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              <span>{showForm ? 'Abbrechen' : 'Neues Projekt'}</span>
            </div>
          </StarBorder>
        </div>

        {/* Form Section */}
        {showForm && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300">
            <SpotlightCard
              className="p-8 bg-white/90 backdrop-blur-md border border-slate-100 shadow-xl rounded-[2rem]"
              spotlightColor="rgba(128, 0, 64, 0.08)"
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-[#800040]" />
                Neues Projekt starten
              </h2>
              <ProjectForm
                onSubmit={handleCreate}
                loading={createProject.isPending}
              />
            </SpotlightCard>
          </div>
        )}

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#800040] transition-colors" />
            <input
              type="text"
              placeholder="Projektname oder Beschreibung suchen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 h-12 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#800040]/10 focus:border-[#800040] transition-all shadow-sm"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-6 h-12 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#800040]/10 focus:border-[#800040] transition-all shadow-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2364748b%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25em_1.25em] bg-[right_1rem_center] bg-no-repeat pr-12"
          >
            <option value="">Alle Status</option>
            <option value={ProjectStatus.PLANNING}>Planung</option>
            <option value={ProjectStatus.ACTIVE}>Aktiv</option>
            <option value={ProjectStatus.ON_HOLD}>Pausiert</option>
            <option value={ProjectStatus.COMPLETED}>Abgeschlossen</option>
            <option value={ProjectStatus.CANCELLED}>Abgebrochen</option>
          </select>

          <select
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
            className="px-6 h-12 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#800040]/10 focus:border-[#800040] transition-all shadow-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2364748b%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25em_1.25em] bg-[right_1rem_center] bg-no-repeat pr-12 min-w-[200px]"
          >
            <option value="">Alle Kunden</option>
            {customers?.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-[#800040]/10 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-[#800040] rounded-full animate-spin"></div>
            </div>
            <p className="text-slate-500 font-medium animate-pulse">Projekte werden geladen...</p>
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <SpotlightCard
                key={project.id}
                className="bg-white/90 backdrop-blur-md border border-slate-100 shadow-sm p-6 rounded-2xl hover:shadow-md transition-shadow group flex flex-col h-full"
                spotlightColor="rgba(128, 0, 64, 0.05)"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-[#800040]/5 group-hover:text-[#800040] transition-colors">
                    <Folder className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-2">
                    <ProjectStatusBadge status={project.status} />
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Löschen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#800040] transition-colors mb-2">
                    {project.name}
                  </h3>
                  {project.description && (
                    <p className="text-sm text-slate-500 line-clamp-2 mb-6">
                      {project.description}
                    </p>
                  )}

                  <div className="grid grid-cols-1 gap-3 mb-6">
                    {project.customer && (
                      <div className="flex items-center gap-3 text-slate-600">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                          <Users className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium truncate">{project.customer.name}</span>
                      </div>
                    )}
                    {project.budget && (
                      <div className="flex items-center gap-3 text-slate-600">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                          <DollarSign className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-slate-900">€{project.budget.toLocaleString('de-DE')}</span>
                      </div>
                    )}
                    {(project.startDate || project.endDate) && (
                      <div className="flex items-center gap-3 text-slate-600">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium">
                          {project.startDate && new Date(project.startDate).toLocaleDateString('de-DE')}
                          {project.startDate && project.endDate && ' — '}
                          {project.endDate && new Date(project.endDate).toLocaleDateString('de-DE')}
                        </span>
                      </div>
                    )}
                    {project._count && project._count.invoices > 0 && (
                      <div className="flex items-center gap-3 text-slate-600">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                          <FileText className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium">
                          {project._count.invoices} Rechnung{project._count.invoices !== 1 ? 'en' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <button className="w-full h-11 flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition-all font-semibold text-sm group/btn border border-slate-100 mt-2">
                  <span>Details anzeigen</span>
                  <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
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
              {search || statusFilter
                ? 'Passe deine Filter an oder suche nach einem anderen Projekt.'
                : 'Erstelle dein erstes Projekt, um deine Arbeit professionell zu organisieren.'}
            </p>
            {!search && !statusFilter && (
              <button
                onClick={() => setShowForm(true)}
                className="px-8 h-12 bg-[#800040] hover:bg-[#600030] text-white rounded-full transition-all font-semibold text-sm shadow-lg shadow-pink-900/20"
              >
                Erstes Projekt erstellen
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
