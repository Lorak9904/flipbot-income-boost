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
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="relative w-80 bg-neutral-800 rounded-full p-1">
        <motion.div
          className="absolute top-1 h-10 w-[calc(50%-4px)] bg-gradient-to-r from-cyan-500 to-fuchsia-500 rounded-full"
          initial={false}
          animate={{
            x: billingCycle === 'monthly' ? 0 : 'calc(100% + 8px)',
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
        
        <div className="relative z-10 grid grid-cols-2 gap-2">
          <button
            onClick={() => onChange('monthly')}
            className="h-10 flex items-center justify-center text-sm font-medium transition-colors"
          >
            <span className={billingCycle === 'monthly' ? 'text-white' : 'text-neutral-400'}>
              {monthlyLabel}
            </span>
          </button>
          <button
            onClick={() => onChange('annual')}
            className="h-10 flex flex-col items-center justify-center text-sm font-medium transition-colors"
          >
            <span className={billingCycle === 'annual' ? 'text-white' : 'text-neutral-400'}>
              {annualLabel}
            </span>
          </button>
        </div>
      </div>
      <span className="text-xs text-green-400 font-medium">
        💰 {savingsLabel} with annual billing
      </span>
    </div>
  );
};
