'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import { CreditCard, Trash2, AlertTriangle, X, Loader2, ShieldAlert, Landmark, Target, Euro, Calculator, ChevronDown, ChevronUp, Check, Zap, CheckCircle, Link, Unlink, ArrowRight } from 'lucide-react';
import apiClient from '@/lib/api/client';
import { authApi } from '@/lib/api/auth';
import { billingApi, ConnectStatus } from '@/lib/api/billing';
import toast from 'react-hot-toast';
import Link2 from 'next/link';

export default function SettingsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, updateUser } = useAuthStore();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    // ── Freelancer settings ──────────────────────────────────────────────────
    const [targetRate, setTargetRate] = useState<string>(
        user?.targetHourlyRate != null ? String(user.targetHourlyRate) : '',
    );
    const [savingRate, setSavingRate] = useState(false);

    // ── Kleinunternehmer ─────────────────────────────────────────────────────
    const [kleinunternehmer, setKleinunternehmer] = useState(user?.isKleinunternehmer ?? false);
    const [savingKU, setSavingKU] = useState(false);

    const handleToggleKleinunternehmer = async (value: boolean) => {
        setSavingKU(true);
        try {
            const updated = await authApi.updateProfile({ isKleinunternehmer: value });
            updateUser({ isKleinunternehmer: updated.isKleinunternehmer });
            setKleinunternehmer(value);
            toast.success(value ? 'Kleinunternehmer-Modus aktiviert.' : 'Kleinunternehmer-Modus deaktiviert.');
        } catch {
            toast.error('Fehler beim Speichern.');
        } finally {
            setSavingKU(false);
        }
    };

    // ── Stundensatz-Rechner ───────────────────────────────────────────────────
    const [showCalc, setShowCalc] = useState(false);
    const [calcIncome, setCalcIncome] = useState('4000');
    const [calcHours, setCalcHours] = useState('40');
    const [calcVacation, setCalcVacation] = useState('5');
    const [calcOverhead, setCalcOverhead] = useState('20');

    const calcResults = (() => {
        const income = parseFloat(calcIncome) || 0;
        const hours = parseFloat(calcHours) || 40;
        const vacation = parseFloat(calcVacation) || 0;
        const overhead = parseFloat(calcOverhead) || 0;
        const effectiveHours = (52 - vacation) * hours * (1 - overhead / 100);
        if (effectiveHours <= 0) return null;
        const minimum = (income * 12) / effectiveHours;
        return {
            minimum: Math.ceil(minimum),
            realistic: Math.ceil(minimum * 1.15),
            comfortable: Math.ceil(minimum * 1.3),
        };
    })();

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

    // ── Stripe Connect ────────────────────────────────────────────────────────
    const [connectStatus, setConnectStatus] = useState<ConnectStatus | null>(null);
    const [connectLoading, setConnectLoading] = useState(false);
    const [disconnectLoading, setDisconnectLoading] = useState(false);
    const stripeToastShown = useRef(false);

    const loadConnectStatus = async () => {
        try {
            const status = await billingApi.getConnectStatus();
            setConnectStatus(status);
            if (status.chargesEnabled) {
                updateUser({
                    stripeConnectEnabled: true,
                    stripeConnectAccountId: status.accountId ?? undefined,
                });
            }
            return status;
        } catch {
            // Ignore – Stripe may not be configured
            return null;
        }
    };

    useEffect(() => {
        loadConnectStatus();
    }, []);

    // Handle return from Stripe Onboarding
    useEffect(() => {
        const stripeParam = searchParams.get('stripe');
        if (!stripeParam) return;

        loadConnectStatus().then((status) => {
            if (stripeToastShown.current) return;
            stripeToastShown.current = true;

            if (stripeParam === 'connected') {
                if (status?.chargesEnabled) {
                    toast.success('Stripe erfolgreich verbunden!');
                } else {
                    toast('Bitte vervollständige dein Stripe-Profil, um Zahlungen zu empfangen.', {
                        icon: '⚠️',
                    });
                }
            } else if (stripeParam === 'refresh') {
                toast('Stripe-Onboarding wurde abgebrochen. Du kannst es jederzeit erneut starten.', {
                    icon: 'ℹ️',
                });
            }
        });
    }, [searchParams]);

    const handleConnectStripe = async () => {
        setConnectLoading(true);
        try {
            const { url } = await billingApi.connectStripe();
            window.location.href = url;
        } catch {
            toast.error('Fehler beim Verbinden mit Stripe.');
            setConnectLoading(false);
        }
    };

    const handleDisconnectStripe = async () => {
        if (!confirm('Stripe-Verbindung wirklich trennen? Kunden können dann keine Online-Zahlungen mehr für deine Rechnungen vornehmen.')) return;
        setDisconnectLoading(true);
        try {
            await billingApi.disconnectStripe();
            setConnectStatus(prev => prev ? { ...prev, connected: false, chargesEnabled: false, accountId: null } : null);
            updateUser({ stripeConnectEnabled: false, stripeConnectAccountId: undefined });
            toast.success('Stripe-Verbindung getrennt.');
        } catch {
            toast.error('Fehler beim Trennen der Verbindung.');
        } finally {
            setDisconnectLoading(false);
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

                                {/* Stundensatz-Rechner */}
                                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                                    <button
                                        onClick={() => setShowCalc(!showCalc)}
                                        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                                    >
                                        <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                                            <Calculator className="w-4 h-4 text-emerald-600" />
                                            Stundensatz-Rechner
                                        </div>
                                        {showCalc ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                                    </button>

                                    {showCalc && (
                                        <div className="p-4 space-y-4 bg-white">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Wunsch-Nettoeinkommen (€/Monat)</label>
                                                    <input
                                                        type="number" min="0" step="100"
                                                        value={calcIncome}
                                                        onChange={(e) => setCalcIncome(e.target.value)}
                                                        className="w-full px-3 h-9 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Wochenstunden</label>
                                                    <input
                                                        type="number" min="1" max="80" step="1"
                                                        value={calcHours}
                                                        onChange={(e) => setCalcHours(e.target.value)}
                                                        className="w-full px-3 h-9 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Urlaubswochen/Jahr</label>
                                                    <input
                                                        type="number" min="0" max="20" step="1"
                                                        value={calcVacation}
                                                        onChange={(e) => setCalcVacation(e.target.value)}
                                                        className="w-full px-3 h-9 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Overhead-Anteil (%)</label>
                                                    <input
                                                        type="number" min="0" max="90" step="5"
                                                        value={calcOverhead}
                                                        onChange={(e) => setCalcOverhead(e.target.value)}
                                                        className="w-full px-3 h-9 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                                    />
                                                </div>
                                            </div>

                                            {calcResults && (
                                                <div className="grid grid-cols-3 gap-2 mt-2">
                                                    {[
                                                        { label: 'Minimum', value: calcResults.minimum, color: 'bg-red-50 border-red-200 text-red-700' },
                                                        { label: 'Realistisch', value: calcResults.realistic, color: 'bg-amber-50 border-amber-200 text-amber-700' },
                                                        { label: 'Komfortabel', value: calcResults.comfortable, color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
                                                    ].map(({ label, value, color }) => (
                                                        <div key={label} className={`border rounded-xl p-3 text-center ${color}`}>
                                                            <div className="text-xs font-semibold mb-1 opacity-80">{label}</div>
                                                            <div className="text-lg font-bold">{value} €/h</div>
                                                            <button
                                                                onClick={() => setTargetRate(String(value))}
                                                                className="mt-2 flex items-center justify-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg bg-white/60 hover:bg-white transition-colors w-full"
                                                            >
                                                                <Check className="w-3 h-3" /> Übernehmen
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Kleinunternehmer Toggle */}
                                <div className="border border-amber-200 bg-amber-50 rounded-2xl p-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-slate-900">Kleinunternehmer (§19 UStG)</p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                Aktiviere dies, wenn du von der Umsatzsteuer befreit bist. Beeinflusst Steuerberechnungen und PDF-Ausgaben.
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleToggleKleinunternehmer(!kleinunternehmer)}
                                            disabled={savingKU}
                                            className={`relative flex-shrink-0 w-12 h-6 rounded-full transition-colors ${kleinunternehmer ? 'bg-emerald-500' : 'bg-slate-300'} disabled:opacity-50`}
                                        >
                                            <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${kleinunternehmer ? 'translate-x-6' : ''}`} />
                                        </button>
                                    </div>
                                    {kleinunternehmer && (
                                        <div className="mt-3 flex items-start gap-2 p-3 bg-amber-100 rounded-xl border border-amber-200">
                                            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                            <p className="text-xs text-amber-700">
                                                Rechnungen erhalten den §19-Vermerk statt einer MwSt.-Zeile. Die Steuerberechnung zeigt keine Umsatzsteuer-Vorauszahlungen.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Stripe Connect Card */}
                        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                                    <Zap className="w-6 h-6 text-violet-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h2 className="text-xl font-bold text-slate-900">Online-Zahlung (Stripe Connect)</h2>
                                        {connectStatus?.chargesEnabled && (
                                            <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                                                <CheckCircle className="w-3 h-3" /> Verbunden
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-slate-600 text-sm">Lass Kunden deine Rechnungen direkt per Kreditkarte oder SEPA bezahlen</p>
                                </div>
                            </div>

                            <div className="pl-16 space-y-4">
                                {connectStatus?.chargesEnabled ? (
                                    /* ── Connected state ── */
                                    <div className="space-y-4">
                                        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-semibold text-slate-700">Stripe Account-ID</span>
                                                <span className="text-sm font-mono text-slate-600 bg-white px-2 py-0.5 rounded-lg border border-slate-200">{connectStatus.accountId}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-semibold text-slate-700">Platform Fee (FreelancerTool)</span>
                                                <span className="text-sm font-bold text-violet-700">{connectStatus.platformFeePct}%</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-semibold text-slate-700">Stripe-Gebühren (EU-Karten)</span>
                                                <span className="text-sm text-slate-500">~1,4% + 25ct</span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-500">
                                            Aktiviere "Online-Zahlung anbieten" beim Erstellen einer Rechnung — deine Kunden sehen dann einen "Jetzt online bezahlen" Button im Client Portal.
                                        </p>
                                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2.5">
                                            <AlertTriangle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                            <div className="space-y-1">
                                                <p className="text-xs font-semibold text-blue-800">Hinweis zur Gewinnberechnung</p>
                                                <p className="text-xs text-blue-700 leading-relaxed">
                                                    Deine Rechnungen werden weiterhin mit dem vollen Rechnungsbetrag als <strong>bezahlt</strong> markiert — so bleibt der Zahlungsstatus korrekt.
                                                    Die Stripe-Transaktionsgebühren ({connectStatus.platformFeePct}% Platform Fee + ~1,4% + 25ct Stripe-Gebühr) werden automatisch als <strong>Ausgabe</strong> in deinen Ausgaben eingetragen.
                                                    Dein tatsächlicher Gewinn in der Übersicht und im Steuer-Assistenten ist dadurch immer korrekt.
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleDisconnectStripe}
                                            disabled={disconnectLoading}
                                            className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600 rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
                                        >
                                            {disconnectLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlink className="w-4 h-4" />}
                                            Verbindung trennen
                                        </button>
                                    </div>
                                ) : connectStatus?.connected && !connectStatus.chargesEnabled ? (
                                    /* ── Connected but onboarding incomplete ── */
                                    <div className="space-y-4">
                                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                                            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-semibold text-amber-800">Onboarding unvollständig</p>
                                                <p className="text-xs text-amber-700 mt-1">Bitte vervollständige dein Stripe-Profil, um Zahlungen zu empfangen.</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleConnectStripe}
                                            disabled={connectLoading}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
                                        >
                                            {connectLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                                            Onboarding fortsetzen
                                        </button>
                                    </div>
                                ) : (
                                    /* ── Not connected ── */
                                    <div className="space-y-4">
                                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                                            <p className="text-sm font-semibold text-slate-800">So funktioniert es:</p>
                                            <div className="space-y-2">
                                                {[
                                                    'Verbinde deinen Stripe-Account (kostenlos, kein bestehender Account nötig)',
                                                    'Aktiviere "Online-Zahlung" beim Erstellen einer Rechnung',
                                                    'Deine Kunden zahlen direkt an dich — Geld landet auf deinem Konto',
                                                ].map((step, i) => (
                                                    <div key={i} className="flex items-start gap-3">
                                                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-violet-100 text-violet-700 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                                                        <p className="text-sm text-slate-600">{step}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="bg-violet-50 border border-violet-100 rounded-xl p-3">
                                            <p className="text-xs text-violet-700 font-medium">
                                                Gebührenstruktur: <span className="font-bold">{connectStatus?.platformFeePct ?? 2}% Platform Fee</span> (FreelancerTool) + Stripe-Gebühren (~1,4% + 25ct für EU-Karten)
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleConnectStripe}
                                            disabled={connectLoading}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 shadow-lg shadow-violet-200"
                                        >
                                            {connectLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link className="w-4 h-4" />}
                                            Mit Stripe verbinden
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Billing Card */}
                        <Link2 href="/settings/billing">
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
                        </Link2>
                        {/* Bank Accounts Card */}
                        <Link2 href="/settings/bank-accounts">
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
                        </Link2>

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
