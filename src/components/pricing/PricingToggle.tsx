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
    <div className="flex w-full max-w-xs flex-col items-center justify-center gap-2">
      <div
        className="relative w-full rounded-lg border border-white/10 bg-neutral-900 p-1"
        role="group"
        aria-label={`${monthlyLabel} / ${annualLabel}`}
      >
        <div
          className={`absolute left-1 top-1 h-10 w-[calc(50%-4px)] rounded-md bg-cyan-500 transition-transform duration-200 motion-reduce:transition-none ${
            billingCycle === 'annual' ? 'translate-x-full' : 'translate-x-0'
          }`}
          aria-hidden="true"
        />
        
        <div className="relative z-10 grid grid-cols-2 gap-2">
          <button
            onClick={() => onChange('monthly')}
            type="button"
            aria-pressed={billingCycle === 'monthly'}
            className="flex h-10 items-center justify-center rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
          >
            <span className={billingCycle === 'monthly' ? 'text-neutral-950' : 'text-neutral-400'}>
              {monthlyLabel}
            </span>
          </button>
          <button
            onClick={() => onChange('annual')}
            type="button"
            aria-pressed={billingCycle === 'annual'}
            className="flex h-10 items-center justify-center rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
          >
            <span className={billingCycle === 'annual' ? 'text-neutral-950' : 'text-neutral-400'}>
              {annualLabel}
            </span>
          </button>
        </div>
      </div>
      <span className="text-xs text-green-400 font-medium">
        {savingsLabel}
      </span>
    </div>
  );
};
