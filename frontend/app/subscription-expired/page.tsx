'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import { Zap, Clock, ShieldAlert, Check, Loader2, AlertTriangle, X } from 'lucide-react';
import apiClient from '@/lib/api/client';
import toast from 'react-hot-toast';

export default function SubscriptionExpiredPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    useEffect(() => {
        if (user?.subscriptionPlan === 'PRO' && user?.subscriptionStatus === 'ACTIVE') {
            router.push('/dashboard');
        }
    }, [user, router]);

    const daysExpired = user?.trialEndsAt
        ? Math.ceil((new Date().getTime() - new Date(user.trialEndsAt).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

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

    const handleDeleteAccount = async () => {
        try {
            setDeleting(true);
            await apiClient.delete('/auth/account');
            toast.success('Account wurde gelöscht.');
            useAuthStore.getState().logout();
            // Use window.location instead of router.push to bypass dashboard layout auth check
            window.location.href = '/';
        } catch (error) {
            console.error(error);
            toast.error('Fehler beim Löschen des Accounts.');
        } finally {
            setDeleting(false);
        }
    };

    const handleLogout = () => {
        useAuthStore.getState().logout();
        router.push('/login');
    };

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
                <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                    {/* Left Column: Warning & Info */}
                    <div className="space-y-6">
                        {/* Expired Warning */}
                        <div className="bg-gradient-to-r from-red-500 to-rose-600 rounded-3xl shadow-2xl p-8 text-white text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4 backdrop-blur-sm">
                                <Clock className="w-8 h-8" />
                            </div>
                            <h1 className="text-2xl font-bold mb-2">Testphase abgelaufen</h1>
                            <p className="text-red-100">
                                Vor {daysExpired} {daysExpired === 1 ? 'Tag' : 'Tagen'}
                            </p>
                        </div>

                        {/* Warning Box */}
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                            <div className="flex items-start gap-4">
                                <ShieldAlert className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-bold text-amber-900 mb-2">Zugriff eingeschränkt</h3>
                                    <p className="text-amber-800 text-sm leading-relaxed">
                                        Um weiterhin auf alle Funktionen zugreifen zu können, upgrade jetzt auf den Pro Plan.
                                        Deine Daten bleiben sicher gespeichert.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="w-full h-12 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-2xl font-medium transition-colors shadow-sm"
                        >
                            Ausloggen
                        </button>

                        {/* Delete Account Button (scary) */}
                        <div className="pt-4 border-t border-slate-200">
                            <p className="text-center text-xs text-slate-500 mb-3 font-medium">
                                Oder möchtest du deinen Account dauerhaft löschen?
                            </p>
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="w-full h-12 bg-red-50 border-2 border-red-300 text-red-700 hover:bg-red-100 hover:border-red-400 rounded-2xl font-bold transition-all shadow-sm group flex items-center justify-center gap-2"
                            >
                                <ShieldAlert className="w-4 h-4" />
                                Account & alle Daten löschen
                            </button>
                            <p className="text-center text-[10px] text-red-600 mt-2 font-semibold flex items-center justify-center gap-1">
                                <Clock className="w-3 h-3" />
                                Alle Projekte, Rechnungen & Daten werden gelöscht!
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Pricing Card */}
                    <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-rose-600 rounded-[2rem] blur opacity-20"></div>
                        <div className="rounded-[2rem] p-8 shadow-2xl border border-white bg-white relative">

                            {/* Badge */}
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-pink-800 text-xs font-bold uppercase tracking-wider shadow-sm">
                                    <Zap className="w-3 h-3 fill-current" />
                                    Empfohlen
                                </div>
                            </div>

                            {/* Pricing */}
                            <div className="text-center mb-6 pb-6 border-b border-slate-100">
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Pro Mitgliedschaft</h3>
                                <div className="flex items-center justify-center gap-1 mb-2">
                                    <span className="text-5xl font-extrabold text-slate-900 tracking-tight">30€</span>
                                    <span className="text-lg text-slate-500 font-medium">/ Monat</span>
                                </div>
                                <p className="text-slate-500 text-xs font-medium">Jederzeit kündbar</p>
                            </div>

                            {/* Features */}
                            <div className="space-y-3 mb-8">
                                {[
                                    'Unbegrenzte Projekte & Kunden',
                                    'Rechnungsstellung & Mahnwesen',
                                    'Erweiterte Berichte',
                                    'Priorisierter Support',
                                    'Team-Zugriff',
                                    'API Zugriff'
                                ].map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-pink-50 text-[#800040] flex items-center justify-center border border-pink-100">
                                            <Check className="w-3 h-3" />
                                        </div>
                                        <span className="text-slate-700 text-sm font-medium">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            {/* CTA */}
                            <button
                                onClick={handleUpgrade}
                                disabled={loading}
                                className="w-full group relative disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-200"></div>
                                <div className="relative h-14 w-full bg-[#800040] text-white flex items-center justify-center rounded-2xl transition-all group-hover:bg-[#600030] font-bold text-lg shadow-xl">
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            Jetzt upgraden
                                            <Zap className="ml-2 w-5 h-5 fill-white/20" />
                                        </>
                                    )}
                                </div>
                            </button>

                            <p className="text-center text-xs text-slate-400 mt-4 font-medium">
                                Sichere Zahlung via Stripe
                            </p>
                        </div>
                    </div>

                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative">
                        {/* Close Button */}
                        <button
                            onClick={() => setShowDeleteModal(false)}
                            className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-500" />
                        </button>

                        {/* Warning Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                                <AlertTriangle className="w-8 h-8 text-red-600" />
                            </div>
                        </div>

                        {/* Content */}
                        <h2 className="text-2xl font-bold text-slate-900 text-center mb-4">
                            Account wirklich löschen?
                        </h2>

                        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-6">
                            <p className="text-red-900 font-semibold mb-3 text-center flex items-center justify-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                ACHTUNG: Unwiderruflich!
                            </p>
                            <ul className="space-y-2 text-sm text-red-800">
                                <li className="flex items-start gap-2">
                                    <span className="text-red-600 font-bold mt-0.5">•</span>
                                    <span>Alle deine <strong>Projekte</strong> werden gelöscht</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-red-600 font-bold mt-0.5">•</span>
                                    <span>Alle deine <strong>Kunden</strong> werden gelöscht</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-red-600 font-bold mt-0.5">•</span>
                                    <span>Alle deine <strong>Rechnungen</strong> werden gelöscht</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-red-600 font-bold mt-0.5">•</span>
                                    <span>Alle deine <strong>Zeiterfassungen</strong> werden gelöscht</span>
                                </li>
                            </ul>
                            <p className="text-red-900 font-bold text-center mt-4 text-sm">
                                Dieser Vorgang kann NICHT rückgängig gemacht werden!
                            </p>
                        </div>

                        {/* Confirmation Checkbox */}
                        <label className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors mb-6">
                            <input
                                type="checkbox"
                                checked={confirmDelete}
                                onChange={(e) => setConfirmDelete(e.target.checked)}
                                className="mt-1 w-4 h-4 text-red-600 border-slate-300 rounded focus:ring-red-500"
                            />
                            <span className="text-sm text-slate-700 leading-relaxed">
                                Ich habe die obigen Informationen gelesen und bin mir bewusst, dass alle meine Daten unwiderruflich gelöscht werden.
                                Ich verstehe, dass dieser Vorgang nicht rückgängig gemacht werden kann.
                            </span>
                        </label>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setConfirmDelete(false);
                                }}
                                className="flex-1 h-12 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
                            >
                                Abbrechen
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleting || !confirmDelete}
                                className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {deleting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <ShieldAlert className="w-4 h-4" />
                                        Endgültig löschen
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
