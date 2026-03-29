import apiClient from './client';

export interface SearchResult {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  meta?: string;
  href: string;
}

export interface SearchResponse {
  results: Record<string, SearchResult[]>;
  total: number;
}

export const searchApi = {
  search: async (q: string): Promise<SearchResponse> => {
    const res = await apiClient.get<{ data: SearchResponse }>('/search', { params: { q } });
    return res.data.data;
  },
};
