'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import { CreditCard, Trash2, AlertTriangle, X, Loader2, ShieldAlert, Landmark, Target, Euro } from 'lucide-react';
import apiClient from '@/lib/api/client';
import { authApi } from '@/lib/api/auth';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function SettingsPage() {
    const router = useRouter();
    const { user, updateUser } = useAuthStore();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    // ── Freelancer settings ──────────────────────────────────────────────────
    const [targetRate, setTargetRate] = useState<string>(
        user?.targetHourlyRate != null ? String(user.targetHourlyRate) : '',
    );
    const [savingRate, setSavingRate] = useState(false);

    const handleSaveTargetRate = async () => {
        const val = parseFloat(targetRate);
        if (isNaN(val) || val < 0) { toast.error('Bitte einen gültigen Stundensatz eingeben.'); return; }
        setSavingRate(true);
        try {
            const updated = await authApi.updateProfile({ targetHourlyRate: val });
            updateUser({ targetHourlyRate: updated.targetHourlyRate });
            toast.success('Ziel-Stundensatz gespeichert!');
        } catch {
            toast.error('Fehler beim Speichern.');
        } finally {
            setSavingRate(false);
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

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Einstellungen</h1>
                        <p className="text-slate-600">Verwalte dein Konto und dein Abonnement</p>
                    </div>

                    {/* Settings Cards */}
                    <div className="grid gap-6">

                        {/* Freelancer Settings */}
                        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                    <Target className="w-6 h-6 text-emerald-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 mb-1">Freelancer-Einstellungen</h2>
                                    <p className="text-slate-600 text-sm">Persönliche Zielwerte für die Profit-Analyse</p>
                                </div>
                            </div>
                            <div className="pl-16 space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Ziel-Stundensatz (€/Std)
                                    </label>
                                    <p className="text-xs text-slate-500 mb-3">
                                        Wird für die Profit-Analyse und den Profitability-Score deiner Projekte verwendet.
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="number"
                                                min="0"
                                                max="10000"
                                                step="5"
                                                value={targetRate}
                                                onChange={(e) => setTargetRate(e.target.value)}
                                                placeholder="80"
                                                className="pl-9 pr-4 h-11 w-36 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                            />
                                        </div>
                                        <button
                                            onClick={handleSaveTargetRate}
                                            disabled={savingRate}
                                            className="h-11 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                                        >
                                            {savingRate ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Speichern'}
                                        </button>
                                        {user?.targetHourlyRate != null && (
                                            <span className="text-sm text-slate-500">
                                                Aktuell: <span className="font-bold text-slate-700">{user.targetHourlyRate} €/Std</span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Billing Card */}
                        <Link href="/settings/billing">
                            <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                                        <CreditCard className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-xl font-bold text-slate-900 mb-1">Abonnement verwalten</h2>
                                        <p className="text-slate-600 text-sm mb-3">
                                            Verwalte dein Abo, aktualisiere deine Zahlungsmethode oder kündige dein Abonnement
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-bold px-2 py-1 rounded ${user?.subscriptionPlan === 'PRO'
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {user?.subscriptionPlan === 'PRO' ? 'Pro Plan' : 'Testversion'}
                                            </span>
                                            <span className={`text-xs font-bold px-2 py-1 rounded ${user?.subscriptionStatus === 'ACTIVE'
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {user?.subscriptionStatus === 'ACTIVE' ? 'Aktiv' : 'Trial'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all">
                                        →
                                    </div>
                                </div>
                            </div>
                        </Link>
                        {/* Bank Accounts Card */}
                        <Link href="/settings/bank-accounts">
                            <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-200 transition-colors">
                                        <Landmark className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-xl font-bold text-slate-900 mb-1">Bankverbindungen</h2>
                                        <p className="text-slate-600 text-sm mb-3">
                                            Hinterlege diene IBAN, BIC oder PayPal für deine Rechnungen
                                        </p>
                                    </div>
                                    <div className="text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all">
                                        →
                                    </div>
                                </div>
                            </div>
                        </Link>

                        {/* Danger Zone */}
                        <div className="bg-white rounded-3xl shadow-lg border-2 border-red-200 p-6">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center flex-shrink-0">
                                    <AlertTriangle className="w-6 h-6 text-red-600" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bold text-slate-900 mb-1">Gefahrenbereich</h2>
                                    <p className="text-slate-600 text-sm">
                                        Unwiderrufliche und destruktive Aktionen
                                    </p>
                                </div>
                            </div>

                            <div className="pl-16 space-y-4">
                                <div className="border-t border-red-100 pt-4">
                                    <h3 className="font-bold text-slate-900 mb-2">Account löschen</h3>
                                    <p className="text-sm text-slate-600 mb-4">
                                        Lösche deinen Account permanent. Alle deine Projekte, Kunden, Rechnungen und Zeiterfassungen werden unwiderruflich gelöscht.
                                    </p>
                                    <button
                                        onClick={() => setShowDeleteModal(true)}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border-2 border-red-300 text-red-700 hover:bg-red-100 hover:border-red-400 rounded-xl font-bold transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Account löschen
                                    </button>
                                </div>
                            </div>
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
                            onClick={() => {
                                setShowDeleteModal(false);
                                setConfirmDelete(false);
                            }}
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
