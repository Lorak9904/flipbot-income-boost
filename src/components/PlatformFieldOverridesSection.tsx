import { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SecondaryAction } from '@/components/ui/button-presets';
import type { Platform, PlatformFieldOverrides, PlatformOverrides } from '@/types/item';
import { SUPPORTED_CURRENCIES, resolveCurrency } from '@/lib/currency';

interface BaseListingValues {
  title: string;
  description: string;
  price: string;
  currency: string;
  brand: string;
  condition: string;
  category: string;
  size: string;
}

interface PlatformFieldOverridesSectionProps {
  selectedPlatforms: Platform[];
  platformOverrides: PlatformOverrides;
  baseValues: BaseListingValues;
  disabled?: boolean;
  onFieldChange: (platform: 'olx' | 'vinted' | 'ebay' | 'allegro', field: keyof PlatformFieldOverrides, value: string) => void;
  onClearPlatformOverrides: (platform: 'olx' | 'vinted' | 'ebay' | 'allegro') => void;
}

type OverridePlatform = 'olx' | 'vinted' | 'ebay' | 'allegro';

const OVERRIDABLE_PLATFORMS: OverridePlatform[] = ['olx', 'vinted', 'ebay', 'allegro'];

const PLATFORM_LABELS: Record<OverridePlatform, string> = {
  olx: 'OLX',
  vinted: 'Vinted',
  ebay: 'eBay',
  allegro: 'Allegro',
};

function hasFieldOverrides(overrides: PlatformFieldOverrides | undefined): boolean {
  if (!overrides || typeof overrides !== 'object') {
    return false;
  }
  return Object.values(overrides).some((value) => {
    if (value === null || value === undefined) {
      return false;
    }
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    return true;
  });
}

function basePlaceholder(label: string, value: string): string {
  const trimmed = (value || '').trim();
  if (!trimmed) {
    return `Using base ${label} (currently empty)`;
  }
  return `Using base ${label}: ${trimmed}`;
}

export default function PlatformFieldOverridesSection({
  selectedPlatforms,
  platformOverrides,
  baseValues,
  disabled = false,
  onFieldChange,
  onClearPlatformOverrides,
}: PlatformFieldOverridesSectionProps) {
  const enabledPlatforms = useMemo(
    () =>
      selectedPlatforms.filter(
        (platform): platform is OverridePlatform =>
          OVERRIDABLE_PLATFORMS.includes(platform as OverridePlatform)
      ),
    [selectedPlatforms]
  );
  const [activePlatform, setActivePlatform] = useState<OverridePlatform | null>(
    enabledPlatforms[0] || null
  );
  const [enabledByPlatform, setEnabledByPlatform] = useState<Record<OverridePlatform, boolean>>({
    olx: hasFieldOverrides(platformOverrides.olx?.field_overrides),
    vinted: hasFieldOverrides(platformOverrides.vinted?.field_overrides),
    ebay: hasFieldOverrides(platformOverrides.ebay?.field_overrides),
    allegro: hasFieldOverrides(platformOverrides.allegro?.field_overrides),
  });

  useEffect(() => {
    if (!enabledPlatforms.length) {
      setActivePlatform(null);
      return;
    }
    if (!activePlatform || !enabledPlatforms.includes(activePlatform)) {
      setActivePlatform(enabledPlatforms[0]);
    }
  }, [enabledPlatforms, activePlatform]);

  useEffect(() => {
    setEnabledByPlatform((previous) => {
      const next: Record<OverridePlatform, boolean> = {
        olx: false,
        vinted: false,
        ebay: false,
        allegro: false,
      };

      for (const platform of enabledPlatforms) {
        next[platform] =
          previous[platform] || hasFieldOverrides(platformOverrides[platform]?.field_overrides);
      }

      if (
        next.olx === previous.olx &&
        next.vinted === previous.vinted &&
        next.ebay === previous.ebay &&
        next.allegro === previous.allegro
      ) {
        return previous;
      }

      return next;
    });
  }, [enabledPlatforms, platformOverrides]);

  if (!enabledPlatforms.length || !activePlatform) {
    return null;
  }

  const renderFields = (platform: OverridePlatform) => {
    const overrides = platformOverrides[platform]?.field_overrides;
    const customEnabled = enabledByPlatform[platform];

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border border-neutral-700 bg-neutral-800/40 px-3 py-2">
          <div>
            <p className="text-sm font-medium text-neutral-200">
              Customize {PLATFORM_LABELS[platform]} listing fields
            </p>
            <p className="text-xs text-neutral-400">
              Leave fields empty to inherit generic values.
            </p>
          </div>
          <Switch
            checked={customEnabled}
            onCheckedChange={(checked) => {
              setEnabledByPlatform((previous) => ({
                ...previous,
                [platform]: checked,
              }));
              if (!checked) {
                onClearPlatformOverrides(platform);
              }
            }}
            disabled={disabled}
          />
        </div>

        {customEnabled && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-neutral-300 text-xs">Title override</Label>
              <Input
                value={overrides?.title || ''}
                onChange={(event) => onFieldChange(platform, 'title', event.target.value)}
                placeholder={basePlaceholder('title', baseValues.title)}
                disabled={disabled}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label className="text-neutral-300 text-xs">Description override</Label>
              <Textarea
                value={overrides?.description || ''}
                onChange={(event) => onFieldChange(platform, 'description', event.target.value)}
                placeholder={basePlaceholder('description', baseValues.description)}
                disabled={disabled}
                className="min-h-[110px]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-neutral-300 text-xs">Price override</Label>
              <Input
                type="number"
                step="0.01"
                value={overrides?.price?.toString() || ''}
                onChange={(event) => onFieldChange(platform, 'price', event.target.value)}
                placeholder={basePlaceholder('price', baseValues.price)}
                disabled={disabled}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-neutral-300 text-xs">Currency override</Label>
              <Select
                value={resolveCurrency(overrides?.currency || baseValues.currency)}
                onValueChange={(value) => onFieldChange(platform, 'currency', value)}
                disabled={disabled}
              >
                <SelectTrigger className="bg-neutral-950/60 border-neutral-700 text-white">
                  <SelectValue placeholder={baseValues.currency} />
                </SelectTrigger>
                <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                  {SUPPORTED_CURRENCIES.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-neutral-500">Default: {baseValues.currency}</p>
            </div>

            <div className="space-y-2">
              <Label className="text-neutral-300 text-xs">Brand override</Label>
              <Input
                value={overrides?.brand || ''}
                onChange={(event) => onFieldChange(platform, 'brand', event.target.value)}
                placeholder={basePlaceholder('brand', baseValues.brand)}
                disabled={disabled}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-neutral-300 text-xs">Condition override</Label>
              <Input
                value={overrides?.condition || ''}
                onChange={(event) => onFieldChange(platform, 'condition', event.target.value)}
                placeholder={basePlaceholder('condition', baseValues.condition)}
                disabled={disabled}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-neutral-300 text-xs">Size override</Label>
              <Input
                value={overrides?.size || ''}
                onChange={(event) => onFieldChange(platform, 'size', event.target.value)}
                placeholder={basePlaceholder('size', baseValues.size)}
                disabled={disabled}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label className="text-neutral-300 text-xs">Category text override (optional hint)</Label>
              <Input
                value={overrides?.category || ''}
                onChange={(event) => onFieldChange(platform, 'category', event.target.value)}
                placeholder={basePlaceholder('category', baseValues.category)}
                disabled={disabled}
              />
            </div>

            <div className="sm:col-span-2">
              <SecondaryAction
                type="button"
                onClick={() => onClearPlatformOverrides(platform)}
                disabled={disabled}
                className="w-full"
              >
                Use Generic Values
              </SecondaryAction>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (enabledPlatforms.length === 1) {
    return (
      <div className="rounded-lg border border-neutral-700 bg-neutral-900/50 p-4">
        {renderFields(enabledPlatforms[0])}
      </div>
    );
  }

  return (
    <Tabs
      value={activePlatform}
      onValueChange={(value) => {
        if (OVERRIDABLE_PLATFORMS.includes(value as OverridePlatform)) {
          setActivePlatform(value as OverridePlatform);
        }
      }}
    >
      <TabsList className="w-full justify-start bg-neutral-800/60">
        {enabledPlatforms.map((platform) => (
          <TabsTrigger key={platform} value={platform} className="capitalize">
            {PLATFORM_LABELS[platform]}
          </TabsTrigger>
        ))}
      </TabsList>
      {enabledPlatforms.map((platform) => (
        <TabsContent key={platform} value={platform} className="rounded-lg border border-neutral-700 bg-neutral-900/50 p-4">
          {renderFields(platform)}
        </TabsContent>
      ))}
    </Tabs>
  );
}
