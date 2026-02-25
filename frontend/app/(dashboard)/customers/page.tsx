'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCustomers, useCreateCustomer, useDeleteCustomer, useUpdateCustomer } from '@/lib/hooks/useCustomers';
import CustomerForm, { type CustomerFormData } from '@/components/customers/CustomerForm';
import SpotlightCard from '@/components/ui/SpotlightCard';
import StarBorder from '@/components/ui/StarBorder';
import PixelBlast from '@/components/landing/PixelBlast';
import {
  Plus,
  Search,
  Users,
  Building2,
  Mail,
  Clock,
  FileText,
  Trash2,
  UserPlus,
  X,
  Loader2,
  TrendingUp,
  Trophy,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { type: 'spring' as const, stiffness: 320, damping: 26, delay },
  };
}

function ArrowUpRight({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 7h10v10" /><path d="M7 17 17 7" />
    </svg>
  );
}

export default function CustomersPage() {
  const searchParams = useSearchParams();
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [sortByRevenue, setSortByRevenue] = useState(false);
  const [highlightedId, setHighlightedId] = useState('');
  const highlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) setHighlightedId(id);
  }, [searchParams]);

  // Scroll to highlighted customer once loaded
  useEffect(() => {
    if (highlightedId && highlightRef.current) {
      setTimeout(() => highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 200);
    }
  }, [highlightedId, highlightRef.current]);

  const { data: customers, isLoading, error } = useCustomers({
    search,
    sortBy: sortByRevenue ? 'revenue' : 'createdAt',
    order: 'desc',
  });
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();

  const handleCreate = async (data: CustomerFormData) => {
    try {
      if (editingCustomer) {
        await updateCustomer.mutateAsync({ id: editingCustomer.id, data });
        setEditingCustomer(null);
        toast.success('Kunde erfolgreich aktualisiert');
      } else {
        await createCustomer.mutateAsync(data);
        setShowForm(false);
        toast.success('Kunde erfolgreich angelegt');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Fehler beim Speichern des Kunden');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bist du sicher, dass du diesen Kunden löschen möchtest?')) {
      try {
        await deleteCustomer.mutateAsync(id);
        toast.success('Kunde erfolgreich gelöscht');
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Fehler beim Löschen des Kunden');
      }
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="bg-red-50 p-4 rounded-full mb-4">
          <X className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-black text-slate-900 uppercase italic">Fehler beim Laden</h2>
        <p className="text-slate-500 mt-1 max-w-sm">{error.message}</p>
      </div>
    );
  }

  const totalRevenue = (customers ?? []).reduce((s: number, c: any) => s + (c.revenue ?? 0), 0);
  const topRevenue = Math.max(...(customers ?? []).map((c: any) => c.revenue ?? 0), 0);

  const statTiles = [
    { label: 'Kunden gesamt', value: String(customers?.length ?? 0), icon: Users, color: 'text-[#800040]', bg: 'bg-[#800040]/5', border: 'border-[#800040]/10' },
    { label: 'Gesamtumsatz', value: (totalRevenue).toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  ];

  return (
    <div className="relative isolate min-h-full p-4 md:p-6 space-y-6">

      {/* Fixed full-page background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#800040]/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/4 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-20">
          <PixelBlast variant="square" pixelSize={5} color="#800040" patternScale={5} patternDensity={0.4} pixelSizeJitter={0.5} enableRipples rippleSpeed={0.2} rippleThickness={0.08} speed={0.15} transparent />
        </div>
        <div className="absolute inset-0 bg-linear-to-br from-slate-50 via-white/80 to-slate-50/50" />
      </div>

      {/* Header */}
      <motion.div {...fadeUp(0)} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-[#800040] to-[#E60045] p-[1.5px] shadow-lg shadow-rose-900/10">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <Users className="w-4 h-4 text-[#800040]" />
              </div>
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Freelancer Tool</span>
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-slate-900 uppercase italic">KUNDEN</h1>
          <p className="text-slate-500 text-sm mt-0.5">Verwalte deine Kontakte und Geschäftsbeziehungen an einem Ort.</p>
        </div>
        <StarBorder onClick={() => setShowForm(!showForm)} color={showForm ? '#94a3b8' : '#ff3366'} speed="4s" thickness={2}>
          <div className={cn(
            'px-5 h-11 flex items-center gap-2 rounded-full transition-all font-black text-[11px] uppercase tracking-widest shadow-lg',
            showForm
              ? 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
              : 'bg-[#800040] hover:bg-[#600030] text-white shadow-rose-900/20'
          )}>
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{showForm ? 'Abbrechen' : 'Neuer Kunde'}</span>
          </div>
        </StarBorder>
      </motion.div>

      {/* Stats tiles */}
      {customers && customers.length > 0 && (
        <motion.div {...fadeUp(0.05)} className="grid grid-cols-2 gap-3">
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
            <SpotlightCard className="bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-[1.8rem] p-8 shadow-xl" spotlightColor="rgba(128, 0, 64, 0.05)">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-black tracking-tight text-slate-900 uppercase italic">Neuen Kunden anlegen</h2>
                  <p className="text-sm text-slate-400 mt-0.5">Fülle alle Pflichtfelder aus</p>
                </div>
                <button onClick={() => setShowForm(false)} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <CustomerForm
                onSubmit={handleCreate}
                onCancel={() => setShowForm(false)}
                isLoading={createCustomer.isPending}
              />
            </SpotlightCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit form */}
      <AnimatePresence>
        {editingCustomer && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
          >
            <SpotlightCard className="bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-[1.8rem] p-8 shadow-xl" spotlightColor="rgba(128, 0, 64, 0.05)">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-black tracking-tight text-slate-900 uppercase italic">Kunden-Details bearbeiten</h2>
                  <p className="text-sm text-slate-400 mt-0.5">{editingCustomer.name}</p>
                </div>
                <button onClick={() => setEditingCustomer(null)} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <CustomerForm
                customer={editingCustomer}
                onSubmit={handleCreate}
                onCancel={() => setEditingCustomer(null)}
                isLoading={updateCustomer.isPending}
              />
            </SpotlightCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & sort bar */}
      <motion.div {...fadeUp(0.1)} className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#800040] transition-colors">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Kunden suchen nach Name, Firma oder E-Mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#800040]/20 focus:border-[#800040] transition-all text-slate-700 shadow-sm text-sm"
          />
        </div>
        <button
          onClick={() => setSortByRevenue(!sortByRevenue)}
          className={cn(
            'flex items-center gap-2 px-5 py-3 rounded-2xl border font-black text-[11px] uppercase tracking-widest transition-all shrink-0',
            sortByRevenue
              ? 'bg-[#800040] text-white border-[#800040] shadow-md shadow-rose-900/20'
              : 'bg-white/80 text-slate-600 border-slate-200 hover:border-[#800040]/40 hover:text-[#800040]'
          )}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Nach Umsatz</span>
        </button>
      </motion.div>

      {/* Customer grid */}
      <div className="relative min-h-[400px]">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="w-10 h-10 animate-spin text-[#800040] mb-3" />
            <p className="font-medium">Lade Kundenliste...</p>
          </div>
        ) : customers && customers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customers.map((customer: any, index: number) => (
              <motion.div
                key={customer.id}
                ref={customer.id === highlightedId ? highlightRef : undefined}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.04, 0.3), duration: 0.2 }}
              >
                <SpotlightCard
                  className={cn(
                    'bg-white/95 backdrop-blur-xl border shadow-sm p-6 rounded-[1.8rem] hover:shadow-md transition-all group flex flex-col h-full',
                    customer.id === highlightedId
                      ? 'border-[#800040]/40 ring-2 ring-[#800040]/20 shadow-[#800040]/10'
                      : 'border-slate-200/80',
                  )}
                  spotlightColor="rgba(128, 0, 64, 0.05)"
                >
                  <div className="flex justify-between items-start mb-5">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-[#800040]/10 to-[#800040]/5 flex items-center justify-center text-[#800040] font-black text-xl uppercase border border-[#800040]/10">
                        {customer.name.charAt(0)}
                      </div>
                      {topRevenue > 0 && customer.revenue === topRevenue && (
                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center shadow-sm" title="Top Kunde">
                          <Trophy className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(customer.id)}
                      disabled={deleteCustomer.isPending}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                      title="Löschen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-base font-black text-slate-900 group-hover:text-[#800040] transition-colors tracking-tight">
                        {customer.name}
                      </h3>
                      <div className="flex items-center gap-2 text-slate-500 mt-1">
                        <Building2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-sm truncate">{customer.company || 'Kein Unternehmen'}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 space-y-2.5">
                      <div className="flex items-center gap-3 text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-sm truncate">{customer.email}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-sm">{customer.defaultPaymentTerms} Tage Zahlungsziel</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-600">
                        <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-sm">{customer._count?.invoices || 0} Rechnungen</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <TrendingUp className="w-3.5 h-3.5 text-[#800040]/60 shrink-0" />
                        <span className="text-sm font-black text-slate-800 tabular-nums">
                          {(customer.revenue ?? 0).toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })} Umsatz
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => setEditingCustomer(customer)}
                      className="w-full py-2.5 rounded-2xl bg-slate-50 text-slate-600 font-black text-[11px] uppercase tracking-widest hover:bg-[#800040] hover:text-white transition-all border border-slate-100 flex items-center justify-center gap-2 group/btn"
                    >
                      Details anzeigen
                      <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </button>
                  </div>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mb-5 border-2 border-dashed border-slate-200">
              <Users className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-black uppercase italic tracking-tight text-slate-900">Noch keine Kunden</h3>
            <p className="text-slate-500 mt-2 text-sm max-w-xs mx-auto">
              Fang an, deine Kundenbasis aufzubauen. Klicke auf "Neuer Kunde", um loszulegen.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
