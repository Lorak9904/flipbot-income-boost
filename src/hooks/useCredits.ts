/**
 * React Query hook for credits balance
 */
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { fetchCreditsBalance, CreditsBalance } from '@/lib/api/credits';

export function useCredits(): UseQueryResult<CreditsBalance, Error> {
  return useQuery({
    queryKey: ['credits'],
    queryFn: fetchCreditsBalance,
    refetchInterval: 60000, // Refresh every minute to keep balance updated
    staleTime: 30000, // Consider data stale after 30 seconds
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}
