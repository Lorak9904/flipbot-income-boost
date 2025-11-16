/**
 * React Query hook for credit transactions
 */
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { fetchTransactions, TransactionResponse } from '@/lib/api/credits';

export function useTransactions(limit = 50): UseQueryResult<TransactionResponse, Error> {
  return useQuery({
    queryKey: ['transactions', limit],
    queryFn: () => fetchTransactions(limit),
    staleTime: 10000, // Consider data stale after 10 seconds
    retry: 2,
  });
}
