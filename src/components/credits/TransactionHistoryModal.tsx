/**
 * TransactionHistoryModal Component
 * Displays detailed credit transaction history with filters
 */
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowDownCircle, ArrowUpCircle, Calendar, ChevronDown } from 'lucide-react';
import { getTranslations } from '@/components/language-utils';
import { creditsTranslations } from './credits-translations';
import { useTransactions } from '@/hooks/useTransactions';
import { formatActionType } from '@/lib/api/credits';
import { format } from 'date-fns';

interface TransactionHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransactionHistoryModal({ open, onOpenChange }: TransactionHistoryModalProps) {
  const t = getTranslations(creditsTranslations);
  const [filter, setFilter] = useState<'all' | 'publish' | 'enhance' | 'bonus'>('all');
  const [limit, setLimit] = useState(50);
  
  const { data, isLoading, error } = useTransactions(limit);
  
  const filteredTransactions = data?.transactions.filter((tx) => {
    if (filter === 'all') return true;
    if (filter === 'publish') return tx.action_type === 'publish_listing';
    if (filter === 'enhance') return tx.action_type === 'enhance_image';
    if (filter === 'bonus') return tx.amount > 0;
    return true;
  });
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden bg-neutral-900 border-neutral-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            📜 {t.transactionHistory}
          </DialogTitle>
          <DialogDescription className="text-neutral-400">
            {filteredTransactions && t.showing.replace('{count}', String(filteredTransactions.length)).replace('{total}', String(data?.count || 0))}
          </DialogDescription>
        </DialogHeader>
        
        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {(['all', 'publish', 'enhance', 'bonus'] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
              className={filter === f ? 'bg-cyan-500 hover:bg-cyan-600' : ''}
            >
              {t[`filter${f.charAt(0).toUpperCase() + f.slice(1)}` as keyof typeof t]}
            </Button>
          ))}
        </div>
        
        {/* Transaction list */}
        <div className="space-y-2 overflow-y-auto max-h-[50vh] pr-2">
          {isLoading && (
            <>
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </>
          )}
          
          {error && (
            <div className="text-center py-8 text-red-400">
              {t.errorLoading}
            </div>
          )}
          
          {!isLoading && filteredTransactions?.length === 0 && (
            <div className="text-center py-12 text-neutral-400">
              {t.noTransactions}
            </div>
          )}
          
          {filteredTransactions?.map((tx) => (
            <div
              key={tx.id}
              className="bg-neutral-800/30 rounded-lg p-4 border border-neutral-700/50 hover:border-neutral-600 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  {tx.amount < 0 ? (
                    <ArrowDownCircle className="h-5 w-5 text-red-400" />
                  ) : (
                    <ArrowUpCircle className="h-5 w-5 text-green-400" />
                  )}
                  
                  {/* Action type */}
                  <div>
                    <p className="font-medium text-white">
                      {formatActionType(tx.action_type)}
                    </p>
                    <p className="text-xs text-neutral-400 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(tx.created_at), 'MMM d, yyyy • h:mm a')}
                    </p>
                  </div>
                </div>
                
                {/* Amount */}
                <Badge
                  variant={tx.amount < 0 ? 'destructive' : 'default'}
                  className={tx.amount < 0 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}
                >
                  {tx.amount > 0 ? '+' : ''}{tx.amount}
                </Badge>
              </div>
              
              {/* Metadata */}
              {tx.metadata && Object.keys(tx.metadata).length > 0 && (
                <div className="mt-3 pt-3 border-t border-neutral-700/50 space-y-1">
                  {tx.metadata.platform && (
                    <p className="text-xs text-neutral-400">
                      <span className="text-neutral-500">Platform:</span>{' '}
                      <span className="text-cyan-400">{tx.metadata.platform}</span>
                    </p>
                  )}
                  {tx.metadata.draft_id && (
                    <p className="text-xs text-neutral-400">
                      <span className="text-neutral-500">Draft ID:</span>{' '}
                      <span className="font-mono">{tx.metadata.draft_id}</span>
                    </p>
                  )}
                  {tx.metadata.prompt && (
                    <p className="text-xs text-neutral-400">
                      <span className="text-neutral-500">Prompt:</span>{' '}
                      <span className="italic">{tx.metadata.prompt}</span>
                    </p>
                  )}
                  {tx.metadata.source && (
                    <p className="text-xs text-neutral-400">
                      <span className="text-neutral-500">Source:</span>{' '}
                      <Badge variant="outline" className="text-xs">
                        {tx.metadata.source}
                      </Badge>
                    </p>
                  )}
                </div>
              )}
              
              {/* Balance change */}
              <div className="mt-3 pt-3 border-t border-neutral-700/50 text-xs text-neutral-400">
                Balance: {tx.balance_before} → <span className="font-semibold">{tx.balance_after}</span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Load more */}
        {data && data.count > limit && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setLimit(limit + 50)}
          >
            <ChevronDown className="h-4 w-4 mr-2" />
            {t.loadMore}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
