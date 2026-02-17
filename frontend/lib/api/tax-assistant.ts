import apiClient from './client';
import { TaxAssistantResult, ApiResponse } from '../types';

export const taxAssistantApi = {
  calculate: (year?: number) =>
    apiClient
      .get<ApiResponse<TaxAssistantResult>>('/tax-assistant', { params: { year } })
      .then((r) => r.data),
};
