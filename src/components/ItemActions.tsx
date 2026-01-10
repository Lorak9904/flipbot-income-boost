import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
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
import { 
  Edit, 
  Copy, 
  Upload, 
  Trash2, 
  MoreVertical, 
  Loader2, 
  CheckCircle2 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getTranslations } from '@/components/language-utils';
import { itemDetailTranslations } from '@/utils/translations/item-detail-translations';
import { UserItem, Platform, PlatformPublishResult } from '@/types/item';
import { duplicateItem, deleteItem } from '@/lib/api/items';

interface ItemActionsProps {
  item: UserItem;
  onRefresh?: () => void;
  connectedPlatforms?: Record<string, boolean>;
  variant?: 'default' | 'compact';
}

const PLATFORM_CONFIG: Record<Platform, { name: string; logo: string }> = {
  facebook: {
    name: 'Facebook Marketplace',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/2021_Facebook_icon.svg/2048px-2021_Facebook_icon.svg.png',
  },
  olx: {
    name: 'OLX',
    logo: 'https://images.seeklogo.com/logo-png/39/1/olx-logo-png_seeklogo-390322.png',
  },
  vinted: {
    name: 'Vinted',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Vinted_logo.png',
  },
  ebay: {
    name: 'eBay',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/EBay_logo.svg',
  },
};

const SUPPORTED_PLATFORMS: Platform[] = ['facebook', 'olx', 'vinted', 'ebay'];

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
  const [showPlatformPicker, setShowPlatformPicker] = useState(false);
  
  const isDraft = item.status === 'draft' || item.stage === 'draft';
  const isPublished = item.stage === 'published' || (item.publish_results && item.publish_results.some((r: PlatformPublishResult) => r.status === 'success'));
  
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
  
  const handleEdit = () => {
    // Navigate to edit page (reusing AddItemPage with existing data)
    navigate(`/add-item?edit=${item.uuid}`);
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
  
  const handlePublishClick = () => {
    if (availablePlatforms.length === 0) {
      // No platforms available - show message
      toast({
        title: t.platformPicker.noConnected,
        description: 'Connect a platform in Settings to publish',
        variant: 'destructive',
      });
      return;
    }
    
    if (availablePlatforms.length === 1) {
      // Single platform available - go directly to publish flow
      navigate(`/add-item?edit=${item.uuid}&publish=${availablePlatforms[0]}`);
    } else {
      // Multiple platforms - show picker
      setShowPlatformPicker(true);
    }
  };
  
  const handleSelectPlatform = (platform: Platform) => {
    setShowPlatformPicker(false);
    // Navigate to publish flow with pre-selected platform
    navigate(`/add-item?edit=${item.uuid}&publish=${platform}`);
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
              {t.actions.edit}
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
            
            {availablePlatforms.length > 0 && (
              <DropdownMenuItem onClick={handlePublishClick} className="cursor-pointer text-white">
                <Upload className="mr-2 h-4 w-4" />
                {isPublished ? t.actions.publishToAnother : t.actions.publish}
              </DropdownMenuItem>
            )}
            
            <DropdownMenuSeparator className="bg-neutral-700" />
            
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
              <DialogTitle className="text-white">{t.confirmations.deleteTitle}</DialogTitle>
              <DialogDescription className="text-neutral-400">
                {t.confirmations.deleteDescription}
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
                {t.confirmations.deleteConfirm}
              </DeleteButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Platform Picker Dialog */}
        <Dialog open={showPlatformPicker} onOpenChange={setShowPlatformPicker}>
          <DialogContent className="bg-neutral-900 border-neutral-700">
            <DialogHeader>
              <DialogTitle className="text-white">{t.platformPicker.title}</DialogTitle>
              <DialogDescription className="text-neutral-400">
                {t.platformPicker.description}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-4">
              {SUPPORTED_PLATFORMS.map((platform) => {
                const isConnected = connectedPlatforms[platform];
                const isAlreadyPublished = publishedPlatforms.has(platform);
                const config = PLATFORM_CONFIG[platform];
                
                return (
                  <button
                    key={platform}
                    onClick={() => !isAlreadyPublished && isConnected && handleSelectPlatform(platform)}
                    disabled={!isConnected || isAlreadyPublished}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      isAlreadyPublished 
                        ? 'border-green-500/30 bg-green-500/10 cursor-not-allowed'
                        : isConnected 
                        ? 'border-neutral-700 hover:border-cyan-500/50 hover:bg-neutral-800 cursor-pointer'
                        : 'border-neutral-800 bg-neutral-900/50 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <img 
                      src={config.logo} 
                      alt={config.name} 
                      className="w-8 h-8 object-contain rounded"
                    />
                    <span className="flex-1 text-left text-white font-medium">
                      {config.name}
                    </span>
                    {isAlreadyPublished && (
                      <span className="flex items-center gap-1 text-green-400 text-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        {t.platformPicker.alreadyPublished}
                      </span>
                    )}
                    {!isConnected && !isAlreadyPublished && (
                      <span className="text-neutral-500 text-sm">
                        {t.platformPicker.connectAccount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <DialogFooter>
              <SecondaryAction onClick={() => setShowPlatformPicker(false)} className="px-4 py-2">
                {t.platformPicker.cancel}
              </SecondaryAction>
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
        {/* Primary CTA - Edit or Publish based on status */}
        {isDraft ? (
          <>
            <AddItemButton 
              size="lg"
              onClick={handlePublishClick}
              className="flex items-center gap-2"
              disabled={availablePlatforms.length === 0}
            >
              <Upload className="h-4 w-4" />
              {t.actions.publish}
            </AddItemButton>
            <SecondaryAction onClick={handleEdit} className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              {t.actions.edit}
            </SecondaryAction>
          </>
        ) : (
          <>
            <SecondaryAction onClick={handleEdit} className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              {t.actions.editListing}
            </SecondaryAction>
            {availablePlatforms.length > 0 && (
              <AddItemButton 
                size="lg"
                onClick={handlePublishClick}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {t.actions.publishToAnother}
              </AddItemButton>
            )}
          </>
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
            
            <DropdownMenuSeparator className="bg-neutral-700" />
            
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
            <DialogTitle className="text-white">{t.confirmations.deleteTitle}</DialogTitle>
            <DialogDescription className="text-neutral-400">
              {t.confirmations.deleteDescription}
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
              {t.confirmations.deleteConfirm}
            </DeleteButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Platform Picker Dialog */}
      <Dialog open={showPlatformPicker} onOpenChange={setShowPlatformPicker}>
        <DialogContent className="bg-neutral-900 border-neutral-700">
          <DialogHeader>
            <DialogTitle className="text-white">{t.platformPicker.title}</DialogTitle>
            <DialogDescription className="text-neutral-400">
              {t.platformPicker.description}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            {SUPPORTED_PLATFORMS.map((platform) => {
              const isConnected = connectedPlatforms[platform];
              const isAlreadyPublished = publishedPlatforms.has(platform);
              const config = PLATFORM_CONFIG[platform];
              
              return (
                <button
                  key={platform}
                  onClick={() => !isAlreadyPublished && isConnected && handleSelectPlatform(platform)}
                  disabled={!isConnected || isAlreadyPublished}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    isAlreadyPublished 
                      ? 'border-green-500/30 bg-green-500/10 cursor-not-allowed'
                      : isConnected 
                      ? 'border-neutral-700 hover:border-cyan-500/50 hover:bg-neutral-800 cursor-pointer'
                      : 'border-neutral-800 bg-neutral-900/50 cursor-not-allowed opacity-50'
                  }`}
                >
                  <img 
                    src={config.logo} 
                    alt={config.name} 
                    className="w-8 h-8 object-contain rounded"
                  />
                  <span className="flex-1 text-left text-white font-medium">
                    {config.name}
                  </span>
                  {isAlreadyPublished && (
                    <span className="flex items-center gap-1 text-green-400 text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      {t.platformPicker.alreadyPublished}
                    </span>
                  )}
                  {!isConnected && !isAlreadyPublished && (
                    <span className="text-neutral-500 text-sm">
                      {t.platformPicker.connectAccount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <DialogFooter>
            <SecondaryAction onClick={() => setShowPlatformPicker(false)} className="px-4 py-2">
              {t.platformPicker.cancel}
            </SecondaryAction>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
