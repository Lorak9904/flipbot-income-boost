import type { BillingCurrency } from '@/lib/billing-pricing';
import { billingCurrencies } from '@/lib/billing-pricing';

interface CurrencySelectorProps {
  currency: BillingCurrency;
  onChange: (currency: BillingCurrency) => void;
  label: string;
}

export const CurrencySelector = ({ currency, onChange, label }: CurrencySelectorProps) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
        {label}
      </span>
      <div className="inline-grid grid-cols-3 rounded-lg border border-white/10 bg-neutral-900 p-1">
        {billingCurrencies.map((option) => {
          const active = option === currency;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              aria-pressed={active}
              className={`h-9 min-w-16 rounded-md px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 ${
                active
                  ? 'bg-cyan-500 text-neutral-950'
                  : 'text-neutral-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {option.toUpperCase()}
            </button>
          );
        })}
      </div>
    </div>
  );
};
