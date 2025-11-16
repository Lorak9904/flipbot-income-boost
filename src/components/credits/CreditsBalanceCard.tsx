/**
 * CreditsBalanceCard Component
 * Main visual display for user's credit balance and subscription info
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Gift, TrendingUp } from 'lucide-react';
import { PlanBadge } from './PlanBadge';
import { CreditsProgressBar } from './CreditsProgressBar';
import { getTranslations } from '@/components/language-utils';
import { creditsTranslations } from './credits-translations';
import { useCredits } from '@/hooks/useCredits';
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
  
  return (
    <Card className="bg-neutral-900/50 backdrop-blur-sm ring-1 ring-cyan-400/20 border-0">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              {t.creditsBalance}
            </CardTitle>
            <CardDescription className="text-neutral-400 mt-1">
              {t.currentPlan}: <PlanBadge plan={credits.plan} size="sm" />
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onManagePlan}
            className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
          >
            {t.managePlan}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Publishing Credits */}
        <div className="space-y-2">
          <p className="text-sm text-neutral-400">Publishing</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-cyan-400">
              {credits.publish_credits_used}
            </span>
            <span className="text-lg text-neutral-500">/ {credits.publish_limit ?? '∞'}</span>
          </div>
        </div>
        
        {/* Image Credits */}
        <div className="space-y-2">
          <p className="text-sm text-neutral-400">Image Enhancement</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-fuchsia-400">
              {credits.image_credits_used}
            </span>
            <span className="text-lg text-neutral-500">/ {credits.image_limit ?? '∞'}</span>
          </div>
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
