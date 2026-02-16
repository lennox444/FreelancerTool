'use client';

import { useState } from 'react';
import {
  useProjects,
  useCreateProject,
  useDeleteProject,
} from '@/lib/hooks/useProjects';
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
} from 'lucide-react';
import PixelBlast from '@/components/landing/PixelBlast';
import StarBorder from '@/components/ui/StarBorder';
import SpotlightCard from '@/components/ui/SpotlightCard';
import toast from 'react-hot-toast';

export default function ProjectsPage() {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | ''>('');

  const { data: projects, isLoading } = useProjects({
    search,
    status: statusFilter || undefined,
  });
  const createProject = useCreateProject();
  const deleteProject = useDeleteProject();

  const handleCreate = async (data: any) => {
    try {
      await createProject.mutateAsync(data);
      setShowForm(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Möchten Sie dieses Projekt wirklich löschen?')) return;
    await deleteProject.mutateAsync(id);
  };

  return (
    <div className="relative min-h-screen">
      {/* Background Effects */}
      <PixelBlast />
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 pointer-events-none" />

      <div className="relative z-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Projekte
            </h1>
            <p className="text-gray-400 mt-2">
              Verwalte deine Projekte und behalte den Überblick
            </p>
          </div>
          <StarBorder
            onClick={() => setShowForm(!showForm)}
            className="rounded-xl group"
            color={showForm ? "#94a3b8" : "#a855f7"}
            speed="4s"
            thickness={2}
          >
            <div className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl transition-all shadow-lg hover:shadow-purple-500/20 font-medium">
              Neues Projekt
            </div>
          </StarBorder>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="relative group">
            <SpotlightCard
              className="p-6 bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800"
              spotlightColor="rgba(147, 51, 234, 0.2)"
            >
              <h2 className="text-2xl font-bold text-white mb-6">
                Neues Projekt erstellen
              </h2>
              <ProjectForm
                onSubmit={handleCreate}
                loading={createProject.isPending}
              />
            </SpotlightCard>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Projekte durchsuchen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-800 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-3 bg-gray-900/50 border border-gray-800 rounded-xl text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          >
            <option value="">Alle Status</option>
            <option value={ProjectStatus.PLANNING}>Planung</option>
            <option value={ProjectStatus.ACTIVE}>Aktiv</option>
            <option value={ProjectStatus.ON_HOLD}>Pausiert</option>
            <option value={ProjectStatus.COMPLETED}>Abgeschlossen</option>
            <option value={ProjectStatus.CANCELLED}>Abgebrochen</option>
          </select>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="relative group">
                <SpotlightCard
                  className="h-full p-6 bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 hover:border-purple-500/50 transition-all"
                  spotlightColor="rgba(147, 51, 234, 0.15)"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Folder className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-white truncate">
                            {project.name}
                          </h3>
                          <ProjectStatusBadge status={project.status} />
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-400 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Description */}
                    {project.description && (
                      <p className="text-gray-400 text-sm line-clamp-2">
                        {project.description}
                      </p>
                    )}

                    {/* Info */}
                    <div className="space-y-2 pt-2">
                      {project.customer && (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Users className="w-4 h-4" />
                          <span className="truncate">
                            {project.customer.name}
                          </span>
                        </div>
                      )}

                      {project.budget && (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <DollarSign className="w-4 h-4" />
                          <span>€{project.budget.toLocaleString('de-DE')}</span>
                        </div>
                      )}

                      {(project.startDate || project.endDate) && (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {project.startDate &&
                              new Date(project.startDate).toLocaleDateString(
                                'de-DE'
                              )}
                            {project.startDate && project.endDate && ' - '}
                            {project.endDate &&
                              new Date(project.endDate).toLocaleDateString(
                                'de-DE'
                              )}
                          </span>
                        </div>
                      )}

                      {project._count && project._count.invoices > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <FileText className="w-4 h-4" />
                          <span>
                            {project._count.invoices} Rechnung
                            {project._count.invoices !== 1 ? 'en' : ''}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action */}
                    <button className="w-full mt-4 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-lg transition-all font-medium text-sm">
                      Details anzeigen
                    </button>
                  </div>
                </SpotlightCard>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900/50 rounded-full mb-4">
              <Folder className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              Noch keine Projekte
            </h3>
            <p className="text-gray-500 mb-6">
              Erstelle dein erstes Projekt, um loszulegen
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all font-medium"
            >
              Erstes Projekt erstellen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
