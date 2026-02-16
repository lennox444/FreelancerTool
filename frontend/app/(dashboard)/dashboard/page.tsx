'use client';

import React from 'react';
import DashboardGrid from '@/components/dashboard/DashboardGrid';
import RevenueAreaChart from '@/components/dashboard/charts/RevenueAreaChart';
import InvoiceStatusChart from '@/components/dashboard/charts/InvoiceStatusChart';
import RecentActivityWidget from '@/components/dashboard/widgets/RecentActivityWidget';
import PixelBlast from '@/components/landing/PixelBlast';
import StarBorder from '@/components/ui/StarBorder';
import Link from 'next/link';
import { Plus, ArrowUpRight, TrendingUp, Users } from 'lucide-react';
import SpotlightCard from '@/components/ui/SpotlightCard'; // Used for static stats if needed, or we use new draggable stats

// We'll use a specific component for the QuickStats to be draggable
import QuickStatsWidget from '@/components/dashboard/widgets/QuickStatsWidget';

export default function DashboardPage() {
  const initialWidgets = [
    {
      id: 'revenue-chart',
      colSpan: 2,
      component: (
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Umsatzentwicklung</h3>
              <p className="text-sm text-slate-500">Dein Einkommen über die Zeit</p>
            </div>
            <div className="bg-slate-100 p-2 rounded-lg text-slate-500 hover:text-slate-900 transition-colors cursor-pointer">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <RevenueAreaChart className="flex-1 min-h-[250px]" />
        </div>
      ),
    },
    {
      id: 'invoice-status',
      colSpan: 1,
      component: (
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Rechnungsstatus</h3>
              <p className="text-sm text-slate-500">Überblick deiner Finanzen</p>
            </div>
          </div>
          <InvoiceStatusChart className="flex-1 min-h-[250px]" />
        </div>
      ),
    },
    {
      id: 'quick-stats',
      colSpan: 2, // Span 2 cols for better visibility of 4 items? Or 1 col vertical stack?
      // QuickStatsWidget is a 2x2 grid. 1 column on desktop (lg:grid-cols-3) might be tight but ok.
      // Let's make it colSpan 1 but maybe it fits better in 2.
      // Actually, let's try colSpan 2 to make it wide, or 1 if we have 3 cols total.
      // Revenue (2) + Status (1) = Row 1.
      // QuickStats (2) + Activity (1) = Row 2.
      component: <QuickStatsWidget />,
    },
    {
      id: 'recent-activity',
      colSpan: 1,
      component: <RecentActivityWidget />,
    },
    // Add more widgets if needed
  ];

  return (
    <div className="relative isolate min-h-full p-6">
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
        {/* Soft Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.8)_0%,rgba(248,250,252,0.95)_100%)]" />
      </div>

      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <div className="hidden md:block h-8 w-[2px] bg-slate-200 rounded-full"></div>
          <p className="text-slate-500 font-medium">
            Willkommen zurück! Hier kannst du deine Karten verschieben und anordnen.
          </p>
        </div>

        <div className="flex gap-3">
          <StarBorder as={Link} href="/customers/new" className="rounded-full group" color="#cbd5e1" speed="6s">
            <div className="px-6 h-12 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 flex items-center justify-center rounded-full transition-all font-medium text-sm gap-2">
              <Users className="w-5 h-5" />
              <span>Kunde</span>
            </div>
          </StarBorder>
          <StarBorder as={Link} href="/invoices/new" className="rounded-full group" color="#ff3366" speed="3s" thickness={3}>
            <div className="px-6 h-12 bg-[#800040] hover:bg-[#600030] text-white flex items-center justify-center rounded-full transition-all font-semibold text-sm shadow-lg shadow-pink-900/20 gap-2">
              <Plus className="w-5 h-5" />
              <span>Neue Rechnung</span>
            </div>
          </StarBorder>
        </div>
      </div>

      {/* Draggable Grid */}
      <DashboardGrid initialWidgets={initialWidgets} />
    </div>
  );
}
