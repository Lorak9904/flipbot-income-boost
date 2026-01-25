import { useEffect, useState } from 'react';
import { 
  GeneratedItemData, 
  GeneratedItemDataWithVinted, 
  ItemImage, 
  Platform, 
  PlatformOverrides,
  VintedFieldMapping 
} from '@/types/item';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import ImageUploader from './ImageUploader';
import DynamicFieldRenderer from './DynamicFieldRenderer';
import PlatformOverrideCard from './PlatformOverrideCard';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, CreditCard, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getTranslations, getCurrentLanguage } from '@/components/language-utils';
import { reviewItemFormTranslations } from '@/utils/translations/review-item-form-translations';
import { useCredits } from '@/hooks/useCredits';
import { useQueryClient } from '@tanstack/react-query';
import { InsufficientCreditsAlert } from '@/components/credits';
import { parseInsufficientCreditsError, parseErrorResponse } from '@/lib/api/error-handler';
import { updateItem } from '@/lib/api/items';
import type { UpdateItemPayload } from '@/lib/api/items';

interface ReviewItemFormProps {
  initialData: GeneratedItemDataWithVinted;
  connectedPlatforms: Record<Platform, boolean>;
  onBack: () => void;
  language?: string;
  editItemId?: string;
  publishedPlatforms?: Platform[];
  publishPlatform?: Platform;
}

const SUPPORTED_PLATFORMS: Platform[] = ['facebook', 'olx', 'vinted', 'ebay'];

const ReviewItemForm = ({
  initialData,
  connectedPlatforms,
  onBack,
  language,
  editItemId,
  publishedPlatforms = [],
  publishPlatform,
}: ReviewItemFormProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [insufficientCreditsError, setInsufficientCreditsError] = useState<{
    required: number;
    available: number;
  } | null>(null);
  const isEditMode = Boolean(editItemId);
  const isPublishIntent = !isEditMode || Boolean(publishPlatform);
  // Ensure draft_id is preserved in state
  const [data, setData] = useState<GeneratedItemData & { draft_id?: string }>(initialData);
  const navigate = useNavigate();
  const { data: credits } = useCredits();
  const queryClient = useQueryClient();
  const t = getTranslations(reviewItemFormTranslations);
  
  // Calculate available platforms for publishing (excluding already published)
  const availablePublishPlatforms = SUPPORTED_PLATFORMS.filter(
    (platform) => connectedPlatforms[platform] && !publishedPlatforms.includes(platform)
  );
  
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(() => {
    // If publishing to specific platform (re-publishing scenario), pre-select it
    if (publishPlatform && availablePublishPlatforms.includes(publishPlatform)) {
      return [publishPlatform];
    }
    // Otherwise, select all connected unpublished platforms (original publish)
    return availablePublishPlatforms;
  });
  
  // Separate state for dynamic Vinted fields
  const [dynamicFieldValues, setDynamicFieldValues] = useState<Record<string, VintedFieldMapping>>(
    initialData.vinted_field_mappings || {}
  );
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
    };
  });
  
  // Debug: Log initial data on mount
  console.log('📝 ReviewItemForm initialized:', initialData);
  console.log('🔍 Vinted field definitions:', initialData.vinted_field_definitions);
  console.log('🔍 Vinted field mappings:', initialData.vinted_field_mappings);
  console.log('🔍 Brand data:', { brand: initialData.brand, brand_id: initialData.brand_id, brand_title: initialData.brand_title });
  console.log('🎨 Enhanced images:', initialData.enhanced_images);

  // Update selected platforms when publishPlatform prop changes
  useEffect(() => {
    if (publishPlatform && availablePublishPlatforms.includes(publishPlatform)) {
      setSelectedPlatforms([publishPlatform]);
    }
  }, [publishPlatform, availablePublishPlatforms]);
  
  // Make sure draft_id is never lost when updating fields
  const updateField = (field: keyof GeneratedItemData, value: any) => {
    setData(prev => ({ ...prev, [field]: value, draft_id: prev.draft_id }));
  };
  
  const handlePlatformToggle = (platform: Platform) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };
  
  // Handler for dynamic field changes
  const handleDynamicFieldChange = (fieldCode: string, attributeId: number, valueId: number) => {
    setDynamicFieldValues(prev => ({
      ...prev,
      [fieldCode]: { attribute_id: attributeId, value_id: valueId }
    }));
  };

  const updatePlatformOverride = (
    platform: 'olx' | 'vinted' | 'ebay',
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

  // Handler for platform-specific attribute changes (Task 2)
  const updatePlatformAttribute = (
    platform: 'olx' | 'ebay',
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
      if (!['olx', 'vinted', 'ebay'].includes(key)) {
        overrides[key] = value as unknown;
      }
    });

    // OLX overrides: category_id + dynamic attributes
    const olxCategory = platformOverrides.olx?.category_id;
    const olxAttrs = platformOverrides.olx?.attributes;
    if ((olxCategory !== undefined && olxCategory !== null && String(olxCategory).trim() !== '') ||
        (olxAttrs && Object.keys(olxAttrs).length > 0)) {
      const parsed = Number(olxCategory);
      overrides.olx = {};
      if (olxCategory !== undefined && olxCategory !== null && String(olxCategory).trim() !== '') {
        overrides.olx.category_id = Number.isNaN(parsed) ? String(olxCategory).trim() : parsed;
      }
      if (olxAttrs && Object.keys(olxAttrs).length > 0) {
        overrides.olx.attributes = olxAttrs;
      }
    }

    // Vinted overrides: catalog_id + field_mappings
    const vintedPayload: NonNullable<PlatformOverrides['vinted']> = {};
    const vintedCatalog = platformOverrides.vinted?.catalog_id;
    if (vintedCatalog !== undefined && vintedCatalog !== null && String(vintedCatalog).trim() !== '') {
      const parsed = Number(vintedCatalog);
      vintedPayload.catalog_id = Number.isNaN(parsed) ? String(vintedCatalog).trim() : parsed;
    }

    const vintedMappings =
      Object.keys(dynamicFieldValues).length > 0
        ? dynamicFieldValues
        : platformOverrides.vinted?.field_mappings;
    if (vintedMappings && Object.keys(vintedMappings).length > 0) {
      vintedPayload.field_mappings = vintedMappings;
    }

    if (Object.keys(vintedPayload).length > 0) {
      overrides.vinted = vintedPayload;
    }

    // eBay overrides: category_path OR category_id + dynamic attributes
    const ebayPath = platformOverrides.ebay?.category_path;
    const ebayCategoryId = platformOverrides.ebay?.category_id;
    const ebayAttrs = platformOverrides.ebay?.attributes;
    if ((ebayPath && String(ebayPath).trim()) ||
        (ebayCategoryId && String(ebayCategoryId).trim()) ||
        (ebayAttrs && Object.keys(ebayAttrs).length > 0)) {
      overrides.ebay = {};
      if (ebayPath && String(ebayPath).trim()) {
        overrides.ebay.category_path = String(ebayPath).trim();
      }
      if (ebayCategoryId && String(ebayCategoryId).trim()) {
        overrides.ebay.category_id = String(ebayCategoryId).trim();
      }
      if (ebayAttrs && Object.keys(ebayAttrs).length > 0) {
        overrides.ebay.attributes = ebayAttrs;
      }
    }

    return Object.keys(overrides).length > 0 ? overrides : undefined;
  };
  
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (isPublishIntent && selectedPlatforms.length === 0) {
    toast({
      title: t.toast.noPlatformsTitle,
      description: t.toast.noPlatformsDesc,
      variant: "destructive",
    });
    return;
  }

  setIsSubmitting(true);

  try {
    const numericPrice = parseFloat(data.price);
    if (isNaN(numericPrice)) {
      throw new Error('Invalid price format');
    }

    // Deduplicate image URLs to avoid accidental duplicates
    const uniqueImageUrls = Array.from(new Set(data.images.map(img => img.url)));
    const platformOverridesPayload = buildPlatformOverridesPayload();

    if (!isPublishIntent) {
      const targetId = editItemId || data.draft_id;
      if (!targetId) {
        throw new Error('Missing item id for update');
      }

      const updatePayload: UpdateItemPayload = {
        title: data.title,
        description: data.description,
        brand: data.brand,
        condition: data.condition,
        category: data.category,
        size: data.size,
        price: numericPrice,
        catalog_path: data.catalog_path,
        images: uniqueImageUrls,
      };
      if (platformOverridesPayload) {
        updatePayload.platform_listing_overrides = platformOverridesPayload;
      }

      await updateItem(targetId, updatePayload);

      toast({
        title: t.toast.successTitle,
        description: t.toast.updateLocalSuccess,
      });

      setTimeout(() => {
        navigate(`/user/items/${targetId}`);
      }, 1200);
      return;
    }

    // UNIFIED PUBLISH FLOW: Always use /api/items/publish endpoint
    // Backend handles both new drafts and re-publishing via draft_id parameter
    const token = localStorage.getItem('flipit_token');
    
    // Build a clean payload the API will accept
    // Always use draft_id (from initialData or editItemId) to support re-publishing
    const payload: any = {
      draft_id: data.draft_id || editItemId,
      images: uniqueImageUrls,
      title: data.title,
      brand: data.brand,
      condition: data.condition,
      category: data.category,
      size: data.size,
      price: numericPrice,
      description: data.description,
      catalog_path: data.catalog_path,
      platforms: selectedPlatforms,
    };

    if (platformOverridesPayload) {
      payload.platform_listing_overrides = platformOverridesPayload;
    }
    
    // Log field values for debugging
    console.log('🔍 Field values:', {
      title: data.title,
      category: data.category,
      description: data.description,
      price: numericPrice,
      draft_id: payload.draft_id,
    });
    
    // Include dynamic Vinted field values if present
    if (Object.keys(dynamicFieldValues).length > 0) {
      payload.vinted_field_mappings = dynamicFieldValues;
    }
    
    console.log('🚀 Publishing payload:', payload);

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
            {data.priceRange.min && data.priceRange.max && (
              <p className="text-xs text-slate-500 mt-1">
                {t.helper.priceRange
                  .replace('{min}', data.priceRange.min)
                  .replace('{max}', data.priceRange.max)}
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* Dynamic Vinted Fields Section */}
      {initialData.vinted_field_definitions && initialData.vinted_field_definitions.length > 0 && (
        <div className="space-y-4 border-t border-neutral-700 pt-6 text-white">
          <DynamicFieldRenderer
            fields={initialData.vinted_field_definitions}
            values={dynamicFieldValues}
            onChange={handleDynamicFieldChange}
            sectionTitle={t.sections.productAttributes}
          />
        </div>
      )}
      <div className="space-y-4 border-t border-neutral-700 pt-6">
        <h3 className="text-base sm:text-lg font-medium text-neutral-300">{t.sections.platformOverrides}</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="olx-category-id" className="text-neutral-300">
              {t.labels.olxCategoryId}
            </Label>
            <Input
              id="olx-category-id"
              type="number"
              value={platformOverrides.olx?.category_id ?? ''}
              onChange={(e) => updatePlatformOverride('olx', 'category_id', e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="vinted-catalog-id" className="text-neutral-300">
              {t.labels.vintedCatalogId}
            </Label>
            <Input
              id="vinted-catalog-id"
              type="number"
              value={platformOverrides.vinted?.catalog_id ?? ''}
              onChange={(e) => updatePlatformOverride('vinted', 'catalog_id', e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      {/* Per-Platform Customization Cards (Task 2) */}
      <div className="space-y-4 border-t border-neutral-700 pt-6">
        <h3 className="text-base sm:text-lg font-medium text-neutral-300">
          {t.sections.platformOverrides || 'Platform Customization'}
        </h3>
        <p className="text-sm text-neutral-400">
          Optionally customize category mapping and required attributes for each platform.
        </p>

        <div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0">
          {/* OLX Platform Override Card */}
          <PlatformOverrideCard
            platform="olx"
            platformLabel="OLX"
            isConnected={connectedPlatforms.olx}
            isDisabled={isSubmitting}
            categoryId={platformOverrides.olx?.category_id?.toString()}
            attributeValues={platformOverrides.olx?.attributes}
            onCategoryChange={(value) => updatePlatformOverride('olx', 'category_id', value)}
            onAttributeChange={(key, value) => updatePlatformAttribute('olx', key, value)}
            categoryLabel={t.labels?.olxCategoryId || 'OLX Category ID'}
            categoryPlaceholder="e.g., 1234"
          />

          {/* eBay Platform Override Card */}
          <PlatformOverrideCard
            platform="ebay"
            platformLabel="eBay"
            isConnected={connectedPlatforms.ebay}
            isDisabled={isSubmitting}
            categoryId={platformOverrides.ebay?.category_id?.toString() || platformOverrides.ebay?.category_path}
            attributeValues={platformOverrides.ebay?.attributes}
            onCategoryChange={(value) => updatePlatformOverride('ebay', 'category_id', value)}
            onAttributeChange={(key, value) => updatePlatformAttribute('ebay', key, value)}
            categoryLabel={t.labels?.ebayCategoryPath || 'eBay Category ID'}
            categoryPlaceholder="e.g., 175673"
          />
        </div>
      </div>

      {/* Platform Selection - Unified for both original publish and re-publishing */}
      {isPublishIntent && availablePublishPlatforms.length > 0 && (
        <div className="space-y-4 border-t border-neutral-700 pt-6">
          <h3 className="text-base sm:text-lg font-medium text-neutral-300">{t.sections.publishPlatforms}</h3>
          
          <div className="space-y-3">
            {availablePublishPlatforms.map((typedPlatform) => {
              const isConnected = connectedPlatforms[typedPlatform];
              const platformName =
                t.platforms[typedPlatform] || typedPlatform.charAt(0).toUpperCase() + typedPlatform.slice(1);
              return (
                <label
                  key={typedPlatform}
                  htmlFor={`platform-${typedPlatform}`}
                  className={`flex items-center gap-3 p-4 rounded-lg border transition-all cursor-pointer min-h-[56px] ${
                    selectedPlatforms.includes(typedPlatform)
                      ? 'bg-cyan-500/10 border-cyan-500/50'
                      : 'bg-neutral-800/30 border-neutral-700'
                  } ${!isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Checkbox 
                    id={`platform-${typedPlatform}`}
                    checked={selectedPlatforms.includes(typedPlatform)}
                    onCheckedChange={() => handlePlatformToggle(typedPlatform)}
                    disabled={!isConnected || isSubmitting}
                    className="h-5 w-5"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-base text-white">
                      {platformName}
                    </div>
                    {!isConnected && (
                      <div className="text-xs text-neutral-400">
                        {t.helper.notConnected}
                      </div>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
          
          {/* Credits cost preview */}
          {selectedPlatforms.length > 0 && (
            <div className="bg-gradient-to-r from-cyan-500/10 to-fuchsia-500/10 border border-cyan-500/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-cyan-400" />
                  <span className="text-sm font-medium text-neutral-300">Publishing cost:</span>
                </div>
                <span className="text-lg font-bold text-cyan-400">
                  {selectedPlatforms.length} {selectedPlatforms.length === 1 ? 'credit' : 'credits'}
                </span>
              </div>
            </div>
          )}
          
          {/* Insufficient credits warning */}
          {selectedPlatforms.length > 0 &&
            credits &&
            credits.publish_remaining !== null &&
            credits.publish_remaining < selectedPlatforms.length && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-red-400 font-medium">Not Enough Listings</p>
                <p className="text-neutral-300 text-xs mt-1">
                  You have {credits.publish_remaining} {credits.publish_remaining === 1 ? 'listing' : 'listings'} left but need {selectedPlatforms.length} to publish to {selectedPlatforms.length} {selectedPlatforms.length === 1 ? 'platform' : 'platforms'}. Upgrade your plan to continue.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Sticky Action Buttons - Mobile Optimized */}
      <div className="fixed bottom-0 left-0 right-0 bg-neutral-950/95 backdrop-blur-sm border-t border-neutral-800 p-4 sm:relative sm:bg-transparent sm:border-0 sm:p-0 z-50">
        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-between max-w-7xl mx-auto">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onBack} 
            disabled={isSubmitting}
            className="h-12 sm:h-10 w-full sm:w-auto text-base sm:text-sm"
          >
            {t.buttons.back}
          </Button>
          
          <Button 
            type="submit" 
            disabled={
              isSubmitting || 
              (isPublishIntent &&
                (selectedPlatforms.length === 0 ||
                  (credits &&
                    credits.publish_remaining !== null &&
                    credits.publish_remaining < selectedPlatforms.length)))
            }
            className="h-12 sm:h-10 w-full sm:w-auto text-base sm:text-sm font-semibold"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 sm:h-4 sm:w-4 animate-spin" />
                {isPublishIntent ? t.buttons.publishing : t.buttons.updating}
              </>
            ) : isPublishIntent &&
              credits &&
              credits.publish_remaining !== null &&
              credits.publish_remaining < selectedPlatforms.length ? (
              <>
                <CreditCard className="mr-2 h-5 w-5 sm:h-4 sm:w-4" /> Insufficient Credits
              </>
            ) : (
              isPublishIntent ? t.buttons.publish : t.buttons.update
            )}
          </Button>
        </div>
      </div>
      
      {/* Insufficient Credits Dialog */}
      <InsufficientCreditsAlert
        open={!!insufficientCreditsError}
        onOpenChange={(open) => !open && setInsufficientCreditsError(null)}
        required={insufficientCreditsError?.required || selectedPlatforms.length}
        available={insufficientCreditsError?.available || 0}
      />
    </form>
  );
};

export default ReviewItemForm;
