import apiClient from './client';

export interface ConnectStatus {
  connected: boolean;
  chargesEnabled: boolean;
  accountId: string | null;
  platformFeePct: number;
}

export const billingApi = {
  connectStripe: async (): Promise<{ url: string }> => {
    const response = await apiClient.post<{ url: string }>('/billing/connect/start');
    return response.data;
  },

  getConnectStatus: async (): Promise<ConnectStatus> => {
    const response = await apiClient.get<ConnectStatus>('/billing/connect/status');
    return response.data;
  },

  disconnectStripe: async (): Promise<{ success: boolean }> => {
    const response = await apiClient.delete<{ success: boolean }>('/billing/connect');
    return response.data;
  },
};
