import { useEffect, useMemo, useState } from 'react';
import { 
  GeneratedItemData, 
  GeneratedItemDataWithVinted, 
  ItemImage, 
  MarketplaceAttributeField,
  MarketplaceAttributes,
  MarketplaceAttributeValue,
  Platform, 
  PlatformFieldOverrides,
  PlatformOverrides
} from '@/types/item';
import { useToast } from '@/hooks/use-toast';
import { AddItemButton, BackButtonGhost } from '@/components/ui/button-presets';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ImageUploader from './ImageUploader';
import MarketplaceAttributesPanel from './MarketplaceAttributesPanel';
import PlatformOverrideCard from './PlatformOverrideCard';
import PlatformCategoryBooks from './PlatformCategoryBooks';
import PlatformFieldOverridesSection from './PlatformFieldOverridesSection';
import { Loader2, CreditCard, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getTranslations } from '@/components/language-utils';
import { reviewItemFormTranslations } from '@/utils/translations/review-item-form-translations';
import { useCredits } from '@/hooks/useCredits';
import { useQueryClient } from '@tanstack/react-query';
import { InsufficientCreditsAlert } from '@/components/credits';
import { parseInsufficientCreditsError, parseErrorResponse } from '@/lib/api/error-handler';
import type { ReviewItemFormMode } from './review-item-form-mode';
import {
  getDefaultSelectedPlatforms,
  getPlatformSelectionOptions,
  isPublishMode,
} from './review-item-form-mode';
import { submitEditDraft } from './review-item/submit-edit';
import { getVintedCategoryAttributes } from '@/lib/api/vinted';
import { SUPPORTED_CURRENCIES, resolveCurrency } from '@/lib/currency';

interface ReviewItemFormProps {
  initialData: GeneratedItemDataWithVinted;
  mode: ReviewItemFormMode;
  connectedPlatforms: Record<Platform, boolean>;
  onBack: () => void;
  language?: string;
  editItemId?: string;
  publishedPlatforms?: Platform[];
  publishPlatform?: Platform;
}

const ReviewItemForm = ({
  initialData,
  mode,
  connectedPlatforms,
  onBack,
  language,
  editItemId,
  publishedPlatforms = [],
  publishPlatform,
}: ReviewItemFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [insufficientCreditsError, setInsufficientCreditsError] = useState<{
    required: number;
    available: number;
  } | null>(null);
  const isPublishingMode = isPublishMode(mode);
  const defaultCurrency = resolveCurrency(initialData.currency, language);
  // Ensure draft_id is preserved in state
  const [data, setData] = useState<GeneratedItemData & { draft_id?: string }>(() => ({
    ...initialData,
    currency: defaultCurrency,
  }));
  const navigate = useNavigate();
  const { data: credits } = useCredits();
  const queryClient = useQueryClient();
  const t = getTranslations(reviewItemFormTranslations);

  const platformSelectionOptions = useMemo(
    () =>
      getPlatformSelectionOptions({
        mode,
        connectedPlatforms,
        publishedPlatforms,
      }),
    [mode, connectedPlatforms, publishedPlatforms]
  );
  const defaultSelectedPlatforms = useMemo(
    () => {
      const base = getDefaultSelectedPlatforms(mode, platformSelectionOptions, publishPlatform);
      if (!isPublishingMode) {
        return base;
      }
      const connectedDefault = base.filter((platform) => connectedPlatforms[platform]);
      return connectedDefault.length > 0 ? connectedDefault : base;
    },
    [mode, platformSelectionOptions, publishPlatform, isPublishingMode, connectedPlatforms]
  );
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(defaultSelectedPlatforms);

  const requiredPublishCredits = isPublishingMode && selectedPlatforms.length > 0 ? 1 : 0;
  const hasInsufficientPublishCredits =
    isPublishingMode &&
    requiredPublishCredits > 0 &&
    !!credits &&
    credits.publish_remaining !== null &&
    credits.publish_remaining < requiredPublishCredits;
  const showPlatformPreparation = platformSelectionOptions.length > 0;
  
  const [marketplaceAttributes, setMarketplaceAttributes] = useState<MarketplaceAttributes>(
    initialData.marketplace_attributes || {}
  );
  const [loadingMarketplaceAttributes, setLoadingMarketplaceAttributes] = useState<
    Partial<Record<Platform, boolean>>
  >({});
  const [platformOverrides, setPlatformOverrides] = useState<PlatformOverrides>(() => {
    const overrides = initialData.platform_listing_overrides;
    if (!overrides || typeof overrides !== 'object') {
      return {};
    }
    return {
      ...overrides,
      olx: overrides.olx ? { ...overrides.olx } : undefined,
      vinted: overrides.vinted ? { ...overrides.vinted } : undefined,
      ebay: overrides.ebay ? { ...overrides.ebay } : undefined,
      allegro: overrides.allegro ? { ...overrides.allegro } : undefined,
    };
  });
  
  // Keep selected platforms aligned with available options and mode defaults.
  useEffect(() => {
    setSelectedPlatforms((previous) => {
      const validSelection = previous.filter((platform) =>
        platformSelectionOptions.includes(platform)
      );

      if (mode === 'republish') {
        return defaultSelectedPlatforms;
      }
      if (validSelection.length > 0) {
        return validSelection;
      }
      return defaultSelectedPlatforms;
    });
  }, [mode, platformSelectionOptions, defaultSelectedPlatforms]);
  
  // Make sure draft_id is never lost when updating fields
  const updateField = <K extends keyof GeneratedItemData>(field: K, value: GeneratedItemData[K]) => {
    setData(prev => ({ ...prev, [field]: value, draft_id: prev.draft_id }));
  };
  
  const handlePlatformToggle = (platform: Platform) => {
    if (isPublishingMode && !connectedPlatforms[platform]) {
      return;
    }
    setSelectedPlatforms(prev => 
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };
  
  const handleMarketplaceAttributeChange = (
    platform: Platform,
    field: MarketplaceAttributeField,
    value: MarketplaceAttributeValue
  ) => {
    setMarketplaceAttributes(prev => {
      const current = prev[platform] || {
        platform,
        category_id: platform === 'vinted' ? platformOverrides.vinted?.catalog_id : undefined,
        fields: [],
        values: {},
      };
      return {
        ...prev,
        [platform]: {
          ...current,
          values: {
            ...current.values,
            [field.key]: value,
          },
        },
      };
    });
  };

  const updatePlatformOverride = (
    platform: 'olx' | 'vinted' | 'ebay' | 'allegro',
    field: string,
    value: string
  ) => {
    setPlatformOverrides(prev => {
      const existing = prev[platform];
      const existingOverrides =
        existing && typeof existing === 'object' ? (existing as Record<string, unknown>) : {};
      return {
        ...prev,
        [platform]: {
          ...existingOverrides,
          [field]: value,
        },
      };
    });
  };

  const handleSetVintedCatalog = async (catalogId: string | number) => {
    updatePlatformOverride('vinted', 'catalog_id', String(catalogId));
    setLoadingMarketplaceAttributes(prev => ({ ...prev, vinted: true }));
    setMarketplaceAttributes(prev => ({
      ...prev,
      vinted: {
        platform: 'vinted',
        category_id: catalogId,
        fields: [],
        values: {},
      },
    }));

    try {
      const state = await getVintedCategoryAttributes(catalogId);
      setMarketplaceAttributes(prev => ({
        ...prev,
        vinted: {
          ...state,
          category_id: state.category_id ?? catalogId,
          values: {},
        },
      }));
    } catch (error) {
      toast({
        title: 'Vinted attributes could not be loaded',
        description: error instanceof Error ? error.message : 'Try again or reconnect Vinted.',
        variant: 'destructive',
      });
    } finally {
      setLoadingMarketplaceAttributes(prev => ({ ...prev, vinted: false }));
    }
  };

  const updateOlxCategoryOverride = (categoryId: string | number, categoryPath?: string) => {
    setPlatformOverrides((prev) => {
      const existing = prev.olx;
      const existingOverrides =
        existing && typeof existing === 'object' ? (existing as Record<string, unknown>) : {};
      const nextOlxOverrides: Record<string, unknown> = {
        ...existingOverrides,
        category_id: String(categoryId),
      };

      if (categoryPath && categoryPath.trim()) {
        nextOlxOverrides.category_path = categoryPath.trim();
      } else {
        delete nextOlxOverrides.category_path;
      }

      return {
        ...prev,
        olx: nextOlxOverrides,
      };
    });
  };

  const updateAllegroCategoryOverride = (
    categoryId: string | number,
    marketplaceId?: string,
    categoryPath?: string
  ) => {
    setPlatformOverrides((prev) => {
      const existing = prev.allegro;
      const existingOverrides =
        existing && typeof existing === 'object' ? (existing as Record<string, unknown>) : {};
      const existingMarketplaceId =
        typeof existingOverrides.marketplace_id === 'string'
          ? existingOverrides.marketplace_id.trim()
          : '';
      const nextMarketplaceId = marketplaceId?.trim() || existingMarketplaceId || 'allegro-pl';
      const nextAllegroOverrides: Record<string, unknown> = {
        ...existingOverrides,
        category_id: String(categoryId),
        marketplace_id: nextMarketplaceId,
      };

      if (categoryPath && categoryPath.trim()) {
        nextAllegroOverrides.category_path = categoryPath.trim();
      } else {
        delete nextAllegroOverrides.category_path;
      }

      return {
        ...prev,
        allegro: nextAllegroOverrides,
      };
    });
  };

  const updatePlatformFieldOverride = (
    platform: 'olx' | 'vinted' | 'ebay' | 'allegro',
    field: keyof PlatformFieldOverrides,
    value: string
  ) => {
    setPlatformOverrides((previous) => {
      const existing = previous[platform];
      const existingOverrides =
        existing && typeof existing === 'object' ? (existing as Record<string, unknown>) : {};
      const existingFieldOverrides =
        existingOverrides.field_overrides && typeof existingOverrides.field_overrides === 'object'
          ? ({ ...(existingOverrides.field_overrides as Record<string, unknown>) } as Record<string, unknown>)
          : {};

      const cleanedValue = value.trim();
      if (!cleanedValue) {
        delete existingFieldOverrides[field];
      } else if (field === 'price') {
        const parsed = Number(cleanedValue);
        existingFieldOverrides[field] = Number.isFinite(parsed) ? parsed : cleanedValue;
      } else if (field === 'currency') {
        existingFieldOverrides[field] = resolveCurrency(cleanedValue, language);
      } else {
        existingFieldOverrides[field] = cleanedValue;
      }

      const nextPlatformOverride: Record<string, unknown> = { ...existingOverrides };
      if (Object.keys(existingFieldOverrides).length > 0) {
        nextPlatformOverride.field_overrides = existingFieldOverrides;
      } else {
        delete nextPlatformOverride.field_overrides;
      }

      return {
        ...previous,
        [platform]: nextPlatformOverride,
      };
    });
  };

  const clearPlatformFieldOverrides = (platform: 'olx' | 'vinted' | 'ebay' | 'allegro') => {
    setPlatformOverrides((previous) => {
      const existing = previous[platform];
      if (!existing || typeof existing !== 'object') {
        return previous;
      }
      const nextPlatformOverride = { ...(existing as Record<string, unknown>) };
      delete nextPlatformOverride.field_overrides;

      return {
        ...previous,
        [platform]: nextPlatformOverride,
      };
    });
  };

  // Handler for platform-specific attribute changes (Task 2)
  const updatePlatformAttribute = (
    platform: 'olx' | 'ebay' | 'allegro',
    key: string,
    value: string | number
  ) => {
    setPlatformOverrides(prev => {
      const existing = prev[platform] || {};
      const existingAttrs = (existing as Record<string, unknown>).attributes as Record<string, string | number> || {};
      return {
        ...prev,
        [platform]: {
          ...existing,
          attributes: {
            ...existingAttrs,
            [key]: value,
          },
        },
      };
    });
  };

  const buildPlatformOverridesPayload = () => {
    const overrides: PlatformOverrides = {};
    Object.entries(platformOverrides || {}).forEach(([key, value]) => {
      if (!['olx', 'vinted', 'ebay', 'allegro'].includes(key)) {
        overrides[key] = value as unknown;
      }
    });

    // OLX overrides: category_id + dynamic attributes
    const olxCategory = platformOverrides.olx?.category_id;
    const olxCategoryPath = platformOverrides.olx?.category_path;
    const olxAttrs = platformOverrides.olx?.attributes;
    const olxFieldOverrides = platformOverrides.olx?.field_overrides;
    if ((olxCategory !== undefined && olxCategory !== null && String(olxCategory).trim() !== '') ||
        (olxCategoryPath && String(olxCategoryPath).trim()) ||
        (olxAttrs && Object.keys(olxAttrs).length > 0) ||
        (olxFieldOverrides && Object.keys(olxFieldOverrides).length > 0)) {
      const parsed = Number(olxCategory);
      overrides.olx = {};
      if (olxCategory !== undefined && olxCategory !== null && String(olxCategory).trim() !== '') {
        overrides.olx.category_id = Number.isNaN(parsed) ? String(olxCategory).trim() : parsed;
      }
      if (olxCategoryPath && String(olxCategoryPath).trim()) {
        overrides.olx.category_path = String(olxCategoryPath).trim();
      }
      if (olxAttrs && Object.keys(olxAttrs).length > 0) {
        overrides.olx.attributes = olxAttrs;
      }
      if (olxFieldOverrides && Object.keys(olxFieldOverrides).length > 0) {
        overrides.olx.field_overrides = olxFieldOverrides;
      }
    }

    // Vinted overrides: category_id + selected marketplace attribute values
    const vintedPayload: NonNullable<PlatformOverrides['vinted']> = {};
    const vintedCatalog = platformOverrides.vinted?.catalog_id;
    if (vintedCatalog !== undefined && vintedCatalog !== null && String(vintedCatalog).trim() !== '') {
      const parsed = Number(vintedCatalog);
      vintedPayload.catalog_id = Number.isNaN(parsed) ? String(vintedCatalog).trim() : parsed;
    }
    const vintedFieldOverrides = platformOverrides.vinted?.field_overrides;
    if (vintedFieldOverrides && Object.keys(vintedFieldOverrides).length > 0) {
      vintedPayload.field_overrides = vintedFieldOverrides;
    }

    const vintedAttributeValues =
      marketplaceAttributes.vinted?.values || platformOverrides.vinted?.attribute_values;
    if (vintedAttributeValues && Object.keys(vintedAttributeValues).length > 0) {
      vintedPayload.attribute_values = vintedAttributeValues;
    }

    if (Object.keys(vintedPayload).length > 0) {
      overrides.vinted = vintedPayload;
    }

    // Allegro overrides: category_id + marketplace_id + optional attributes
    const allegroCategoryId = platformOverrides.allegro?.category_id;
    const allegroCategoryPath = platformOverrides.allegro?.category_path;
    const allegroMarketplaceId = platformOverrides.allegro?.marketplace_id;
    const allegroAttrs = platformOverrides.allegro?.attributes;
    const allegroFieldOverrides = platformOverrides.allegro?.field_overrides;
    if (
      (allegroCategoryId !== undefined &&
        allegroCategoryId !== null &&
        String(allegroCategoryId).trim() !== '') ||
      (allegroCategoryPath && String(allegroCategoryPath).trim()) ||
      (allegroMarketplaceId && String(allegroMarketplaceId).trim()) ||
      (allegroAttrs && Object.keys(allegroAttrs).length > 0) ||
      (allegroFieldOverrides && Object.keys(allegroFieldOverrides).length > 0)
    ) {
      const parsedCategory = Number(allegroCategoryId);
      overrides.allegro = {};
      if (
        allegroCategoryId !== undefined &&
        allegroCategoryId !== null &&
        String(allegroCategoryId).trim() !== ''
      ) {
        overrides.allegro.category_id = Number.isNaN(parsedCategory)
          ? String(allegroCategoryId).trim()
          : parsedCategory;
      }
      if (allegroCategoryPath && String(allegroCategoryPath).trim()) {
        overrides.allegro.category_path = String(allegroCategoryPath).trim();
      }
      if (allegroMarketplaceId && String(allegroMarketplaceId).trim()) {
        overrides.allegro.marketplace_id = String(allegroMarketplaceId).trim();
      }
      if (allegroAttrs && Object.keys(allegroAttrs).length > 0) {
        overrides.allegro.attributes = allegroAttrs;
      }
      if (allegroFieldOverrides && Object.keys(allegroFieldOverrides).length > 0) {
        overrides.allegro.field_overrides = allegroFieldOverrides;
      }
    }

    // eBay overrides: marketplace_id + category_path/category_id + dynamic attributes
    const ebayMarketplace = platformOverrides.ebay?.marketplace_id;
    const ebayPath = platformOverrides.ebay?.category_path;
    const ebayCategoryId = platformOverrides.ebay?.category_id;
    const ebayAttrs = platformOverrides.ebay?.attributes;
    const ebayFieldOverrides = platformOverrides.ebay?.field_overrides;
    if ((ebayMarketplace && String(ebayMarketplace).trim()) ||
        (ebayPath && String(ebayPath).trim()) ||
        (ebayCategoryId && String(ebayCategoryId).trim()) ||
        (ebayAttrs && Object.keys(ebayAttrs).length > 0) ||
        (ebayFieldOverrides && Object.keys(ebayFieldOverrides).length > 0)) {
      overrides.ebay = {};
      if (ebayMarketplace && String(ebayMarketplace).trim()) {
        overrides.ebay.marketplace_id = String(ebayMarketplace).trim();
      }
      if (ebayPath && String(ebayPath).trim()) {
        overrides.ebay.category_path = String(ebayPath).trim();
      }
      if (ebayCategoryId && String(ebayCategoryId).trim()) {
        overrides.ebay.category_id = String(ebayCategoryId).trim();
      }
      if (ebayAttrs && Object.keys(ebayAttrs).length > 0) {
        overrides.ebay.attributes = ebayAttrs;
      }
      if (ebayFieldOverrides && Object.keys(ebayFieldOverrides).length > 0) {
        overrides.ebay.field_overrides = ebayFieldOverrides;
      }
    }

    return Object.keys(overrides).length > 0 ? overrides : undefined;
  };
  
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (isPublishingMode && selectedPlatforms.length === 0) {
    toast({
      title: t.toast.noPlatformsTitle,
      description: t.toast.noPlatformsDesc,
      variant: "destructive",
    });
    return;
  }

  setIsSubmitting(true);

  try {
    const platformOverridesPayload = buildPlatformOverridesPayload();

    if (!isPublishingMode) {
      const result = await submitEditDraft({
        editItemId,
        draftId: data.draft_id,
        data,
        platformOverridesPayload,
        marketplaceAttributes,
      });

      toast({
        title: t.toast.successTitle,
        description: t.toast.updateLocalSuccess,
      });

      setTimeout(() => {
        const params = new URLSearchParams({ updated: '1' });
        if (result.dirtyPlatforms.length > 0) {
          params.set('dirty', result.dirtyPlatforms.join(','));
        }
        navigate(`/user/items/${result.itemId}?${params.toString()}`);
      }, 1200);
      return;
    }

    const numericPrice = parseFloat(data.price);
    if (isNaN(numericPrice)) {
      throw new Error('Invalid price format');
    }

    // Deduplicate image URLs to avoid accidental duplicates
    const uniqueImageUrls = Array.from(new Set(data.images.map(img => img.url)));

    // UNIFIED PUBLISH FLOW: Always use /api/items/publish endpoint
    // Backend handles both new drafts and re-publishing via draft_id parameter
    const token = localStorage.getItem('flipit_token');
    
    // Build a clean payload the API will accept
    // Always use draft_id (from initialData or editItemId) to support re-publishing
    const payload: {
      draft_id?: string;
      images: string[];
      title: string;
      brand: string;
      condition: string;
      category: string;
      size?: string;
      price: number;
      currency: string;
      description: string;
      catalog_path?: string;
      platforms: Platform[];
      platform_listing_overrides?: PlatformOverrides;
      marketplace_attributes?: MarketplaceAttributes;
    } = {
      draft_id: data.draft_id || editItemId,
      images: uniqueImageUrls,
      title: data.title,
      brand: data.brand,
      condition: data.condition,
      category: data.category,
      size: data.size,
      price: numericPrice,
      currency: resolveCurrency(data.currency, language),
      description: data.description,
      catalog_path: data.catalog_path,
      platforms: selectedPlatforms,
    };

    if (platformOverridesPayload) {
      payload.platform_listing_overrides = platformOverridesPayload;
    }

    if (Object.keys(marketplaceAttributes).length > 0) {
      payload.marketplace_attributes = marketplaceAttributes;
    }

    const response = await fetch('/api/items/publish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      // Parse error response for insufficient credits (402)
      const error = await parseErrorResponse(response);
      const creditsError = parseInsufficientCreditsError(error);
      
      if (creditsError) {
        setInsufficientCreditsError({
          required: creditsError.required,
          available: creditsError.available,
        });
        return; // Don't throw, let the dialog handle it
      }

      const errorMessage =
        error?.data?.detail ||
        error?.data?.error ||
        'Failed to publish item';
      throw new Error(errorMessage);
    }

    const result = await response.json();

    if (result.platforms) {
      Object.entries(result.platforms).forEach(([platform, status]) => {
        if (status === "success") {
          toast({
            title: t.toast.successTitle,
            description: t.toast.publishedSuccess.replace('{platform}', platform),
          });
        } else {
          toast({
            title: t.toast.publishError.replace('{platform}', platform),
            description: String(status),
            variant: "destructive",
          });
        }
      });
    } else {
      toast({
        title: t.toast.successTitle,
        description: t.toast.generalSuccess,
      });
    }

    queryClient.invalidateQueries({ queryKey: ['credits'] });

    // Redirect to the published item's detail page
    if (result.uuid) {
      setTimeout(() => {
        navigate(`/user/items/${result.uuid}`);
      }, 1500);
    } else {
      // Fallback to user items list if UUID not provided
      setTimeout(() => {
        navigate('/user/items');
      }, 1500);
    }
    
  } catch (error) {
    console.error('Error publishing item:', error);
    const errorMessage =
      error instanceof Error && error.message && error.message !== 'Failed to publish item'
        ? error.message
        : t.toast.errorDesc;
    toast({
      title: t.toast.errorTitle,
      description: errorMessage,
      variant: "destructive",
    });
  } finally {
    setIsSubmitting(false);
  }
};

  const renderPlatformPreparation = () => {
    if (!showPlatformPreparation) {
      return null;
    }

    return (
      <div className="space-y-4 border-t border-neutral-700 pt-6">
        <h3 className="text-base sm:text-lg font-medium text-neutral-300">
          {isPublishingMode ? t.sections.publishPlatforms : 'Platform Preparation'}
        </h3>
        {!isPublishingMode && (
          <p className="text-sm text-neutral-400">
            Select platforms to configure category mapping and overrides for this edit session.
          </p>
        )}

        <div className="space-y-3">
          {platformSelectionOptions.map((typedPlatform) => {
            const isConnected = connectedPlatforms[typedPlatform];
            const isDisabled = isSubmitting || (isPublishingMode && !isConnected);
            const isSelected = selectedPlatforms.includes(typedPlatform);
            const platformName =
              t.platforms[typedPlatform] || typedPlatform.charAt(0).toUpperCase() + typedPlatform.slice(1);
            const reason = !isConnected
              ? `${platformName} is not connected yet. Connect it in platform settings before publishing.`
              : undefined;
            const platformOption = (
              <label
                key={typedPlatform}
                htmlFor={`platform-${typedPlatform}`}
                className={`flex items-center gap-3 p-4 rounded-lg border transition-all min-h-[56px] ${
                  isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                } ${
                  isSelected
                    ? 'bg-cyan-500/10 border-cyan-500/50'
                    : 'bg-neutral-800/30 border-neutral-700'
                }`}
              >
                <Checkbox
                  id={`platform-${typedPlatform}`}
                  checked={isSelected}
                  onCheckedChange={() => handlePlatformToggle(typedPlatform)}
                  disabled={isDisabled}
                  className="h-5 w-5"
                />
                <div className="flex-1">
                  <div className="font-medium text-base text-white">
                    {platformName}
                  </div>
                  {!isConnected && (
                    <div className="text-xs text-neutral-400">
                      {isPublishingMode ? 'Not connected' : 'Not connected (you can still preconfigure)'}
                    </div>
                  )}
                </div>
              </label>
            );
            if (!reason || !isPublishingMode) {
              return platformOption;
            }
            return (
              <TooltipProvider key={typedPlatform} delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>{platformOption}</div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs border-neutral-700 bg-neutral-900 text-neutral-200">
                    <p className="text-sm">{reason}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>

        {selectedPlatforms.length > 0 && (
          <PlatformCategoryBooks
            draftId={data.draft_id || editItemId}
            selectedPlatforms={selectedPlatforms}
            connectedPlatforms={connectedPlatforms}
            platformOverrides={platformOverrides}
            vintedSuggestedCatalogId={initialData.vinted_category_id}
            disabled={isSubmitting}
            onSetOlxCategory={(categoryId, categoryPath) =>
              updateOlxCategoryOverride(categoryId, categoryPath)
            }
            onSetAllegroCategory={(categoryId, marketplaceId, categoryPath) =>
              updateAllegroCategoryOverride(categoryId, marketplaceId, categoryPath)
            }
            onSetVintedCatalog={(catalogId) => {
              void handleSetVintedCatalog(catalogId);
            }}
          />
        )}

        {selectedPlatforms.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-medium text-neutral-300">
              Platform Listing Overrides
            </h3>
            <p className="text-sm text-neutral-400">
              Keep generic fields as defaults and override only where a platform needs custom wording or pricing.
            </p>
            <PlatformFieldOverridesSection
              selectedPlatforms={selectedPlatforms}
              platformOverrides={platformOverrides}
              baseValues={{
                title: data.title ?? '',
                description: data.description ?? '',
                price: data.price ?? '',
                currency: resolveCurrency(data.currency, language),
                brand: data.brand ?? '',
                condition: data.condition ?? '',
                category: data.category ?? '',
                size: data.size ?? '',
              }}
              disabled={isSubmitting}
              onFieldChange={updatePlatformFieldOverride}
              onClearPlatformOverrides={clearPlatformFieldOverrides}
            />
          </div>
        )}

        <div className="space-y-4 pt-2">
          <h3 className="text-base sm:text-lg font-medium text-neutral-300">
            Platform Attribute Overrides
          </h3>
          <p className="text-sm text-neutral-400">
            Fill required platform parameters after selecting categories in the category books.
          </p>

          <div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0">
            {selectedPlatforms.includes('olx') && (
              <PlatformOverrideCard
                platform="olx"
                platformLabel="OLX"
                isConnected={connectedPlatforms.olx}
                isDisabled={isSubmitting}
                categoryId={platformOverrides.olx?.category_id?.toString()}
                attributeValues={platformOverrides.olx?.attributes}
                onCategoryChange={() => undefined}
                onAttributeChange={(key, value) => updatePlatformAttribute('olx', key, value)}
                categoryLabel="OLX category"
                categoryInputMode="summary"
              />
            )}

            {selectedPlatforms.includes('vinted') && loadingMarketplaceAttributes.vinted && (
              <div className="rounded-lg border border-neutral-700 bg-neutral-800/60 p-4 text-sm text-neutral-300">
                Loading Vinted category attributes...
              </div>
            )}

            {selectedPlatforms.includes('vinted') &&
            !loadingMarketplaceAttributes.vinted &&
            marketplaceAttributes.vinted?.fields?.length ? (
              <MarketplaceAttributesPanel
                platform="vinted"
                platformLabel="Vinted"
                state={marketplaceAttributes.vinted}
                disabled={isSubmitting}
                onValueChange={handleMarketplaceAttributeChange}
              />
            ) : null}

            {selectedPlatforms.includes('vinted') &&
              !loadingMarketplaceAttributes.vinted &&
              platformOverrides.vinted?.catalog_id &&
              !marketplaceAttributes.vinted?.fields?.length && (
                <div className="rounded-lg border border-neutral-700 bg-neutral-800/60 p-4 text-sm text-neutral-400">
                  No Vinted category-specific attributes loaded for this category yet.
                </div>
              )}

            {selectedPlatforms.includes('ebay') && (
              <PlatformOverrideCard
                platform="ebay"
                platformLabel="eBay"
                isConnected={connectedPlatforms.ebay}
                isDisabled={isSubmitting}
                marketplaceId={platformOverrides.ebay?.marketplace_id?.toString()}
                categoryId={platformOverrides.ebay?.category_id?.toString() || platformOverrides.ebay?.category_path}
                attributeValues={platformOverrides.ebay?.attributes}
                onCategoryChange={(value) => updatePlatformOverride('ebay', 'category_id', value)}
                onAttributeChange={(key, value) => updatePlatformAttribute('ebay', key, value)}
                categoryLabel={t.labels?.ebayCategoryPath || 'eBay Category ID'}
                categoryPlaceholder="e.g., 175673"
              />
            )}

            {selectedPlatforms.includes('allegro') && (
              <PlatformOverrideCard
                platform="allegro"
                platformLabel="Allegro"
                isConnected={connectedPlatforms.allegro}
                isDisabled={isSubmitting}
                marketplaceId={platformOverrides.allegro?.marketplace_id?.toString() || 'allegro-pl'}
                categoryId={platformOverrides.allegro?.category_id?.toString()}
                attributeValues={platformOverrides.allegro?.attributes}
                onCategoryChange={() => undefined}
                onAttributeChange={(key, value) => updatePlatformAttribute('allegro', key, value)}
                categoryLabel={t.labels?.allegroCategoryId || 'Allegro Category ID'}
                categoryPlaceholder="e.g., 175673"
                categoryInputMode="summary"
              />
            )}
          </div>
        </div>

        {isPublishingMode && selectedPlatforms.length > 0 && (
          <div className="bg-gradient-to-r from-cyan-500/10 to-fuchsia-500/10 border border-cyan-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-cyan-400" />
                <span className="text-sm font-medium text-neutral-300">Publishing cost:</span>
              </div>
              <span className="text-lg font-bold text-cyan-400">
                1 credit
              </span>
            </div>
          </div>
        )}

        {isPublishingMode && selectedPlatforms.length > 0 && hasInsufficientPublishCredits && (
          <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-red-400 font-medium">Not Enough Listings</p>
              <p className="text-neutral-300 text-xs mt-1">
                You have {credits?.publish_remaining} {credits?.publish_remaining === 1 ? 'listing' : 'listings'} left but need 1 listing to publish this item to {selectedPlatforms.length} {selectedPlatforms.length === 1 ? 'platform' : 'platforms'}. Upgrade your plan to continue.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h3 className="text-lg font-medium mb-4 text-neutral-300">{t.sections.images}</h3>
        <ImageUploader 
          images={data.images} 
          onChange={(images) => updateField('images', images)} 
          isDisabled={isSubmitting}
        />
      </div>

      {renderPlatformPreparation()}
      
      <div className="space-y-4">
        <h3 className="text-base sm:text-lg font-medium text-neutral-300">{t.sections.itemDetails}</h3>
        
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium text-neutral-300">{t.labels.title}</Label>
          <Input 
            id="title"
            value={data.title}
            onChange={(e) => updateField('title', e.target.value)}
            disabled={isSubmitting}
            required
            className="h-12 text-base"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium text-neutral-300">{t.labels.description}</Label>
          <Textarea 
            id="description" 
            value={data.description}
            onChange={(e) => updateField('description', e.target.value)}
            className="min-h-[200px] sm:min-h-[150px] text-base resize-y"
            disabled={isSubmitting}
            required
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="brand" className="text-sm font-medium text-neutral-300">{t.labels.brand}</Label>
            <Input
              id="brand"
              value={data.brand ?? ''}
              onChange={(e) => updateField('brand', e.target.value)}
              disabled={isSubmitting}
              className="h-12 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="condition" className="text-sm font-medium text-neutral-300">{t.labels.condition}</Label>
            <Input
              id="condition"
              value={data.condition ?? ''}
              onChange={(e) => updateField('condition', e.target.value)}
              disabled={isSubmitting}
              className="h-12 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium text-neutral-300">{t.labels.category}</Label>
            <Input
              id="category"
              value={data.category ?? ''}
              onChange={(e) => updateField('category', e.target.value)}
              disabled={isSubmitting}
              className="h-12 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="size" className="text-sm font-medium text-neutral-300">{t.labels.size}</Label>
            <Input
              id="size"
              value={data.size ?? ''}
              onChange={(e) => updateField('size', e.target.value)}
              disabled={isSubmitting}
              className="h-12 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price" className="text-sm font-medium text-neutral-300">{t.labels.price}</Label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_140px]">
              <Input
                id="price"
                type="number"
                value={data.price}
                onChange={(e) => updateField('price', e.target.value)}
                disabled={isSubmitting}
                required
                className="h-12 text-base"
                inputMode="decimal"
              />
              <Select
                value={resolveCurrency(data.currency, language)}
                onValueChange={(value) => updateField('currency', value)}
                disabled={isSubmitting}
              >
                <SelectTrigger className="h-12 bg-neutral-950/60 border-neutral-700 text-white">
                  <SelectValue placeholder={defaultCurrency} />
                </SelectTrigger>
                <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                  {SUPPORTED_CURRENCIES.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {data.priceRange.min && data.priceRange.max && (
              <p className="text-xs text-slate-500 mt-1">
                {t.helper.priceRange
                  .replace('{min}', data.priceRange.min)
                  .replace('{max}', data.priceRange.max)
                  .replace('{currency}', resolveCurrency(data.currency, language))}
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* Sticky Action Buttons - Mobile Optimized */}
      <div className="fixed bottom-0 left-0 right-0 bg-neutral-950/95 backdrop-blur-sm border-t border-neutral-800 p-4 sm:relative sm:bg-transparent sm:border-0 sm:p-0 z-50">
        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-between max-w-7xl mx-auto">
          <BackButtonGhost
            type="button" 
            onClick={onBack} 
            disabled={isSubmitting}
            className="h-12 sm:h-10 w-full sm:w-auto text-base sm:text-sm"
          >
            {t.buttons.back}
          </BackButtonGhost>
          
          <AddItemButton
            type="submit" 
            sizeVariant="md"
            disabled={
              isSubmitting || 
              (isPublishingMode &&
                (selectedPlatforms.length === 0 ||
                  hasInsufficientPublishCredits))
            }
            className="h-12 sm:h-10 w-full sm:w-auto text-base sm:text-sm font-semibold"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 sm:h-4 sm:w-4 animate-spin" />
                {isPublishingMode ? t.buttons.publishing : t.buttons.updating}
              </>
            ) : isPublishingMode && hasInsufficientPublishCredits ? (
              <>
                <CreditCard className="mr-2 h-5 w-5 sm:h-4 sm:w-4" /> Insufficient Credits
              </>
            ) : (
              isPublishingMode ? t.buttons.publish : t.buttons.update
            )}
          </AddItemButton>
        </div>
      </div>
      
      {/* Insufficient Credits Dialog */}
      <InsufficientCreditsAlert
        open={!!insufficientCreditsError}
        onOpenChange={(open) => !open && setInsufficientCreditsError(null)}
        required={insufficientCreditsError?.required || 1}
        available={insufficientCreditsError?.available || 0}
      />
    </form>
  );
};

export default ReviewItemForm;
