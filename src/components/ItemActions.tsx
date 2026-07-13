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
import { Edit, Copy, Trash2, MoreVertical, Loader2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getLocalizedPathForCurrentLanguage, getTranslations } from '@/components/language-utils';
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
  etsy: { name: 'Etsy' },
};

const SUPPORTED_PLATFORMS: Platform[] = ['facebook', 'olx', 'vinted', 'ebay', 'allegro', 'etsy'];

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
  
  const isDraft = item.status === 'draft';
  
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
  
  // Get published marketplaces whose live listing needs saved FlipIt changes published.
  const syncablePlatforms: Platform[] = ['olx', 'ebay', 'allegro', 'etsy'];
  const syncStatus = item.platform_sync_status || {};
  const dirtyPlatforms = syncablePlatforms.filter(platform => {
    const status = syncStatus[platform];
    return publishedPlatforms.has(platform) && status?.dirty;
  });
  const showUpdateAllChanged = dirtyPlatforms.length > 1;
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

  const getMarketplaceUpdateLabel = (platform: Platform) =>
    (syncStatus[platform]?.dirty
      ? t.actions.updateMarketplaceListing
      : t.actions.resendMarketplaceListing
    ).replace('{platform}', PLATFORM_CONFIG[platform].name);

  const updateAllChangedLabel = t.actions.updateChangedMarketplaces.replace(
    '{count}',
    dirtyPlatforms.length.toString()
  );

  const navigateToListingEditor = () => {
    navigate(
      getLocalizedPathForCurrentLanguage(buildListingEditorUrl({
        mode: canPublishToMorePlatforms ? 'republish' : 'edit',
        itemId: item.uuid,
      }))
    );
  };
  
  // Push saved FlipIt changes to one live marketplace listing.
  const handleSyncPlatform = async (platform: Platform) => {
    setIsSyncing(true);
    setSyncingPlatform(platform);
    try {
      const response = await syncPlatformListings(item.uuid, [platform]);
      const result = response.results?.[platform];
      
      if (result?.status === 'success') {
        toast({
          title: t.toasts.updateMarketplaceSuccess.replace('{platform}', PLATFORM_CONFIG[platform].name),
          description: t.toasts.updateMarketplaceSuccessDescription,
        });
        onRefresh?.();
      } else {
        const errorMsg = result?.message || result?.error || t.toasts.unknownError;
        toast({
          title: t.toasts.updateMarketplaceError.replace('{platform}', PLATFORM_CONFIG[platform].name),
          description: errorMsg,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: t.toasts.updateMarketplaceError.replace('{platform}', PLATFORM_CONFIG[platform].name),
        description: error instanceof Error ? error.message : t.toasts.unknownError,
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
      setSyncingPlatform(null);
    }
  };
  
  // Push saved FlipIt changes to every dirty marketplace listing for this item.
  const handleSyncAll = async () => {
    if (dirtyPlatforms.length === 0) {
      toast({
        title: t.toasts.allMarketplacesUpToDate,
        description: t.toasts.allMarketplacesUpToDateDescription,
      });
      return;
    }
    
    setIsSyncing(true);
    setSyncingPlatform('all');
    try {
      const response = await syncPlatformListings(item.uuid); // No platforms = publish changes to all dirty marketplaces.
      
      const successCount = Object.values(response.results || {}).filter(r => r.status === 'success').length;
      const errorCount = Object.values(response.results || {}).filter(r => r.status === 'error').length;
      
      if (errorCount === 0) {
        toast({
          title: t.toasts.updateMarketplacesSuccess
            .replace('{count}', successCount.toString())
            .replace('{plural}', successCount === 1 ? '' : 's'),
          description: t.toasts.updateMarketplacesSuccessDescription,
        });
      } else if (successCount > 0) {
        toast({
          title: t.toasts.updateMarketplacesPartial,
          description: t.toasts.updateMarketplacesPartialDescription
            .replace('{successCount}', successCount.toString())
            .replace('{errorCount}', errorCount.toString()),
          variant: 'destructive',
        });
      } else {
        toast({
          title: t.toasts.updateMarketplacesError,
          description: response.detail || t.toasts.updateMarketplacesError,
          variant: 'destructive',
        });
      }
      onRefresh?.();
    } catch (error) {
      toast({
        title: t.toasts.updateMarketplacesError,
        description: error instanceof Error ? error.message : t.toasts.unknownError,
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
        title: t.toasts.duplicateSuccess,
        description: t.toasts.duplicateDescription(newItem.title),
      });
      // Navigate to the duplicated item
      navigate(getLocalizedPathForCurrentLanguage(`/user/items/${newItem.uuid}`));
    } catch (error) {
      toast({
        title: t.toasts.duplicateError,
        description: error instanceof Error ? error.message : t.toasts.unknownError,
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
        title: t.toasts.deleteSuccess,
      });
      navigate(getLocalizedPathForCurrentLanguage('/user/items'));
    } catch (error) {
      toast({
        title: t.toasts.deleteError,
        description: error instanceof Error ? error.message : t.toasts.unknownError,
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
          ? t.toasts.removeMarketplacesPartial
          : t.toasts.removeMarketplacesSuccess,
        description: failedPlatforms.length > 0
          ? failedPlatforms.map(platform => PLATFORM_CONFIG[platform].name).join(', ')
          : removableMarketplaceNames,
        variant: failedPlatforms.length > 0 ? 'destructive' : 'default',
      });

      onRefresh?.();
    } catch (error) {
      toast({
        title: t.toasts.removeMarketplacesError,
        description: error instanceof Error ? error.message : t.toasts.unknownError,
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
            <GhostIconButton sizeVariant="lg" aria-label={t.actions.actionsMenu}>
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
                {showUpdateAllChanged && (
                  <DropdownMenuItem
                    onClick={handleSyncAll}
                    disabled={isSyncing}
                    className="cursor-pointer text-white"
                  >
                    {isSyncing && syncingPlatform === 'all' ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    {updateAllChangedLabel}
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
                        <Upload className="mr-2 h-4 w-4" />
                      )}
                      {getMarketplaceUpdateLabel(platform)}
                      {isDirty && (
                        <Badge className="ml-2 bg-amber-500/20 text-amber-400 border-amber-500/50 text-xs">
                          {t.actions.changed}
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
        
        {/* Bulk update button - only useful when more than one marketplace changed. */}
        {!isDraft && showUpdateAllChanged && (
          <SecondaryAction
            size="lg"
            onClick={handleSyncAll}
            disabled={isSyncing}
            className="flex items-center gap-2"
          >
            {isSyncing && syncingPlatform === 'all' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {updateAllChangedLabel}
          </SecondaryAction>
        )}
        
        {/* Secondary actions in dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <GhostIconButton sizeVariant="lg" aria-label={t.actions.actionsMenu}>
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
            
            {/* Publish saved FlipIt changes to live marketplace listings. */}
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
                        <Upload className="mr-2 h-4 w-4" />
                      )}
                      {getMarketplaceUpdateLabel(platform)}
                      {isDirty && (
                        <Badge className="ml-2 bg-amber-500/20 text-amber-400 border-amber-500/50 text-xs">
                          {t.actions.changed}
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
