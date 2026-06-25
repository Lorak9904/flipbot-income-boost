import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AddItemButton, SecondaryAction, DeleteButton, GhostIconButton } from '@/components/ui/button-presets';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Edit, Copy, Trash2, MoreVertical, Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getTranslations } from '@/components/language-utils';
import { itemDetailTranslations } from '@/utils/translations/item-detail-translations';
import { UserItem, Platform, PlatformPublishResult } from '@/types/item';
import { duplicateItem, deleteItem, removeListingFromMarketplaces, syncPlatformListings } from '@/lib/api/items';
import { Badge } from '@/components/ui/badge';
import { buildListingEditorUrl } from '@/lib/listing-editor/navigation';

interface ItemActionsProps {
  item: UserItem;
  onRefresh?: () => void;
  connectedPlatforms?: Record<string, boolean>;
  variant?: 'default' | 'compact';
}

const PLATFORM_CONFIG: Record<Platform, { name: string }> = {
  facebook: { name: 'Facebook Marketplace' },
  olx: { name: 'OLX' },
  vinted: { name: 'Vinted' },
  ebay: { name: 'eBay' },
  allegro: { name: 'Allegro' },
};

const SUPPORTED_PLATFORMS: Platform[] = ['facebook', 'olx', 'vinted', 'ebay', 'allegro'];

export function ItemActions({ 
  item, 
  onRefresh, 
  connectedPlatforms = {}, 
  variant = 'default' 
}: ItemActionsProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const t = getTranslations(itemDetailTranslations);
  
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncingPlatform, setSyncingPlatform] = useState<Platform | 'all' | null>(null);
  const [isRemovingFromMarketplaces, setIsRemovingFromMarketplaces] = useState(false);
  const [showRemoveMarketplacesDialog, setShowRemoveMarketplacesDialog] = useState(false);
  
  const isDraft = item.stage === 'draft';
  
  // Get platforms already published to
  const publishedPlatforms = new Set(
    (item.publish_results || [])
      .filter((r: PlatformPublishResult) => r.status === 'success')
      .map((r: PlatformPublishResult) => r.platform)
  );
  
  // Get available platforms for publishing
  const availablePlatforms = SUPPORTED_PLATFORMS.filter(
    platform => connectedPlatforms[platform] && !publishedPlatforms.has(platform)
  );
  const canPublishToMorePlatforms = availablePlatforms.length > 0;
  const manageActionLabel = canPublishToMorePlatforms
    ? t.actions.manageListing
    : t.actions.editListing;
  
  // Get dirty platforms that need syncing
  const syncablePlatforms: Platform[] = ['olx', 'ebay', 'allegro'];
  const syncStatus = item.platform_sync_status || {};
  const dirtyPlatforms = syncablePlatforms.filter(platform => {
    const status = syncStatus[platform];
    return publishedPlatforms.has(platform) && status?.dirty;
  });
  const hasDirtyPlatforms = dirtyPlatforms.length > 0;
  const removableMarketplacePlatforms = syncablePlatforms.filter(platform => publishedPlatforms.has(platform));
  const unsupportedPublishedPlatforms = SUPPORTED_PLATFORMS.filter(
    platform => publishedPlatforms.has(platform) && !syncablePlatforms.includes(platform)
  );
  const removableMarketplaceNames = removableMarketplacePlatforms
    .map(platform => PLATFORM_CONFIG[platform].name)
    .join(', ');
  const unsupportedMarketplaceNames = unsupportedPublishedPlatforms
    .map(platform => PLATFORM_CONFIG[platform].name)
    .join(', ');
  const localRemoveTitle = isDraft
    ? t.confirmations.removeUnpublishedTitle
    : t.confirmations.removeFromFlipItTitle;
  const localRemoveDescription = isDraft
    ? t.confirmations.removeUnpublishedDescription
    : t.confirmations.removeFromFlipItDescription;
  const localRemoveConfirm = isDraft
    ? t.confirmations.removeUnpublishedConfirm
    : t.confirmations.removeFromFlipItConfirm;

  const navigateToListingEditor = () => {
    navigate(
      buildListingEditorUrl({
        mode: canPublishToMorePlatforms ? 'republish' : 'edit',
        itemId: item.uuid,
      })
    );
  };
  
  // Handler for syncing a single platform
  const handleSyncPlatform = async (platform: Platform) => {
    setIsSyncing(true);
    setSyncingPlatform(platform);
    try {
      const response = await syncPlatformListings(item.uuid, [platform]);
      const result = response.results?.[platform];
      
      if (result?.status === 'success') {
        toast({
          title: `✅ Synced to ${PLATFORM_CONFIG[platform].name}`,
          description: result.message,
        });
        onRefresh?.();
      } else {
        const errorMsg = result?.message || result?.error || 'Unknown error';
        toast({
          title: `❌ Failed to sync to ${PLATFORM_CONFIG[platform].name}`,
          description: errorMsg,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: `❌ Failed to sync to ${PLATFORM_CONFIG[platform].name}`,
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
      setSyncingPlatform(null);
    }
  };
  
  // Handler for syncing all dirty platforms
  const handleSyncAll = async () => {
    if (dirtyPlatforms.length === 0) {
      toast({
        title: 'All platforms are up to date',
        description: 'No changes need to be synced.',
      });
      return;
    }
    
    setIsSyncing(true);
    setSyncingPlatform('all');
    try {
      const response = await syncPlatformListings(item.uuid); // No platforms = sync all dirty
      
      const successCount = Object.values(response.results || {}).filter(r => r.status === 'success').length;
      const errorCount = Object.values(response.results || {}).filter(r => r.status === 'error').length;
      
      if (errorCount === 0) {
        toast({
          title: `✅ Synced ${successCount} platform${successCount > 1 ? 's' : ''}`,
          description: 'All changes have been synced.',
        });
      } else if (successCount > 0) {
        toast({
          title: `⚠️ Partially synced`,
          description: `${successCount} succeeded, ${errorCount} failed`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: `❌ Sync failed`,
          description: response.detail || 'Failed to sync to all platforms',
          variant: 'destructive',
        });
      }
      onRefresh?.();
    } catch (error) {
      toast({
        title: '❌ Sync failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
      setSyncingPlatform(null);
    }
  };
  
  const handleEdit = () => {
    navigateToListingEditor();
  };
  
  const handleDuplicate = async () => {
    setIsDuplicating(true);
    try {
      const newItem = await duplicateItem(item.uuid);
      toast({
        title: '✅ ' + t.toasts.duplicateSuccess,
        description: `New draft created: ${newItem.title}`,
      });
      // Navigate to the duplicated item
      navigate(`/user/items/${newItem.uuid}`);
    } catch (error) {
      toast({
        title: '❌ ' + t.toasts.duplicateError,
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsDuplicating(false);
    }
  };
  
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteItem(item.uuid);
      toast({
        title: '✅ ' + t.toasts.deleteSuccess,
      });
      navigate('/user/items');
    } catch (error) {
      toast({
        title: '❌ ' + t.toasts.deleteError,
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleRemoveFromMarketplaces = async () => {
    if (removableMarketplacePlatforms.length === 0) {
      return;
    }

    setIsRemovingFromMarketplaces(true);
    try {
      const response = await removeListingFromMarketplaces(item.uuid, removableMarketplacePlatforms);
      const failedPlatforms = removableMarketplacePlatforms.filter(
        platform => response.results?.[platform]?.status === 'error'
      );

      toast({
        title: failedPlatforms.length > 0
          ? '⚠️ ' + t.toasts.removeMarketplacesPartial
          : '✅ ' + t.toasts.removeMarketplacesSuccess,
        description: failedPlatforms.length > 0
          ? failedPlatforms.map(platform => PLATFORM_CONFIG[platform].name).join(', ')
          : removableMarketplaceNames,
        variant: failedPlatforms.length > 0 ? 'destructive' : 'default',
      });

      onRefresh?.();
    } catch (error) {
      toast({
        title: '❌ ' + t.toasts.removeMarketplacesError,
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsRemovingFromMarketplaces(false);
      setShowRemoveMarketplacesDialog(false);
    }
  };
  
  if (variant === 'compact') {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <GhostIconButton sizeVariant="lg">
              <MoreVertical className="h-4 w-4" />
            </GhostIconButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-neutral-900 border-neutral-700">
            <DropdownMenuItem onClick={handleEdit} className="cursor-pointer text-white">
              <Edit className="mr-2 h-4 w-4" />
              {manageActionLabel}
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={handleDuplicate} 
              disabled={isDuplicating}
              className="cursor-pointer text-white"
            >
              {isDuplicating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Copy className="mr-2 h-4 w-4" />
              )}
              {t.actions.duplicate}
            </DropdownMenuItem>
            
            {!isDraft && syncablePlatforms.some((platform) => publishedPlatforms.has(platform)) && (
              <>
                <DropdownMenuSeparator className="bg-neutral-700" />
                {hasDirtyPlatforms && (
                  <DropdownMenuItem
                    onClick={handleSyncAll}
                    disabled={isSyncing}
                    className="cursor-pointer text-white"
                  >
                    {isSyncing && syncingPlatform === 'all' ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    Sync All ({dirtyPlatforms.length})
                  </DropdownMenuItem>
                )}
                {syncablePlatforms.map((platform) => {
                  if (!publishedPlatforms.has(platform)) return null;
                  const isDirty = syncStatus[platform]?.dirty;
                  const isSyncingThis = isSyncing && syncingPlatform === platform;
                  return (
                    <DropdownMenuItem
                      key={`compact-sync-${platform}`}
                      onClick={() => handleSyncPlatform(platform)}
                      disabled={isSyncing}
                      className="cursor-pointer text-white"
                    >
                      {isSyncingThis ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="mr-2 h-4 w-4" />
                      )}
                      Sync {PLATFORM_CONFIG[platform].name}
                      {isDirty && (
                        <Badge className="ml-2 bg-amber-500/20 text-amber-400 border-amber-500/50 text-xs">
                          Changed
                        </Badge>
                      )}
                    </DropdownMenuItem>
                  );
                })}
              </>
            )}
            
            <DropdownMenuSeparator className="bg-neutral-700" />

            {!isDraft && removableMarketplacePlatforms.length > 0 && (
              <>
                <DropdownMenuItem
                  onClick={() => setShowRemoveMarketplacesDialog(true)}
                  disabled={isRemovingFromMarketplaces}
                  className="cursor-pointer text-red-400 focus:text-red-400"
                >
                  {isRemovingFromMarketplaces ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  {t.actions.removeFromMarketplaces}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-neutral-700" />
              </>
            )}
            
            <DropdownMenuItem 
              onClick={() => setShowDeleteDialog(true)}
              className="cursor-pointer text-red-400 focus:text-red-400"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {isDraft ? t.actions.deleteDraft : t.actions.delete}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="bg-neutral-900 border-neutral-700">
            <DialogHeader>
              <DialogTitle className="text-white">{localRemoveTitle}</DialogTitle>
              <DialogDescription className="text-neutral-400">
                {localRemoveDescription}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <SecondaryAction onClick={() => setShowDeleteDialog(false)} className="px-4 py-2">
                {t.confirmations.deleteCancel}
              </SecondaryAction>
              <DeleteButton 
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {localRemoveConfirm}
              </DeleteButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showRemoveMarketplacesDialog} onOpenChange={setShowRemoveMarketplacesDialog}>
          <DialogContent className="bg-neutral-900 border-neutral-700">
            <DialogHeader>
              <DialogTitle className="text-white">{t.confirmations.removeMarketplacesTitle}</DialogTitle>
              <DialogDescription className="space-y-2 text-neutral-400">
                <span className="block">
                  {t.confirmations.removeMarketplacesDescription.replace(
                    '{platforms}',
                    removableMarketplaceNames
                  )}
                </span>
                {unsupportedPublishedPlatforms.length > 0 && (
                  <span className="block text-amber-400">
                    {t.confirmations.removeMarketplacesUnsupported.replace(
                      '{platforms}',
                      unsupportedMarketplaceNames
                    )}
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <SecondaryAction
                onClick={() => setShowRemoveMarketplacesDialog(false)}
                className="px-4 py-2"
              >
                {t.confirmations.deleteCancel}
              </SecondaryAction>
              <DeleteButton
                onClick={handleRemoveFromMarketplaces}
                disabled={isRemovingFromMarketplaces}
              >
                {isRemovingFromMarketplaces && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t.confirmations.removeMarketplacesConfirm}
              </DeleteButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
      </>
    );
  }
  
  // Default variant - full buttons
  return (
    <>
      <div className="flex flex-wrap gap-2">
        <AddItemButton 
          size="lg"
          onClick={handleEdit}
          className="flex items-center gap-2"
        >
          <Edit className="h-4 w-4" />
          {manageActionLabel}
        </AddItemButton>
        
        {/* Sync All button - only show if there are dirty platforms */}
        {!isDraft && hasDirtyPlatforms && (
          <SecondaryAction
            size="lg"
            onClick={handleSyncAll}
            disabled={isSyncing}
            className="flex items-center gap-2"
          >
            {isSyncing && syncingPlatform === 'all' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Sync All ({dirtyPlatforms.length})
          </SecondaryAction>
        )}
        
        {/* Secondary actions in dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <GhostIconButton sizeVariant="lg">
              <MoreVertical className="h-4 w-4" />
            </GhostIconButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-neutral-900 border-neutral-700">
            <DropdownMenuItem 
              onClick={handleDuplicate} 
              disabled={isDuplicating}
              className="cursor-pointer text-white"
            >
              {isDuplicating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Copy className="mr-2 h-4 w-4" />
              )}
              {t.actions.duplicate}
            </DropdownMenuItem>
            
            {/* Sync options for published platforms */}
            {!isDraft && syncablePlatforms.some(p => publishedPlatforms.has(p)) && (
              <>
                <DropdownMenuSeparator className="bg-neutral-700" />
                {syncablePlatforms.map(platform => {
                  if (!publishedPlatforms.has(platform)) return null;
                  const isDirty = syncStatus[platform]?.dirty;
                  const isSyncingThis = isSyncing && syncingPlatform === platform;
                  return (
                    <DropdownMenuItem
                      key={`sync-${platform}`}
                      onClick={() => handleSyncPlatform(platform)}
                      disabled={isSyncing}
                      className="cursor-pointer text-white"
                    >
                      {isSyncingThis ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="mr-2 h-4 w-4" />
                      )}
                      Sync {PLATFORM_CONFIG[platform].name}
                      {isDirty && (
                        <Badge className="ml-2 bg-amber-500/20 text-amber-400 border-amber-500/50 text-xs">
                          Changed
                        </Badge>
                      )}
                    </DropdownMenuItem>
                  );
                })}
              </>
            )}
            
            <DropdownMenuSeparator className="bg-neutral-700" />

            {!isDraft && removableMarketplacePlatforms.length > 0 && (
              <>
                <DropdownMenuItem
                  onClick={() => setShowRemoveMarketplacesDialog(true)}
                  disabled={isRemovingFromMarketplaces}
                  className="cursor-pointer text-red-400 focus:text-red-400"
                >
                  {isRemovingFromMarketplaces ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  {t.actions.removeFromMarketplaces}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-neutral-700" />
              </>
            )}
            
            <DropdownMenuItem 
              onClick={() => setShowDeleteDialog(true)}
              className="cursor-pointer text-red-400 focus:text-red-400"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {isDraft ? t.actions.deleteDraft : t.actions.delete}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-neutral-900 border-neutral-700">
          <DialogHeader>
            <DialogTitle className="text-white">{localRemoveTitle}</DialogTitle>
            <DialogDescription className="text-neutral-400">
              {localRemoveDescription}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <SecondaryAction onClick={() => setShowDeleteDialog(false)}>
              {t.confirmations.deleteCancel}
            </SecondaryAction>
            <DeleteButton 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {localRemoveConfirm}
            </DeleteButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRemoveMarketplacesDialog} onOpenChange={setShowRemoveMarketplacesDialog}>
        <DialogContent className="bg-neutral-900 border-neutral-700">
          <DialogHeader>
            <DialogTitle className="text-white">{t.confirmations.removeMarketplacesTitle}</DialogTitle>
            <DialogDescription className="space-y-2 text-neutral-400">
              <span className="block">
                {t.confirmations.removeMarketplacesDescription.replace(
                  '{platforms}',
                  removableMarketplaceNames
                )}
              </span>
              {unsupportedPublishedPlatforms.length > 0 && (
                <span className="block text-amber-400">
                  {t.confirmations.removeMarketplacesUnsupported.replace(
                    '{platforms}',
                    unsupportedMarketplaceNames
                  )}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <SecondaryAction onClick={() => setShowRemoveMarketplacesDialog(false)}>
              {t.confirmations.deleteCancel}
            </SecondaryAction>
            <DeleteButton
              onClick={handleRemoveFromMarketplaces}
              disabled={isRemovingFromMarketplaces}
            >
              {isRemovingFromMarketplaces && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t.confirmations.removeMarketplacesConfirm}
            </DeleteButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
    </>
  );
}
