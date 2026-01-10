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
import { getTranslations } from '@/components/language-utils';

// Supported platforms for sync
type SyncPlatform = 'olx' | 'vinted';

interface PlatformConfig {
  id: SyncPlatform;
  name: string;
  enabled: boolean;
  comingSoon?: boolean;
}

const PLATFORMS: PlatformConfig[] = [
  { id: 'olx', name: 'OLX', enabled: true },
  { id: 'vinted', name: 'Vinted', enabled: false, comingSoon: true },
];

// Translations for the component
const translations = {
  en: {
    syncListings: 'Sync Listings',
    syncing: 'Syncing...',
    selectPlatform: 'Select platform',
    comingSoon: 'Coming Soon',
    tooltipTitle: 'Import listings',
    tooltipDescription: 'Imports your current listings from the selected platform and adds any missing ones to FlipIt.',
    syncSuccess: 'Sync completed!',
    syncSuccessDescription: (inserted: number, updated: number) => 
      `Imported ${inserted} new listings, updated ${updated} existing ones.`,
    syncSuccessNoNew: 'All your listings are already synced.',
    syncError: 'Sync failed',
    connectFirst: 'Please connect your account first',
    platformNotConnected: (platform: string) => 
      `Please connect your ${platform} account in Settings first.`,
  },
  pl: {
    syncListings: 'Synchronizuj ogłoszenia',
    syncing: 'Synchronizuję...',
    selectPlatform: 'Wybierz platformę',
    comingSoon: 'Wkrótce',
    tooltipTitle: 'Importuj ogłoszenia',
    tooltipDescription: 'Importuje Twoje aktualne ogłoszenia z wybranej platformy i dodaje brakujące do FlipIt.',
    syncSuccess: 'Synchronizacja zakończona!',
    syncSuccessDescription: (inserted: number, updated: number) => 
      `Zaimportowano ${inserted} nowych ogłoszeń, zaktualizowano ${updated} istniejących.`,
    syncSuccessNoNew: 'Wszystkie ogłoszenia są już zsynchronizowane.',
    syncError: 'Błąd synchronizacji',
    connectFirst: 'Najpierw połącz swoje konto',
    platformNotConnected: (platform: string) => 
      `Najpierw połącz swoje konto ${platform} w ustawieniach.`,
  },
};

interface SyncListingsButtonProps {
  onSyncComplete?: () => void;  // Callback to refresh items list after sync
  className?: string;
}

export function SyncListingsButton({ onSyncComplete, className }: SyncListingsButtonProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<SyncPlatform | null>(null);
  const { toast } = useToast();
  const t = getTranslations(translations);

  const handleSync = async (platform: SyncPlatform) => {
    setSelectedPlatform(platform);
    setIsSyncing(true);

    try {
      let response: OlxSyncResponse;

      // Call appropriate sync function based on platform
      switch (platform) {
        case 'olx':
          response = await syncOlxListings();
          break;
        case 'vinted':
          // Future: implement Vinted sync
          throw new Error('Vinted sync not yet implemented');
        default:
          throw new Error(`Unknown platform: ${platform}`);
      }

      // Show success toast with summary
      if (response.success && response.summary) {
        const { inserted, updated, total_fetched } = response.summary;
        
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

  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-flex items-center">
              <DropdownMenu>
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
                  {PLATFORMS.map((platform) => (
                    <DropdownMenuItem
                      key={platform.id}
                      onClick={() => platform.enabled && handleSync(platform.id)}
                      disabled={!platform.enabled || isSyncing}
                      className={`
                        text-neutral-200 hover:text-white hover:bg-neutral-700
                        ${!platform.enabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      <span className="flex items-center gap-2">
                        {platform.name}
                        {platform.comingSoon && (
                          <span className="text-xs text-neutral-500 bg-neutral-700/50 px-1.5 py-0.5 rounded">
                            {t.comingSoon}
                          </span>
                        )}
                      </span>
                    </DropdownMenuItem>
                  ))}
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
