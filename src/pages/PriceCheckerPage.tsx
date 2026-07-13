import { useEffect, useMemo, useRef, useState } from 'react';
import { usePostHog } from '@posthog/react';
import { Camera, ImageUp, Info, Loader2, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

import { AnimatedGradientBackground } from '@/components/AnimatedGradientBackground';
import { getCurrentLanguage, getTranslations } from '@/components/language-utils';
import { PriceCheckResults } from '@/components/price-checker/PriceCheckResults';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createPriceCheck, uploadPriceCheckImage, type PriceCheckResult } from '@/lib/api/price-checks';
import { EBAY_PRICE_CHECK_MARKETS, IMAGE_SEARCH_MARKETS } from '@/lib/price-checker';
import { getRoutePath } from '@/lib/localized-routes';
import { priceCheckerTranslations } from './price-checker-translations';

type SearchMode = 'keyword' | 'image';

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export default function PriceCheckerPage() {
  const t = getTranslations(priceCheckerTranslations);
  const language = getCurrentLanguage();
  const posthog = usePostHog();
  const inputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<SearchMode>('keyword');
  const [query, setQuery] = useState('');
  const [marketplace, setMarketplace] = useState(language === 'pl' ? 'EBAY_PL' : 'EBAY_US');
  const [condition, setCondition] = useState('ANY');
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [result, setResult] = useState<PriceCheckResult | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableMarkets = useMemo(
    () => EBAY_PRICE_CHECK_MARKETS.filter((market) => mode !== 'image' || IMAGE_SEARCH_MARKETS.has(market.id)),
    [mode],
  );

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const switchMode = (nextMode: SearchMode) => {
    setMode(nextMode);
    setError('');
    setResult(null);
    if (nextMode === 'image' && !IMAGE_SEARCH_MARKETS.has(marketplace)) {
      setMarketplace(language === 'pl' ? 'EBAY_DE' : 'EBAY_US');
    }
  };

  const chooseImage = (file: File | null) => {
    setError('');
    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPES.has(file.type) || file.size > MAX_IMAGE_BYTES) {
      setError(t.imageHint);
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setResult(null);

    if (mode === 'keyword' && query.trim().length < 3) {
      setError(t.keywordHint);
      return;
    }
    if (mode === 'image' && !image) {
      setError(t.imageHint);
      return;
    }

    setIsSubmitting(true);
    try {
      const uploaded = mode === 'image' && image ? await uploadPriceCheckImage(image) : null;
      const nextResult = await createPriceCheck({
        provider: 'ebay',
        marketplace_id: marketplace,
        search_mode: mode,
        query: mode === 'keyword' ? query.trim() : undefined,
        condition: condition === 'ANY' ? '' : condition,
        limit: 12,
        images: uploaded
          ? [{
              key: uploaded.key,
              filename: uploaded.filename,
              content_type: uploaded.content_type,
              size: uploaded.size,
            }]
          : undefined,
      });
      setResult(nextResult);
      setSelectedIds(new Set(nextResult.sampled_items.map((item) => item.provider_item_id)));
      posthog?.capture('public_price_check_completed', {
        source: 'price_checker',
        mode,
        marketplace_id: marketplace,
        sample_count: nextResult.sample_count,
        status: nextResult.status,
      });
    } catch (requestError) {
      setError(requestError instanceof Error && requestError.message ? requestError.message : t.genericError);
      posthog?.capture('public_price_check_failed', {
        source: 'price_checker',
        mode,
        marketplace_id: marketplace,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleComparable = (providerItemId: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(providerItemId)) next.delete(providerItemId);
      else next.add(providerItemId);
      return next;
    });
  };

  const faq = [
    [t.faq1Question, t.faq1Answer],
    [t.faq2Question, t.faq2Answer],
    [t.faq3Question, t.faq3Answer],
    [t.faq4Question, t.faq4Answer],
  ];
  const canonicalUrl = `https://myflipit.live${getRoutePath('priceChecker', language)}`;
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: t.title,
      url: canonicalUrl,
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      isAccessibleForFree: true,
      description: t.pageDescription,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq.map(([question, answer]) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer },
      })),
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <SEOHead
        title={t.pageTitle}
        description={t.pageDescription}
        canonicalUrl={canonicalUrl}
        keywords={language === 'pl'
          ? ['wycena przedmiotu', 'ile wart jest używany telefon', 'wycena laptopa', 'sprawdzanie cen eBay']
          : ['used item price checker', 'how much is my item worth', 'used phone value', 'eBay price checker']}
        structuredData={structuredData}
        language={language}
      />
      <AnimatedGradientBackground />

      <main className="relative mx-auto max-w-6xl px-4 pb-24 pt-12 sm:px-6 lg:px-8 lg:pt-16">
        <header className="max-w-3xl">
          <div className="text-sm font-semibold text-cyan-300">{t.eyebrow}</div>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">{t.title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-300 sm:text-lg">{t.subtitle}</p>
        </header>

        <section className="mt-8 rounded-lg border border-white/10 bg-neutral-950/80 p-4 shadow-2xl backdrop-blur-xl sm:p-6 lg:p-8">
          <form onSubmit={submit} className="space-y-6">
            <div className="inline-flex w-full rounded-md border border-neutral-800 bg-neutral-900 p-1 sm:w-auto" aria-label={t.eyebrow}>
              <ModeButton active={mode === 'keyword'} onClick={() => switchMode('keyword')} icon={<Search className="h-4 w-4" />}>
                {t.keywordMode}
              </ModeButton>
              <ModeButton active={mode === 'image'} onClick={() => switchMode('image')} icon={<Camera className="h-4 w-4" />}>
                {t.imageMode}
              </ModeButton>
            </div>

            {mode === 'keyword' ? (
              <div className="space-y-2">
                <Label htmlFor="price-check-query">{t.keywordLabel}</Label>
                <Input
                  id="price-check-query"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t.keywordPlaceholder}
                  maxLength={100}
                  className="min-h-12 border-neutral-700 bg-white text-base text-neutral-950 placeholder:text-neutral-500"
                />
                <p className="text-sm leading-6 text-neutral-400">{t.keywordHint}</p>
              </div>
            ) : (
              <div className="space-y-3">
                <Label>{t.imageLabel}</Label>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="flex min-h-48 w-full items-center justify-center overflow-hidden rounded-md border border-dashed border-neutral-600 bg-neutral-900/70 text-left transition-colors hover:border-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                >
                  {previewUrl ? (
                    <div className="grid w-full gap-4 p-4 sm:grid-cols-[12rem_1fr] sm:items-center">
                      <img src={previewUrl} alt="" className="h-44 w-full rounded object-contain bg-neutral-950" />
                      <div>
                        <ImageUp className="h-5 w-5 text-cyan-300" aria-hidden="true" />
                        <div className="mt-2 font-medium text-white">{t.imageReplace}</div>
                        <div className="mt-1 text-sm text-neutral-400">{image?.name}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <ImageUp className="mx-auto h-8 w-8 text-cyan-300" aria-hidden="true" />
                      <div className="mt-3 font-medium text-white">{t.imageDrop}</div>
                      <div className="mt-2 text-sm text-neutral-400">{t.imageHint}</div>
                    </div>
                  )}
                </button>
                <input
                  ref={inputRef}
                  type="file"
                  aria-label={t.imageDrop}
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(event) => chooseImage(event.target.files?.[0] || null)}
                />
                <div className="flex items-start gap-2 text-sm leading-6 text-neutral-400">
                  <Info className="mt-1 h-4 w-4 shrink-0 text-cyan-300" aria-hidden="true" />
                  <span>{t.photoMarketNote}</span>
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price-check-market">{t.marketLabel}</Label>
                <Select value={marketplace} onValueChange={setMarketplace}>
                  <SelectTrigger id="price-check-market" className="min-h-12 border-neutral-700 bg-neutral-900 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMarkets.map((market) => (
                      <SelectItem key={market.id} value={market.id}>
                        {market[language]} · {market.currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price-check-condition">{t.conditionLabel}</Label>
                <Select value={condition} onValueChange={setCondition}>
                  <SelectTrigger id="price-check-condition" className="min-h-12 border-neutral-700 bg-neutral-900 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ANY">{t.anyCondition}</SelectItem>
                    <SelectItem value="USED">{t.usedCondition}</SelectItem>
                    <SelectItem value="NEW">{t.newCondition}</SelectItem>
                    <SelectItem value="UNSPECIFIED">{t.unspecifiedCondition}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {error && (
              <div role="alert" className="rounded-md border border-red-400/30 bg-red-400/10 px-4 py-3">
                <div className="font-medium text-red-100">{t.errorTitle}</div>
                <div className="mt-1 text-sm text-red-100/80">{error || t.genericError}</div>
              </div>
            )}

            <div className="flex flex-col gap-4 border-t border-neutral-800 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-2xl text-xs leading-5 text-neutral-400">
                <p>{t.activeOnly}</p>
                <p>{t.privacyNote}</p>
              </div>
              <Button type="submit" disabled={isSubmitting} className="min-h-12 shrink-0 px-6">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : <Search className="mr-2 h-4 w-4" aria-hidden="true" />}
                {isSubmitting ? t.submitting : t.submit}
              </Button>
            </div>
          </form>

          {result?.status === 'completed' && result.sampled_items.length > 0 && (
            <PriceCheckResults
              result={result}
              selectedIds={selectedIds}
              language={language}
              copy={t}
              onToggle={(item) => toggleComparable(item.provider_item_id)}
            />
          )}
          {result?.status === 'no_results' && (
            <div className="mt-8 rounded-md border border-neutral-700 bg-neutral-900/80 p-5">
              <h2 className="font-semibold text-white">{t.noResultsTitle}</h2>
              <p className="mt-2 text-sm text-neutral-300">{t.noResultsBody}</p>
            </div>
          )}
        </section>

        <section className="mt-16 grid gap-8 lg:grid-cols-3">
          {[
            [t.howTitle, t.howBody],
            [t.itemsTitle, t.itemsBody],
            [t.limitsTitle, t.limitsBody],
          ].map(([heading, body]) => (
            <div key={heading} className="border-t border-neutral-700 pt-5">
              <h2 className="text-xl font-semibold text-white">{heading}</h2>
              <p className="mt-3 text-sm leading-7 text-neutral-300">{body}</p>
            </div>
          ))}
        </section>

        <section className="mt-16 max-w-4xl">
          <h2 className="text-2xl font-semibold text-white">{t.questionsTitle}</h2>
          <div className="mt-6 divide-y divide-neutral-800 border-y border-neutral-800">
            {faq.map(([question, answer]) => (
              <article key={question} className="py-5">
                <h3 className="font-medium text-white">{question}</h3>
                <p className="mt-2 text-sm leading-7 text-neutral-300">{answer}</p>
              </article>
            ))}
          </div>
          <Link to={getRoutePath('priceForEbay', language)} className="mt-6 inline-flex min-h-11 items-center text-cyan-300 underline hover:text-cyan-200">
            {t.guideCta}
          </Link>
        </section>
      </main>
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded px-4 text-sm font-medium transition-colors sm:flex-none ${
        active ? 'bg-cyan-400 text-neutral-950' : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
      }`}
    >
      {icon}
      {children}
    </button>
  );
}
