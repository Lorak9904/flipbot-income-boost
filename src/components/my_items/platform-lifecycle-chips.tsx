import { AlertTriangle, CheckCircle2, Clock3, RefreshCw, XCircle, type LucideIcon } from 'lucide-react';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatPlatformLabel } from '@/lib/platforms';
import type { Platform, PlatformLifecycleStatus, PlatformPublishResult, UserItem } from '@/types/item';

const PLATFORM_ORDER: Platform[] = ['facebook', 'olx', 'vinted', 'ebay', 'allegro', 'etsy'];

type ChipTone = 'success' | 'warning' | 'error' | 'neutral' | 'pending';

const toneClasses: Record<ChipTone, string> = {
  success: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  warning: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  error: 'border-red-500/45 bg-red-500/10 text-red-300',
  neutral: 'border-neutral-600 bg-neutral-800/60 text-neutral-300',
  pending: 'border-sky-500/40 bg-sky-500/10 text-sky-300',
};

interface LifecycleCopy {
  locale: string;
  ariaLabel: string;
  removed: string;
  needsAttention: string;
  pending: string;
  pendingChanges: string;
  live: string;
  notChecked: string;
  lastChecked: string;
  neverChecked: string;
  providerMessage: string;
  detailsLabel: string;
}

const formatTimestamp = (value: string | null | undefined, locale: string) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsed);
};

const getOrderedPlatforms = (item: UserItem): Platform[] => {
  const platforms = new Set<Platform>();
  item.platforms?.forEach((platform) => platforms.add(platform));
  item.publish_results?.forEach((result) => platforms.add(result.platform));
  Object.keys(item.platform_lifecycle_status || {}).forEach((platform) => platforms.add(platform as Platform));

  const orderIndex = (platform: Platform) => {
    const index = PLATFORM_ORDER.indexOf(platform);
    return index === -1 ? PLATFORM_ORDER.length : index;
  };

  return Array.from(platforms).sort((a, b) => orderIndex(a) - orderIndex(b));
};

const getPublishResult = (item: UserItem, platform: Platform): PlatformPublishResult | undefined =>
  item.publish_results?.find((result) => result.platform === platform);

const resolveChipState = (
  copy: LifecycleCopy,
  publishResult?: PlatformPublishResult,
  lifecycle?: PlatformLifecycleStatus
): { label: string; tone: ChipTone; Icon: LucideIcon } => {
  if (publishResult?.status === 'removed') {
    return { label: copy.removed, tone: 'neutral', Icon: XCircle };
  }

  if (publishResult?.status === 'error' || lifecycle?.last_result === 'error') {
    return { label: copy.needsAttention, tone: 'error', Icon: AlertTriangle };
  }

  if (publishResult?.status === 'pending' || lifecycle?.last_result === 'pending') {
    return { label: copy.pending, tone: 'pending', Icon: Clock3 };
  }

  if (lifecycle?.dirty) {
    return { label: copy.pendingChanges, tone: 'warning', Icon: RefreshCw };
  }

  if (publishResult?.status === 'success' || lifecycle?.last_result === 'success') {
    return { label: copy.live, tone: 'success', Icon: CheckCircle2 };
  }

  return { label: copy.notChecked, tone: 'neutral', Icon: Clock3 };
};

export function PlatformLifecycleChips({ item, copy }: { item: UserItem; copy: LifecycleCopy }) {
  const platforms = getOrderedPlatforms(item);
  if (platforms.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5" aria-label={copy.ariaLabel}>
      {platforms.map((platform) => {
        const publishResult = getPublishResult(item, platform);
        const lifecycle = item.platform_lifecycle_status?.[platform];
        const { label, tone, Icon } = resolveChipState(copy, publishResult, lifecycle);
        const platformLabel = formatPlatformLabel(platform);
        const lastChecked = formatTimestamp(
          lifecycle?.last_completed_at || lifecycle?.last_attempted_at || publishResult?.updated_at,
          copy.locale
        );
        const detailsLabel = copy.detailsLabel.replace('{platform}', platformLabel);

        return (
          <Popover key={platform}>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label={`${detailsLabel}: ${label}`}
                className={`inline-flex min-h-8 items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium transition-colors hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 ${toneClasses[tone]}`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span className="whitespace-nowrap">
                  {platformLabel} · {label}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              side="top"
              className="w-72 border-neutral-700 bg-neutral-900 text-neutral-100"
            >
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-neutral-300" aria-hidden="true" />
                <p className="text-sm font-semibold">{platformLabel}</p>
              </div>
              <p className="mt-1 text-sm text-neutral-300">{label}</p>
              <dl className="mt-3 space-y-2 text-xs">
                <div>
                  <dt className="text-neutral-500">{copy.lastChecked}</dt>
                  <dd className="mt-0.5 text-neutral-300">{lastChecked || copy.neverChecked}</dd>
                </div>
                {publishResult?.message && (
                  <div>
                    <dt className="text-neutral-500">{copy.providerMessage}</dt>
                    <dd className="mt-0.5 break-words text-neutral-300">{publishResult.message}</dd>
                  </div>
                )}
              </dl>
            </PopoverContent>
          </Popover>
        );
      })}
    </div>
  );
}
