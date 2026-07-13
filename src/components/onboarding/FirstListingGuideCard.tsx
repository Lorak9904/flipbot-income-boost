import { Link, useLocation } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Compass, Loader2, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { getLocalizedPathForCurrentLanguage, getTranslations } from '@/components/language-utils';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { fetchUserProfile, updateUserProfile, type FirstListingCoachState } from '@/lib/api/user';
import { cn } from '@/lib/utils';
import {
  buildActiveFirstListingCoachState,
  dispatchFirstListingCoachCommand,
  type FirstListingCoachCommandSource,
} from './first-listing-coach-controls';

const guideCardTranslations = {
  en: {
    title: 'First steps',
    settingsDescription: 'Open the checklist again or start over.',
    tutorialDescription: 'Keep the checklist open while you follow the tutorial.',
    hiddenStatus: 'Hidden',
    activeStatus: 'Active',
    completeStatus: 'Done',
    continueGuide: 'Continue',
    restartGuide: 'Start over',
    loginToUseGuide: 'Log in',
    openedTitle: 'First steps opened',
    openedDescription: 'The checklist is visible again.',
    errorTitle: 'Could not open first steps',
    errorDescription: 'Try again from Settings.',
  },
  pl: {
    title: 'Pierwsze kroki',
    settingsDescription: 'Otwórz listę kroków ponownie albo zacznij od nowa.',
    tutorialDescription: 'Otwórz listę kroków podczas czytania poradnika.',
    hiddenStatus: 'Ukryte',
    activeStatus: 'Aktywne',
    completeStatus: 'Gotowe',
    continueGuide: 'Kontynuuj',
    restartGuide: 'Zacznij od nowa',
    loginToUseGuide: 'Zaloguj się',
    openedTitle: 'Pierwsze kroki otwarte',
    openedDescription: 'Lista kroków jest znowu widoczna.',
    errorTitle: 'Nie udało się otworzyć',
    errorDescription: 'Spróbuj ponownie w ustawieniach.',
  },
};

interface FirstListingGuideCardProps {
  source: FirstListingCoachCommandSource;
  className?: string;
}

export function FirstListingGuideCard({ source, className }: FirstListingGuideCardProps) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const t = getTranslations(guideCardTranslations);

  const profileQuery = useQuery({
    queryKey: ['user-profile'],
    queryFn: fetchUserProfile,
    enabled: isAuthenticated,
    staleTime: 60 * 1000,
  });

  const openMutation = useMutation({
    mutationFn: (state: FirstListingCoachState) =>
      updateUserProfile({ first_listing_coach_state: state }),
    onSuccess: (profile, state) => {
      const nextState = profile.first_listing_coach_state || state;
      queryClient.setQueryData(['user-profile'], profile);
      dispatchFirstListingCoachCommand({ state: nextState, source });
      toast({
        title: t.openedTitle,
        description: t.openedDescription,
      });
    },
    onError: () => {
      toast({
        title: t.errorTitle,
        description: t.errorDescription,
        variant: 'destructive',
      });
    },
  });

  const status = profileQuery.data?.first_listing_coach_state?.status;
  const statusLabel =
    status === 'dismissed'
      ? t.hiddenStatus
      : status === 'completed'
        ? t.completeStatus
        : t.activeStatus;
  const loginPath = `${getLocalizedPathForCurrentLanguage('/login')}?returnTo=${encodeURIComponent(location.pathname)}`;
  const description = source === 'settings' ? t.settingsDescription : t.tutorialDescription;

  const openGuide = (restart = false) => {
    const state = buildActiveFirstListingCoachState(source, restart ? { restart_at: new Date().toISOString() } : {});
    openMutation.mutate(state);
  };

  return (
    <section
      className={cn(
        'rounded-2xl bg-neutral-900/50 p-6 text-left text-white ring-1 ring-cyan-400/20 backdrop-blur-sm',
        className
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300">
            {source === 'settings' ? <Compass className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-white">{t.title}</h2>
              {isAuthenticated && (
                <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 text-xs text-cyan-200">
                  {profileQuery.isLoading ? '...' : statusLabel}
                </span>
              )}
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-300">{description}</p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:min-w-40">
          {isAuthenticated ? (
            <>
              <Button
                type="button"
                className="rounded-full bg-cyan-500 text-sm font-semibold text-black hover:bg-cyan-400"
                disabled={openMutation.isPending}
                onClick={() => openGuide(false)}
              >
                {openMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Compass className="h-4 w-4" />}
                {t.continueGuide}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-full border-neutral-700 bg-neutral-900 text-sm text-neutral-100 hover:bg-neutral-800"
                disabled={openMutation.isPending}
                onClick={() => openGuide(true)}
              >
                <RotateCcw className="h-4 w-4" />
                {t.restartGuide}
              </Button>
            </>
          ) : (
            <Button asChild className="rounded-full bg-cyan-500 text-sm font-semibold text-black hover:bg-cyan-400">
              <Link to={loginPath}>{t.loginToUseGuide}</Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
