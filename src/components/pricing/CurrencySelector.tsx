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
      <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
        {label}
      </span>
      <div className="inline-grid grid-cols-3 rounded-full border border-neutral-700 bg-neutral-800/70 p-1">
        {billingCurrencies.map((option) => {
          const active = option === currency;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              aria-pressed={active}
              className={`h-9 min-w-16 rounded-full px-4 text-sm font-semibold transition-colors ${
                active
                  ? 'bg-white text-neutral-950'
                  : 'text-neutral-300 hover:bg-neutral-700 hover:text-white'
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
