'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';
import { Check, ShieldCheck, Zap, Loader2 } from 'lucide-react';
import SpotlightCard from '@/components/ui/SpotlightCard';
import StarBorder from '@/components/ui/StarBorder';
import PixelBlast from '@/components/landing/PixelBlast';
import apiClient from '@/lib/api/client';
import toast from 'react-hot-toast';
import { useSearchParams, useRouter } from 'next/navigation';

export default function BillingPage() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false); // New state for verification process
    const searchParams = useSearchParams();
    const router = useRouter();
    const hasVerified = useRef(false); // Prevent double execution

    useEffect(() => {
        const verifyPayment = async () => {
            const success = searchParams.get('success');
            const sessionId = searchParams.get('session_id');

            // Only run once, even in React Strict Mode
            if (success === 'true' && sessionId && !hasVerified.current) {
                hasVerified.current = true; // Mark as executed
                setVerifying(true);

                console.log('[DEBUG] Starting verification with session:', sessionId);

                try {
                    // 1. Verify Payment
                    const { data } = await apiClient.post('/billing/verify-session', { sessionId });
                    console.log('[DEBUG] Verification response:', data);

                    if (data.success) {
                        toast.success('Upgrade erfolgreich! Willkommen im PRO Plan.');

                        // 2. Fetch updated user profile
                        try {
                            const profileRes = await apiClient.get('/auth/me');
                            const updatedUser = profileRes.data.data;
                            console.log('[DEBUG] User profile fetched:', updatedUser);

                            // 3. Update Auth Store manually
                            const { token, refreshToken, setAuth } = useAuthStore.getState();
                            if (token && refreshToken && updatedUser) {
                                setAuth(updatedUser, token, refreshToken);

                                // 4. Explicitly write to localStorage
                                const storeState = {
                                    state: {
                                        user: updatedUser,
                                        token,
                                        refreshToken,
                                    },
                                    version: 0,
                                };
                                localStorage.setItem('auth-storage', JSON.stringify(storeState));
                                console.log('[DEBUG] State saved. Plan:', updatedUser.subscriptionPlan);
                            }
                        } catch (profileError: any) {
                            console.error('[DEBUG] Profile fetch failed:', profileError);
                        }

                        // 5. Wait, then redirect
                        await new Promise(resolve => setTimeout(resolve, 1500));
                        window.location.href = '/dashboard';
                    } else {
                        console.error('[DEBUG] Verification failed:', data);
                        toast.error('Zahlung noch in Bearbeitung.');
                        setVerifying(false);
                    }
                } catch (error: any) {
                    console.error('[DEBUG] Verification error:', error);
                    toast.error('Konnte Zahlung nicht verifizieren.');
                    setVerifying(false);
                }
            }
        };

        verifyPayment();
    }, [searchParams, router]);

    // Show loading screen during verification
    if (verifying) {
        return (
            <div className="relative isolate min-h-full p-6 md:p-10 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin text-[#800040] mx-auto" />
                    <h2 className="text-2xl font-bold text-slate-900">Zahlung wird verifiziert...</h2>
                    <p className="text-slate-600">Einen Moment bitte, wir aktivieren deinen Pro Plan.</p>
                </div>
            </div>
        );
    }

    const handleUpgrade = async () => {
        try {
            setLoading(true);
            const response = await apiClient.post<{ url: string }>('/billing/create-checkout-session');
            if (response.data && response.data.url) {
                window.location.href = response.data.url;
            } else {
                toast.error('Fehler beim Starten des Bezahlvorgangs.');
            }
        } catch (error) {
            console.error(error);
            toast.error('Konnte Checkout-Session nicht erstellen.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative isolate min-h-full p-6 md:p-10">
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

            <div className="max-w-4xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-pink-800 text-xs font-bold uppercase tracking-wider shadow-sm mb-4">
                        <Zap className="w-3 h-3 fill-current" />
                        Upgrade deinen Plan
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                        Wähle den <span className="text-[#800040]">Pro Plan</span>
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Entfessle das volle Potenzial von FreelanceFlow. Unbegrenzte Projekte, Kunden und Rechnungen.
                    </p>
                </div>

                {/* Pricing Card (Simplified Version for Dashboard) */}
                <div className="relative max-w-lg mx-auto transform hover:scale-[1.02] transition-transform duration-500">
                    <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-rose-600 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                    <SpotlightCard
                        className="rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-white bg-white/80 backdrop-blur-xl relative"
                        spotlightColor="rgba(219, 39, 119, 0.1)"
                    >
                        {/* Current Plan Badge if applicable */}
                        {user?.subscriptionPlan === 'PRO' && (
                            <div className="absolute top-0 left-0 right-0 -mt-4 flex justify-center">
                                <span className="bg-emerald-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4" /> Aktueller Plan
                                </span>
                            </div>
                        )}

                        <div className="mb-8 text-center border-b border-slate-100 pb-8">
                            <h3 className="text-lg font-bold text-slate-500 uppercase tracking-widest mb-2">Pro Mitgliedschaft</h3>
                            <div className="flex items-center justify-center gap-1">
                                <span className="text-6xl font-extrabold text-slate-900 tracking-tight">30€</span>
                                <span className="text-xl text-slate-500 font-medium">/ Monat</span>
                            </div>
                            <p className="text-slate-500 mt-4 font-medium text-sm">Jederzeit kündbar. Keine versteckten Kosten.</p>
                        </div>

                        <div className="space-y-4 mb-10 pl-4">
                            {[
                                "Unbegrenzte Projekte & Kunden",
                                "Rechnungsstellung & Mahnwesen",
                                "Erweiterte Berichte & Analysen",
                                "Priorisierter Email Support",
                                "Team-Zugriff (bald verfügbar)",
                                "API Zugriff"
                            ].map((feature) => (
                                <div key={feature} className="flex items-center gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-50 text-[#800040] flex items-center justify-center shadow-sm border border-pink-100">
                                        <Check className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="text-slate-700 font-medium">{feature}</span>
                                </div>
                            ))}
                        </div>

                        {user?.subscriptionPlan !== 'PRO' ? (
                            <button
                                onClick={handleUpgrade}
                                disabled={loading}
                                className="w-full group relative disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-200"></div>
                                <div className="relative h-14 w-full bg-[#800040] text-white flex items-center justify-center rounded-2xl transition-all group-hover:bg-[#600030] font-bold text-lg shadow-xl">
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                        <>
                                            Jetzt upgraden
                                            <Zap className="ml-2 w-5 h-5 fill-white/20" />
                                        </>
                                    )}
                                </div>
                            </button>
                        ) : (
                            <button disabled className="w-full h-14 bg-slate-100 text-slate-400 font-bold rounded-2xl cursor-not-allowed flex items-center justify-center gap-2">
                                Bereits Aktiv
                            </button>
                        )}

                        <p className="text-center text-xs text-slate-400 mt-6 font-medium">
                            Sichere Zahlung via Stripe (Mock im Testmodus).
                        </p>
                    </SpotlightCard>
                </div>
            </div>
        </div>
    );
}
