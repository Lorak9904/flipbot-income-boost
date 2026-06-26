import { useEffect, useMemo, useState } from 'react';
import { 
  GeneratedItemData, 
  GeneratedItemDataWithVinted, 
  ItemImage, 
  MarketplaceAttributeField,
  MarketplaceAttributes,
  MarketplaceAttributeValue,
  Platform, 
  PlatformDynamicAttributeValue,
  PlatformFieldOverrides,
  PlatformOverrides
} from '@/types/item';
import { useToast } from '@/hooks/use-toast';
import { AddItemButton, BackButtonGhost, SecondaryAction } from '@/components/ui/button-presets';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import type { PlatformHealthResponse } from '@/lib/api/platform-health';
import {
  getDefaultSelectedPlatforms,
  getPlatformSelectionOptions,
  isPublishMode,
} from './review-item-form-mode';
import { submitEditDraft } from './review-item/submit-edit';
import { getVintedCategoryAttributes } from '@/lib/api/vinted';
import type { AllegroProductSearchResult } from '@/lib/api/allegro';
import { SUPPORTED_CURRENCIES, resolveCurrency } from '@/lib/currency';
import { syncPlatformListings, type RegeneratableItemField } from '@/lib/api/items';
import { AiFieldRegenerationControl } from '@/components/listing-editor/AiFieldRegenerationControl';

interface ReviewItemFormProps {
  initialData: GeneratedItemDataWithVinted;
  mode: ReviewItemFormMode;
  connectedPlatforms: Record<Platform, boolean>;
  platformHealth?: PlatformHealthResponse['platforms'] | null;
  onBack: () => void;
  language?: string;
  editItemId?: string;
  publishedPlatforms?: Platform[];
  publishPlatform?: Platform;
}

const formatAllegroProductCategoryPath = (product: AllegroProductSearchResult): string => {
  const path = product.category?.path?.map((row) => row.name).filter(Boolean).join(' > ');
  return path || product.category?.id || '';
};

const MARKETPLACE_UPDATE_PLATFORMS: Platform[] = ['olx', 'ebay', 'allegro', 'etsy'];

const ReviewItemForm = ({
  initialData,
  mode,
  connectedPlatforms,
  platformHealth,
  onBack,
  language,
  editItemId,
  publishedPlatforms = [],
  publishPlatform,
}: ReviewItemFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitIntent, setSubmitIntent] = useState<'save' | 'saveAndUpdate' | 'publish' | null>(null);
  const [regeneratingField, setRegeneratingField] = useState<RegeneratableItemField | null>(null);
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
      return base.filter((platform) => connectedPlatforms[platform]);
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
  const publishedMarketplaceUpdatePlatforms = useMemo(
    () => MARKETPLACE_UPDATE_PLATFORMS.filter((platform) => publishedPlatforms.includes(platform)),
    [publishedPlatforms]
  );
  const canSaveAndUpdateMarketplaces = !!editItemId && publishedMarketplaceUpdatePlatforms.length > 0;
  const saveAndUpdateLabel =
    publishedMarketplaceUpdatePlatforms.length === 1
      ? t.buttons.saveAndUpdateMarketplace.replace(
          '{platform}',
          t.platforms[publishedMarketplaceUpdatePlatforms[0]]
        )
      : t.buttons.saveAndUpdateMarketplaces;
  const showPlatformPreparation = platformSelectionOptions.length > 0;
  const isSaving = isSubmitting && submitIntent === 'save';
  const isSavingAndUpdating = isSubmitting && submitIntent === 'saveAndUpdate';
  const isPublishing = isSubmitting && submitIntent === 'publish';
  
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
      etsy: overrides.etsy ? { ...overrides.etsy } : undefined,
    };
  });
  const [pendingOlxCountryCode, setPendingOlxCountryCode] = useState<string | null>(null);
  const olxConnectedAccounts = useMemo(
    () =>
      (platformHealth?.olx?.accounts || []).filter(
        (account) =>
          !!account.country_code &&
          (account.connected || account.stored) &&
          account.status !== 'expired' &&
          account.status !== 'invalid'
      ),
    [platformHealth]
  );
  const defaultOlxAccount = useMemo(
    () => olxConnectedAccounts.find((account) => account.is_default) || olxConnectedAccounts[0],
    [olxConnectedAccounts]
  );
  const selectedOlxCountryCode = useMemo(
    () =>
      String(
        platformOverrides.olx?.country_code ||
          platformOverrides.olx?.country ||
          defaultOlxAccount?.country_code ||
          'PL'
      ).toUpperCase(),
    [defaultOlxAccount?.country_code, platformOverrides.olx?.country, platformOverrides.olx?.country_code]
  );
  const selectedOlxAccount = useMemo(
    () => olxConnectedAccounts.find((account) => account.country_code === selectedOlxCountryCode),
    [olxConnectedAccounts, selectedOlxCountryCode]
  );
  const selectedOlxCountryLabel = selectedOlxAccount?.country_name
    ? `${selectedOlxAccount.country_name} (${selectedOlxCountryCode})`
    : selectedOlxCountryCode;
  const hasOlxCountrySpecificData = useMemo(() => {
    const olxOverrides = platformOverrides.olx;
    if (!olxOverrides) {
      return false;
    }

    const hasCategory =
      olxOverrides.category_id !== undefined &&
      olxOverrides.category_id !== null &&
      String(olxOverrides.category_id).trim() !== '';
    const hasCategoryPath = Boolean(olxOverrides.category_path?.trim());
    const hasAttributes = Boolean(
      olxOverrides.attributes && Object.keys(olxOverrides.attributes).length > 0
    );

    return hasCategory || hasCategoryPath || hasAttributes;
  }, [platformOverrides.olx]);
  
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

  const fieldIsRegenerating = (field: RegeneratableItemField) => regeneratingField === field;

  const applyRegeneratedField = (field: RegeneratableItemField, value: string) => {
    if (field === 'title') updateField('title', value);
    if (field === 'description') updateField('description', value);
    if (field === 'brand') updateField('brand', value);
    if (field === 'condition') updateField('condition', value);
    if (field === 'category') updateField('category', value);
    if (field === 'size') updateField('size', value);
  };

  const regenerationContext = useMemo(
    () => ({
      title: data.title,
      description: data.description,
      brand: data.brand,
      condition: data.condition,
      category: data.category,
      size: data.size,
      price: data.price,
      currency: resolveCurrency(data.currency, language),
      catalog_path: data.catalog_path,
    }),
    [
      data.title,
      data.description,
      data.brand,
      data.condition,
      data.category,
      data.size,
      data.price,
      data.currency,
      data.catalog_path,
      language,
    ]
  );

  const renderAiFieldLabel = (
    field: RegeneratableItemField,
    htmlFor: string,
    label: string
  ) => (
    <div className="flex items-center justify-between gap-2">
      <Label htmlFor={htmlFor} className="text-sm font-medium text-neutral-300">
        {label}
      </Label>
      <AiFieldRegenerationControl
        itemId={editItemId || data.draft_id}
        field={field}
        fieldLabel={label}
        language={language}
        context={regenerationContext}
        disabled={isSubmitting || (!!regeneratingField && !fieldIsRegenerating(field))}
        onLoadingChange={(loading) => setRegeneratingField(loading ? field : null)}
        onRegenerated={(value) => applyRegeneratedField(field, value)}
      />
    </div>
  );
  
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
    platform: 'olx' | 'vinted' | 'ebay' | 'allegro' | 'etsy',
    field: string,
    value: string
  ) => {
    setPlatformOverrides(prev => {
      const existing = prev[platform];
      const existingOverrides =
        existing && typeof existing === 'object' ? (existing as Record<string, unknown>) : {};
      const nextOverrides: Record<string, unknown> = {
        ...existingOverrides,
        [field]: value,
      };

      if (
        (platform === 'ebay' || platform === 'etsy') &&
        (field === 'category_id' || field === 'taxonomy_id' || field === 'marketplace_id') &&
        String(existingOverrides[field] || '') !== value
      ) {
        delete nextOverrides.attributes;
      }

      return {
        ...prev,
        [platform]: nextOverrides,
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

  const applyOlxCountryOverride = (countryCode: string) => {
    const nextCountry = countryCode.trim().toUpperCase();
    if (!nextCountry) {
      return;
    }

    setPlatformOverrides((prev) => {
      const existing = prev.olx;
      const existingOverrides =
        existing && typeof existing === 'object' ? (existing as Record<string, unknown>) : {};
      const previousCountry = String(
        existingOverrides.country_code || existingOverrides.country || selectedOlxCountryCode
      ).toUpperCase();
      const nextOlxOverrides: Record<string, unknown> = {
        ...existingOverrides,
        country_code: nextCountry,
      };

      if (previousCountry && previousCountry !== nextCountry) {
        delete nextOlxOverrides.category_id;
        delete nextOlxOverrides.category_path;
        delete nextOlxOverrides.attributes;
      }

      return {
        ...prev,
        olx: nextOlxOverrides,
      };
    });
  };

  const updateOlxCountryOverride = (countryCode: string) => {
    const nextCountry = countryCode.trim().toUpperCase();
    if (!nextCountry || nextCountry === selectedOlxCountryCode) {
      return;
    }

    if (hasOlxCountrySpecificData) {
      setPendingOlxCountryCode(nextCountry);
      return;
    }

    applyOlxCountryOverride(nextCountry);
  };

  const confirmOlxCountryChange = () => {
    if (pendingOlxCountryCode) {
      applyOlxCountryOverride(pendingOlxCountryCode);
    }
    setPendingOlxCountryCode(null);
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

  const updateAllegroProductSelection = (product: AllegroProductSearchResult | null) => {
    setPlatformOverrides((prev) => {
      const existing = prev.allegro;
      const existingOverrides =
        existing && typeof existing === 'object' ? (existing as Record<string, unknown>) : {};

      if (!product) {
        const nextAllegroOverrides = { ...existingOverrides };
        delete nextAllegroOverrides.product_id;
        delete nextAllegroOverrides.product_name;
        delete nextAllegroOverrides.product_image_url;
        delete nextAllegroOverrides.product_category_path;
        delete nextAllegroOverrides.product_parameters;

        return {
          ...prev,
          allegro: nextAllegroOverrides,
        };
      }

      const categoryId = product.category?.id || existingOverrides.category_id;
      const categoryPath = formatAllegroProductCategoryPath(product);
      const nextAllegroOverrides: Record<string, unknown> = {
        ...existingOverrides,
        product_id: product.id,
        product_name: product.name,
        product_image_url: product.images?.[0]?.url || '',
        product_category_path: categoryPath,
        product_parameters: (product.parameters || []).map((parameter) => ({
          id: parameter.id,
          name: parameter.name,
          values: parameter.values,
          valuesIds: parameter.valuesIds,
          valuesLabels: parameter.valuesLabels,
          unit: parameter.unit,
          options: parameter.options,
        })),
      };

      if (categoryId) {
        nextAllegroOverrides.category_id = String(categoryId);
      }
      if (categoryPath) {
        nextAllegroOverrides.category_path = categoryPath;
      }
      if (!nextAllegroOverrides.marketplace_id) {
        nextAllegroOverrides.marketplace_id = 'allegro-pl';
      }

      return {
        ...prev,
        allegro: nextAllegroOverrides,
      };
    });
  };

  const updateEtsyCategoryOverride = (
    categoryId: string | number,
    categoryPath?: string
  ) => {
    setPlatformOverrides((prev) => {
      const existing = prev.etsy;
      const existingOverrides =
        existing && typeof existing === 'object' ? (existing as Record<string, unknown>) : {};
      const nextEtsyOverrides: Record<string, unknown> = {
        ...existingOverrides,
        taxonomy_id: String(categoryId),
        category_id: String(categoryId),
      };

      if (categoryPath && categoryPath.trim()) {
        nextEtsyOverrides.category_path = categoryPath.trim();
      } else {
        delete nextEtsyOverrides.category_path;
      }
      delete nextEtsyOverrides.attributes;

      return {
        ...prev,
        etsy: nextEtsyOverrides,
      };
    });
  };

  const updatePlatformFieldOverride = (
    platform: 'olx' | 'vinted' | 'ebay' | 'allegro' | 'etsy',
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

  const clearPlatformFieldOverrides = (platform: 'olx' | 'vinted' | 'ebay' | 'allegro' | 'etsy') => {
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
    platform: 'olx' | 'ebay' | 'allegro' | 'etsy',
    key: string,
    value: PlatformDynamicAttributeValue
  ) => {
    setPlatformOverrides(prev => {
      const existing = prev[platform] || {};
      const existingAttrs =
        ((existing as Record<string, unknown>).attributes as Record<string, PlatformDynamicAttributeValue>) || {};
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
      if (!['olx', 'vinted', 'ebay', 'allegro', 'etsy'].includes(key)) {
        overrides[key] = value as unknown;
      }
    });

    // OLX overrides: category_id + dynamic attributes
    const olxCategory = platformOverrides.olx?.category_id;
    const olxCategoryPath = platformOverrides.olx?.category_path;
    const olxAttrs = platformOverrides.olx?.attributes;
    const olxFieldOverrides = platformOverrides.olx?.field_overrides;
    const explicitOlxCountry = platformOverrides.olx?.country_code || platformOverrides.olx?.country;
    const olxCountry =
      explicitOlxCountry ||
      (selectedPlatforms.includes('olx') && olxConnectedAccounts.length > 0 ? selectedOlxCountryCode : '');
    if ((olxCountry && String(olxCountry).trim()) ||
        (olxCategory !== undefined && olxCategory !== null && String(olxCategory).trim() !== '') ||
        (olxCategoryPath && String(olxCategoryPath).trim()) ||
        (olxAttrs && Object.keys(olxAttrs).length > 0) ||
        (olxFieldOverrides && Object.keys(olxFieldOverrides).length > 0)) {
      const parsed = Number(olxCategory);
      overrides.olx = {};
      if (olxCountry && String(olxCountry).trim()) {
        overrides.olx.country_code = String(olxCountry).trim().toUpperCase();
      }
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
    const allegroProductId = platformOverrides.allegro?.product_id;
    const allegroProductName = platformOverrides.allegro?.product_name;
    const allegroProductImageUrl = platformOverrides.allegro?.product_image_url;
    const allegroProductCategoryPath = platformOverrides.allegro?.product_category_path;
    const allegroProductParameters = platformOverrides.allegro?.product_parameters;
    if (
      (allegroCategoryId !== undefined &&
        allegroCategoryId !== null &&
        String(allegroCategoryId).trim() !== '') ||
      (allegroCategoryPath && String(allegroCategoryPath).trim()) ||
      (allegroMarketplaceId && String(allegroMarketplaceId).trim()) ||
      (allegroProductId && String(allegroProductId).trim()) ||
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
      if (allegroProductId && String(allegroProductId).trim()) {
        overrides.allegro.product_id = String(allegroProductId).trim();
      }
      if (allegroProductName && String(allegroProductName).trim()) {
        overrides.allegro.product_name = String(allegroProductName).trim();
      }
      if (allegroProductImageUrl && String(allegroProductImageUrl).trim()) {
        overrides.allegro.product_image_url = String(allegroProductImageUrl).trim();
      }
      if (allegroProductCategoryPath && String(allegroProductCategoryPath).trim()) {
        overrides.allegro.product_category_path = String(allegroProductCategoryPath).trim();
      }
      if (allegroProductParameters && allegroProductParameters.length > 0) {
        overrides.allegro.product_parameters = allegroProductParameters;
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

    // Etsy overrides: taxonomy_id/category_id + seller taxonomy property values
    const etsyTaxonomyId = platformOverrides.etsy?.taxonomy_id || platformOverrides.etsy?.category_id;
    const etsyCategoryPath = platformOverrides.etsy?.category_path;
    const etsyAttrs = platformOverrides.etsy?.attributes || platformOverrides.etsy?.attribute_values;
    const etsyFieldOverrides = platformOverrides.etsy?.field_overrides;
    if (
      (etsyTaxonomyId !== undefined &&
        etsyTaxonomyId !== null &&
        String(etsyTaxonomyId).trim() !== '') ||
      (etsyCategoryPath && String(etsyCategoryPath).trim()) ||
      (etsyAttrs && Object.keys(etsyAttrs).length > 0) ||
      (etsyFieldOverrides && Object.keys(etsyFieldOverrides).length > 0)
    ) {
      overrides.etsy = {};
      if (
        etsyTaxonomyId !== undefined &&
        etsyTaxonomyId !== null &&
        String(etsyTaxonomyId).trim() !== ''
      ) {
        overrides.etsy.taxonomy_id = String(etsyTaxonomyId).trim();
        overrides.etsy.category_id = String(etsyTaxonomyId).trim();
      }
      if (etsyCategoryPath && String(etsyCategoryPath).trim()) {
        overrides.etsy.category_path = String(etsyCategoryPath).trim();
      }
      if (etsyAttrs && Object.keys(etsyAttrs).length > 0) {
        overrides.etsy.attributes = etsyAttrs;
      }
      if (etsyFieldOverrides && Object.keys(etsyFieldOverrides).length > 0) {
        overrides.etsy.field_overrides = etsyFieldOverrides;
      }
    }

    return Object.keys(overrides).length > 0 ? overrides : undefined;
  };

  const buildSavedItemUrl = (itemId: string, dirtyPlatforms: Platform[] = []) => {
    const params = new URLSearchParams();
    if (dirtyPlatforms.length > 0) {
      params.set('updated', '1');
      params.set('dirty', dirtyPlatforms.join(','));
    }
    const query = params.toString();
    return `/user/items/${itemId}${query ? `?${query}` : ''}`;
  };

  const saveEditedItem = async () => {
    const platformOverridesPayload = buildPlatformOverridesPayload();
    return submitEditDraft({
      editItemId,
      draftId: data.draft_id,
      data,
      platformOverridesPayload,
      marketplaceAttributes,
    });
  };

  const saveLocalChanges = async () => {
    const result = await saveEditedItem();
    toast({
      title: t.toast.successTitle,
      description: t.toast.updateLocalSuccess,
    });

    setTimeout(() => {
      navigate(buildSavedItemUrl(result.itemId, result.dirtyPlatforms));
    }, 1200);
  };

  const saveAndUpdateMarketplaceChanges = async () => {
    const result = await saveEditedItem();
    if (result.dirtyPlatforms.length === 0) {
      toast({
        title: t.toast.successTitle,
        description: t.toast.saveAndUpdateNoMarketplaceChanges,
      });
      setTimeout(() => {
        navigate(buildSavedItemUrl(result.itemId));
      }, 1200);
      return;
    }

    try {
      const updateResponse = await syncPlatformListings(result.itemId, result.dirtyPlatforms);
      const failedPlatforms = result.dirtyPlatforms.filter(
        (platform) => updateResponse.results?.[platform]?.status !== 'success'
      );
      const succeededCount = result.dirtyPlatforms.length - failedPlatforms.length;
      const platformNames = result.dirtyPlatforms
        .map((platform) => t.platforms[platform])
        .join(', ');

      if (failedPlatforms.length === 0) {
        toast({
          title: t.toast.saveAndUpdateSuccess,
          description: t.toast.saveAndUpdateSuccessDesc.replace('{platforms}', platformNames),
        });
        setTimeout(() => {
          navigate(buildSavedItemUrl(result.itemId));
        }, 1200);
        return;
      }

      const failedNames = failedPlatforms.map((platform) => t.platforms[platform]).join(', ');
      toast({
        title:
          succeededCount > 0
            ? t.toast.saveAndUpdatePartial
            : t.toast.saveAndUpdateMarketplaceError,
        description: t.toast.saveAndUpdateFailedDesc.replace('{platforms}', failedNames),
        variant: 'destructive',
      });
      setTimeout(() => {
        navigate(buildSavedItemUrl(result.itemId, failedPlatforms));
      }, 1600);
    } catch (error) {
      toast({
        title: t.toast.saveAndUpdateMarketplaceError,
        description: error instanceof Error ? error.message : t.toast.errorDesc,
        variant: 'destructive',
      });
      setTimeout(() => {
        navigate(buildSavedItemUrl(result.itemId, result.dirtyPlatforms));
      }, 1600);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (regeneratingField) {
      return;
    }

    if (isPublishingMode && selectedPlatforms.length === 0) {
      toast({
        title: t.toast.noPlatformsTitle,
        description: t.toast.noPlatformsDesc,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitIntent(isPublishingMode ? 'publish' : 'save');

    try {
      if (!isPublishingMode) {
        await saveLocalChanges();
        return;
      }

      const platformOverridesPayload = buildPlatformOverridesPayload();
      const numericPrice = parseFloat(data.price);
      if (isNaN(numericPrice)) {
        throw new Error('Invalid price format');
      }

      const uniqueImageUrls = Array.from(new Set(data.images.map(img => img.url)));
      const token = localStorage.getItem('flipit_token');
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
        const error = await parseErrorResponse(response);
        const creditsError = parseInsufficientCreditsError(error);

        if (creditsError) {
          setInsufficientCreditsError({
            required: creditsError.required,
            available: creditsError.available,
          });
          return;
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

      if (result.uuid) {
        setTimeout(() => {
          navigate(`/user/items/${result.uuid}`);
        }, 1500);
      } else {
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
      setSubmitIntent(null);
    }
  };

  const handleSaveChanges = async () => {
    if (regeneratingField) {
      return;
    }

    setIsSubmitting(true);
    setSubmitIntent('save');

    try {
      await saveLocalChanges();
    } catch (error) {
      console.error('Error saving item:', error);
      const errorMessage = error instanceof Error ? error.message : t.toast.errorDesc;
      toast({
        title: t.toast.errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setSubmitIntent(null);
    }
  };

  const handleSaveAndUpdateChanges = async () => {
    if (!canSaveAndUpdateMarketplaces || regeneratingField) {
      return;
    }

    setIsSubmitting(true);
    setSubmitIntent('saveAndUpdate');

    try {
      await saveAndUpdateMarketplaceChanges();
    } catch (error) {
      console.error('Error saving and updating item:', error);
      const errorMessage = error instanceof Error ? error.message : t.toast.errorDesc;
      toast({
        title: t.toast.errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setSubmitIntent(null);
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

        {selectedPlatforms.includes('olx') && (
          <div className="rounded-lg border border-neutral-700 bg-neutral-900/50 p-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_220px] sm:items-center">
              <div>
                <Label className="text-sm font-medium text-neutral-200">OLX country</Label>
                <p className="mt-1 text-xs text-neutral-400">
                  {olxConnectedAccounts.length > 0
                    ? 'Used for OLX category data, required attributes, and publishing to the selected country.'
                    : 'No OLX country connected yet. You can prepare OLX details now, but publishing requires a connected country.'}
                </p>
              </div>
              {olxConnectedAccounts.length > 1 ? (
                <Select
                  value={selectedOlxCountryCode}
                  onValueChange={updateOlxCountryOverride}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="bg-neutral-950/60 border-neutral-700 text-white">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                    {olxConnectedAccounts.map((account) => (
                      <SelectItem key={account.country_code} value={account.country_code || 'PL'}>
                        {account.country_name || account.country_code}
                        {account.is_default ? ' (default)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : olxConnectedAccounts.length === 1 ? (
                <div className="flex items-center justify-between gap-3 rounded-md border border-neutral-700 bg-neutral-950/60 px-3 py-2 text-sm text-neutral-200">
                  <span>{selectedOlxCountryLabel}</span>
                  <span className="shrink-0 text-xs text-neutral-500">
                    {defaultOlxAccount?.country_code === selectedOlxCountryCode
                      ? 'Default country'
                      : 'Connected country'}
                  </span>
                </div>
              ) : (
                <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
                  Not connected yet
                </div>
              )}
            </div>
          </div>
        )}

        {selectedPlatforms.length > 0 && (
          <PlatformCategoryBooks
            draftId={data.draft_id || editItemId}
            selectedPlatforms={selectedPlatforms}
            connectedPlatforms={connectedPlatforms}
            platformOverrides={platformOverrides}
            olxCountryCode={selectedOlxCountryCode}
            vintedSuggestedCatalogId={initialData.vinted_category_id}
            disabled={isSubmitting}
            onSetOlxCategory={(categoryId, categoryPath) =>
              updateOlxCategoryOverride(categoryId, categoryPath)
            }
            onSetAllegroCategory={(categoryId, marketplaceId, categoryPath) =>
              updateAllegroCategoryOverride(categoryId, marketplaceId, categoryPath)
            }
            onSetEtsyCategory={(categoryId, categoryPath) =>
              updateEtsyCategoryOverride(categoryId, categoryPath)
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
                countryCode={selectedOlxCountryCode}
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
                allegroSearchPhrase={data.title}
                selectedAllegroProduct={
                  platformOverrides.allegro?.product_id
                    ? {
                        id: platformOverrides.allegro.product_id,
                        name: platformOverrides.allegro.product_name,
                        imageUrl: platformOverrides.allegro.product_image_url,
                        categoryPath:
                          platformOverrides.allegro.product_category_path ||
                          platformOverrides.allegro.category_path,
                      }
                    : null
                }
                onAllegroProductSelect={updateAllegroProductSelection}
                onAllegroProductClear={() => updateAllegroProductSelection(null)}
              />
            )}

            {selectedPlatforms.includes('etsy') && (
              <PlatformOverrideCard
                platform="etsy"
                platformLabel="Etsy"
                isConnected={connectedPlatforms.etsy}
                isDisabled={isSubmitting}
                categoryId={
                  platformOverrides.etsy?.taxonomy_id?.toString() ||
                  platformOverrides.etsy?.category_id?.toString()
                }
                attributeValues={platformOverrides.etsy?.attributes}
                onCategoryChange={() => undefined}
                onAttributeChange={(key, value) => updatePlatformAttribute('etsy', key, value)}
                categoryLabel="Etsy category"
                categoryPlaceholder="Choose an Etsy category above"
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
          {renderAiFieldLabel('title', 'title', t.labels.title)}
          <Input 
            id="title"
            value={data.title}
            onChange={(e) => updateField('title', e.target.value)}
            disabled={isSubmitting || fieldIsRegenerating('title')}
            required
            className={`h-12 text-base ${fieldIsRegenerating('title') ? 'opacity-60' : ''}`}
          />
        </div>
        
        <div className="space-y-2">
          {renderAiFieldLabel('description', 'description', t.labels.description)}
          <Textarea 
            id="description" 
            value={data.description}
            onChange={(e) => updateField('description', e.target.value)}
            className={`min-h-[200px] sm:min-h-[150px] text-base resize-y ${fieldIsRegenerating('description') ? 'opacity-60' : ''}`}
            disabled={isSubmitting || fieldIsRegenerating('description')}
            required
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            {renderAiFieldLabel('brand', 'brand', t.labels.brand)}
            <Input
              id="brand"
              value={data.brand ?? ''}
              onChange={(e) => updateField('brand', e.target.value)}
              disabled={isSubmitting || fieldIsRegenerating('brand')}
              className={`h-12 text-base ${fieldIsRegenerating('brand') ? 'opacity-60' : ''}`}
            />
          </div>

          <div className="space-y-2">
            {renderAiFieldLabel('condition', 'condition', t.labels.condition)}
            <Input
              id="condition"
              value={data.condition ?? ''}
              onChange={(e) => updateField('condition', e.target.value)}
              disabled={isSubmitting || fieldIsRegenerating('condition')}
              className={`h-12 text-base ${fieldIsRegenerating('condition') ? 'opacity-60' : ''}`}
            />
          </div>

          <div className="space-y-2">
            {renderAiFieldLabel('category', 'category', t.labels.category)}
            <Input
              id="category"
              value={data.category ?? ''}
              onChange={(e) => updateField('category', e.target.value)}
              disabled={isSubmitting || fieldIsRegenerating('category')}
              className={`h-12 text-base ${fieldIsRegenerating('category') ? 'opacity-60' : ''}`}
            />
          </div>

          <div className="space-y-2">
            {renderAiFieldLabel('size', 'size', t.labels.size)}
            <Input
              id="size"
              value={data.size ?? ''}
              onChange={(e) => updateField('size', e.target.value)}
              disabled={isSubmitting || fieldIsRegenerating('size')}
              className={`h-12 text-base ${fieldIsRegenerating('size') ? 'opacity-60' : ''}`}
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
            disabled={isSubmitting || !!regeneratingField}
            className="h-12 sm:h-10 w-full sm:w-auto text-base sm:text-sm"
          >
            {t.buttons.back}
          </BackButtonGhost>
          
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            {(mode === 'republish' || (!isPublishingMode && canSaveAndUpdateMarketplaces)) && (
              <SecondaryAction
                type="button"
                onClick={handleSaveChanges}
                disabled={isSubmitting || !!regeneratingField}
                className="h-12 min-h-0 px-6 py-2 sm:h-10 text-base sm:text-sm font-semibold"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 sm:h-4 sm:w-4 animate-spin" />
                    {t.buttons.saving}
                  </>
                ) : (
                  t.buttons.saveChanges
                )}
              </SecondaryAction>
            )}

            {canSaveAndUpdateMarketplaces && isPublishingMode && (
              <SecondaryAction
                type="button"
                onClick={handleSaveAndUpdateChanges}
                disabled={isSubmitting || !!regeneratingField}
                className="h-12 min-h-0 px-6 py-2 sm:h-10 text-base sm:text-sm font-semibold"
              >
                {isSavingAndUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 sm:h-4 sm:w-4 animate-spin" />
                    {t.buttons.savingAndUpdating}
                  </>
                ) : (
                  saveAndUpdateLabel
                )}
              </SecondaryAction>
            )}

            {canSaveAndUpdateMarketplaces && !isPublishingMode && (
              <AddItemButton
                type="button"
                sizeVariant="md"
                onClick={handleSaveAndUpdateChanges}
                disabled={isSubmitting || !!regeneratingField}
                className="h-12 sm:h-10 w-full sm:w-auto text-base sm:text-sm font-semibold"
              >
                {isSavingAndUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 sm:h-4 sm:w-4 animate-spin" />
                    {t.buttons.savingAndUpdating}
                  </>
                ) : (
                  saveAndUpdateLabel
                )}
              </AddItemButton>
            )}

            {(isPublishingMode || !canSaveAndUpdateMarketplaces) && (
              <AddItemButton
                type="submit"
                sizeVariant="md"
                disabled={
                  isSubmitting ||
                  !!regeneratingField ||
                  (isPublishingMode &&
                    (selectedPlatforms.length === 0 ||
                      hasInsufficientPublishCredits))
                }
                className="h-12 sm:h-10 w-full sm:w-auto text-base sm:text-sm font-semibold"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 sm:h-4 sm:w-4 animate-spin" />
                    {t.buttons.publishing}
                  </>
                ) : isSaving && !isPublishingMode ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 sm:h-4 sm:w-4 animate-spin" />
                    {t.buttons.updating}
                  </>
                ) : isPublishingMode && hasInsufficientPublishCredits ? (
                  <>
                    <CreditCard className="mr-2 h-5 w-5 sm:h-4 sm:w-4" /> Insufficient Credits
                  </>
                ) : (
                  isPublishingMode ? t.buttons.publish : t.buttons.update
                )}
              </AddItemButton>
            )}
          </div>
        </div>
      </div>
      
      <AlertDialog
        open={!!pendingOlxCountryCode}
        onOpenChange={(open) => {
          if (!open) {
            setPendingOlxCountryCode(null);
          }
        }}
      >
        <AlertDialogContent className="bg-neutral-900 border-amber-500/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Change OLX country?</AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-300">
              Changing OLX country clears the selected OLX category and OLX attributes for this listing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-neutral-700 bg-neutral-800 text-neutral-200 hover:bg-neutral-700 hover:text-white">
              Keep current country
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <SecondaryAction
                type="button"
                onClick={confirmOlxCountryChange}
                className="min-h-[44px] border-amber-400/70 bg-amber-500/15 px-5 py-2 text-amber-100 hover:bg-amber-500/25 hover:border-amber-300"
              >
                Change country
              </SecondaryAction>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
