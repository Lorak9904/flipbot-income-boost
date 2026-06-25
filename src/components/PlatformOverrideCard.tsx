/**
 * PlatformOverrideCard - Per-platform customization UI
 * 
 * Allows sellers to toggle "Customize for this platform" and edit
 * category + required attributes that differ per platform.
 * 
 * Task 2: Per-Platform Override Editor UI
 */

import { useState, useEffect, useCallback } from 'react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, ChevronDown, ChevronUp, Settings2, Search, X } from 'lucide-react';
import { 
  getPlatformCategoryAttributes, 
  PlatformAttributeField 
} from '@/lib/api/platform-metadata';
import {
  searchAllegroProducts,
  type AllegroProductParameter,
  type AllegroProductSearchResult,
} from '@/lib/api/allegro';
import { cn } from '@/lib/utils';
import type { PlatformDynamicAttributeValue } from '@/types/item';

interface SelectedAllegroProduct {
  id?: string;
  name?: string;
  imageUrl?: string;
  categoryPath?: string;
}

interface PlatformOverrideCardProps {
  platform: 'olx' | 'ebay' | 'allegro';
  platformLabel: string;
  isConnected: boolean;
  isDisabled?: boolean;
  /** Optional marketplace ID override (used for eBay attribute lookups) */
  marketplaceId?: string;
  /** Optional country code override (used for OLX metadata lookups) */
  countryCode?: string;
  /** Current category ID override for this platform */
  categoryId?: string | number;
  /** Current attribute values for this platform */
  attributeValues?: Record<string, PlatformDynamicAttributeValue>;
  /** Callback when category ID changes */
  onCategoryChange: (categoryId: string) => void;
  /** Callback when an attribute value changes */
  onAttributeChange: (key: string, value: PlatformDynamicAttributeValue) => void;
  /** Optional placeholder for category input */
  categoryPlaceholder?: string;
  /** Optional label for category input */
  categoryLabel?: string;
  /** Use a read-only category summary when category selection is handled elsewhere. */
  categoryInputMode?: 'editable' | 'summary';
  /** Default phrase for Allegro catalog search. */
  allegroSearchPhrase?: string;
  /** Selected Allegro catalog product, if the listing is mapped to one. */
  selectedAllegroProduct?: SelectedAllegroProduct | null;
  /** Callback when an Allegro catalog product is selected. */
  onAllegroProductSelect?: (product: AllegroProductSearchResult) => void;
  /** Callback when the selected Allegro catalog product is removed. */
  onAllegroProductClear?: () => void;
}

const formatProductCategoryPath = (product: AllegroProductSearchResult): string => {
  const path = product.category?.path?.map((item) => item.name).filter(Boolean).join(' > ');
  return path || product.category?.id || '';
};

const getProductImageUrl = (product: AllegroProductSearchResult): string | undefined =>
  product.images?.find((image) => image.url)?.url;

const getImportantParameters = (parameters: AllegroProductParameter[]): AllegroProductParameter[] => {
  const isImportant = (parameter: AllegroProductParameter) => {
    const name = parameter.name.toLowerCase();
    return (
      Boolean(parameter.options?.isGTIN) ||
      Boolean(parameter.options?.isBrand) ||
      name.includes('ean') ||
      name.includes('gtin') ||
      name.includes('marka') ||
      name.includes('model')
    );
  };
  return parameters.filter(isImportant).slice(0, 3);
};

const formatParameterValue = (parameter: AllegroProductParameter): string => {
  const values = parameter.valuesLabels?.length
    ? parameter.valuesLabels
    : parameter.valuesIds?.length
      ? parameter.valuesIds
      : parameter.values;
  if (!values?.length) {
    return '';
  }
  return values.map(String).join(', ');
};

const isProductOnlyAttribute = (attribute: PlatformAttributeField): boolean =>
  attribute.metadata?.required_for_product === true && attribute.metadata?.required_for_offer !== true;

const PlatformOverrideCard = ({
  platform,
  platformLabel,
  isConnected,
  isDisabled = false,
  marketplaceId,
  countryCode,
  categoryId,
  attributeValues = {},
  onCategoryChange,
  onAttributeChange,
  categoryPlaceholder = 'Enter category ID',
  categoryLabel = 'Category ID',
  categoryInputMode = 'editable',
  allegroSearchPhrase,
  selectedAllegroProduct,
  onAllegroProductSelect,
  onAllegroProductClear,
}: PlatformOverrideCardProps) => {
  const categoryIsSummary = categoryInputMode === 'summary';
  // Toggle state: whether customization is enabled for this platform
  const [isCustomizing, setIsCustomizing] = useState(() => {
    // Auto-enable if there's already a category ID or attributes set
    const hasAttributes = attributeValues && Object.keys(attributeValues).length > 0;
    return categoryIsSummary || Boolean(categoryId || hasAttributes);
  });
  
  // Expanded/collapsed state for the card content
  const [isExpanded, setIsExpanded] = useState(() => categoryIsSummary || Boolean(categoryId));
  
  // Dynamic attributes fetched from backend
  const [attributes, setAttributes] = useState<PlatformAttributeField[]>([]);
  const [isLoadingAttributes, setIsLoadingAttributes] = useState(false);
  const [attributeError, setAttributeError] = useState<string | null>(null);
  const [productSearchPhrase, setProductSearchPhrase] = useState(allegroSearchPhrase || '');
  const [productResults, setProductResults] = useState<AllegroProductSearchResult[]>([]);
  const [isSearchingProducts, setIsSearchingProducts] = useState(false);
  const [productSearchError, setProductSearchError] = useState<string | null>(null);
  
  // Debounce timer for category ID changes
  const [debouncedCategoryId, setDebouncedCategoryId] = useState(categoryId);

  const selectedScalar = (value: PlatformDynamicAttributeValue | undefined): string => {
    if (value === undefined || value === null) {
      return '';
    }
    if (Array.isArray(value)) {
      return value[0] === undefined ? '' : String(value[0]);
    }
    if (typeof value === 'object') {
      const selected =
        value.valueId ??
        value.value ??
        value.valuesIds?.[0] ??
        value.values?.[0];
      return selected === undefined || selected === null ? '' : String(selected);
    }
    return String(value);
  };

  const selectedList = (value: PlatformDynamicAttributeValue | undefined): string[] => {
    if (value === undefined || value === null) {
      return [];
    }
    if (Array.isArray(value)) {
      return value.map(String);
    }
    if (typeof value === 'object') {
      if (Array.isArray(value.valuesIds)) {
        return value.valuesIds.map(String);
      }
      if (Array.isArray(value.values)) {
        return value.values.map(String);
      }
      const scalar = selectedScalar(value);
      return scalar ? [scalar] : [];
    }
    return [String(value)];
  };

  const toStoredAttributeValue = (
    attr: PlatformAttributeField,
    value: string | number | Array<string | number>
  ): PlatformDynamicAttributeValue => {
    if (platform !== 'allegro') {
      return value;
    }

    const values = Array.isArray(value) ? value : [value];
    if (attr.type === 'select' || attr.type === 'multi_select') {
      return { valuesIds: values };
    }
    return { values };
  };
  
  // Debounce category ID changes to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCategoryId(categoryId);
    }, 500);
    return () => clearTimeout(timer);
  }, [categoryId]);
  
  // Fetch attributes when category ID changes
  const fetchAttributes = useCallback(async () => {
    if (!debouncedCategoryId || !isCustomizing) {
      setAttributes([]);
      setAttributeError(null);
      return;
    }

    if (!isConnected) {
      setAttributes([]);
      setAttributeError(null);
      return;
    }
    
    setIsLoadingAttributes(true);
    setAttributeError(null);
    
    try {
      const response = await getPlatformCategoryAttributes(
        platform,
        debouncedCategoryId,
        { marketplaceId, countryCode }
      );
      setAttributes(response.fields || response.required_fields || []);
    } catch (err) {
      console.error(`Failed to fetch ${platform} attributes:`, err);
      setAttributeError(
        err instanceof Error ? err.message : 'Failed to load attributes'
      );
      setAttributes([]);
    } finally {
      setIsLoadingAttributes(false);
    }
  }, [debouncedCategoryId, platform, isCustomizing, marketplaceId, countryCode, isConnected]);
  
  useEffect(() => {
    fetchAttributes();
  }, [fetchAttributes]);

  useEffect(() => {
    if (categoryIsSummary) {
      setIsCustomizing(true);
      setIsExpanded(true);
    }
  }, [categoryIsSummary]);

  useEffect(() => {
    if (!productSearchPhrase && allegroSearchPhrase) {
      setProductSearchPhrase(allegroSearchPhrase);
    }
  }, [allegroSearchPhrase, productSearchPhrase]);

  const visibleAttributes =
    platform === 'allegro' && selectedAllegroProduct?.id
      ? attributes.filter((attribute) => !isProductOnlyAttribute(attribute))
      : attributes;
  
  // Handle toggle change
  const handleToggleCustomization = (enabled: boolean) => {
    setIsCustomizing(enabled);
    if (enabled) {
      setIsExpanded(true);
    } else {
      // Clear overrides when disabling customization
      onCategoryChange('');
      setAttributes([]);
    }
  };

  const handleAllegroProductSearch = async () => {
    const phrase = productSearchPhrase.trim();
    if (!phrase || platform !== 'allegro') {
      return;
    }

    setIsSearchingProducts(true);
    setProductSearchError(null);

    try {
      const response = await searchAllegroProducts({
        phrase,
        categoryId,
        pageSize: 6,
      });
      setProductResults(response.products || []);
    } catch (error) {
      console.error('Failed to search Allegro products:', error);
      setProductResults([]);
      setProductSearchError(error instanceof Error ? error.message : 'Failed to search Allegro products');
    } finally {
      setIsSearchingProducts(false);
    }
  };
  
  // Render attribute input based on type
  const renderAttributeInput = (attr: PlatformAttributeField) => {
    const currentValue = attributeValues[attr.key];
    const currentScalar = selectedScalar(currentValue);
    const maxLength = typeof attr.metadata?.max_length === 'number'
      ? attr.metadata.max_length
      : undefined;
    
    if (attr.type === 'select' && attr.options && attr.options.length > 0) {
      return (
        <Select
          value={currentScalar}
          onValueChange={(value) =>
            onAttributeChange(attr.key, toStoredAttributeValue(attr, value))
          }
          disabled={isDisabled}
        >
          <SelectTrigger className="text-black">
            <SelectValue placeholder={`Select ${attr.label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {attr.options.map((opt) => (
              <SelectItem key={String(opt.value)} value={String(opt.value)}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (attr.type === 'multi_select' && attr.options && attr.options.length > 0) {
      const selectedValues = selectedList(currentValue);
      const selectedSet = new Set(selectedValues);

      return (
        <div className="rounded-md border border-neutral-700 bg-neutral-900/60">
          <div className="border-b border-neutral-800 px-3 py-2 text-xs text-neutral-400">
            {selectedValues.length} selected
          </div>
          <div className="max-h-48 space-y-1 overflow-y-auto p-2">
            {attr.options.map((opt) => {
              const value = String(opt.value);
              const checked = selectedSet.has(value);
              return (
                <label
                  key={value}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-neutral-200 hover:bg-neutral-800',
                    isDisabled && 'cursor-not-allowed opacity-60'
                  )}
                >
                  <Checkbox
                    checked={checked}
                    disabled={isDisabled}
                    onCheckedChange={(nextChecked) => {
                      const nextValues = nextChecked === true
                        ? [...selectedValues, value]
                        : selectedValues.filter((item) => item !== value);
                      onAttributeChange(
                        attr.key,
                        toStoredAttributeValue(attr, nextValues)
                      );
                    }}
                  />
                  <span>{opt.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      );
    }
    
    if (attr.type === 'number') {
      return (
        <Input
          type="number"
          value={currentScalar}
          onChange={(e) => onAttributeChange(attr.key, toStoredAttributeValue(attr, e.target.value))}
          placeholder={`Enter ${attr.label.toLowerCase()}`}
          disabled={isDisabled}
        />
      );
    }
    
    // Default: text input
    return (
      <Input
        type="text"
        value={currentScalar}
        onChange={(e) => onAttributeChange(attr.key, toStoredAttributeValue(attr, e.target.value))}
        placeholder={`Enter ${attr.label.toLowerCase()}`}
        maxLength={maxLength}
        disabled={isDisabled}
      />
    );
  };

  const renderAllegroProductSearch = () => {
    if (platform !== 'allegro') {
      return null;
    }

    return (
      <div className="space-y-3 rounded-lg border border-neutral-700 bg-neutral-900/40 p-3">
        <div className="space-y-1">
          <Label className="text-xs text-neutral-300">Allegro catalog product</Label>
          <p className="text-xs text-neutral-500">
            Use this when you do not know the EAN/GTIN. Selecting a catalog product fills product identity through Allegro.
          </p>
        </div>

        {selectedAllegroProduct?.id && (
          <div className="flex gap-3 rounded-md border border-cyan-500/30 bg-cyan-500/10 p-3">
            {selectedAllegroProduct.imageUrl ? (
              <img
                src={selectedAllegroProduct.imageUrl}
                alt=""
                className="h-14 w-14 rounded-md object-cover"
              />
            ) : (
              <div className="h-14 w-14 rounded-md bg-neutral-800" />
            )}
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-neutral-100">
                {selectedAllegroProduct.name || selectedAllegroProduct.id}
              </div>
              {selectedAllegroProduct.categoryPath && (
                <div className="mt-1 line-clamp-2 text-xs text-neutral-400">
                  {selectedAllegroProduct.categoryPath}
                </div>
              )}
              <div className="mt-1 text-[11px] text-cyan-300">
                Product ID: {selectedAllegroProduct.id}
              </div>
            </div>
            <button
              type="button"
              onClick={onAllegroProductClear}
              disabled={isDisabled}
              className="rounded-md p-1 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Clear Allegro catalog product"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="flex gap-2">
          <Input
            value={productSearchPhrase}
            onChange={(event) => setProductSearchPhrase(event.target.value)}
            placeholder="Search Allegro catalog by title"
            disabled={isDisabled || !isConnected || isSearchingProducts}
            className="text-sm"
          />
          <button
            type="button"
            onClick={() => void handleAllegroProductSearch()}
            disabled={isDisabled || !isConnected || isSearchingProducts || !productSearchPhrase.trim()}
            className="inline-flex items-center gap-2 rounded-md border border-cyan-500/50 px-3 text-xs font-medium text-cyan-200 hover:bg-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSearchingProducts ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Search className="h-3.5 w-3.5" />
            )}
            Search
          </button>
        </div>

        {!isConnected && (
          <div className="text-xs text-amber-400">
            Connect Allegro to search the live catalog.
          </div>
        )}

        {productSearchError && (
          <div className="text-xs text-red-400">{productSearchError}</div>
        )}

        {productResults.length > 0 && (
          <div className="space-y-2">
            {productResults.map((product) => {
              const imageUrl = getProductImageUrl(product);
              const categoryPath = formatProductCategoryPath(product);
              const importantParameters = getImportantParameters(product.parameters || []);
              return (
                <div
                  key={product.id}
                  className="flex gap-3 rounded-md border border-neutral-700 bg-neutral-950/30 p-3"
                >
                  {imageUrl ? (
                    <img src={imageUrl} alt="" className="h-16 w-16 rounded-md object-cover" />
                  ) : (
                    <div className="h-16 w-16 rounded-md bg-neutral-800" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="line-clamp-2 text-sm font-medium text-neutral-100">
                      {product.name}
                    </div>
                    {categoryPath && (
                      <div className="mt-1 line-clamp-1 text-xs text-neutral-500">
                        {categoryPath}
                      </div>
                    )}
                    {importantParameters.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {importantParameters.map((parameter) => {
                          const value = formatParameterValue(parameter);
                          return (
                            <span
                              key={parameter.id}
                              className="rounded-full bg-neutral-800 px-2 py-0.5 text-[11px] text-neutral-300"
                            >
                              {parameter.name}{value ? `: ${value}` : ''}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => onAllegroProductSelect?.(product)}
                    disabled={isDisabled}
                    className="self-start rounded-md bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-neutral-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Use
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <Card className={cn(
      "border-neutral-700 transition-all",
      isCustomizing ? "bg-neutral-800/60 border-cyan-500/30" : "bg-neutral-800/30"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle 
            className="text-sm font-medium text-neutral-300 flex items-center gap-2 cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Settings2 className="h-4 w-4 text-cyan-400" />
            {platformLabel}
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-neutral-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-neutral-500" />
            )}
          </CardTitle>
          
          {!categoryIsSummary && (
            <div className="flex items-center gap-2">
              <Label
                htmlFor={`${platform}-customize-toggle`}
                className="text-xs text-neutral-400"
              >
                Customize
              </Label>
              <Switch
                id={`${platform}-customize-toggle`}
                checked={isCustomizing}
                onCheckedChange={handleToggleCustomization}
                disabled={isDisabled}
              />
            </div>
          )}
        </div>
        
        {!isCustomizing && !categoryIsSummary && (
          <CardDescription className="text-xs text-neutral-500 mt-1">
            Using default category mapping
          </CardDescription>
        )}

        {!isConnected && (
          <CardDescription className="text-xs text-amber-400 mt-1">
            Not connected. You can prefill category/attributes manually; automatic attribute fetch needs connection.
          </CardDescription>
        )}
      </CardHeader>
      
      {isExpanded && isCustomizing && (
        <CardContent className="pt-0 space-y-4">
          {/* Category Selection Summary / Input */}
          <div className="space-y-2">
            <Label 
              htmlFor={`${platform}-category-id`} 
              className="text-xs text-neutral-400"
            >
              {categoryLabel}
            </Label>
            {categoryIsSummary ? (
              <div
                id={`${platform}-category-id`}
                className="rounded-md border border-neutral-700 bg-neutral-900/60 px-3 py-2 text-sm text-neutral-300"
              >
                {categoryId
                  ? `Selected category ID: ${categoryId}`
                  : 'Choose a category in the Category section above to load required attributes.'}
              </div>
            ) : (
              <Input
                id={`${platform}-category-id`}
                type={platform === 'olx' ? 'number' : 'text'}
                value={categoryId || ''}
                onChange={(e) => onCategoryChange(e.target.value)}
                placeholder={categoryPlaceholder}
                disabled={isDisabled}
                className="text-sm"
              />
            )}
          </div>

          {renderAllegroProductSearch()}
          
          {/* Loading State */}
          {isLoadingAttributes && (
            <div className="flex items-center gap-2 text-xs text-neutral-400 py-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              Loading required attributes...
            </div>
          )}
          
          {/* Error State */}
          {attributeError && (
            <div className="text-xs text-red-400 py-2">
              {attributeError}
            </div>
          )}
          
          {/* Dynamic Attributes */}
          {!isLoadingAttributes && visibleAttributes.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-neutral-700">
              <p className="text-xs text-neutral-400 font-medium">
                Required Attributes ({visibleAttributes.filter(a => a.required).length})
              </p>
              
              <div className="grid grid-cols-1 gap-3">
                {visibleAttributes
                  .filter(attr => attr.required)
                  .map((attr) => (
                    <div key={attr.key} className="space-y-1">
                      <Label 
                        htmlFor={`${platform}-attr-${attr.key}`}
                        className="text-xs text-neutral-300"
                      >
                        {attr.label}
                        <span className="text-red-400 ml-1">*</span>
                      </Label>
                      {renderAttributeInput(attr)}
                    </div>
                  ))}
              </div>
              
              {/* Optional Attributes (collapsed by default) */}
              {visibleAttributes.filter(a => !a.required).length > 0 && (
                <details className="pt-2">
                  <summary className="text-xs text-neutral-500 cursor-pointer hover:text-neutral-400">
                    Optional attributes ({visibleAttributes.filter(a => !a.required).length})
                  </summary>
                  <div className="grid grid-cols-1 gap-3 pt-3">
                    {visibleAttributes
                      .filter(attr => !attr.required)
                      .map((attr) => (
                        <div key={attr.key} className="space-y-1">
                          <Label 
                            htmlFor={`${platform}-attr-${attr.key}`}
                            className="text-xs text-neutral-300"
                          >
                            {attr.label}
                          </Label>
                          {renderAttributeInput(attr)}
                        </div>
                      ))}
                  </div>
                </details>
              )}
            </div>
          )}
          
          {/* Empty State */}
          {!isLoadingAttributes && 
           !attributeError && 
           debouncedCategoryId && 
           visibleAttributes.length === 0 && (
            <div className="text-xs text-neutral-500 py-2">
              No required attributes found for this category
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default PlatformOverrideCard;
