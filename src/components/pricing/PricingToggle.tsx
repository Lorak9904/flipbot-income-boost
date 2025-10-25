import { motion } from 'framer-motion';

interface PricingToggleProps {
  billingCycle: 'monthly' | 'annual';
  onChange: (cycle: 'monthly' | 'annual') => void;
  monthlyLabel: string;
  annualLabel: string;
  savingsLabel: string;
}

export const PricingToggle = ({ 
  billingCycle, 
  onChange, 
  monthlyLabel, 
  annualLabel, 
  savingsLabel 
}: PricingToggleProps) => {
  return (
    <div className="flex items-center justify-center gap-4">
      <button
        onClick={() => onChange('monthly')}
        className={`text-sm font-medium transition-colors ${
          billingCycle === 'monthly' ? 'text-white' : 'text-neutral-400'
        }`}
      >
        {monthlyLabel}
      </button>
      
      <div className="relative w-64 bg-neutral-800 rounded-full p-1">
        <motion.div
          className="absolute top-1 h-8 w-[calc(50%-4px)] bg-gradient-to-r from-cyan-500 to-fuchsia-500 rounded-full"
          initial={false}
          animate={{
            x: billingCycle === 'monthly' ? 0 : 'calc(100% + 8px)',
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
        
        <div className="relative z-10 grid grid-cols-2 gap-2">
          <button
            onClick={() => onChange('monthly')}
            className="h-8 flex items-center justify-center text-sm font-medium transition-colors"
          >
            <span className={billingCycle === 'monthly' ? 'text-white' : 'text-neutral-400'}>
              {monthlyLabel}
            </span>
          </button>
          <button
            onClick={() => onChange('annual')}
            className="h-8 flex items-center justify-center text-sm font-medium transition-colors"
          >
            <span className={billingCycle === 'annual' ? 'text-white' : 'text-neutral-400'}>
              {annualLabel}
            </span>
            {billingCycle === 'annual' && (
              <span className="ml-2 text-xs text-green-400">({savingsLabel})</span>
            )}
          </button>
        </div>
      </div>
      
      <button
        onClick={() => onChange('annual')}
        className={`text-sm font-medium transition-colors ${
          billingCycle === 'annual' ? 'text-white' : 'text-neutral-400'
        }`}
      >
        {annualLabel}
      </button>
    </div>
  );
};
