import type { ReactNode } from 'react';
import { format } from 'date-fns';
import { enUS, pl } from 'date-fns/locale';
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  Clock,
  ExternalLink,
  ImageIcon,
  Layers3,
  Link2,
  Package,
  Trash2,
  XCircle,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { cdnThumb } from '@/lib/images';
import { formatMoney } from '@/lib/currency';
import type { ItemDetailTranslations } from '@/utils/translations/item-detail-translations';
import type { Platform, PlatformPublishResult, UserItem } from '@/types/item';
import type { Language } from '@/components/language-utils';

interface ListingDetailSectionProps {
  item: UserItem;
  formatPlatformLabel: (platform: Platform | string) => string;
  t: ItemDetailTranslations;
  language: Language;
}

interface ListingMediaPanelProps {
  item: UserItem;
  imageUrls: string[];
  onPreview: (index: number) => void;
  t: ItemDetailTranslations;
}

interface ListingActionPanelProps extends ListingDetailSectionProps {
  actions: ReactNode;
  statusBadgeClass: (statusValue: string) => string;
  dirtySyncCount: number;
}

interface PendingPublishBannerProps {
  count: number;
  marketplaceLabels: string;
  actionLabel: string;
  t: ItemDetailTranslations;
}

interface ListingOverviewGridProps extends ListingDetailSectionProps {
  statusBadgeClass: (statusValue: string) => string;
}

interface PublishingStatusPanelProps extends ListingDetailSectionProps {
  t: ItemDetailTranslations;
  onRemovePlatform: (platform: Platform) => void;
}

const formatDateTime = (value: string | null | undefined, language: Language) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return format(date, 'PPp', { locale: language === 'pl' ? pl : enUS });
};

const statusLabel = (status: string | null | undefined, t: ItemDetailTranslations) => {
  if (!status) return t.status.unknown;
  return (t.status as Record<string, string>)[status] || status.replaceAll('_', ' ');
};

const publishStatusTone = (result: PlatformPublishResult, t: ItemDetailTranslations) => {
  if (result.status === 'removed') {
    return {
      icon: <CheckCircle2 className="h-5 w-5 text-neutral-400" />,
      label: t.sections.publishRemoved,
      badgeClass: 'bg-neutral-500/20 text-neutral-300 border-neutral-500/50',
      borderClass: 'border-neutral-700',
    };
  }

  if (result.status === 'success' || result.success) {
    return {
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-400" />,
      label: t.sections.publishSuccess,
      badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
      borderClass: 'border-emerald-500/30',
    };
  }

  if (result.status === 'error' || result.error_message) {
    return {
      icon: <XCircle className="h-5 w-5 text-red-400" />,
      label: t.sections.publishError,
      badgeClass: 'bg-red-500/20 text-red-400 border-red-500/50',
      borderClass: 'border-red-500/30',
    };
  }

  if (result.status === 'pending') {
    return {
      icon: <Clock className="h-5 w-5 text-amber-300" />,
      label: t.sections.publishPendingStatus,
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
      borderClass: 'border-amber-500/30',
    };
  }

  return {
    icon: <Clock className="h-5 w-5 text-neutral-400" />,
    label: result.status ? statusLabel(result.status, t) : t.sections.publishUnknown,
    badgeClass: 'bg-neutral-700/70 text-neutral-300 border-neutral-600',
    borderClass: 'border-neutral-700',
  };
};

export function ListingMediaPanel({ item, imageUrls, onPreview, t }: ListingMediaPanelProps) {
  const primaryImage = imageUrls[0];

  return (
    <Card className="overflow-hidden border-neutral-800 bg-neutral-900/55 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base text-white">
              <ImageIcon className="h-4 w-4 text-cyan-300" />
              {t.sections.photosTitle}
            </CardTitle>
            <CardDescription className="text-neutral-400">
              {imageUrls.length > 0 ? t.sections.photoCount(imageUrls.length) : t.sections.noPhotos}
            </CardDescription>
          </div>
          {imageUrls.length > 0 && (
            <Badge className="bg-cyan-500/15 text-cyan-300 border-cyan-500/40">
              {imageUrls.length}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {primaryImage ? (
          <button
            type="button"
            onClick={() => onPreview(0)}
            className="group relative block aspect-[4/3] w-full overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            <img
              src={cdnThumb(primaryImage)}
              alt={t.sections.mainPhotoAlt(item.title || t.inlineEdit.untitled)}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.01]"
              loading="lazy"
            />
            <span className="absolute bottom-3 left-3 rounded-full border border-white/10 bg-neutral-950/80 px-3 py-1 text-xs text-neutral-200 backdrop-blur">
              {t.sections.openPreview}
            </span>
          </button>
        ) : (
          <div className="flex aspect-[4/3] w-full flex-col items-center justify-center rounded-lg border border-dashed border-neutral-700 bg-neutral-950/70 text-neutral-500">
            <Package className="mb-2 h-10 w-10" />
            <span className="text-sm">{t.sections.noImage}</span>
          </div>
        )}

        {imageUrls.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {imageUrls.slice(0, 8).map((imageUrl, index) => (
              <button
                key={`${imageUrl}-${index}`}
                type="button"
                onClick={() => onPreview(index)}
                className="aspect-square overflow-hidden rounded-md border border-neutral-800 bg-neutral-950 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <img
                  src={cdnThumb(imageUrl)}
                  alt={t.sections.photoAlt(item.title || t.inlineEdit.untitled, index + 1)}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ListingActionPanel({
  item,
  actions,
  statusBadgeClass,
  dirtySyncCount,
  formatPlatformLabel,
  t,
}: ListingActionPanelProps) {
  const platforms = Array.isArray(item.platforms) ? item.platforms : [];

  return (
    <Card className="border-neutral-800 bg-neutral-900/55 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-white">{t.sections.controlsTitle}</CardTitle>
        <CardDescription className="text-neutral-400">
          {t.sections.controlsDescription}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-4">
          <p className="text-xs uppercase tracking-wide text-cyan-200/80">{t.sections.currentPrice}</p>
          <p className="mt-2 break-words text-3xl font-bold text-white">
            {formatMoney(item.price, item.currency)}
          </p>
        </div>

        <div className="rounded-lg bg-neutral-800/50 p-3">
          <p className="text-xs uppercase tracking-wide text-neutral-400">{t.sections.status}</p>
          <Badge className={`mt-2 ${statusBadgeClass(item.status)}`}>{statusLabel(item.status, t)}</Badge>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <div className="rounded-lg bg-neutral-800/50 p-3">
            <p className="text-xs uppercase tracking-wide text-neutral-400">{t.sections.lifecycle}</p>
            <p className="mt-2 text-sm text-neutral-300">
              {item.status === 'draft'
                ? t.sections.lifecycleDraft
                : item.status === 'active'
                  ? t.sections.lifecycleActive
                  : t.sections.lifecycleOther}
            </p>
          </div>
        </div>

        {dirtySyncCount > 0 && (
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-100">
            <div className="flex items-center gap-2 font-semibold text-amber-300">
              <AlertTriangle className="h-4 w-4" />
              {t.sections.publishPending}
            </div>
            <p className="mt-1 text-amber-100/90">
              {t.sections.pendingChanges(dirtySyncCount)}
            </p>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-neutral-400">{t.sections.targetMarketplaces}</p>
          {platforms.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {platforms.map((platform) => (
                <Badge key={platform} className="bg-neutral-800/70 text-neutral-200 border-neutral-700">
                  {formatPlatformLabel(platform)}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-500">{t.sections.noTargetMarketplaces}</p>
          )}
        </div>

        <Separator className="bg-neutral-800" />

        {actions}
      </CardContent>
    </Card>
  );
}

export function PendingPublishBanner({ count, marketplaceLabels, actionLabel, t }: PendingPublishBannerProps) {
  if (count === 0) return null;

  return (
    <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 shadow-lg shadow-amber-950/20">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-3">
          <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/40">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <p className="font-semibold text-amber-200">{t.sections.pendingBannerTitle}</p>
            <p className="mt-1 text-sm text-amber-100/90">
              {t.sections.pendingBannerDescription(actionLabel, marketplaceLabels)}
            </p>
          </div>
        </div>
        <Badge className="w-fit bg-amber-500/20 text-amber-300 border-amber-500/50">
          {t.sections.pendingActions(count)}
        </Badge>
      </div>
    </div>
  );
}

export function ListingOverviewGrid({
  item,
  statusBadgeClass,
  t,
}: ListingOverviewGridProps) {
  const editableFields: Array<{
    key: string;
    label: string;
    value?: string;
  }> = [
    { key: 'category', label: t.sections.category, value: item.category },
    {
      key: 'condition',
      label: t.sections.condition,
      value: item.condition ? t.sections.conditionValue(item.condition) : item.condition,
    },
    { key: 'brand', label: t.sections.brand, value: item.brand },
    { key: 'size', label: t.sections.size, value: item.size },
  ];

  return (
    <Card className="border-neutral-800 bg-neutral-900/55 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Layers3 className="h-5 w-5 text-cyan-300" />
          <div>
            <CardTitle className="text-lg text-white">{t.sections.overviewTitle}</CardTitle>
            <CardDescription className="text-neutral-400">
              {t.sections.overviewDescription}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-lg bg-neutral-800/50 p-4">
            <p className="text-xs uppercase tracking-wide text-neutral-400">{t.sections.status}</p>
            <Badge className={`mt-2 ${statusBadgeClass(item.status)}`}>{statusLabel(item.status, t)}</Badge>
          </div>
          <div className="rounded-lg bg-neutral-800/50 p-4">
            <p className="text-xs uppercase tracking-wide text-neutral-400">{t.sections.price}</p>
            <p className="mt-2 text-2xl font-bold text-white">
              {formatMoney(item.price, item.currency)}
            </p>
          </div>
          {editableFields.map(({ key, label, value }) => (
            <div key={key} className="rounded-lg bg-neutral-800/50 p-4">
              <p className="text-xs uppercase tracking-wide text-neutral-400">{label}</p>
              <p className="mt-2 text-sm text-neutral-200">{value || t.sections.notSet}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function ListingActivityPanel({ item, formatPlatformLabel, t, language }: ListingDetailSectionProps) {
  const lifecycleEntries = item.platform_lifecycle_status
    ? Object.entries(item.platform_lifecycle_status)
    : [];

  return (
    <Card className="border-neutral-800 bg-neutral-900/55 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-cyan-300" />
          <div>
            <CardTitle className="text-lg text-white">{t.sections.activityTitle}</CardTitle>
            <CardDescription className="text-neutral-400">
              {t.sections.activityDescription}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {item.created_at && (
          <div className="flex flex-col gap-1 rounded-lg bg-neutral-800/50 p-3 sm:flex-row sm:justify-between">
            <dt className="text-sm text-neutral-400">{t.sections.created}</dt>
            <dd className="text-neutral-200">{formatDateTime(item.created_at, language)}</dd>
          </div>
        )}
        {item.updated_at && (
          <div className="flex flex-col gap-1 rounded-lg bg-neutral-800/50 p-3 sm:flex-row sm:justify-between">
            <dt className="text-sm text-neutral-400">{t.sections.lastUpdated}</dt>
            <dd className="text-neutral-200">{formatDateTime(item.updated_at, language)}</dd>
          </div>
        )}
        {item.published_at && (
          <div className="flex flex-col gap-1 rounded-lg bg-neutral-800/50 p-3 sm:flex-row sm:justify-between">
            <dt className="text-sm text-neutral-400">{t.sections.firstPublished}</dt>
            <dd className="text-neutral-200">{formatDateTime(item.published_at, language)}</dd>
          </div>
        )}

        {lifecycleEntries.length > 0 && (
          <div className="space-y-2 rounded-lg border border-neutral-800 bg-neutral-900/40 p-3">
            <p className="text-sm font-medium text-neutral-300">{t.sections.timeline}</p>
            {lifecycleEntries.map(([platform, lifecycle]) => (
              <div key={platform} className="flex flex-col gap-1 text-sm sm:flex-row sm:justify-between">
                <span className="text-neutral-400">{formatPlatformLabel(platform)}</span>
                <span className="text-neutral-200">
                  {lifecycle?.last_operation_type?.replaceAll('_', ' ') || t.sections.noOperations}
                  {lifecycle?.last_result ? ` · ${statusLabel(lifecycle.last_result, t)}` : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function PublishingStatusPanel({
  item,
  t,
  onRemovePlatform,
  formatPlatformLabel,
  language,
}: PublishingStatusPanelProps) {
  const results = item.publish_results || [];

  if (results.length === 0) {
    return (
      <Card className="border-neutral-800 bg-neutral-900/55 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg text-white">{t.sections.publishingTitle}</CardTitle>
          <CardDescription className="text-neutral-400">
            {t.sections.notPublished}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-neutral-800 bg-neutral-900/55 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg text-white">{t.sections.publishingTitle}</CardTitle>
        <CardDescription className="text-neutral-400">
          {t.sections.publishingDescription}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {results.map((result) => {
          const tone = publishStatusTone(result, t);
          const isSuccess = result.status === 'success' || result.success;
          const canRemove =
            isSuccess &&
            (result.platform === 'olx' ||
              result.platform === 'ebay' ||
              result.platform === 'allegro' ||
              result.platform === 'etsy');
          const timestamp = formatDateTime(result.updated_at || result.published_at, language);

          return (
            <div
              key={`${result.platform}-${result.external_id || result.post_id || result.status}`}
              className={`rounded-lg border ${tone.borderClass} bg-neutral-900/50 p-4`}
            >
              <div className="flex flex-col items-start gap-3 sm:flex-row">
                <div className="flex min-w-0 flex-1 gap-3">
                  <div className="mt-0.5 flex-shrink-0">{tone.icon}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-white">{formatPlatformLabel(result.platform)}</span>
                      <Badge className={tone.badgeClass}>{tone.label}</Badge>
                    </div>

                    {result.listing_url && (
                      <a
                        href={result.listing_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-sm text-cyan-300 hover:text-cyan-200 hover:underline"
                      >
                        {t.sections.viewLive}
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}

                    {(result.external_id || result.post_id) && (
                      <p className="mt-1 text-sm text-neutral-400">
                        ID: {result.external_id || result.post_id}
                      </p>
                    )}

                    {(result.message || result.error_message) && (
                      <p className={`mt-1 text-sm ${result.error_message ? 'text-red-300' : 'text-neutral-400'}`}>
                        {result.error_message ? `${t.sections.providerError}: ${result.error_message}` : result.message}
                      </p>
                    )}

                    {timestamp && <p className="mt-1 text-xs text-neutral-500">{timestamp}</p>}
                  </div>
                </div>

                {canRemove && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full shrink-0 sm:w-auto"
                    onClick={() => onRemovePlatform(result.platform)}
                  >
                    <Trash2 className="h-4 w-4 sm:mr-2" />
                    <span className="sm:inline">{t.actions.deleteFromPlatform}</span>
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function ListingAdvancedDetails({ item, formatPlatformLabel, t }: ListingDetailSectionProps) {
  return (
    <Collapsible className="rounded-xl border border-neutral-800 bg-neutral-900/55 p-4 backdrop-blur-sm">
      <CollapsibleTrigger asChild>
        <Button type="button" variant="ghost" className="w-full justify-between text-neutral-200 hover:bg-neutral-800/60">
          {t.sections.advancedTitle}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-4 space-y-4">
        <div className="rounded-lg bg-neutral-800/50 p-4">
          <p className="text-xs uppercase tracking-wide text-neutral-400">UUID</p>
          <p className="mt-2 break-all font-mono text-xs text-neutral-200">{item.uuid}</p>
        </div>

        {item.description_full && (
          <div className="rounded-lg bg-neutral-800/50 p-4">
            <p className="text-xs uppercase tracking-wide text-neutral-400">{t.sections.fullDescription}</p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-neutral-200">{item.description_full}</p>
          </div>
        )}

        {(item.catalog_path || item.weight_kg || item.dimensions_cm || item.shipping_advice) && (
          <div className="space-y-3 rounded-lg bg-neutral-800/50 p-4">
            {item.catalog_path && (
              <div>
                <p className="text-xs uppercase tracking-wide text-neutral-400">{t.sections.catalogPath}</p>
                <p className="mt-1 text-sm text-neutral-200">{item.catalog_path}</p>
              </div>
            )}
            {item.weight_kg && (
              <div>
                <p className="text-xs uppercase tracking-wide text-neutral-400">{t.sections.weight}</p>
                <p className="mt-1 text-sm text-neutral-200">{item.weight_kg} kg</p>
              </div>
            )}
            {item.dimensions_cm && (
              <div>
                <p className="text-xs uppercase tracking-wide text-neutral-400">{t.sections.dimensions}</p>
                <pre className="mt-1 overflow-auto rounded border border-neutral-700 bg-neutral-900/60 p-2 text-xs text-neutral-200">
                  {JSON.stringify(item.dimensions_cm, null, 2)}
                </pre>
              </div>
            )}
            {item.shipping_advice && (
              <div>
                <p className="text-xs uppercase tracking-wide text-neutral-400">{t.sections.shippingAdvice}</p>
                <pre className="mt-1 overflow-auto rounded border border-neutral-700 bg-neutral-900/60 p-2 text-xs text-neutral-200">
                  {JSON.stringify(item.shipping_advice, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {item.analysis && (
          <div className="rounded-lg bg-neutral-800/50 p-4">
            <p className="text-xs uppercase tracking-wide text-neutral-400">{t.sections.analysisPayload}</p>
            <pre className="mt-2 max-h-96 overflow-auto rounded border border-neutral-700 bg-neutral-900/60 p-2 text-xs text-neutral-200">
              {JSON.stringify(item.analysis, null, 2)}
            </pre>
          </div>
        )}

        {item.recent_lifecycle_events && item.recent_lifecycle_events.length > 0 && (
          <div className="rounded-lg bg-neutral-800/50 p-4">
            <p className="text-xs uppercase tracking-wide text-neutral-400">{t.sections.recentEvents}</p>
            <div className="mt-2 space-y-1 text-xs text-neutral-300">
              {item.recent_lifecycle_events.slice(0, 8).map((event, index) => (
                <div key={`${event.platform}-${event.operation_type}-${event.attempted_at || index}`}>
                  {formatPlatformLabel(event.platform)} · {event.operation_type} · {event.status}
                </div>
              ))}
            </div>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

export function ListingIdentityBar({ item, t, language }: { item: UserItem; t: ItemDetailTranslations; language: Language }) {
  const updatedAt = formatDateTime(item.updated_at, language);
  const publishedAt = formatDateTime(item.published_at, language);

  return (
    <div className="flex flex-wrap gap-2 text-xs text-neutral-400">
      {updatedAt && (
        <span className="inline-flex items-center gap-1 rounded-full border border-neutral-800 bg-neutral-900/60 px-3 py-1">
          <Clock className="h-3.5 w-3.5 text-cyan-300" />
          {t.sections.identityUpdated} {updatedAt}
        </span>
      )}
      {publishedAt && (
        <span className="inline-flex items-center gap-1 rounded-full border border-neutral-800 bg-neutral-900/60 px-3 py-1">
          <Link2 className="h-3.5 w-3.5 text-emerald-300" />
          {t.sections.identityPublished} {publishedAt}
        </span>
      )}
    </div>
  );
}
