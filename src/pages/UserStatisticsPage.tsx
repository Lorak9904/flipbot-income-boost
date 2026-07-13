import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { enUS, pl } from 'date-fns/locale';
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  ArrowUpDown,
  BarChart3,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Loader2,
  MinusCircle,
  Package,
} from 'lucide-react';
import { motion } from 'framer-motion';

import { AnimatedGradientBackground } from '@/components/AnimatedGradientBackground';
import { SEOHead } from '@/components/SEOHead';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { fetchPlatformStatistics } from '@/lib/api/items';
import { ALL_PLATFORMS, formatPlatformLabel } from '@/lib/platforms';
import { getCurrentLanguage, getLocalizedPathForCurrentLanguage, getTranslations } from '@/components/language-utils';
import { resolveStatisticMetricLabel, statisticsTranslations } from './statistics-translations';
import {
  formatStatisticDelta,
  formatStatisticMetricValue,
  getStatisticMetricNumber,
} from '@/lib/statistics-format';
import type { ListingStatisticMetric, Platform, PlatformStatisticsItem } from '@/types/item';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 * i, duration: 0.45, ease: 'easeOut' },
  }),
};

const statusStyles: Record<string, string> = {
  success: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
  unsupported: 'bg-neutral-700/70 text-neutral-300 border-neutral-600',
  no_data: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
  not_published: 'bg-neutral-800 text-neutral-300 border-neutral-700',
  error: 'bg-red-500/20 text-red-300 border-red-500/50',
};

const metricColorClass = ['text-cyan-300', 'text-fuchsia-300', 'text-emerald-300', 'text-amber-300'];
type MetricColumn = Pick<ListingStatisticMetric, 'key' | 'label'>;
type SortKey = 'title' | 'captured_at' | `metric:${string}`;
type SortDirection = 'asc' | 'desc';
const PAGE_SIZE = 25;

const validPlatform = (value: string | null): Platform =>
  ALL_PLATFORMS.includes(value as Platform) ? (value as Platform) : 'olx';

const deltaIcon = (metric: ListingStatisticMetric) => {
  if (metric.delta_value === null || metric.delta_value === undefined) return <MinusCircle className="h-3.5 w-3.5" />;
  return Number(metric.delta_value) >= 0
    ? <ArrowUpRight className="h-3.5 w-3.5" />
    : <ArrowDownRight className="h-3.5 w-3.5" />;
};

const latestMetric = (item: PlatformStatisticsItem, key: string): ListingStatisticMetric | undefined =>
  item.metrics.find((metric) => metric.key === key);

const capturedAtValue = (item: PlatformStatisticsItem): number => {
  if (!item.captured_at) return 0;
  const value = Date.parse(item.captured_at);
  return Number.isFinite(value) ? value : 0;
};

const metricSortKey = (key: string): SortKey => `metric:${key}`;

const sortMetricKey = (key: SortKey): string | null =>
  key.startsWith('metric:') ? key.slice('metric:'.length) : null;

const defaultSortDirection = (key: SortKey): SortDirection => key === 'title' ? 'asc' : 'desc';

const buildMetricColumns = (
  summary: ListingStatisticMetric[],
  items: PlatformStatisticsItem[]
): MetricColumn[] => {
  const columns = new Map<string, string>();

  [...summary, ...items.flatMap((item) => item.metrics)].forEach((metric) => {
    if (metric.key && !columns.has(metric.key)) {
      columns.set(metric.key, metric.label || metric.key);
    }
  });

  return Array.from(columns, ([key, label]) => ({ key, label }));
};

const UserStatisticsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortKey, setSortKey] = useState<SortKey>(metricSortKey('views'));
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [page, setPage] = useState(1);
  const language = getCurrentLanguage();
  const t = getTranslations(statisticsTranslations);
  const selectedPlatform = validPlatform(searchParams.get('platform'));

  const { data, isLoading, isError } = useQuery({
    queryKey: ['platform-statistics', selectedPlatform],
    queryFn: () => fetchPlatformStatistics(selectedPlatform),
    staleTime: 5 * 60 * 1000,
  });

  const summary = useMemo(() => data?.summary || [], [data?.summary]);
  const metricColumns = useMemo(
    () =>
      buildMetricColumns(summary, data?.items || []).map((metric) => ({
        ...metric,
        label: resolveStatisticMetricLabel(t, metric.key, metric.label),
      })),
    [data?.items, summary, t]
  );
  const activeSortKey = useMemo<SortKey>(() => {
    const metricKey = sortMetricKey(sortKey);
    if (!metricKey) return sortKey;
    if (metricColumns.some((metric) => metric.key === metricKey)) return sortKey;
    if (metricColumns.length > 0) return metricSortKey(metricColumns[0].key);
    return 'captured_at';
  }, [metricColumns, sortKey]);
  const sortLabel = useMemo(() => {
    if (activeSortKey === 'title') return t.titleSort;
    if (activeSortKey === 'captured_at') return t.captureDateSort;
    const metricKey = sortMetricKey(activeSortKey);
    return metricColumns.find((metric) => metric.key === metricKey)?.label.toLowerCase() || metricKey || t.metricSort;
  }, [activeSortKey, metricColumns, t.captureDateSort, t.metricSort, t.titleSort]);

  const sortedItems = useMemo(
    () =>
      [...(data?.items || [])]
        .map((item, index) => ({ item, index }))
        .sort((left, right) => {
          let comparison = 0;
          if (activeSortKey === 'title') {
            comparison = left.item.title.localeCompare(right.item.title, undefined, { sensitivity: 'base' });
          } else if (activeSortKey === 'captured_at') {
            comparison = capturedAtValue(left.item) - capturedAtValue(right.item);
          } else {
            const metricKey = sortMetricKey(activeSortKey);
            comparison =
              getStatisticMetricNumber(left.item.metrics, metricKey || '') -
              getStatisticMetricNumber(right.item.metrics, metricKey || '');
          }

          if (comparison === 0) {
            return left.index - right.index;
          }
          return sortDirection === 'asc' ? comparison : -comparison;
        })
        .map(({ item }) => item),
    [activeSortKey, data?.items, sortDirection]
  );
  const totalPages = Math.max(1, Math.ceil(sortedItems.length / PAGE_SIZE));
  const visibleItems = useMemo(
    () => sortedItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [page, sortedItems]
  );

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const handlePlatformChange = (platform: Platform) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('platform', platform);
    setSearchParams(nextParams);
    setPage(1);
  };

  const handleSort = (key: SortKey) => {
    setPage(1);
    if (activeSortKey === key) {
      setSortDirection((direction) => direction === 'asc' ? 'desc' : 'asc');
      return;
    }
    setSortKey(key);
    setSortDirection(defaultSortDirection(key));
  };

  const renderSortLabel = (key: SortKey, label: string) => {
    const active = activeSortKey === key;
    const SortIcon = active
      ? sortDirection === 'asc'
        ? ChevronUp
        : ChevronDown
      : ArrowUpDown;

    return (
      <button
        type="button"
        onClick={() => handleSort(key)}
        className="inline-flex items-center gap-1 text-left text-neutral-400 transition-colors hover:text-white"
        aria-label={t.sortAria(label.toLowerCase())}
      >
        {label}
        <SortIcon className={active ? 'h-3.5 w-3.5 text-cyan-300' : 'h-3.5 w-3.5 text-neutral-500'} />
      </button>
    );
  };

  return (
    <>
      <SEOHead
        title={t.seoTitle}
        description={t.seoDescription}
        language={language}
        robots="noindex, nofollow"
      />
      <div className="relative min-h-screen overflow-hidden text-white">
        <AnimatedGradientBackground />

        <div className="relative container mx-auto px-4 py-10 md:py-14">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2 text-cyan-300">
                  <BarChart3 className="h-5 w-5" />
                  <span className="text-sm font-medium">{t.eyebrow}</span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                  {t.title}
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-neutral-300 md:text-base">
                  {t.description}
                </p>
              </div>

              <div className="sm:hidden">
                <Select value={selectedPlatform} onValueChange={(value) => handlePlatformChange(value as Platform)}>
                  <SelectTrigger className="w-full bg-neutral-900/70 border-neutral-700 text-white">
                    <SelectValue placeholder={t.platform} />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                    {ALL_PLATFORMS.map((platform) => (
                      <SelectItem key={platform} value={platform}>
                        {formatPlatformLabel(platform)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2} className="mb-6 hidden sm:block">
            <Tabs value={selectedPlatform} onValueChange={(value) => handlePlatformChange(value as Platform)}>
              <TabsList className="h-auto flex-wrap justify-start gap-2 rounded-lg border border-neutral-800 bg-neutral-900/50 p-2">
                {ALL_PLATFORMS.map((platform) => (
                  <TabsTrigger
                    key={platform}
                    value={platform}
                    className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300"
                  >
                    {formatPlatformLabel(platform)}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </motion.div>

          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
            </div>
          ) : isError ? (
            <Card className="border-red-500/40 bg-red-500/10">
              <CardContent className="flex items-center gap-3 p-6 text-red-100">
                <AlertCircle className="h-5 w-5" />
                {t.loadError}
              </CardContent>
            </Card>
          ) : (
            <>
              {!data?.supported && (
                <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3} className="mb-6">
                  <div className="rounded-lg border border-neutral-700 bg-neutral-900/60 p-4 text-sm text-neutral-300">
                    {t.unsupported(formatPlatformLabel(selectedPlatform))}
                  </div>
                </motion.div>
              )}

              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={3}
                className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
              >
                {summary.length > 0 ? (
                  summary.map((metric, index) => (
                    <Card key={metric.key} className="border-neutral-800 bg-neutral-900/55 backdrop-blur-sm">
                      <CardContent className="p-5">
                        <p className="text-sm text-neutral-400">
                          {resolveStatisticMetricLabel(t, metric.key, metric.label)}
                        </p>
                        <p className={`mt-2 text-3xl font-semibold ${metricColorClass[index % metricColorClass.length]}`}>
                          {formatStatisticMetricValue(metric)}
                        </p>
                        {formatStatisticDelta(metric) && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-neutral-300">
                            {deltaIcon(metric)}
                            {formatStatisticDelta(metric)}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="col-span-full border-neutral-800 bg-neutral-900/55">
                    <CardContent className="flex items-center gap-3 p-6 text-neutral-400">
                      <Package className="h-5 w-5" />
                      {t.noStatistics(formatPlatformLabel(selectedPlatform))}
                    </CardContent>
                  </Card>
                )}
              </motion.div>

              <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4}>
                <Card className="border-neutral-800 bg-neutral-900/55 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">{t.listingsOn(formatPlatformLabel(selectedPlatform))}</CardTitle>
                    <CardDescription className="text-neutral-400">
                      {t.sortedBy(sortLabel, sortDirection === 'asc' ? t.ascending : t.descending)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {sortedItems.length === 0 ? (
                      <div className="rounded-lg border border-neutral-800 bg-neutral-950/40 p-8 text-center text-neutral-400">
                        {t.noListings}
                      </div>
                    ) : (
                      <Table className="min-w-max">
                        <TableHeader>
                          <TableRow className="border-neutral-800 hover:bg-transparent">
                            <TableHead>{renderSortLabel('title', t.listing)}</TableHead>
                            <TableHead className="text-neutral-400">{t.status}</TableHead>
                            {metricColumns.map((metric) => (
                              <TableHead key={metric.key} className="min-w-[130px]">
                                {renderSortLabel(metricSortKey(metric.key), metric.label)}
                              </TableHead>
                            ))}
                            <TableHead>{renderSortLabel('captured_at', t.captured)}</TableHead>
                            <TableHead className="text-right text-neutral-400">{t.link}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {visibleItems.map((item) => (
                            <TableRow key={item.item_id} className="border-neutral-800 hover:bg-neutral-800/30">
                              <TableCell className="min-w-[220px]">
                                <Link to={getLocalizedPathForCurrentLanguage(`/user/items/${item.item_id}`)} className="font-medium text-white hover:text-cyan-300">
                                  {item.title}
                                </Link>
                                {item.external_id && (
                                  <p className="mt-1 font-mono text-xs text-neutral-500">{item.external_id}</p>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge className={statusStyles[item.status] || statusStyles.no_data}>
                                  {t.statuses[item.status] || item.status.replace('_', ' ')}
                                </Badge>
                                {item.message && (
                                  <p className="mt-1 max-w-[260px] text-xs text-neutral-500">{item.message}</p>
                                )}
                              </TableCell>
                              {metricColumns.map((column) => {
                                const metric = latestMetric(item, column.key);
                                return (
                                  <TableCell key={column.key} className="min-w-[130px]">
                                    {metric ? (
                                      <div>
                                        <p className="font-semibold text-white">{formatStatisticMetricValue(metric)}</p>
                                        {formatStatisticDelta(metric) && (
                                          <p className={Number(metric.delta_value) >= 0 ? 'text-xs text-emerald-300' : 'text-xs text-red-300'}>
                                            {formatStatisticDelta(metric)}
                                          </p>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-neutral-500">-</span>
                                    )}
                                  </TableCell>
                                );
                              })}
                              <TableCell className="text-neutral-300">
                                {item.captured_at ? format(new Date(item.captured_at), 'PPp', { locale: language === 'pl' ? pl : enUS }) : '-'}
                              </TableCell>
                              <TableCell className="text-right">
                                {item.listing_url ? (
                                  <a
                                    href={item.listing_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-end text-cyan-300 hover:text-cyan-200"
                                    aria-label={t.openListingAria(formatPlatformLabel(item.platform))}
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                ) : (
                                  <span className="text-neutral-600">-</span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}

                    {sortedItems.length > PAGE_SIZE && (
                      <div className="mt-4 flex flex-col gap-3 border-t border-neutral-800 pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-neutral-400">
                          {t.pagination(
                            (page - 1) * PAGE_SIZE + 1,
                            Math.min(page * PAGE_SIZE, sortedItems.length),
                            sortedItems.length
                          )}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={page === 1}
                            onClick={() => setPage((current) => Math.max(1, current - 1))}
                          >
                            {t.previous}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={page === totalPages}
                            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                          >
                            {t.next}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default UserStatisticsPage;
