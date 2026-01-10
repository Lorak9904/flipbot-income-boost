import { motion } from 'framer-motion';
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
  ctaText: string;
  ctaLink?: string;
  ctaOnClick?: () => void;
  index: number;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 * i, duration: 0.6, ease: 'easeOut' },
  }),
};

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
  ctaText,
  ctaLink,
  ctaOnClick,
  index,
}: PricingCardProps) => {
  const displayPrice = billingCycle === 'annual' && annualPrice ? annualPrice : price;
  const isFree = price === 'Free' || price === 'Darmowy';
  
  return (
    <motion.div
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeUp}
      className={`relative flex flex-col bg-neutral-900/50 backdrop-blur-sm rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 ${
        featured
          ? 'ring-2 ring-cyan-400 shadow-2xl shadow-cyan-500/20 hover:ring-fuchsia-400 md:scale-105'
          : 'ring-1 ring-neutral-700 hover:ring-cyan-400/40 hover:shadow-xl'
      }`}
    >
      {badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
          {badge}
        </div>
      )}
      
      <div className="flex-grow">
        <h3 className="text-2xl font-bold text-white mb-2">{name}</h3>
        <p className="text-sm text-neutral-300 mb-6">{description}</p>
        
        <div className="mb-6">
          {isFree ? (
            <div className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">
              {price}
            </div>
          ) : (
            <>
              <div className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">
                {displayPrice}
              </div>
              <p className="text-sm text-neutral-400 mt-1">
                {billingCycle === 'monthly' ? perMonthLabel : perYearLabel}
              </p>
            </>
          )}
        </div>
        
        <div className="border-t border-neutral-700 my-6"></div>
        
        <ul className="space-y-4 mb-8">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <span className="text-base text-neutral-200">{feature}</span>
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
    </motion.div>
  );
};
