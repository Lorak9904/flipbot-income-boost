import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AddItemButton, SecondaryAction } from '@/components/ui/button-presets';
import { UserItem } from '@/types/item';
import { updateItem } from '@/lib/api/items';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lock, Save, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PlatformOverridesModalProps {
  item: UserItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: () => void | Promise<void>;
}

type Platform = 'facebook' | 'vinted' | 'olx' | 'ebay';

interface PlatformOverrides {
  facebook?: Record<string, any>;
  vinted?: Record<string, any>;
  olx?: Record<string, any>;
  ebay?: Record<string, any>;
}

export const PlatformOverridesModal = ({
  item,
  open,
  onOpenChange,
  onSave,
}: PlatformOverridesModalProps) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [overrides, setOverrides] = useState<PlatformOverrides>({});
  const [activeTab, setActiveTab] = useState<Platform>('facebook');

  // Platform documentation status
  const platformsStatus: Record<Platform, { enabled: boolean; label: string }> = {
    facebook: { enabled: true, label: 'Facebook' },
    vinted: { enabled: true, label: 'Vinted' },
    olx: { enabled: true, label: 'OLX' },
    ebay: { enabled: false, label: 'eBay (Coming Soon)' },
  };

  useEffect(() => {
    if (open && item.platform_listing_overrides) {
      setOverrides(item.platform_listing_overrides as PlatformOverrides);
    }
  }, [open, item]);

  const handleFieldChange = (platform: Platform, field: string, value: any) => {
    setOverrides((prev) => ({
      ...prev,
      [platform]: {
        ...(prev[platform] || {}),
        [field]: value,
      },
    }));
  };

  const handleSaveOverrides = async () => {
    setSaving(true);
    try {
      await updateItem(item.uuid, {
        platform_listing_overrides: overrides as any, // Type assertion to handle index signature
      });

      toast({
        title: '✅ Overrides saved',
        description: 'Platform-specific settings updated successfully.',
      });

      if (onSave) {
        await onSave();
      }

      onOpenChange(false);
    } catch (error) {
      toast({
        title: '❌ Failed to save',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const renderFacebookFields = () => {
    const fb = overrides.facebook || {};
    return (
      <div className="space-y-4">
        <Alert className="bg-blue-500/10 border-blue-500/50 text-blue-400">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            These settings will override the default values when publishing to Facebook Marketplace.
          </AlertDescription>
        </Alert>

        <div>
          <Label className="text-white">Title</Label>
          <Input
            value={fb.title || item.title || ''}
            onChange={(e) => handleFieldChange('facebook', 'title', e.target.value)}
            className="bg-neutral-800 border-neutral-700 text-white mt-2"
            placeholder="Facebook-specific title"
          />
        </div>

        <div>
          <Label className="text-white">Description</Label>
          <Textarea
            value={fb.description || item.description || ''}
            onChange={(e) => handleFieldChange('facebook', 'description', e.target.value)}
            className="bg-neutral-800 border-neutral-700 text-white mt-2 min-h-[100px]"
            placeholder="Facebook-specific description"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-white">Price</Label>
            <Input
              type="number"
              step="0.01"
              value={fb.price || item.price || ''}
              onChange={(e) => handleFieldChange('facebook', 'price', parseFloat(e.target.value))}
              className="bg-neutral-800 border-neutral-700 text-white mt-2"
              placeholder="Price"
            />
          </div>
          <div>
            <Label className="text-white">Condition</Label>
            <Input
              value={fb.condition || item.condition || ''}
              onChange={(e) => handleFieldChange('facebook', 'condition', e.target.value)}
              className="bg-neutral-800 border-neutral-700 text-white mt-2"
              placeholder="new, used_like_new, used_good, used_fair"
            />
          </div>
        </div>
      </div>
    );
  };

  const renderVintedFields = () => {
    const vinted = overrides.vinted || {};
    return (
      <div className="space-y-4">
        <Alert className="bg-purple-500/10 border-purple-500/50 text-purple-400">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            These settings will override the default values when publishing to Vinted.
          </AlertDescription>
        </Alert>

        <div>
          <Label className="text-white">Title</Label>
          <Input
            value={vinted.title || item.title || ''}
            onChange={(e) => handleFieldChange('vinted', 'title', e.target.value)}
            className="bg-neutral-800 border-neutral-700 text-white mt-2"
            placeholder="Vinted-specific title"
          />
        </div>

        <div>
          <Label className="text-white">Description</Label>
          <Textarea
            value={vinted.description || item.description || ''}
            onChange={(e) => handleFieldChange('vinted', 'description', e.target.value)}
            className="bg-neutral-800 border-neutral-700 text-white mt-2 min-h-[100px]"
            placeholder="Vinted-specific description"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-white">Price</Label>
            <Input
              type="number"
              step="0.01"
              value={vinted.price || item.price || ''}
              onChange={(e) => handleFieldChange('vinted', 'price', parseFloat(e.target.value))}
              className="bg-neutral-800 border-neutral-700 text-white mt-2"
              placeholder="Price"
            />
          </div>
          <div>
            <Label className="text-white">Brand</Label>
            <Input
              value={vinted.brand || item.brand || ''}
              onChange={(e) => handleFieldChange('vinted', 'brand', e.target.value)}
              className="bg-neutral-800 border-neutral-700 text-white mt-2"
              placeholder="Brand name"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-white">Size</Label>
            <Input
              value={vinted.size || item.size || ''}
              onChange={(e) => handleFieldChange('vinted', 'size', e.target.value)}
              className="bg-neutral-800 border-neutral-700 text-white mt-2"
              placeholder="Size"
            />
          </div>
          <div>
            <Label className="text-white">Color</Label>
            <Input
              value={vinted.color || ''}
              onChange={(e) => handleFieldChange('vinted', 'color', e.target.value)}
              className="bg-neutral-800 border-neutral-700 text-white mt-2"
              placeholder="Color"
            />
          </div>
        </div>
      </div>
    );
  };

  const renderOlxFields = () => {
    const olx = overrides.olx || {};
    return (
      <div className="space-y-4">
        <Alert className="bg-green-500/10 border-green-500/50 text-green-400">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            These settings will override the default values when publishing to OLX.
          </AlertDescription>
        </Alert>

        <div>
          <Label className="text-white">Title</Label>
          <Input
            value={olx.title || item.title || ''}
            onChange={(e) => handleFieldChange('olx', 'title', e.target.value)}
            className="bg-neutral-800 border-neutral-700 text-white mt-2"
            placeholder="OLX-specific title"
          />
        </div>

        <div>
          <Label className="text-white">Description</Label>
          <Textarea
            value={olx.description || item.description || ''}
            onChange={(e) => handleFieldChange('olx', 'description', e.target.value)}
            className="bg-neutral-800 border-neutral-700 text-white mt-2 min-h-[100px]"
            placeholder="OLX-specific description"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-white">Price</Label>
            <Input
              type="number"
              step="0.01"
              value={olx.price || item.price || ''}
              onChange={(e) => handleFieldChange('olx', 'price', parseFloat(e.target.value))}
              className="bg-neutral-800 border-neutral-700 text-white mt-2"
              placeholder="Price"
            />
          </div>
          <div>
            <Label className="text-white">Condition</Label>
            <Input
              value={olx.condition || item.condition || ''}
              onChange={(e) => handleFieldChange('olx', 'condition', e.target.value)}
              className="bg-neutral-800 border-neutral-700 text-white mt-2"
              placeholder="new, used"
            />
          </div>
        </div>
      </div>
    );
  };

  const renderEbayFields = () => {
    return (
      <div className="space-y-4">
        <Alert className="bg-amber-500/10 border-amber-500/50 text-amber-400">
          <Lock className="h-4 w-4" />
          <AlertDescription>
            eBay integration is coming soon. Platform-specific settings will be available once the
            integration is complete.
          </AlertDescription>
        </Alert>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-neutral-900 border-neutral-800 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Platform-Specific Settings</DialogTitle>
          <DialogDescription className="text-neutral-400">
            Customize how your item appears on different platforms. These settings override the
            default values.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Platform)}>
          <TabsList className="grid w-full grid-cols-4 bg-neutral-800">
            {(Object.entries(platformsStatus) as [Platform, typeof platformsStatus[Platform]][]).map(
              ([platform, status]) => (
                <TabsTrigger
                  key={platform}
                  value={platform}
                  disabled={!status.enabled}
                  className="data-[state=active]:bg-neutral-700 data-[state=active]:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status.enabled ? status.label : <Lock className="h-4 w-4 inline mr-1" />}
                  {!status.enabled && ' ' + status.label}
                </TabsTrigger>
              )
            )}
          </TabsList>

          <TabsContent value="facebook" className="mt-6">
            {renderFacebookFields()}
          </TabsContent>

          <TabsContent value="vinted" className="mt-6">
            {renderVintedFields()}
          </TabsContent>

          <TabsContent value="olx" className="mt-6">
            {renderOlxFields()}
          </TabsContent>

          <TabsContent value="ebay" className="mt-6">
            {renderEbayFields()}
          </TabsContent>
        </Tabs>

        <div className="flex gap-3 pt-4 border-t border-neutral-800">
          <AddItemButton
            onClick={handleSaveOverrides}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Overrides
              </>
            )}
          </AddItemButton>
          <SecondaryAction onClick={() => onOpenChange(false)}>Cancel</SecondaryAction>
        </div>
      </DialogContent>
    </Dialog>
  );
};
