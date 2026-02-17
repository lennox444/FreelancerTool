'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bankAccountsApi, BankAccount } from '@/lib/api/bank-accounts';
import { Plus, Trash2, Edit2, CheckCircle, Landmark, MoreVertical, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function BankAccountsPage() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);

    const { data: accounts = [], isLoading } = useQuery({
        queryKey: ['bank-accounts'],
        queryFn: bankAccountsApi.getAll,
    });

    const createMutation = useMutation({
        mutationFn: bankAccountsApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
            toast.success('Bankkonto hinzugefügt');
            setIsModalOpen(false);
            setEditingAccount(null);
        },
        onError: () => toast.error('Fehler beim Hinzufügen'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<BankAccount> }) =>
            bankAccountsApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
            toast.success('Bankkonto aktualisiert');
            setIsModalOpen(false);
            setEditingAccount(null);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: bankAccountsApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
            toast.success('Bankkonto gelöscht');
        },
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const type = formData.get('type') as 'bank' | 'paypal';
        const isPaypal = type === 'paypal';

        // Sanitize string inputs (trim whitespace, convert empty to undefined)
        const sanitize = (val: FormDataEntryValue | null): string | undefined => {
            if (!val || typeof val !== 'string') return undefined;
            const trimmed = val.trim();
            return trimmed === '' ? undefined : trimmed;
        };

        const currentName = sanitize(formData.get('name'));
        if (!currentName) {
            toast.error('Bitte eine Bezeichnung eingeben');
            return;
        }

        const baseData = {
            name: currentName,
            isPaypal,
            isDefault: formData.get('isDefault') === 'on',
        };

        let data: Partial<BankAccount>;

        if (isPaypal) {
            const paypalEmail = sanitize(formData.get('paypalEmail'));
            if (!paypalEmail) {
                toast.error('Bitte eine PayPal Email eingeben');
                return;
            }
            // Explicitly clear bank fields for updates by sending null if editing, 
            // otherwise just don't send them for creation
            data = {
                ...baseData,
                paypalEmail,
                bankName: editingAccount ? null as any : undefined,
                iban: editingAccount ? null as any : undefined,
                bic: editingAccount ? null as any : undefined,
                accountHolder: editingAccount ? null as any : undefined,
            };
        } else {
            // Bank transfer
            const bankName = sanitize(formData.get('bankName'));
            const iban = sanitize(formData.get('iban'));
            const bic = sanitize(formData.get('bic'));
            const accountHolder = sanitize(formData.get('accountHolder'));

            if (!bankName || !iban || !bic || !accountHolder) {
                toast.error('Bitte alle Bankdaten ausfüllen');
                return;
            }

            data = {
                ...baseData,
                bankName,
                iban,
                bic,
                accountHolder,
                // Clear paypal field
                paypalEmail: editingAccount ? null as any : undefined,
            };
        }

        if (editingAccount) {
            updateMutation.mutate({ id: editingAccount.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const openEdit = (acc: BankAccount) => {
        setEditingAccount(acc);
        setIsModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Link href="/settings" className="text-sm text-slate-500 hover:text-slate-800 mb-2 block">
                            ← Zurück zu Einstellungen
                        </Link>
                        <h1 className="text-3xl font-bold text-slate-900">Bankverbindungen</h1>
                        <p className="text-slate-600">Verwalte deine Konten für Rechnungen</p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingAccount(null);
                            setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Neues Konto
                    </button>
                </div>

                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin w-8 h-8 boundary-t-2 border-slate-900 rounded-full mx-auto" />
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {accounts.length === 0 && (
                            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                                <Landmark className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-slate-900">Keine Konten hinterlegt</h3>
                                <p className="text-slate-500 mb-6">Füge dein erstes Bankkonto oder PayPal hinzu.</p>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="text-indigo-600 font-medium hover:underline"
                                >
                                    Jetzt hinzufügen
                                </button>
                            </div>
                        )}

                        {Array.isArray(accounts) && accounts.map((acc) => (
                            <div
                                key={acc.id}
                                className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-slate-300 transition-all shadow-sm"
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${acc.isPaypal ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                                        {acc.isPaypal ? <CreditCard className="w-6 h-6" /> : <Landmark className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-bold text-slate-900">{acc.name}</h3>
                                            {acc.isDefault && (
                                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full flex items-center gap-1">
                                                    <CheckCircle className="w-3 h-3" /> Standard
                                                </span>
                                            )}
                                        </div>
                                        {acc.isPaypal ? (
                                            <p className="text-slate-500 text-sm mt-1">{acc.paypalEmail}</p>
                                        ) : (
                                            <div className="text-slate-500 text-sm mt-1 space-y-0.5">
                                                <p>{acc.bankName} • {acc.accountHolder}</p>
                                                <p className="font-mono text-xs">{acc.iban} • {acc.bic}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => openEdit(acc)}
                                        className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (confirm('Wirklich löschen?')) deleteMutation.mutate(acc.id)
                                        }}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-6">
                            {editingAccount ? 'Konto bearbeiten' : 'Neues Konto hinzufügen'}
                        </h2>

                        <AccountForm
                            initial={editingAccount}
                            onSubmit={handleSubmit}
                            onCancel={() => {
                                setIsModalOpen(false);
                                setEditingAccount(null);
                            }}
                            isLoading={createMutation.isPending || updateMutation.isPending}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

function AccountForm({ initial, onSubmit, onCancel, isLoading }: any) {
    const [type, setType] = useState<'bank' | 'paypal'>(initial?.isPaypal ? 'paypal' : 'bank');

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="flex gap-4 p-1 bg-slate-100 rounded-lg mb-6">
                <button
                    type="button"
                    onClick={() => setType('bank')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${type === 'bank' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Banküberweisung
                </button>
                <button
                    type="button"
                    onClick={() => setType('paypal')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${type === 'paypal' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    PayPal
                </button>
                <input type="hidden" name="type" value={type} />
            </div>

            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Bezeichnung (intern)</label>
                <input
                    name="name"
                    defaultValue={initial?.name}
                    placeholder={type === 'bank' ? 'Geschäftskonto Sparkasse' : 'PayPal Business'}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                />
            </div>

            {type === 'bank' ? (
                <>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Bankname</label>
                            <input
                                name="bankName"
                                defaultValue={initial?.bankName}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Kontoinhaber</label>
                            <input
                                name="accountHolder"
                                defaultValue={initial?.accountHolder}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">IBAN</label>
                        <input
                            name="iban"
                            defaultValue={initial?.iban}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">BIC</label>
                        <input
                            name="bic"
                            defaultValue={initial?.bic}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                            required
                        />
                    </div>
                </>
            ) : (
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">PayPal E-Mail</label>
                    <input
                        type="email"
                        name="paypalEmail"
                        defaultValue={initial?.paypalEmail}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        required
                    />
                </div>
            )}

            <div className="pt-4 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        name="isDefault"
                        defaultChecked={initial?.isDefault}
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-slate-700">Als Standardkonto verwenden</span>
                </label>
            </div>

            <div className="flex gap-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors"
                >
                    Abbrechen
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                    {isLoading ? 'Speichern...' : 'Speichern'}
                </button>
            </div>
        </form>
    );
}
