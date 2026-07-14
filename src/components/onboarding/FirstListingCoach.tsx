import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usePostHog } from '@posthog/react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  BarChart3,
  BookOpen,
  Camera,
  CheckCircle2,
  Circle,
  Compass,
  EyeOff,
  ExternalLink,
  Link2,
  Loader2,
  MoreHorizontal,
  RotateCcw,
  Send,
  Trophy,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { NotificationAction } from '@/components/ui/notification-action';
import { getLocalizedPathForCurrentLanguage, getTranslations } from '@/components/language-utils';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { captureActivationEvent } from '@/lib/analytics/activation';
import { fetchPlatformHealth, toPlatformConnectedMap } from '@/lib/api/platform-health';
import { fetchItemStats, fetchUserItems } from '@/lib/api/items';
import {
  fetchUserProfile,
  updateUserProfile,
  type FirstListingCoachState,
} from '@/lib/api/user';
import { COOKIE_CONSENT_CHOICE_EVENT, hasCookieConsentChoice } from '@/lib/cookie-consent';
import { buildListingEditorUrl } from '@/lib/listing-editor/navigation';
import { matchLocalizedRoute } from '@/lib/localized-routes';
import { cn } from '@/lib/utils';
import type { PlatformPublishResult, UserItem } from '@/types/item';
import {
  FIRST_LISTING_COACH_COMMAND_EVENT,
  buildActiveFirstListingCoachState,
  dispatchFirstListingCoachCommand,
  getFirstListingCoachSessionKey,
  type FirstListingCoachCommandDetail,
} from './first-listing-coach-controls';

const firstListingCoachTranslations = {
  en: {
    title: 'First steps',
    launcher: 'First steps',
    resume: 'First steps',
    liveTitle: 'First listing live',
    complete: 'done',
    loading: 'Checking',
    nextConnectTitle: 'Choose a marketplace',
    nextConnectBody: 'Pick where you want to sell first.',
    nextDraftTitle: 'Add photos',
    nextDraftBody: 'FlipIt will prepare a draft you can review.',
    nextPublishTitle: 'Publish the draft',
    nextPublishBody: 'Check the title, photos, price, and details. Publish when it looks right.',
    nextResultTitle: 'Check the listing',
    nextResultBody: 'Open the live listing and make sure it looks good.',
    finishedBody: 'Your first marketplace listing is published.',
    connectTitle: 'Marketplace',
    connectBody: 'Choose where to sell.',
    draftTitle: 'Draft',
    draftBody: 'Create one editable draft.',
    publishTitle: 'Publish',
    publishBody: 'Review before publishing.',
    resultTitle: 'Live',
    resultBody: 'Confirm the listing is visible.',
    connectCta: 'Connect marketplace',
    addCta: 'Add listing',
    draftsCta: 'Drafts',
    statsCta: 'Statistics',
    liveListingCta: 'Open live listing',
    minimize: 'Minimize',
    guideOptions: 'Options',
    hideGuide: 'Hide',
    restartGuide: 'Start over',
    openTutorials: 'Tutorials',
    hiddenToastTitle: 'First steps hidden',
    hiddenToastBody: 'Open them again from Settings or Tutorials.',
    settingsToastAction: 'Settings',
    markDone: 'Mark done',
    done: 'Done',
  },
  pl: {
    title: 'Pierwsze kroki',
    launcher: 'Pierwsze kroki',
    resume: 'Pierwsze kroki',
    liveTitle: 'Pierwsze ogłoszenie aktywne',
    complete: 'gotowe',
    loading: 'Sprawdzanie',
    nextConnectTitle: 'Wybierz platformę',
    nextConnectBody: 'Zacznij od miejsca, gdzie chcesz wystawić pierwsze ogłoszenie.',
    nextDraftTitle: 'Dodaj zdjęcia',
    nextDraftBody: 'FlipIt przygotuje szkic, który możesz sprawdzić.',
    nextPublishTitle: 'Opublikuj szkic',
    nextPublishBody: 'Sprawdź tytuł, cenę, zdjęcia i szczegóły. Publikuj dopiero, gdy wszystko się zgadza.',
    nextResultTitle: 'Sprawdź ogłoszenie',
    nextResultBody: 'Otwórz link i upewnij się, że ogłoszenie wygląda dobrze.',
    finishedBody: 'Pierwsze ogłoszenie jest już opublikowane.',
    connectTitle: 'Platforma',
    connectBody: 'Wybierz, gdzie sprzedajesz.',
    draftTitle: 'Szkic',
    draftBody: 'Przygotuj jedną wersję do sprawdzenia.',
    publishTitle: 'Publikacja',
    publishBody: 'Zatwierdź dopiero po sprawdzeniu.',
    resultTitle: 'Na żywo',
    resultBody: 'Sprawdź, czy ogłoszenie jest widoczne.',
    connectCta: 'Połącz platformę',
    addCta: 'Dodaj ogłoszenie',
    draftsCta: 'Szkice',
    statsCta: 'Statystyki',
    liveListingCta: 'Otwórz ogłoszenie',
    minimize: 'Zwiń',
    guideOptions: 'Opcje',
    hideGuide: 'Ukryj',
    restartGuide: 'Zacznij od nowa',
    openTutorials: 'Poradniki',
    hiddenToastTitle: 'Pierwsze kroki ukryte',
    hiddenToastBody: 'Znajdziesz je w ustawieniach albo poradnikach.',
    settingsToastAction: 'Ustawienia',
    markDone: 'Gotowe',
    done: 'Gotowe',
  },
};

function findFirstLiveListing(items: UserItem[]) {
  for (const item of items) {
    const result = item.publish_results?.find(
      (row): row is PlatformPublishResult =>
        row.status === 'success' && Boolean(row.listing_url)
    );
    if (result) {
      return { item, result };
    }
  }
  return null;
}

function LauncherIcon({ complete }: { complete: boolean }) {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center">
      {complete ? (
        <Trophy className="h-4 w-4 text-emerald-300" />
      ) : (
        <Compass className="h-4 w-4 text-cyan-200" />
      )}
    </span>
  );
}

export function FirstListingCoach() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const posthog = usePostHog();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const { toast } = useToast();
  const t = getTranslations(firstListingCoachTranslations);
  const routeKey = matchLocalizedRoute(location.pathname)?.key;
  const isWorkspaceRoute = Boolean(routeKey && [
    'connectAccounts',
    'addItem',
    'userItems',
    'itemDetail',
    'editItem',
    'statistics',
    'settings',
    'platformSettings',
  ].includes(routeKey));
  const [optimisticState, setOptimisticState] = useState<FirstListingCoachState | null>(null);
  const [hasAnsweredCookieBanner, setHasAnsweredCookieBanner] = useState(() => hasCookieConsentChoice());
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia('(min-width: 768px)').matches
  );
  const userKey = user?.id || user?.email || 'anonymous';
  const minimizedSessionKey = getFirstListingCoachSessionKey('flipit_first_listing_coach_minimized', userKey);
  const introSessionKey = getFirstListingCoachSessionKey('flipit_first_listing_coach_intro', userKey);
  const [isSessionMinimized, setIsSessionMinimized] = useState(() =>
    typeof window === 'undefined' ? false : window.sessionStorage.getItem(minimizedSessionKey) === 'true'
  );
  const [hasPlayedIntro, setHasPlayedIntro] = useState(() =>
    typeof window === 'undefined' ? true : window.sessionStorage.getItem(introSessionKey) === 'true'
  );

  useEffect(() => {
    const handleConsentChoice = () => setHasAnsweredCookieBanner(true);
    window.addEventListener(COOKIE_CONSENT_CHOICE_EVENT, handleConsentChoice);
    return () => window.removeEventListener(COOKIE_CONSENT_CHOICE_EVENT, handleConsentChoice);
  }, []);

  useEffect(() => {
    const query = window.matchMedia('(min-width: 768px)');
    const handleChange = () => setIsDesktop(query.matches);
    handleChange();
    query.addEventListener('change', handleChange);
    return () => query.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    setIsSessionMinimized(window.sessionStorage.getItem(minimizedSessionKey) === 'true');
    setHasPlayedIntro(window.sessionStorage.getItem(introSessionKey) === 'true');
  }, [introSessionKey, minimizedSessionKey]);

  useEffect(() => {
    const handleCommand = (event: Event) => {
      const detail = (event as CustomEvent<FirstListingCoachCommandDetail>).detail;
      if (!detail?.state) {
        return;
      }
      window.sessionStorage.removeItem(minimizedSessionKey);
      window.sessionStorage.removeItem(introSessionKey);
      setIsSessionMinimized(false);
      setHasPlayedIntro(false);
      setOptimisticState(detail.state);
    };

    window.addEventListener(FIRST_LISTING_COACH_COMMAND_EVENT, handleCommand);
    return () => window.removeEventListener(FIRST_LISTING_COACH_COMMAND_EVENT, handleCommand);
  }, [introSessionKey, minimizedSessionKey]);

  const profileQuery = useQuery({
    queryKey: ['user-profile'],
    queryFn: fetchUserProfile,
    enabled: isAuthenticated && isWorkspaceRoute,
    staleTime: 60 * 1000,
  });

  const savedState = profileQuery.data?.first_listing_coach_state || {};
  const coachState = optimisticState || savedState;
  const shouldLoadCoachData =
    isAuthenticated &&
    isWorkspaceRoute &&
    hasAnsweredCookieBanner &&
    profileQuery.isSuccess &&
    coachState.status !== 'dismissed' &&
    coachState.status !== 'completed';

  const healthQuery = useQuery({
    queryKey: ['first-listing-coach-platform-health'],
    queryFn: fetchPlatformHealth,
    enabled: shouldLoadCoachData,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const statsQuery = useQuery({
    queryKey: ['first-listing-coach-item-stats'],
    queryFn: fetchItemStats,
    enabled: shouldLoadCoachData,
    staleTime: 5 * 60 * 1000,
  });

  const itemsQuery = useQuery({
    queryKey: ['first-listing-coach-items'],
    queryFn: () => fetchUserItems({ page: 1, page_size: 10 }),
    enabled: shouldLoadCoachData,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    setOptimisticState(null);
  }, [profileQuery.data?.first_listing_coach_state]);

  const mutation = useMutation({
    mutationFn: (state: FirstListingCoachState) =>
      updateUserProfile({ first_listing_coach_state: state }),
    onSuccess: (profile) => {
      queryClient.setQueryData(['user-profile'], profile);
    },
  });

  const connectedPlatforms = toPlatformConnectedMap(healthQuery.data?.platforms);
  const hasConnectedMarketplace = Object.values(connectedPlatforms).some(Boolean);
  const hasOlxConnected = connectedPlatforms.olx;
  const stats = statsQuery.data;
  const items = itemsQuery.data?.items || [];
  const totalListings = stats?.total_items ?? itemsQuery.data?.total ?? 0;
  const draftListings = stats?.draft_items ?? items.filter((item) => item.status === 'draft').length;
  const firstLiveListing = findFirstLiveListing(items);
  const hasPublishedListing = (stats?.published_items ?? 0) > 0 || Boolean(firstLiveListing);
  const isFinishedState = hasPublishedListing && coachState.status !== 'completed' && coachState.status !== 'dismissed';

  const steps = useMemo(
    () => [
      {
        key: 'connect',
        title: t.connectTitle,
        body: t.connectBody,
        complete: hasConnectedMarketplace,
        Icon: Link2,
      },
      {
        key: 'draft',
        title: t.draftTitle,
        body: t.draftBody,
        complete: totalListings > 0,
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
    ],
    [
      hasConnectedMarketplace,
      hasPublishedListing,
      t.connectBody,
      t.connectTitle,
      t.draftBody,
      t.draftTitle,
      t.publishBody,
      t.publishTitle,
      t.resultBody,
      t.resultTitle,
      totalListings,
    ]
  );

  const completedSteps = steps.filter((step) => step.complete).length;
  const progress = Math.round((completedSteps / steps.length) * 100);
  const isLoading =
    profileQuery.isLoading || healthQuery.isLoading || statsQuery.isLoading || itemsQuery.isLoading;
  const isHidden = coachState.status === 'dismissed' || coachState.status === 'completed';
  const isSnoozed = coachState.status === 'snoozed';
  const shouldAutoOpen = !isLoading && !hasConnectedMarketplace && !isHidden && !isSessionMinimized;
  const shouldPlayIntro = shouldAutoOpen && !hasPlayedIntro && isDesktop && !shouldReduceMotion;
  const isOpen =
    shouldAutoOpen || (!isSessionMinimized && (isFinishedState || Boolean(coachState.open)));

  const primaryAction = !hasConnectedMarketplace
    ? { label: t.connectCta, href: getLocalizedPathForCurrentLanguage('/connect-accounts'), key: 'connect_marketplace' }
    : totalListings === 0
      ? { label: t.addCta, href: getLocalizedPathForCurrentLanguage(buildListingEditorUrl({ mode: 'add' })), key: 'add_listing' }
      : !hasPublishedListing
        ? draftListings > 0
          ? { label: t.draftsCta, href: getLocalizedPathForCurrentLanguage('/user/items?status_group=drafts'), key: 'open_drafts' }
          : { label: t.addCta, href: getLocalizedPathForCurrentLanguage(buildListingEditorUrl({ mode: 'add' })), key: 'add_listing' }
        : {
            label: t.statsCta,
            href: getLocalizedPathForCurrentLanguage(`/user/statistics?platform=${firstLiveListing?.result.platform || 'olx'}`),
            key: 'view_statistics',
          };

  const activeCopy = !hasConnectedMarketplace
    ? { title: t.nextConnectTitle, body: t.nextConnectBody, Icon: Link2 }
    : totalListings === 0
      ? { title: t.nextDraftTitle, body: t.nextDraftBody, Icon: Camera }
      : !hasPublishedListing
        ? { title: t.nextPublishTitle, body: t.nextPublishBody, Icon: Send }
        : { title: t.nextResultTitle, body: t.nextResultBody, Icon: BarChart3 };

  const saveCoachState = (nextState: FirstListingCoachState, target: string) => {
    const mergedState: FirstListingCoachState = {
      ...coachState,
      ...nextState,
      source: 'widget',
      updated_at: new Date().toISOString(),
    };
    setOptimisticState(mergedState);
    mutation.mutate(mergedState);
    captureActivationEvent(posthog, 'activation_guide_cta_clicked', {
      target,
      completed_steps: completedSteps,
      total_steps: steps.length,
      has_olx_connected: hasOlxConnected,
      total_listings: totalListings,
      published_listings: stats?.published_items ?? 0,
      coach_status: mergedState.status || 'active',
    });
  };

  const openCoach = () => {
    window.sessionStorage.removeItem(minimizedSessionKey);
    setIsSessionMinimized(false);
    saveCoachState({ status: 'active', open: true }, 'open_coach');
  };
  const minimizeCoach = () => {
    window.sessionStorage.setItem(minimizedSessionKey, 'true');
    setIsSessionMinimized(true);
    saveCoachState({ status: 'active', open: false }, 'minimize_coach');
  };
  const toggleCoach = () => {
    if (isOpen) {
      minimizeCoach();
      return;
    }
    openCoach();
  };
  const hideCoachForNavigation = (target: string) => {
    window.sessionStorage.setItem(minimizedSessionKey, 'true');
    setIsSessionMinimized(true);
    saveCoachState({ status: 'active', open: false }, target);
  };
  const dismissCoach = () => {
    saveCoachState({ status: 'dismissed', open: false, hidden_at: new Date().toISOString() }, 'hide_coach');
    toast({
      title: t.hiddenToastTitle,
      description: t.hiddenToastBody,
      action: (
        <NotificationAction altText={t.settingsToastAction} onClick={() => navigate(getLocalizedPathForCurrentLanguage('/settings'))}>
          {t.settingsToastAction}
        </NotificationAction>
      ),
    });
  };
  const restartCoach = () => {
    const state = buildActiveFirstListingCoachState('widget', {
      restart_at: new Date().toISOString(),
    });
    window.sessionStorage.removeItem(minimizedSessionKey);
    setIsSessionMinimized(false);
    saveCoachState(state, 'restart_coach');
    dispatchFirstListingCoachCommand({ state, source: 'widget' });
  };
  const completeCoach = () => saveCoachState({ status: 'completed', open: false }, 'complete_coach');

  const trackAction = (target: string) => {
    captureActivationEvent(posthog, 'activation_guide_cta_clicked', {
      target,
      completed_steps: completedSteps,
      total_steps: steps.length,
      has_olx_connected: hasOlxConnected,
      total_listings: totalListings,
      published_listings: stats?.published_items ?? 0,
    });
  };
  const handlePrimaryActionClick = () => {
    if (primaryAction.key === 'connect_marketplace') {
      hideCoachForNavigation(primaryAction.key);
      return;
    }
    trackAction(primaryAction.key);
  };

  useEffect(() => {
    if (!shouldPlayIntro) {
      return;
    }

    const timer = window.setTimeout(() => {
      window.sessionStorage.setItem(introSessionKey, 'true');
      setHasPlayedIntro(true);
    }, 2400);

    return () => window.clearTimeout(timer);
  }, [introSessionKey, shouldPlayIntro]);

  if (!isAuthenticated || !isWorkspaceRoute || isHidden || !hasAnsweredCookieBanner) {
    return null;
  }

  const launcherLabel = isSnoozed ? t.resume : t.launcher;
  const PanelIcon = isFinishedState ? Trophy : activeCopy.Icon;

  return (
    <motion.div
      className={cn(
        'fixed left-4 z-40 flex w-[calc(100vw-2rem)] max-w-sm flex-col items-start gap-3 sm:left-5 sm:w-auto',
        'bottom-5'
      )}
      initial={
        shouldPlayIntro
          ? { opacity: 0, x: 'calc(50vw - 12rem)', y: 'calc(-42vh + 12rem)', scale: 1.04 }
          : false
      }
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      transition={shouldPlayIntro ? { delay: 1.1, duration: 0.75, ease: [0.22, 1, 0.36, 1] } : undefined}
    >
      {isOpen && (
        <div
          className={cn(
            'flex w-full flex-col overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950/95 text-white shadow-2xl shadow-black/35 backdrop-blur-xl sm:w-[360px]'
          )}
        >
          <div className="border-b border-neutral-800 bg-neutral-900/80 px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white">
                  {isFinishedState ? t.liveTitle : t.title}
                </div>
                <div className="mt-1 text-xs text-neutral-400">
                  {completedSteps}/{steps.length} {t.complete}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 rounded-full text-neutral-400 hover:bg-neutral-800 hover:text-white"
                    aria-label={t.guideOptions}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="border-neutral-800 bg-neutral-950 text-neutral-100">
                  {isFinishedState ? (
                    <DropdownMenuItem onClick={completeCoach}>
                      <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-300" />
                      {t.markDone}
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={minimizeCoach}>
                      <Circle className="mr-2 h-4 w-4 text-neutral-400" />
                      {t.minimize}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={restartCoach}>
                    <RotateCcw className="mr-2 h-4 w-4 text-cyan-300" />
                    {t.restartGuide}
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={getLocalizedPathForCurrentLanguage('/articles')} onClick={() => trackAction('open_tutorials')}>
                      <BookOpen className="mr-2 h-4 w-4 text-cyan-300" />
                      {t.openTutorials}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={dismissCoach} className="text-red-300 focus:text-red-200">
                    <EyeOff className="mr-2 h-4 w-4" />
                    {t.hideGuide}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Progress value={progress} className="mt-3 h-1.5 bg-neutral-800" />
          </div>

          <div className="min-h-0 overflow-y-auto p-4">
            <div className="rounded-lg border border-cyan-400/20 bg-cyan-400/10 p-3">
              <div className="flex gap-3">
                <div
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border',
                    isFinishedState
                      ? 'border-emerald-400/30 bg-emerald-400/15 text-emerald-300'
                      : 'border-cyan-400/30 bg-cyan-400/15 text-cyan-300'
                  )}
                >
                  <PanelIcon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-white">
                    {isFinishedState ? t.liveTitle : activeCopy.title}
                  </h2>
                  <p className="mt-1 text-sm leading-5 text-neutral-300">
                    {isFinishedState ? t.finishedBody : activeCopy.body}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {isFinishedState && firstLiveListing?.result.listing_url ? (
                  <Button asChild className="h-9 rounded-full bg-cyan-500 px-3 text-sm font-semibold text-black hover:bg-cyan-400">
                    <a
                      href={firstLiveListing.result.listing_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackAction('open_live_listing')}
                    >
                      {t.liveListingCta}
                      <ExternalLink className="ml-1 h-3.5 w-3.5" />
                    </a>
                  </Button>
                ) : (
                  <Button asChild className="h-9 rounded-full bg-cyan-500 px-3 text-sm font-semibold text-black hover:bg-cyan-400">
                    <Link to={primaryAction.href} onClick={handlePrimaryActionClick}>
                      {primaryAction.label}
                    </Link>
                  </Button>
                )}
                {isFinishedState && (
                  <Button asChild variant="outline" className="h-9 rounded-full border-neutral-700 bg-neutral-900 px-3 text-sm text-neutral-100 hover:bg-neutral-800">
                    <Link to={primaryAction.href} onClick={() => trackAction(primaryAction.key)}>
                      {t.statsCta}
                    </Link>
                  </Button>
                )}
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {steps.map(({ key, title, body, complete, Icon }) => {
                const StepStatusIcon = complete ? CheckCircle2 : Circle;
                const active = !complete && key === steps.find((step) => !step.complete)?.key;
                return (
                  <div key={key} className="flex gap-3">
                    <div className="mt-0.5">
                      <StepStatusIcon
                        className={cn(
                          'h-5 w-5',
                          complete
                            ? 'text-emerald-300'
                            : active
                              ? 'text-cyan-300'
                              : 'text-neutral-600'
                        )}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Icon className={cn('h-3.5 w-3.5', complete ? 'text-emerald-300' : 'text-neutral-500')} />
                        <p className="text-sm font-medium text-white">{title}</p>
                      </div>
                      <p className="mt-0.5 text-xs leading-5 text-neutral-400">{body}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button
          type="button"
          className={cn(
            'h-12 rounded-full border px-3 pr-4 shadow-xl shadow-black/30 backdrop-blur-xl',
            isSnoozed
              ? 'border-neutral-700 bg-neutral-900/95 text-neutral-200 hover:bg-neutral-800'
              : isFinishedState
                ? 'border-emerald-400/30 bg-emerald-500/15 text-emerald-100 hover:bg-emerald-500/20'
                : 'border-cyan-400/30 bg-neutral-950/95 text-white hover:bg-neutral-900'
          )}
          onClick={toggleCoach}
        >
          {isLoading ? (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-900">
              <Loader2 className="h-4 w-4 animate-spin text-cyan-300" />
            </span>
          ) : (
            <LauncherIcon complete={isFinishedState} />
          )}
          <span className="text-sm font-semibold">
            {isLoading ? t.loading : `${launcherLabel} ${completedSteps}/${steps.length}`}
          </span>
        </Button>

      </div>
    </motion.div>
  );
}
