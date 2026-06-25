/**
 * Sync Listings Button Component
 * 
 * A button with platform selector dropdown that allows users to sync their
 * marketplace listings from external platforms (OLX, Vinted, etc.) into FlipIt.
 * 
 * Features:
 * - Platform dropdown selector
 * - Loading state during sync
 * - Toast notifications for success/error
 * - Tooltips explaining the sync functionality
 */

import { useState } from 'react';
import { RefreshCw, ChevronDown, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { syncOlxListings, type OlxSyncResponse } from '@/lib/api/olx';
import { syncVintedListings, type VintedSyncResponse } from '@/lib/api/vinted';
import { syncEbayListings, type EbaySyncResponse } from '@/lib/api/ebay';
import {
  fetchPlatformHealth,
  type PlatformHealthInfo,
  type PlatformHealthResponse,
} from '@/lib/api/platform-health';
import { getTranslations } from '@/components/language-utils';

// Supported platforms for sync
type SyncPlatform = 'olx' | 'vinted' | 'ebay';
interface SyncTarget {
  platform: SyncPlatform;
  countryCode?: string;
}

interface PlatformConfig {
  id: SyncPlatform;
  name: string;
  enabled: boolean;
  comingSoon?: boolean;
}

const PLATFORMS: PlatformConfig[] = [
  { id: 'olx', name: 'OLX', enabled: true },
  { id: 'vinted', name: 'Vinted', enabled: true },
  { id: 'ebay', name: 'eBay', enabled: true },
];

// Translations for the component
const translations = {
  en: {
    syncListings: 'Sync Listings',
    syncing: 'Syncing...',
    syncAllConnected: 'All connected accounts',
    olxCountries: 'OLX country accounts',
    selectPlatform: 'Select platform',
    comingSoon: 'Coming Soon',
    unavailable: 'Unavailable',
    tooltipTitle: 'Import listings',
    tooltipDescription: 'Imports your current listings from the selected account or platform and adds any missing ones to FlipIt.',
    syncSuccess: 'Sync completed!',
    syncSuccessDescription: (inserted: number, updated: number) => 
      `Imported ${inserted} new listings, updated ${updated} existing ones.`,
    syncSuccessNoNew: 'All your listings are already synced.',
    syncPartial: 'Sync partially completed',
    syncAllSuccess: 'All connected accounts synced',
    syncAllSummary: (succeeded: number, failed: number, skipped: number) =>
      `${succeeded} succeeded, ${failed} failed, ${skipped} skipped.`,
    syncError: 'Sync failed',
    connectFirst: 'Please connect your account first',
    platformNotConnected: (platform: string) => 
      `Please connect your ${platform} account in Settings first.`,
    platformExpired: (platform: string) =>
      `${platform} connection is expired or invalid. Reconnect it before syncing.`,
    noConnectedPlatforms: 'No connected accounts available for sync.',
  },
  pl: {
    syncListings: 'Synchronizuj ogłoszenia',
    syncing: 'Synchronizuję...',
    syncAllConnected: 'Wszystkie połączone konta',
    olxCountries: 'Konta OLX według kraju',
    selectPlatform: 'Wybierz platformę',
    comingSoon: 'Wkrótce',
    unavailable: 'Niedostępne',
    tooltipTitle: 'Importuj ogłoszenia',
    tooltipDescription: 'Importuje Twoje aktualne ogłoszenia z wybranego konta lub platformy i dodaje brakujące do FlipIt.',
    syncSuccess: 'Synchronizacja zakończona!',
    syncSuccessDescription: (inserted: number, updated: number) => 
      `Zaimportowano ${inserted} nowych ogłoszeń, zaktualizowano ${updated} istniejących.`,
    syncSuccessNoNew: 'Wszystkie ogłoszenia są już zsynchronizowane.',
    syncPartial: 'Synchronizacja częściowo zakończona',
    syncAllSuccess: 'Wszystkie połączone konta zsynchronizowane',
    syncAllSummary: (succeeded: number, failed: number, skipped: number) =>
      `${succeeded} zakończone, ${failed} nieudane, ${skipped} pominięte.`,
    syncError: 'Błąd synchronizacji',
    connectFirst: 'Najpierw połącz swoje konto',
    platformNotConnected: (platform: string) => 
      `Najpierw połącz swoje konto ${platform} w ustawieniach.`,
    platformExpired: (platform: string) =>
      `Połączenie ${platform} wygasło lub jest nieprawidłowe. Połącz je ponownie przed synchronizacją.`,
    noConnectedPlatforms: 'Brak połączonych kont dostępnych do synchronizacji.',
  },
};

interface SyncListingsButtonProps {
  onSyncComplete?: () => void;  // Callback to refresh items list after sync
  className?: string;
}

export function SyncListingsButton({ onSyncComplete, className }: SyncListingsButtonProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<SyncPlatform | null>(null);
  const [platformHealth, setPlatformHealth] = useState<PlatformHealthResponse | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const { toast } = useToast();
  const t = getTranslations(translations);

  const refreshPlatformHealth = async (): Promise<PlatformHealthResponse | null> => {
    setHealthLoading(true);
    try {
      const health = await fetchPlatformHealth();
      setPlatformHealth(health);
      return health;
    } catch (error) {
      console.error('Failed to fetch platform health:', error);
      setPlatformHealth(null);
      return null;
    } finally {
      setHealthLoading(false);
    }
  };

  const getPlatformHealth = async (): Promise<PlatformHealthResponse | null> =>
    platformHealth || refreshPlatformHealth();

  const platformInfo = (platform: SyncPlatform): PlatformHealthInfo | undefined =>
    platformHealth?.platforms?.[platform];

  const isPlatformConnected = (platform: SyncPlatform, health = platformHealth): boolean => {
    const info = health?.platforms?.[platform];
    return !!info?.stored && info.status !== 'expired' && info.status !== 'invalid';
  };

  const platformUnavailableReason = (platform: SyncPlatform): string | null => {
    const info = platformInfo(platform);
    if (!info) {
      return null;
    }
    if (!info.stored) {
      return t.platformNotConnected(platform.toUpperCase());
    }
    if (info.status === 'expired' || info.status === 'invalid') {
      return t.platformExpired(platform.toUpperCase());
    }
    return null;
  };

  const olxSyncAccounts = (platformHealth?.platforms?.olx?.accounts || []).filter(
    (account) =>
      !!account.country_code &&
      (account.connected || account.stored) &&
      account.status !== 'expired' &&
      account.status !== 'invalid'
  );

  const syncPlatform = async (
    platform: SyncPlatform,
    countryCode?: string
  ): Promise<OlxSyncResponse | VintedSyncResponse | EbaySyncResponse> => {
    switch (platform) {
      case 'olx':
        return syncOlxListings(countryCode);
      case 'vinted':
        return syncVintedListings();
      case 'ebay':
        return syncEbayListings();
      default:
        throw new Error(`Unknown platform: ${platform}`);
    }
  };

  const handleSync = async (platform: SyncPlatform, countryCode?: string) => {
    setSelectedPlatform(platform);
    setIsSyncing(true);

    try {
      const health = await getPlatformHealth();
      if (health && !isPlatformConnected(platform, health)) {
        toast({
          title: t.connectFirst,
          description: platformUnavailableReason(platform) || t.platformNotConnected(platform.toUpperCase()),
          variant: 'destructive',
        });
        return;
      }

      const response = await syncPlatform(platform, countryCode);

      // Show success toast with summary
      if (response.success && response.summary) {
        const { inserted, updated } = response.summary;
        
        if (inserted === 0 && updated === 0) {
          toast({
            title: t.syncSuccess,
            description: t.syncSuccessNoNew,
          });
        } else {
          toast({
            title: t.syncSuccess,
            description: t.syncSuccessDescription(inserted, updated),
          });
        }

        // Trigger callback to refresh items list
        if (onSyncComplete) {
          onSyncComplete();
        }
      }
    } catch (error) {
      console.error('Sync error:', error);
      
      const message = error instanceof Error ? error.message : 'Unknown error';
      
      // Check if it's a "not connected" error
      if (message.toLowerCase().includes('connect')) {
        toast({
          title: t.connectFirst,
          description: t.platformNotConnected(platform.toUpperCase()),
          variant: 'destructive',
        });
      } else {
        toast({
          title: t.syncError,
          description: message,
          variant: 'destructive',
        });
      }
    } finally {
      setIsSyncing(false);
      setSelectedPlatform(null);
    }
  };

  const handleSyncAllConnected = async () => {
    setSelectedPlatform(null);
    setIsSyncing(true);

    try {
      const health = await getPlatformHealth();
      const connectedTargets = PLATFORMS.flatMap<SyncTarget>((platform) => {
        if (!platform.enabled || !isPlatformConnected(platform.id, health)) {
          return [];
        }
        if (platform.id !== 'olx') {
          return [{ platform: platform.id }];
        }
        const accounts = (health?.platforms?.olx?.accounts || []).filter(
          (account) =>
            !!account.country_code &&
            (account.connected || account.stored) &&
            account.status !== 'expired' &&
            account.status !== 'invalid'
        );
        return accounts.length
          ? accounts.map((account) => ({ platform: 'olx', countryCode: account.country_code }))
          : [{ platform: 'olx' }];
      });
      const skippedCount = PLATFORMS.length - new Set(connectedTargets.map((target) => target.platform)).size;

      if (connectedTargets.length === 0) {
        toast({
          title: t.connectFirst,
          description: t.noConnectedPlatforms,
          variant: 'destructive',
        });
        return;
      }

      const results = await Promise.allSettled(
        connectedTargets.map(async (target) => ({
          platform: target.platform,
          countryCode: target.countryCode,
          response: await syncPlatform(target.platform, target.countryCode),
        }))
      );
      const succeeded = results.filter((result) => result.status === 'fulfilled').length;
      const failed = results.length - succeeded;

      toast({
        title: failed > 0 ? t.syncPartial : t.syncAllSuccess,
        description: t.syncAllSummary(succeeded, failed, skippedCount),
        variant: failed > 0 ? 'destructive' : undefined,
      });

      if (succeeded > 0 && onSyncComplete) {
        onSyncComplete();
      }
    } catch (error) {
      toast({
        title: t.syncError,
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
      setSelectedPlatform(null);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-flex items-center">
              <DropdownMenu onOpenChange={(open) => {
                if (open && !platformHealth && !healthLoading) {
                  void refreshPlatformHealth();
                }
              }}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isSyncing}
                    className="bg-neutral-800/50 border-neutral-700 hover:bg-neutral-700/50 text-neutral-200 hover:text-white"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? t.syncing : t.syncListings}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="bg-neutral-800 border-neutral-700"
                >
                  <DropdownMenuItem
                    onClick={handleSyncAllConnected}
                    disabled={isSyncing || healthLoading}
                    className="cursor-pointer text-neutral-200 hover:text-white hover:bg-neutral-700"
                  >
                    <span className="flex items-center gap-2">
                      {t.syncAllConnected}
                    </span>
                  </DropdownMenuItem>
                  {olxSyncAccounts.length > 1 && (
                    <>
                      <DropdownMenuSeparator className="bg-neutral-700" />
                      <DropdownMenuLabel className="text-xs font-medium uppercase tracking-normal text-neutral-500">
                        {t.olxCountries}
                      </DropdownMenuLabel>
                    </>
                  )}
                  {PLATFORMS.flatMap((platform) => {
                    if (platform.id === 'olx' && olxSyncAccounts.length > 1) {
                      return olxSyncAccounts.map((account) => (
                        <DropdownMenuItem
                          key={`olx-${account.country_code}`}
                          onClick={() => handleSync('olx', account.country_code)}
                          disabled={isSyncing || healthLoading}
                          className="cursor-pointer text-neutral-200 hover:text-white hover:bg-neutral-700"
                        >
                          <span className="flex items-center gap-2">
                            OLX {account.country_name || account.country_code}
                          </span>
                        </DropdownMenuItem>
                      ));
                    }

                    return [
                      <DropdownMenuItem
                        key={platform.id}
                        onClick={() => platform.enabled && handleSync(platform.id)}
                        disabled={!platform.enabled || isSyncing || healthLoading || platformUnavailableReason(platform.id) !== null}
                        className={`
                          text-neutral-200 hover:text-white hover:bg-neutral-700
                          ${(!platform.enabled || platformUnavailableReason(platform.id)) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                      >
                        <span className="flex items-center gap-2">
                          {platform.name}
                          {(platform.comingSoon || platformUnavailableReason(platform.id)) && (
                            <span className="text-xs text-neutral-500 bg-neutral-700/50 px-1.5 py-0.5 rounded">
                              {platform.comingSoon ? t.comingSoon : t.unavailable}
                            </span>
                          )}
                        </span>
                      </DropdownMenuItem>,
                    ];
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </TooltipTrigger>
          <TooltipContent 
            side="top" 
            className="bg-neutral-800 border-neutral-700 text-neutral-200 max-w-xs"
          >
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 mt-0.5 text-cyan-400 shrink-0" />
              <div>
                <p className="font-medium text-sm">{t.tooltipTitle}</p>
                <p className="text-xs text-neutral-400 mt-1">{t.tooltipDescription}</p>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
