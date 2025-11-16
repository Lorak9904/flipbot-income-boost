/**
 * InsufficientCreditsAlert Component
 * Displays when user attempts an action without sufficient credits
 */
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { CreditCard, Calendar, ArrowRight } from 'lucide-react';
import { getTranslations } from '@/components/language-utils';
import { creditsTranslations } from './credits-translations';
import { useNavigate } from 'react-router-dom';

interface InsufficientCreditsAlertProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  required: number;
  available: number;
  periodEnd?: string;
  onUpgrade?: () => void;
}

export function InsufficientCreditsAlert({
  open,
  onOpenChange,
  required,
  available,
  periodEnd,
  onUpgrade,
}: InsufficientCreditsAlertProps) {
  const t = getTranslations(creditsTranslations);
  const navigate = useNavigate();
  
  const daysUntilReset = periodEnd 
    ? Math.ceil((new Date(periodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;
  
  const handleViewPlans = () => {
    onOpenChange(false);
    if (onUpgrade) {
      onUpgrade();
    } else {
      navigate('/pricing');
    }
  };
  
  const handleGoToSettings = () => {
    onOpenChange(false);
    navigate('/settings');
  };
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-neutral-900 border-red-500/30 max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/20 blur-xl animate-pulse" />
              <div className="relative bg-red-500/10 p-4 rounded-full border-2 border-red-500/30">
                <CreditCard className="h-12 w-12 text-red-400" />
              </div>
            </div>
          </div>
          
          <AlertDialogTitle className="text-center text-2xl font-bold text-white">
            {t.insufficientTitle}
          </AlertDialogTitle>
          
          <AlertDialogDescription className="text-center space-y-4 pt-4">
            {/* Error message */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-neutral-200 text-base font-medium">
                {t.insufficientMessage
                  .replace('{required}', String(required))
                  .replace('{available}', String(available))
                }
              </p>
            </div>
            
            {/* Reset info */}
            {daysUntilReset !== null && (
              <div className="flex items-center justify-center gap-2 text-sm text-neutral-400">
                <Calendar className="h-4 w-4" />
                <span>
                  {t.resetsIn.replace('{days}', String(daysUntilReset))}
                </span>
              </div>
            )}
            
            {/* Call to action */}
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
              <p className="text-sm text-neutral-300">
                💡 <strong>Need more credits?</strong> Upgrade your plan to continue using FlipIt without interruption.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="flex-col sm:flex-col gap-2">
          <Button
            onClick={handleViewPlans}
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white"
          >
            {t.viewPlans}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            onClick={handleGoToSettings}
            className="w-full border-neutral-700 hover:bg-neutral-800"
          >
            {t.goToSettings}
          </Button>
          
          <AlertDialogCancel className="w-full mt-2 bg-neutral-800 hover:bg-neutral-700 border-0">
            {t.cancel}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * Hook to extract insufficient credits error from API response
 */
export function useInsufficientCreditsError(error: any): {
  required: number;
  available: number;
} | null {
  if (error?.response?.status === 402 && error?.response?.data?.error === 'insufficient_credits') {
    return {
      required: error.response.data.required,
      available: error.response.data.available,
    };
  }
  
  if (error?.error === 'insufficient_credits') {
    return {
      required: error.required,
      available: error.available,
    };
  }
  
  return null;
}
