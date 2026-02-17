'use client';

import React from 'react';
import Link from 'next/link';
import { useDashboardStats, useDashboardRevenueTrend } from '@/lib/hooks/useDashboard';
import { useProjects } from '@/lib/hooks/useProjects';
import DashboardStatsCard from '@/components/dashboard/widgets/DashboardStatsCard';
import DashboardChart from '@/components/dashboard/widgets/DashboardChart';
import DashboardAppointmentsWidget from '@/components/dashboard/widgets/DashboardAppointmentsWidget';
import PixelBlast from '@/components/landing/PixelBlast';
import StarBorder from '@/components/ui/StarBorder';
import SpotlightCard from '@/components/ui/SpotlightCard';
import { Plus, Users, TrendingUp, Wallet, Briefcase, Files } from 'lucide-react';

export default function DashboardPage() {
  const { data: stats } = useDashboardStats();
  const { data: revenueTrend } = useDashboardRevenueTrend();
  const { data: projects } = useProjects();

  const activeProjectsCount = projects?.filter((p: any) => p.status === 'ACTIVE').length || 0;

  // Prepare chart data - revenue trend returns array of { month: string, revenue: number }
  const chartData = revenueTrend?.map((item: any) => ({
    date: item.month, // month name, e.g. "Jan 2024"
    value: item.revenue || 0
  })) || [];

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

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <div className="hidden md:block w-px h-8 bg-slate-300"></div>
          <p className="text-slate-500 font-medium">Hier ist dein aktueller Überblick.</p>
        </div>

        <div className="flex gap-3">
          <StarBorder as={Link} href="/customers/new" className="rounded-full group" color="#cbd5e1" speed="6s">
            <div className="px-5 h-11 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 flex items-center justify-center rounded-full transition-all font-medium text-sm gap-2 shadow-sm">
              <Users className="w-4 h-4" />
              <span>Neuer Kunde</span>
            </div>
          </StarBorder>
          <StarBorder as={Link} href="/invoices/new" className="rounded-full group" color="#ff3366" speed="3s" thickness={3}>
            <div className="px-5 h-11 bg-[#800040] hover:bg-[#600030] text-white flex items-center justify-center rounded-full transition-all font-semibold text-sm shadow-lg shadow-pink-900/20 gap-2">
              <Plus className="w-4 h-4" />
              <span>Rechnung</span>
            </div>
          </StarBorder>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardStatsCard
          title="Monatsumsatz"
          value={stats?.monthRevenue?.amount ? `${stats.monthRevenue.amount}€` : '0€'}
          trend={{ value: 12, label: 'vs last month', positive: true }} // Mock trend for now
          icon={TrendingUp}
          iconColor="text-emerald-600 bg-emerald-50"
        />
        <DashboardStatsCard
          title="Offene Rechnungen"
          value={stats?.openInvoices?.amount ? `${stats.openInvoices.amount}€` : '0€'}
          description={`${stats?.openInvoices?.count || 0} Rechnungen ausstehend`}
          icon={Files}
          iconColor="text-blue-600 bg-blue-50"
          href="/invoices?status=SENT"
        />
        <DashboardStatsCard
          title="Aktive Projekte"
          value={activeProjectsCount.toString()}
          description="In Bearbeitung"
          icon={Briefcase}
          iconColor="text-indigo-600 bg-indigo-50"
          href="/projects?status=ACTIVE"
        />
        <DashboardStatsCard
          title="Überfällig"
          value={stats?.overdueInvoices?.amount ? `${stats.overdueInvoices.amount}€` : '0€'}
          description={`${stats?.overdueInvoices?.count || 0} Rechnungen überfällig`}
          icon={Wallet}
          iconColor="text-rose-600 bg-rose-50"
          trend={stats?.overdueInvoices?.amount > 0 ? { value: 10, label: 'Achtung', positive: false } : undefined}
          href="/invoices?status=OVERDUE"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
        {/* Chart Section */}
        <div className="lg:col-span-2 h-full">
          <SpotlightCard className="bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm p-6 rounded-3xl h-full flex flex-col" spotlightColor="rgba(128, 0, 64, 0.05)">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Einnahmen</h3>
                <p className="text-sm text-slate-500">Übersicht der letzten Monate</p>
              </div>
              <div className="bg-slate-50 px-3 py-1 rounded-lg text-xs font-semibold text-slate-500">
                Letzte 6 Monate
              </div>
            </div>
            <div className="flex-1 w-full min-h-0">
              <DashboardChart data={chartData} type="area" />
            </div>
          </SpotlightCard>
        </div>

        {/* Appointments Section */}
        <div className="lg:col-span-1 h-full">
          <SpotlightCard className="bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm p-6 rounded-3xl h-full flex flex-col" spotlightColor="rgba(128, 0, 64, 0.05)">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Nächste Termine</h3>
                <p className="text-sm text-slate-500">Kommende Meetings & Events</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto pr-1">
              <DashboardAppointmentsWidget />
            </div>
          </SpotlightCard>
        </div>
      </div>

      {/* Bottom Section - Could be Recent Activity or Projects quick view */}
      {/* For now, keeping it clean with just the above grids based on user request "clean & useful" */}
    </div>
  );
}
