import apiClient from './client';

export interface BankAccount {
    id: string;
    name: string;
    bankName?: string;
    iban?: string;
    bic?: string;
    accountHolder?: string;
    isPaypal: boolean;
    paypalEmail?: string;
    isDefault: boolean;
}

export const bankAccountsApi = {
    getAll: async () => {
        const response = await apiClient.get<BankAccount[]>('/bank-accounts');
        return response.data;
    },

    create: async (data: Partial<BankAccount>) => {
        const response = await apiClient.post<BankAccount>('/bank-accounts', data);
        return response.data;
    },

    update: async (id: string, data: Partial<BankAccount>) => {
        const response = await apiClient.patch<BankAccount>(`/bank-accounts/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        await apiClient.delete(`/bank-accounts/${id}`);
    },
};
