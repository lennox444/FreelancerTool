'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateCustomer } from '@/lib/hooks/useCustomers';
import CustomerForm, { type CustomerFormData } from '@/components/customers/CustomerForm';
import SpotlightCard from '@/components/ui/SpotlightCard';
import PixelBlast from '@/components/landing/PixelBlast';
import StarBorder from '@/components/ui/StarBorder';
import { UserPlus, FileText, Users, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function NewCustomerPage() {
  const router = useRouter();
  const createCustomer = useCreateCustomer();
  const [showSuccessOptions, setShowSuccessOptions] = useState(false);
  const [createdCustomerId, setCreatedCustomerId] = useState<string | null>(null);

  const handleCreate = async (data: CustomerFormData) => {
    try {
      const customer = await createCustomer.mutateAsync(data);
      setCreatedCustomerId(customer.id);
      setShowSuccessOptions(true);
      toast.success('Kunde erfolgreich angelegt! 🎉');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Fehler beim Erstellen des Kunden');
    }
  };

  const handleCancel = () => {
    router.push('/customers');
  };

  if (showSuccessOptions && createdCustomerId) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center relative overflow-hidden isolate py-12 px-4">
        {/* Background */}
        <div className="absolute inset-0 -z-10">
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
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8)_0%,rgba(248,250,252,0.95)_100%)] pointer-events-none" />
        </div>

        <div className="w-full max-w-2xl mx-auto relative z-10">
          <SpotlightCard
            className="w-full bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-100 p-8 md:p-12"
            spotlightColor="rgba(128, 0, 64, 0.15)"
          >
            <div className="text-center mb-8">
              <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 text-green-600">
                <UserPlus className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 mb-3">
                Kunde erfolgreich angelegt!
              </h2>
              <p className="text-slate-500 text-lg">
                Was möchtest du als Nächstes tun?
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-6">
              {/* Option 1: Create Invoice */}
              <button
                type="button"
                onClick={() => router.push(`/invoices/new?customerId=${createdCustomerId}`)}
                className="group relative w-full p-6 text-left transition-all hover:-translate-y-1 focus:outline-none"
              >
                <div className="absolute inset-0 bg-white rounded-2xl border border-slate-200 shadow-sm group-hover:shadow-xl group-hover:border-[#800040]/30 transition-all duration-300"></div>
                <div className="relative flex items-center gap-6">
                  <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-[#800040]/10 flex items-center justify-center text-[#800040] group-hover:bg-[#800040] group-hover:text-white transition-colors duration-300">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-[#800040] transition-colors">
                      Rechnung erstellen
                    </h3>
                    <p className="text-slate-500 group-hover:text-slate-700 transition-colors">
                      Erstelle direkt die erste Rechnung für diesen Kunden
                    </p>
                  </div>
                </div>
              </button>

              {/* Option 2: View Customers */}
              <button
                type="button"
                onClick={() => router.push('/customers')}
                className="group relative w-full p-6 text-left transition-all hover:-translate-y-1 focus:outline-none"
              >
                <div className="absolute inset-0 bg-white rounded-2xl border border-slate-200 shadow-sm group-hover:shadow-xl group-hover:border-slate-300 transition-all duration-300"></div>
                <div className="relative flex items-center gap-6">
                  <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-slate-800 group-hover:text-white transition-colors duration-300">
                    <Users className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-slate-800 transition-colors">
                      Zur Kundenliste
                    </h3>
                    <p className="text-slate-500 group-hover:text-slate-700 transition-colors">
                      Zurück zur Übersicht aller Kunden
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </SpotlightCard>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/customers"
          className="inline-flex items-center text-slate-500 hover:text-slate-700 transition-colors mb-4 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Zurück zur Kundenliste
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-[#800040] to-[#600030] flex items-center justify-center shadow-lg shadow-pink-900/20">
            <UserPlus className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
              Neuen Kunden anlegen
            </h1>
            <p className="text-slate-500 mt-1">
              Erfasse die Daten deines neuen Kunden
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="relative">
        <div className="absolute inset-0 -z-10 opacity-30">
          <PixelBlast
            variant="square"
            pixelSize={4}
            color="#800040"
            patternScale={3}
            patternDensity={0.3}
            pixelSizeJitter={0.3}
            speed={0.15}
            transparent
          />
        </div>

        <SpotlightCard
          className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-8"
          spotlightColor="rgba(128, 0, 64, 0.1)"
        >
          <CustomerForm
            onSubmit={handleCreate}
            onCancel={handleCancel}
            isLoading={createCustomer.isPending}
          />
        </SpotlightCard>
      </div>
    </div>
  );
}
