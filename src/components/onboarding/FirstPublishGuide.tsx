import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { usePostHog } from '@posthog/react';
import {
  BarChart3,
  Camera,
  CheckCircle2,
  Circle,
  ExternalLink,
  Link2,
  Loader2,
  Send,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AddItemButton, SecondaryAction } from '@/components/ui/button-presets';
import { getTranslations } from '@/components/language-utils';
import { captureActivationEvent } from '@/lib/analytics/activation';
import { fetchPlatformHealth, toPlatformConnectedMap } from '@/lib/api/platform-health';
import type { ItemStats, PlatformPublishResult, UserItem } from '@/types/item';

interface FirstPublishGuideProps {
  stats: ItemStats | null;
  statsLoading: boolean;
  items: UserItem[];
}

const firstPublishGuideTranslations = {
  en: {
    eyebrow: 'First publish',
    title: 'Get one live listing out',
    description: 'OLX PL is the default first path. Once any marketplace is ready, create a draft and publish it from review.',
    completeBadge: 'Complete',
    inProgressBadge: 'In progress',
    connectTitle: 'Connect marketplace',
    connectBody: 'Start with OLX PL or another supported marketplace account.',
    olxReadyBody: 'OLX is connected and ready for the first listing.',
    marketplaceReadyBody: 'A marketplace account is connected.',
    draftTitle: 'Create AI draft',
    draftBody: 'Upload product photos and let FlipIt prepare the listing draft.',
    publishTitle: 'Publish listing',
    publishBody: 'Review fields, required attributes, price, and publish.',
    resultTitle: 'Check result',
    resultBody: 'Open the live listing or monitor marketplace statistics.',
    connectCta: 'Connect OLX',
    addCta: 'Add listing',
    draftsCta: 'Open drafts',
    statsCta: 'View statistics',
    liveListingCta: 'Open live listing',
    loading: 'Checking first-publish progress...',
  },
  pl: {
    eyebrow: 'Pierwsza publikacja',
    title: 'Wystaw pierwsze aktywne ogloszenie',
    description: 'OLX PL to domyslna pierwsza sciezka. Po podlaczeniu konta przygotuj szkic i opublikuj go po sprawdzeniu.',
    completeBadge: 'Gotowe',
    inProgressBadge: 'W trakcie',
    connectTitle: 'Polacz marketplace',
    connectBody: 'Zacznij od OLX PL albo innego obslugiwanego konta sprzedazy.',
    olxReadyBody: 'OLX jest polaczony i gotowy na pierwsze ogloszenie.',
    marketplaceReadyBody: 'Konto marketplace jest polaczone.',
    draftTitle: 'Utworz szkic AI',
    draftBody: 'Wgraj zdjecia produktu, a FlipIt przygotuje szkic ogloszenia.',
    publishTitle: 'Opublikuj ogloszenie',
    publishBody: 'Sprawdz pola, wymagane atrybuty, cene i opublikuj.',
    resultTitle: 'Sprawdz wynik',
    resultBody: 'Otworz aktywne ogloszenie albo monitoruj statystyki marketplace.',
    connectCta: 'Polacz OLX',
    addCta: 'Dodaj ogloszenie',
    draftsCta: 'Otworz szkice',
    statsCta: 'Zobacz statystyki',
    liveListingCta: 'Otworz ogloszenie',
    loading: 'Sprawdzamy postep pierwszej publikacji...',
  },
};

function findFirstLiveListing(items: UserItem[]) {
  for (const item of items) {
    const result = item.publish_results?.find(
      (row): row is PlatformPublishResult =>
        row.status === 'success' && Boolean(row.listing_url)
    );
    if (result) {
      return {
        item,
        result,
      };
    }
  }
  return null;
}

export function FirstPublishGuide({ stats, statsLoading, items }: FirstPublishGuideProps) {
  const posthog = usePostHog();
  const t = getTranslations(firstPublishGuideTranslations);
  const { data: health, isLoading: healthLoading } = useQuery({
    queryKey: ['first-publish-platform-health'],
    queryFn: fetchPlatformHealth,
    staleTime: 60 * 1000,
    retry: false,
  });

  const connectedPlatforms = toPlatformConnectedMap(health?.platforms);
  const hasConnectedMarketplace = Object.values(connectedPlatforms).some(Boolean);
  const hasOlxConnected = connectedPlatforms.olx;
  const totalListings = stats?.total_items ?? 0;
  const draftListings = stats?.draft_items ?? 0;
  const publishedListings = stats?.published_items ?? 0;
  const hasAnyListing = totalListings > 0;
  const firstLiveListing = findFirstLiveListing(items);
  const hasPublishedListing = publishedListings > 0 || Boolean(firstLiveListing);

  const steps = [
    {
      key: 'connect',
      title: t.connectTitle,
      body: hasConnectedMarketplace
        ? hasOlxConnected
          ? t.olxReadyBody
          : t.marketplaceReadyBody
        : t.connectBody,
      complete: hasConnectedMarketplace,
      Icon: Link2,
    },
    {
      key: 'draft',
      title: t.draftTitle,
      body: t.draftBody,
      complete: hasAnyListing,
      Icon: Camera,
    },
    {
      key: 'publish',
      title: t.publishTitle,
      body: t.publishBody,
      complete: hasPublishedListing,
      Icon: Send,
    },
    {
      key: 'result',
      title: t.resultTitle,
      body: t.resultBody,
      complete: hasPublishedListing,
      Icon: BarChart3,
    },
  ];

  const completedSteps = steps.filter((step) => step.complete).length;
  const progress = Math.round((completedSteps / steps.length) * 100);
  const primaryAction = !hasConnectedMarketplace
    ? { label: t.connectCta, href: '/connect-accounts', key: 'connect_olx' }
    : !hasAnyListing
        ? { label: t.addCta, href: '/add-item', key: 'add_listing' }
        : !hasPublishedListing
          ? draftListings > 0
            ? { label: t.draftsCta, href: '/user/items?status_group=drafts', key: 'open_drafts' }
            : { label: t.addCta, href: '/add-item', key: 'add_listing' }
        : {
            label: t.statsCta,
            href: `/user/statistics?platform=${firstLiveListing?.result.platform || 'olx'}`,
            key: 'view_statistics',
          };

  const trackCtaClick = (target: string) => {
    captureActivationEvent(posthog, 'activation_guide_cta_clicked', {
      target,
      completed_steps: completedSteps,
      total_steps: steps.length,
      has_olx_connected: hasOlxConnected,
      total_listings: totalListings,
      published_listings: publishedListings,
    });
  };

  if (statsLoading || healthLoading) {
    return (
      <Card className="mb-8 border border-neutral-800 bg-neutral-900/55 backdrop-blur-sm">
        <CardContent className="flex items-center gap-3 p-5 text-neutral-300">
          <Loader2 className="h-5 w-5 animate-spin text-cyan-300" />
          {t.loading}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8 overflow-hidden border border-cyan-400/20 bg-neutral-900/55 backdrop-blur-sm">
      <CardContent className="p-5 md:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-cyan-300">{t.eyebrow}</span>
              <Badge className={hasPublishedListing
                ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200'
                : 'border-cyan-500/40 bg-cyan-500/15 text-cyan-200'}
              >
                {hasPublishedListing ? t.completeBadge : t.inProgressBadge}
              </Badge>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-white">{t.title}</h2>
            <p className="mt-2 max-w-3xl text-sm text-neutral-300">{t.description}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
            <AddItemButton asChild sizeVariant="md" className="w-full sm:w-auto">
              <Link to={primaryAction.href} onClick={() => trackCtaClick(primaryAction.key)}>
                {primaryAction.label}
              </Link>
            </AddItemButton>
            {firstLiveListing?.result.listing_url && (
              <SecondaryAction asChild className="min-h-10 px-4 py-0 text-sm">
                <a
                  href={firstLiveListing.result.listing_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackCtaClick('open_live_listing')}
                >
                  {t.liveListingCta}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </SecondaryAction>
            )}
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-xs text-neutral-400">
            <span>{completedSteps}/{steps.length}</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-neutral-800" />
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {steps.map(({ key, title, body, complete, Icon }) => {
            const StatusIcon = complete ? CheckCircle2 : Circle;
            return (
              <div
                key={key}
                className="rounded-lg border border-neutral-800 bg-neutral-950/35 p-4"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
                    <Icon className="h-4 w-4" />
                  </div>
                  <StatusIcon className={complete ? 'h-5 w-5 text-emerald-300' : 'h-5 w-5 text-neutral-500'} />
                </div>
                <h3 className="font-semibold text-white">{title}</h3>
                <p className="mt-1 text-sm text-neutral-400">{body}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
