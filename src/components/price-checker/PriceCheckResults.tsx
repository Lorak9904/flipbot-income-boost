import { ExternalLink, Info, PackageSearch } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { PriceCheckComparable, PriceCheckResult } from '@/lib/api/price-checks';
import { calculateSelectedPriceStats, formatPrice } from '@/lib/price-checker';

interface ResultCopy {
  resultsTitle: string;
  resultsSubtitle: string;
  medianLabel: string;
  rangeLabel: string;
  selectedLabel: string;
  deliveredLabel: string;
  deliveredCoverage: string;
  lowSelection: string;
  comparableTitle: string;
  includeListing: string;
  excludeListing: string;
  shipping: string;
  shippingUnknown: string;
  viewOnEbay: string;
  sourceNote: string;
}

interface PriceCheckResultsProps {
  result: PriceCheckResult;
  selectedIds: Set<string>;
  language: 'en' | 'pl';
  copy: ResultCopy;
  onToggle: (item: PriceCheckComparable) => void;
}

export function PriceCheckResults({ result, selectedIds, language, copy, onToggle }: PriceCheckResultsProps) {
  const stats = calculateSelectedPriceStats(result.sampled_items, selectedIds);

  return (
    <section className="mt-10 space-y-6" aria-live="polite">
      <div>
        <h2 className="text-2xl font-semibold text-white">{copy.resultsTitle}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-300">{copy.resultsSubtitle}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ResultMetric label={copy.medianLabel} value={formatPrice(stats.median, stats.currency, language)} />
        <ResultMetric
          label={copy.rangeLabel}
          value={`${formatPrice(stats.typicalLow, stats.currency, language)} – ${formatPrice(stats.typicalHigh, stats.currency, language)}`}
        />
        <ResultMetric label={copy.selectedLabel} value={`${stats.count}/${result.sampled_items.length}`} />
        <ResultMetric
          label={copy.deliveredLabel}
          value={formatPrice(stats.deliveredMedian, stats.currency, language)}
          detail={stats.deliveredCount ? `${stats.deliveredCount} ${copy.deliveredCoverage}` : undefined}
        />
      </div>

      {stats.count < 3 && (
        <div className="flex items-start gap-2 rounded-md border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{copy.lowSelection}</span>
        </div>
      )}

      <div className="flex items-center gap-2">
        <img src="/platform-logos/ebay-bag.svg" alt="eBay" className="h-6 w-6 object-contain" />
        <h3 className="text-lg font-semibold text-white">{copy.comparableTitle}</h3>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {result.sampled_items.map((item) => {
          const selected = selectedIds.has(item.provider_item_id);
          const price = formatPrice(Number(item.price), item.currency, language);
          const shipping = item.shipping_price
            ? formatPrice(Number(item.shipping_price), item.shipping_currency || item.currency, language)
            : copy.shippingUnknown;
          return (
            <article
              key={item.provider_item_id}
              className={`overflow-hidden rounded-lg border bg-neutral-950/75 transition-colors ${
                selected ? 'border-cyan-400/45' : 'border-neutral-800 opacity-65'
              }`}
            >
              <div className="aspect-[4/3] bg-neutral-900">
                {item.image_url ? (
                  <img src={item.image_url} alt="" className="h-full w-full object-contain" loading="lazy" />
                ) : (
                  <div className="flex h-full items-center justify-center text-neutral-600">
                    <PackageSearch className="h-8 w-8" aria-hidden="true" />
                  </div>
                )}
              </div>
              <div className="space-y-3 p-4">
                <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-neutral-200">
                  <Checkbox checked={selected} onCheckedChange={() => onToggle(item)} />
                  <span>{selected ? copy.includeListing : copy.excludeListing}</span>
                </label>
                <h4 className="line-clamp-2 min-h-12 font-medium leading-6 text-white">{item.title}</h4>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <div className="text-xl font-semibold text-white">{price}</div>
                    <div className="mt-1 text-xs text-neutral-400">
                      {item.shipping_price ? `${copy.shipping}: ${shipping}` : shipping}
                    </div>
                  </div>
                  {item.condition && <span className="text-xs text-neutral-400">{item.condition}</span>}
                </div>
                <Button asChild variant="outline" className="min-h-11 w-full border-neutral-700 bg-neutral-900/70">
                  <a href={item.item_url} target="_blank" rel="noreferrer sponsored">
                    {copy.viewOnEbay}
                    <ExternalLink className="ml-2 h-4 w-4" aria-hidden="true" />
                  </a>
                </Button>
              </div>
            </article>
          );
        })}
      </div>

      <p className="text-xs leading-5 text-neutral-400">{copy.sourceNote}</p>
    </section>
  );
}

function ResultMetric({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="rounded-md border border-neutral-800 bg-neutral-950/70 p-4">
      <div className="text-xs font-medium text-neutral-400">{label}</div>
      <div className="mt-1 text-xl font-semibold text-white">{value}</div>
      {detail && <div className="mt-1 text-xs text-neutral-500">{detail}</div>}
    </div>
  );
}
