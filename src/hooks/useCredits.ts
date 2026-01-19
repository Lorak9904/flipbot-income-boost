/**
 * React Query hook for credits balance
 */
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { fetchCreditsBalance, CreditsBalance } from '@/lib/api/credits';

export function useCredits(): UseQueryResult<CreditsBalance, Error> {
  return useQuery({
    queryKey: ['credits'],
    queryFn: fetchCreditsBalance,
    // Keep credits fresh on focus or explicit invalidation; avoid constant polling.
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}
