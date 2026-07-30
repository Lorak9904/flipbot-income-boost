import { CheckCircle } from 'lucide-react';
import { HeroCTA, SecondaryAction } from '@/components/ui/button-presets';
import { Link } from 'react-router-dom';

interface PricingCardProps {
  name: string;
  description: string;
  price: string;
  annualPrice?: string;
  billingCycle: 'monthly' | 'annual';
  features: string[];
  featured?: boolean;
  badge?: string;
  perMonthLabel?: string;
  perYearLabel?: string;
  billingLabelOverride?: string;
  ctaText: string;
  ctaLink?: string;
  ctaOnClick?: () => void;
  index: number;
}

export const PricingCard = ({
  name,
  description,
  price,
  annualPrice,
  billingCycle,
  features,
  featured = false,
  badge,
  perMonthLabel = 'per month',
  perYearLabel = 'per year',
  billingLabelOverride,
  ctaText,
  ctaLink,
  ctaOnClick,
  index,
}: PricingCardProps) => {
  const displayPrice = billingCycle === 'annual' && annualPrice ? annualPrice : price;
  const isFree = price === 'Free' || price === 'Darmowy';
  
  return (
    <article
      className={`relative flex flex-col rounded-xl border bg-neutral-950/75 p-6 shadow-sm ${
        featured
          ? 'border-cyan-400/70 bg-cyan-950/20 shadow-cyan-950/30'
          : 'border-white/10'
      }`}
      data-pricing-card-index={index}
    >
      {badge && (
        <div className="absolute -top-3 left-5 rounded-md border border-cyan-300/40 bg-cyan-400 px-3 py-1 text-xs font-bold uppercase tracking-wide text-neutral-950">
          {badge}
        </div>
      )}
      
      <div className="flex-grow">
        <h3 className="mb-2 text-xl font-bold text-white">{name}</h3>
        <p className="mb-5 min-h-10 text-sm leading-5 text-neutral-400">{description}</p>
        
        <div className="mb-6">
          {isFree ? (
            <div className="text-4xl font-extrabold tracking-tight text-cyan-300">
              {price}
            </div>
          ) : (
            <>
              <div className="text-4xl font-extrabold tracking-tight text-white">
                {displayPrice}
              </div>
              <p className="mt-1 text-sm text-neutral-300">
                {billingLabelOverride || (billingCycle === 'monthly' ? perMonthLabel : perYearLabel)}
              </p>
            </>
          )}
        </div>
        
        <div className="my-5 border-t border-white/10"></div>
        
        <ul className="mb-7 space-y-3">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" aria-hidden="true" />
              <span className="text-sm leading-5 text-neutral-200">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      
      {featured ? (
        <HeroCTA asChild className="w-full">
          {ctaOnClick ? (
            <button type="button" onClick={ctaOnClick}>{ctaText}</button>
          ) : (
            <Link to={ctaLink || '#'}>{ctaText}</Link>
          )}
        </HeroCTA>
      ) : (
        <SecondaryAction asChild className="w-full">
          {ctaOnClick ? (
            <button type="button" onClick={ctaOnClick}>{ctaText}</button>
          ) : (
            <Link to={ctaLink || '#'}>{ctaText}</Link>
          )}
        </SecondaryAction>
      )}
    </article>
  );
};
