import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { enUS, pl } from 'date-fns/locale';
import {
  AlertCircle,
  BarChart3,
  Clock,
  MinusCircle,
  TrendingUp,
} from 'lucide-react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Badge } from '@/components/ui/badge';
import { fetchListingStatistics } from '@/lib/api/items';
import { formatPlatformLabel, STATISTICS_SUPPORTED_PLATFORMS } from '@/lib/platforms';
import {
  formatStatisticDelta,
  formatStatisticMetricValue,
  pickPrimaryStatisticMetric,
} from '@/lib/statistics-format';
import type {
  ListingPlatformStatisticsPayload,
  Platform,
} from '@/types/item';
import { getTranslations, type Language } from '@/components/language-utils';
import {
  resolveStatisticMetricLabel,
  statisticsTranslations,
  type StatisticsTranslations,
} from '@/pages/statistics-translations';

interface MarketplaceStatisticsSectionProps {
  itemId: string;
  platforms: Platform[];
  language: Language;
}

const statusStyles: Record<string, string> = {
  success: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
  unsupported: 'bg-neutral-700/70 text-neutral-300 border-neutral-600',
  no_data: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
  not_published: 'bg-neutral-800 text-neutral-300 border-neutral-700',
  error: 'bg-red-500/20 text-red-300 border-red-500/50',
};

const statusIcon = (status: string) => {
  if (status === 'success') return <TrendingUp className="h-4 w-4 text-emerald-300" />;
  if (status === 'error') return <AlertCircle className="h-4 w-4 text-red-300" />;
  if (status === 'no_data') return <Clock className="h-4 w-4 text-amber-300" />;
  return <MinusCircle className="h-4 w-4 text-neutral-400" />;
};

const chartData = (payload: ListingPlatformStatisticsPayload, metricKey: string, language: Language) =>
  (payload.metrics.timeseries || [])
    .map((point) => ({
      name: format(new Date(point.captured_at), 'MMM d', { locale: language === 'pl' ? pl : enUS }),
      value: Number(point.metrics?.[metricKey] ?? 0),
    }))
    .filter((point) => Number.isFinite(point.value));

const statusMessage = (
  platform: Platform,
  payload: ListingPlatformStatisticsPayload,
  t: StatisticsTranslations
): string => {
  if (payload.status === 'unsupported') return t.detail.unsupported(formatPlatformLabel(platform));
  if (payload.status === 'not_published') return t.detail.notPublished;
  if (payload.status === 'no_data') return t.detail.noData;
  if (payload.status === 'error') return t.detail.error;
  return payload.message || '';
};

export function MarketplaceStatisticsSection({ itemId, platforms, language }: MarketplaceStatisticsSectionProps) {
  const t = getTranslations(statisticsTranslations);
  const selectedPlatforms = useMemo(
    () => Array.from(new Set(platforms.filter(Boolean))),
    [platforms]
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: ['listing-statistics', itemId, selectedPlatforms.join(',')],
    queryFn: () => fetchListingStatistics(itemId, selectedPlatforms),
    enabled: !!itemId,
    staleTime: 5 * 60 * 1000,
  });

  const platformOrder = useMemo(() => {
    const responsePlatforms = Object.keys(data?.platforms || {}) as Platform[];
    return Array.from(new Set([...selectedPlatforms, ...responsePlatforms]));
  }, [data?.platforms, selectedPlatforms]);

  return (
    <section className="mb-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-cyan-300" />
          <h3 className="text-base sm:text-lg font-semibold text-white">{t.detail.title}</h3>
        </div>
        <span className="text-xs text-neutral-500">{t.detail.scheduler}</span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {[0, 1].map((index) => (
            <div key={index} className="h-36 animate-pulse rounded-lg border border-neutral-800 bg-neutral-900/50" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
          {t.detail.loadError}
        </div>
      ) : platformOrder.length === 0 ? (
        <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4 text-sm text-neutral-400">
          {t.detail.empty}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {platformOrder.map((platform) => {
            const payload = data?.platforms?.[platform];
            const fallbackPayload: ListingPlatformStatisticsPayload = {
              platform,
              status: STATISTICS_SUPPORTED_PLATFORMS.includes(platform) ? 'no_data' : 'unsupported',
              captured_at: null,
              metrics: { summary: [], timeseries: [], native: {} },
            };
            const platformPayload = payload || fallbackPayload;
            const displayPayload = platformPayload.status === 'success'
              ? platformPayload
              : platformPayload.latest_success;
            const summary = displayPayload?.metrics.summary || [];
            const highlighted = pickPrimaryStatisticMetric(summary);
            const chartMetricKey = highlighted?.key;
            const points = displayPayload && chartMetricKey ? chartData(displayPayload, chartMetricKey, language) : [];

            return (
              <div key={platform} className="rounded-lg border border-neutral-800 bg-neutral-900/45 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    {statusIcon(platformPayload.status)}
                    <div className="min-w-0">
                      <p className="font-semibold text-white">{formatPlatformLabel(platform)}</p>
                      {platformPayload.captured_at && (
                        <p className="text-xs text-neutral-500">
                          {format(new Date(platformPayload.captured_at), 'PPp', { locale: language === 'pl' ? pl : enUS })}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge className={statusStyles[platformPayload.status] || statusStyles.no_data}>
                    {(t.statuses as Record<string, string>)[platformPayload.status] || platformPayload.status.replaceAll('_', ' ')}
                  </Badge>
                </div>

                {summary.length > 0 ? (
                  <>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {summary.slice(0, 4).map((metric) => {
                        const delta = formatStatisticDelta(metric);
                        return (
                          <div key={metric.key} className="rounded-md bg-neutral-800/55 p-3">
                            <p className="text-xs text-neutral-400">
                              {resolveStatisticMetricLabel(t, metric.key, metric.label)}
                            </p>
                            <p className="mt-1 text-lg font-semibold text-white">{formatStatisticMetricValue(metric)}</p>
                            {delta && (
                              <p className={Number(metric.delta_value) >= 0 ? 'text-xs text-emerald-300' : 'text-xs text-red-300'}>
                                {delta}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {points.length > 1 && (
                      <div className="mt-4 h-20">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={points} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                            <XAxis dataKey="name" hide />
                            <YAxis hide domain={['dataMin', 'dataMax']} />
                            <Tooltip
                              contentStyle={{ background: '#171717', border: '1px solid #404040', borderRadius: 6 }}
                              labelStyle={{ color: '#e5e5e5' }}
                            />
                            <Line type="monotone" dataKey="value" stroke="#22d3ee" strokeWidth={2} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="mt-4 text-sm text-neutral-400">{statusMessage(platform, platformPayload, t)}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
