/**
 * PlanBadge Component
 * Visual indicator for user's subscription tier
 */
import { getTranslations } from '@/components/language-utils';
import { creditsTranslations } from './credits-translations';

interface PlanBadgeProps {
  plan: 'starter' | 'pro' | 'business';
  size?: 'sm' | 'md' | 'lg';
}

export function PlanBadge({ plan, size = 'md' }: PlanBadgeProps) {
  const t = getTranslations(creditsTranslations);
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };
  
  const planConfig = {
    starter: {
      label: t.planStarter,
      bgClass: 'bg-neutral-800/50 border-neutral-600',
      textClass: 'text-neutral-300',
    },
    pro: {
      label: t.planPro,
      bgClass: 'bg-cyan-500/10 border-cyan-400/30',
      textClass: 'text-cyan-400',
    },
    business: {
      label: t.planBusiness,
      bgClass: 'bg-purple-500/10 border-purple-400/30',
      textClass: 'text-purple-400',
    },
  };
  
  const config = planConfig[plan];
  
  return (
    <span
      className={`
        inline-flex items-center rounded-full border font-semibold uppercase tracking-wide
        ${sizeClasses[size]} ${config.bgClass} ${config.textClass}
      `}
    >
      {config.label}
    </span>
  );
}
