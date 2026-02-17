'use client';

import { useState } from 'react';
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
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

export default function CustomersPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [search, setSearch] = useState('');

  const { data: customers, isLoading, error } = useCustomers({ search });
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
        <h2 className="text-xl font-bold text-slate-900">Fehler beim Laden</h2>
        <p className="text-slate-500 mt-1 max-w-sm">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="relative isolate min-h-full p-4 md:p-6">
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

      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Kunden</h1>
          <div className="hidden md:block h-8 w-[2px] bg-slate-200 rounded-full"></div>
          <p className="text-slate-500 font-medium">
            Verwalte deine Kontakte und Geschäftsbeziehungen an einem Ort.
          </p>
        </div>

        <div className="flex gap-3">
          <StarBorder onClick={() => setShowForm(!showForm)} className="rounded-full group" color={showForm ? "#94a3b8" : "#ff3366"} speed="4s" thickness={3}>
            <div className={cn(
              "px-6 h-12 flex items-center justify-center rounded-full transition-all font-semibold text-sm shadow-lg gap-2",
              showForm
                ? "bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-slate-200/20"
                : "bg-[#800040] hover:bg-[#600030] text-white shadow-pink-900/20"
            )}>
              {showForm ? <X className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
              <span>{showForm ? 'Abbrechen' : 'Neuer Kunde'}</span>
            </div>
          </StarBorder>
        </div>
      </div>

      {showForm && (
        <SpotableCardContainer
          title="Neuen Kunden anlegen"
          onClose={() => setShowForm(false)}
        >
          <CustomerForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
            isLoading={createCustomer.isPending}
          />
        </SpotableCardContainer>
      )}

      {editingCustomer && (
        <SpotableCardContainer
          title="Kunden-Details bearbeiten"
          onClose={() => setEditingCustomer(null)}
        >
          <CustomerForm
            customer={editingCustomer}
            onSubmit={handleCreate}
            onCancel={() => setEditingCustomer(null)}
            isLoading={updateCustomer.isPending}
          />
        </SpotableCardContainer>
      )}

      {/* Search & Stats */}
      <div className="mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#800040] transition-colors">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Kunden suchen nach Name, Firma oder E-Mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#800040]/20 focus:border-[#800040] transition-all text-slate-700 shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2 px-4 py-3 bg-[#800040]/5 rounded-2xl border border-[#800040]/10 text-[#800040] font-semibold text-sm">
          <Users className="w-4 h-4" />
          <span>{customers?.length || 0} Kunden insgesamt</span>
        </div>
      </div>

      {/* List Container */}
      <div className="relative min-h-[400px]">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="w-10 h-10 animate-spin text-[#800040] mb-3" />
            <p className="font-medium">Lade Kundenliste...</p>
          </div>
        ) : customers && customers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customers.map((customer) => (
              <SpotlightCard
                key={customer.id}
                className="bg-white/90 backdrop-blur-md border border-slate-100 shadow-sm p-6 rounded-2xl hover:shadow-md transition-shadow group flex flex-col"
                spotlightColor="rgba(128, 0, 64, 0.05)"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[#800040]/10 flex items-center justify-center text-[#800040] font-bold text-xl uppercase">
                    {customer.name.charAt(0)}
                  </div>
                  <button
                    onClick={() => handleDelete(customer.id)}
                    disabled={deleteCustomer.isPending}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                    title="Löschen"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#800040] transition-colors">
                      {customer.name}
                    </h3>
                    <div className="flex items-center gap-2 text-slate-500 mt-1">
                      <Building2 className="w-4 h-4" />
                      <span className="text-sm font-medium">{customer.company || 'Kein Unternehmen'}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-50 space-y-2">
                    <div className="flex items-center gap-3 text-slate-600">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="text-sm truncate">{customer.email}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="text-sm">{customer.defaultPaymentTerms} Tage Zahlungsziel</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span className="text-sm">{customer._count?.invoices || 0} Rechnungen</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4">
                  <button
                    onClick={() => setEditingCustomer(customer)}
                    className="w-full py-2.5 rounded-xl bg-slate-50 text-slate-600 font-semibold text-sm hover:bg-[#800040] hover:text-white transition-all border border-slate-100 flex items-center justify-center gap-2 group/btn"
                  >
                    Details anzeigen
                    <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                  </button>
                </div>
              </SpotlightCard>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100">
              <Users className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Noch keine Kunden</h3>
            <p className="text-slate-500 mt-2 max-w-sm mx-auto">
              Fang an, deine Kundenbasis aufzubauen. Klicke auf "Neuer Kunde", um loszulegen.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Internal reusable container for the form
function SpotableCardContainer({ children, title, onClose }: { children: React.ReactNode, title: string, onClose: () => void }) {
  return (
    <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
      <SpotlightCard className="bg-white/95 backdrop-blur-md border border-[#800040]/20 shadow-xl p-8 rounded-3xl" spotlightColor="rgba(128, 0, 64, 0.05)">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </SpotlightCard>
    </div>
  );
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
