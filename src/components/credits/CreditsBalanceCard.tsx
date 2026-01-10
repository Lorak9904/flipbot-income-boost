/**
 * CreditsBalanceCard Component
 * Main visual display for user's credit balance and subscription info
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, CreditCard, RefreshCw } from 'lucide-react';
import { PlanBadge } from './PlanBadge';
import { getTranslations } from '@/components/language-utils';
import { creditsTranslations } from './credits-translations';
import { useCredits } from '@/hooks/useCredits';
import { normalizePlan } from '@/lib/api/credits';
import { format } from 'date-fns';

interface CreditsBalanceCardProps {
  onManagePlan?: () => void;
  onViewHistory?: () => void;
}

export function CreditsBalanceCard({ onManagePlan, onViewHistory }: CreditsBalanceCardProps) {
  const t = getTranslations(creditsTranslations);
  const { data: credits, isLoading, error } = useCredits();
  
  if (isLoading) {
    return (
      <Card className="bg-neutral-900/50 border-neutral-800">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="bg-neutral-900/50 border-red-500/30">
        <CardContent className="pt-6">
          <p className="text-red-400 text-sm">{t.errorLoading}</p>
        </CardContent>
      </Card>
    );
  }
  
  if (!credits) return null;
  
  const activePlan = normalizePlan(credits.effective_plan ?? credits.plan);
  
  // Format subscription dates
  const formatDate = (timestamp: number | null | undefined) => {
    if (!timestamp) return null;
    return format(new Date(timestamp * 1000), 'MMM d, yyyy');
  };
  
  const startedAt = formatDate(credits.current_period_start);
  const nextChargeAt = formatDate(credits.current_period_end);
  const billingInterval = credits.billing_interval
    ? credits.billing_interval === 'month'
      ? (t.billingMonthly || 'Monthly')
      : credits.billing_interval === 'year'
        ? (t.billingAnnual || 'Annual')
        : credits.billing_interval
    : null;
  
  // Check if user has an active paid subscription
  const hasPaidSubscription = activePlan !== 'start' && 
    credits.subscription_status && 
    credits.subscription_status !== 'canceled' &&
    credits.subscription_status !== 'incomplete_expired';

  return (
    <Card className="bg-neutral-900/50 backdrop-blur-sm ring-1 ring-cyan-400/20 border-0">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              {t.subscriptionTitle || 'Subscription & Credits'}
            </CardTitle>
            <CardDescription className="text-neutral-400 mt-1">
              {t.currentPlan}: <PlanBadge plan={activePlan} size="sm" />
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onManagePlan}
            className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
          >
            {t.changePlan || 'Change Plan'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Subscription Details (only for paid plans) */}
        {hasPaidSubscription && (
          <div className="p-4 rounded-lg bg-neutral-800/50 border border-neutral-700/50 space-y-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-cyan-400" />
              {t.subscriptionDetails || 'Subscription Details'}
            </h3>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              {billingInterval && (
                <div>
                  <p className="text-neutral-500">{t.billingLabel || 'Billing'}</p>
                  <p className="text-white font-medium">{billingInterval}</p>
                </div>
              )}
              
              {startedAt && (
                <div>
                  <p className="text-neutral-500">{t.startedLabel || 'Started'}</p>
                  <p className="text-white font-medium flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {startedAt}
                  </p>
                </div>
              )}
              
              {nextChargeAt && (
                <div>
                  <p className="text-neutral-500">
                    {credits.cancel_at_period_end
                      ? (t.activeUntilLabel || 'Active until')
                      : (t.nextBillingLabel || 'Next billing')}
                  </p>
                  <p className="text-white font-medium">{nextChargeAt}</p>
                </div>
              )}

              {credits.cancel_at_period_end && (
                <div className="col-span-2 pt-2 border-t border-neutral-700">
                  <p className="text-amber-400 text-xs">
                    ⚠️ {t.cancelScheduled || 'Subscription will cancel at period end'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Publishing Credits */}
        <div className="space-y-2">
          <p className="text-sm text-neutral-400">{t.listingsRemaining || 'Listings Remaining'}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-cyan-400">
              {credits.publish_remaining === null ? '∞' : credits.publish_remaining}
            </span>
            <span className="text-lg text-neutral-500">/ {credits.publish_limit ?? '∞'}</span>
          </div>
          <p className="text-xs text-neutral-500">{t.usedLabel || 'Used'}: {credits.publish_credits_used}</p>
        </div>
        
        {/* Image Credits */}
        <div className="space-y-2">
          <p className="text-sm text-neutral-400">{t.imageEnhancements || 'AI Photo Enhancements'}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-fuchsia-400">
              {credits.image_remaining === null ? '∞' : credits.image_remaining}
            </span>
            <span className="text-lg text-neutral-500">/ {credits.image_limit ?? '∞'}</span>
          </div>
          <p className="text-xs text-neutral-500">{t.usedLabel || 'Used'}: {credits.image_credits_used}</p>
        </div>
        
        {/* View history button */}
        <Button
          variant="ghost"
          className="w-full text-cyan-400 hover:bg-cyan-400/10"
          onClick={onViewHistory}
        >
          {t.viewHistory} →
        </Button>
      </CardContent>
    </Card>
  );
}
