/**
 * PlanManagementDialog Component
 * Plan comparison and upgrade/downgrade with Stripe integration
 */
import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, Sparkles } from 'lucide-react';
import { PlanBadge } from './PlanBadge';
import { HeroCTA, SecondaryAction } from '@/components/ui/button-presets';
import { getTranslations } from '@/components/language-utils';
import { creditsTranslations } from './credits-translations';
import { useCredits } from '@/hooks/useCredits';
import { useToast } from '@/hooks/use-toast';
import { createBillingPortalSession, createCheckoutSession, createImageAddonCheckoutSession } from '@/lib/api/billing';
import { normalizePlan } from '@/lib/api/credits';

interface PlanManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PlanDetails {
  id: 'start' | 'plus' | 'scale' | 'unlimited';
  name: string;
  monthlyPrice: string;
  annualPrice?: string;
  credits: string;
  platforms: string;
  support: string;
  features: string[];
}

export function PlanManagementDialog({ open, onOpenChange }: PlanManagementDialogProps) {
  const t = getTranslations(creditsTranslations);
  const { data: credits } = useCredits();
  const { toast } = useToast();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [cycleInitialized, setCycleInitialized] = useState(false);
  const currentPlan = credits ? normalizePlan(credits.effective_plan ?? credits.plan) : null;
  const hasStripeSubscription = Boolean(
    credits?.subscription_status &&
    credits.subscription_status !== 'canceled' &&
    credits.subscription_status !== 'incomplete_expired'
  );
  const currentBillingCycle: 'monthly' | 'annual' | null = credits?.billing_interval === 'year'
    ? 'annual'
    : credits?.billing_interval === 'month'
      ? 'monthly'
      : null;
  const inferredCurrentBillingCycle: 'monthly' | 'annual' | null = currentBillingCycle
    ?? (currentPlan && currentPlan !== 'start' ? 'monthly' : null);
  
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: 'upgrade' | 'downgrade' | 'cancel';
    targetPlan?: 'start' | 'plus' | 'scale' | 'unlimited';
  }>({ open: false, action: 'upgrade' });
  
  const [processing, setProcessing] = useState(false);

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return 'Please try again later.';
  };
  
  const plans: PlanDetails[] = [
    {
      id: 'start',
      name: t.planStarter,
      monthlyPrice: t.free,
      credits: '5 listings + 1 image/month',
      platforms: 'All supported marketplaces',
      support: 'Community',
      features: [
        '5 listings per month',
        '1 AI image enhancement per month',
        'All supported marketplaces',
        'Manual review before publish',
        'Community support',
      ],
    },
    {
      id: 'plus',
      name: t.planPro,
      monthlyPrice: '29 PLN/month',
      annualPrice: '279 PLN/year',
      credits: '30 listings + 20 images/month',
      platforms: 'All supported marketplaces',
      support: 'Email',
      features: [
        '30 listings per month',
        '20 AI image enhancements per month',
        'All supported marketplaces',
        'Manual review before publish',
        'Email support',
      ],
    },
    {
      id: 'scale',
      name: t.planBusiness,
      monthlyPrice: '59 PLN/month',
      annualPrice: '569 PLN/year',
      credits: '100 listings + 100 images/month',
      platforms: 'All supported marketplaces',
      support: 'Priority email',
      features: [
        '100 listings per month',
        '100 AI image enhancements per month',
        'All supported marketplaces',
        'Manual review before publish',
        'Priority email support',
      ],
    },
    {
      id: 'unlimited',
      name: t.planUnlimited,
      monthlyPrice: '149 PLN/month',
      annualPrice: '1430 PLN/year',
      credits: 'Unlimited listings + 150 included images/month',
      platforms: 'All supported marketplaces',
      support: 'Priority email',
      features: [
        'Unlimited listings per month',
        '150 included AI image enhancements per month',
        'Image add-on packs available (+50 / +100)',
        'All supported marketplaces',
        'Manual review before publish',
        'Priority email support',
      ],
    },
  ];

  const getDisplayedPrice = (plan: PlanDetails): string => {
    if (plan.id === 'start') {
      return plan.monthlyPrice;
    }
    return billingCycle === 'annual' && plan.annualPrice ? plan.annualPrice : plan.monthlyPrice;
  };

  useEffect(() => {
    if (!cycleInitialized && currentBillingCycle) {
      setBillingCycle(currentBillingCycle);
      setCycleInitialized(true);
    }
  }, [cycleInitialized, currentBillingCycle]);

  const openBillingPortal = async () => {
    setProcessing(true);
    try {
      const portalUrl = await createBillingPortalSession();
      window.location.href = portalUrl;
    } catch (error: unknown) {
      toast({
        title: t.errorUpgrade,
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };
  
  const handlePlanAction = async (targetPlan: 'start' | 'plus' | 'scale' | 'unlimited') => {
    if (!credits || !currentPlan) return;

    if (hasStripeSubscription) {
      await openBillingPortal();
      return;
    }

    const samePlanCycleSwitch =
      targetPlan === currentPlan &&
      targetPlan !== 'start' &&
      inferredCurrentBillingCycle !== null &&
      inferredCurrentBillingCycle !== billingCycle;
    if (samePlanCycleSwitch) {
      setConfirmDialog({
        open: true,
        action: billingCycle === 'annual' ? 'upgrade' : 'downgrade',
        targetPlan,
      });
      return;
    }
    
    // Open confirmation dialog
    const action = getPlanChangeAction(currentPlan, targetPlan);
    if (!action) return;
    
    setConfirmDialog({ open: true, action, targetPlan });
  };
  
  const confirmPlanChange = async () => {
    setProcessing(true);
    setConfirmDialog({ ...confirmDialog, open: false });
    
    try {
      const targetPlanDetails = plans.find(p => p.id === confirmDialog.targetPlan);
      
      if (confirmDialog.action === 'upgrade' && targetPlanDetails?.id && targetPlanDetails.id !== 'start') {
        toast({
          title: t.redirectingToCheckout,
          description: `Upgrading to ${targetPlanDetails.name}...`,
        });
        
        const checkoutPlan = targetPlanDetails.id as 'plus' | 'scale' | 'unlimited';
        const checkoutUrl = await createCheckoutSession(checkoutPlan, billingCycle);
        window.location.href = checkoutUrl;
        return;
      }
      
      await openBillingPortal();
    } catch (error: unknown) {
      toast({
        title: t.errorUpgrade,
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const purchaseImageAddon = async (pack: 'image_50' | 'image_100') => {
    setProcessing(true);
    try {
      toast({
        title: t.redirectingToCheckout,
        description: t.buyAddonCredits || 'Redirecting to image add-on checkout...',
      });
      const checkoutUrl = await createImageAddonCheckoutSession(pack);
      window.location.href = checkoutUrl;
    } catch (error: unknown) {
      toast({
        title: t.errorUpgrade,
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };
  
  const getPlanChangeAction = (
    currentPlan: string,
    targetPlan: string
  ): 'upgrade' | 'downgrade' | null => {
    const planOrder = { start: 1, plus: 2, scale: 3, unlimited: 4 };
    const current = planOrder[currentPlan as keyof typeof planOrder];
    const target = planOrder[targetPlan as keyof typeof planOrder];
    if (!current || !target) return null;
    
    if (current === target) return null;
    return target > current ? 'upgrade' : 'downgrade';
  };
  
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-neutral-900 border-neutral-800">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-cyan-400" />
              {t.planManagement}
            </DialogTitle>
            <DialogDescription className="text-neutral-400">
              {currentPlan && (
                <>
                  {t.currentPlan}: <PlanBadge plan={currentPlan} size="sm" />
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 flex items-center justify-center gap-3">
            <p className="text-sm text-neutral-400">{t.billingLabel || 'Billing'}</p>
            <div className="inline-flex rounded-lg border border-neutral-700 bg-neutral-800/40 p-1">
              <Button
                type="button"
                size="sm"
                variant={billingCycle === 'monthly' ? 'default' : 'ghost'}
                className={billingCycle === 'monthly' ? 'bg-cyan-500 hover:bg-cyan-600 text-white' : 'text-neutral-300'}
                onClick={() => setBillingCycle('monthly')}
              >
                {t.billingMonthly || 'Monthly'}
              </Button>
              <Button
                type="button"
                size="sm"
                variant={billingCycle === 'annual' ? 'default' : 'ghost'}
                className={billingCycle === 'annual' ? 'bg-cyan-500 hover:bg-cyan-600 text-white' : 'text-neutral-300'}
                onClick={() => setBillingCycle('annual')}
              >
                {t.billingAnnual || 'Annual'}
              </Button>
            </div>
          </div>

          {hasStripeSubscription && (
            <div className="mt-4 rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-4">
              <p className="text-sm text-neutral-300">
                {t.portalManagedNotice || 'Your subscription is active. Plan and billing cycle changes are managed in Stripe Billing Portal.'}
              </p>
              <Button
                type="button"
                className="mt-3 bg-cyan-500 text-white hover:bg-cyan-600"
                disabled={processing}
                onClick={openBillingPortal}
              >
                {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t.openBillingPortal || 'Open Stripe Billing Portal'}
              </Button>
            </div>
          )}
          
          {/* Plans comparison table */}
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mt-6">
            {plans.map((plan) => {
              const isCurrentPlan = currentPlan === plan.id;
              const isCurrentCycle =
                !hasStripeSubscription ||
                !inferredCurrentBillingCycle ||
                billingCycle === inferredCurrentBillingCycle;
              const isCurrent = isCurrentPlan && isCurrentCycle;
              const showMostPopular = plan.id === 'plus' && currentPlan === 'start';
              const action = currentPlan ? getPlanChangeAction(currentPlan, plan.id) : null;
              const displayedPrice = getDisplayedPrice(plan);
              const isPortalManaged = hasStripeSubscription;
              const samePlanCycleSwitch =
                !hasStripeSubscription &&
                isCurrentPlan &&
                plan.id !== 'start' &&
                inferredCurrentBillingCycle !== null &&
                billingCycle !== inferredCurrentBillingCycle;
              
              return (
                <div
                  key={plan.id}
                  className={`
                    relative rounded-xl p-6 border-2 transition-all
                    ${isCurrent 
                      ? 'border-cyan-500 bg-cyan-500/5' 
                      : 'border-neutral-700 bg-neutral-800/30 hover:border-neutral-600'
                    }
                    ${plan.id === 'plus' ? 'md:scale-105 md:shadow-lg md:shadow-cyan-500/10' : ''}
                  `}
                >
                  {/* Featured badge for Plus */}
                  {showMostPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  {/* Current plan badge */}
                  {isCurrent && (
                    <div className="absolute -top-3 right-4">
                      <Badge className="bg-cyan-500 text-white">
                        {hasStripeSubscription && currentBillingCycle
                          ? `${t.currentlyActive} (${currentBillingCycle === 'annual' ? (t.billingAnnual || 'Annual') : (t.billingMonthly || 'Monthly')})`
                          : t.currentlyActive}
                      </Badge>
                    </div>
                  )}
                  
                  {/* Plan header */}
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <div className="text-3xl font-bold text-cyan-400 mb-1">{displayedPrice}</div>
                    {plan.id !== 'start' && (
                      <p className="text-xs text-neutral-400">
                        {billingCycle === 'monthly' ? t.perMonth : (t.perYear || 'per year')}
                      </p>
                    )}
                  </div>
                  
                  {/* Key stats */}
                  <div className="space-y-3 mb-6 pb-6 border-b border-neutral-700">
                    <div>
                      <p className="text-xs text-neutral-400 mb-1">{t.planCredits}</p>
                      <p className="text-lg font-semibold text-white">{plan.credits}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-400 mb-1">{t.planPlatforms}</p>
                      <p className="text-sm text-white">{plan.platforms}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-400 mb-1">{t.planSupport}</p>
                      <p className="text-sm text-white">{plan.support}</p>
                    </div>
                  </div>
                  
                  {/* Features list */}
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                        <span className="text-neutral-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {/* Action button */}
                  <Button
                    className={`
                      w-full
                      ${isCurrent
                        ? 'bg-neutral-700 cursor-default' 
                        : isPortalManaged
                          ? 'bg-neutral-700 hover:bg-neutral-600'
                          : action === 'upgrade'
                          ? 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600'
                          : 'bg-neutral-700 hover:bg-neutral-600'
                      }
                    `}
                    disabled={isCurrent || processing}
                    onClick={() => handlePlanAction(plan.id)}
                  >
                    {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isCurrent 
                      ? t.currentlyActive
                      : isPortalManaged
                        ? (t.managedInStripe || 'Managed in Stripe')
                        : samePlanCycleSwitch
                          ? (billingCycle === 'annual' ? t.upgrade : t.downgrade)
                        : action === 'upgrade'
                        ? t.upgrade
                        : t.downgrade
                    }
                  </Button>
                </div>
              );
            })}
          </div>

          {currentPlan === 'unlimited' && (
            <div className="mt-6 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
              <p className="text-sm text-neutral-300 mb-3">
                {t.buyAddonCredits || 'Buy add-on image credits'}
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  className="border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10"
                  disabled={processing}
                  onClick={() => purchaseImageAddon('image_50')}
                >
                  {t.addonPack50 || 'Buy +50 credits'}
                </Button>
                <Button
                  variant="outline"
                  className="border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10"
                  disabled={processing}
                  onClick={() => purchaseImageAddon('image_100')}
                >
                  {t.addonPack100 || 'Buy +100 credits'}
                </Button>
              </div>
            </div>
          )}
          
          {/* Additional info */}
          <div className="mt-6 p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-lg">
            <p className="text-sm text-neutral-300">
              💳 <strong>Secure payments powered by Stripe</strong> - Your payment information is never stored on our servers.
            </p>
            <p className="text-xs text-neutral-400 mt-2">
              Need help choosing? Contact us at support@myflipit.live
            </p>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Confirmation dialog */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <AlertDialogContent className="bg-neutral-900 border-neutral-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              {confirmDialog.action === 'upgrade'
                ? t.confirmUpgrade.replace('{plan}', plans.find(p => p.id === confirmDialog.targetPlan)?.name || '')
                : t.confirmDowngrade.replace('{plan}', plans.find(p => p.id === confirmDialog.targetPlan)?.name || '')
              }
            </AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-400">
              {confirmDialog.action === 'upgrade'
                ? t.confirmUpgradeMessage
                    .replace('{price}', getDisplayedPrice(plans.find(p => p.id === confirmDialog.targetPlan) || plans[0]))
                    .replace('{credits}', plans.find(p => p.id === confirmDialog.targetPlan)?.credits || '')
                : t.confirmDowngradeMessage
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <SecondaryAction className="min-h-[44px] px-6 py-2 sm:w-auto">
                {t.cancel}
              </SecondaryAction>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <HeroCTA
                onClick={confirmPlanChange}
                className="min-h-[44px] px-6 py-2 sm:w-auto"
              >
                {t.confirm}
              </HeroCTA>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
