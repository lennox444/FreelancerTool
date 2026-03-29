import { useQuery } from '@tanstack/react-query';
import { searchApi } from '@/lib/api/search';

export function useSearch(q: string) {
  return useQuery({
    queryKey: ['search', q],
    queryFn: () => searchApi.search(q),
    enabled: q.trim().length >= 2,
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}
