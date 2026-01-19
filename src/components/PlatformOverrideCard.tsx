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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, ChevronDown, ChevronUp, Settings2 } from 'lucide-react';
import { 
  getPlatformCategoryAttributes, 
  PlatformAttributeField 
} from '@/lib/api/platform-metadata';
import { cn } from '@/lib/utils';

interface PlatformOverrideCardProps {
  platform: 'olx' | 'ebay';
  platformLabel: string;
  isConnected: boolean;
  isDisabled?: boolean;
  /** Current category ID override for this platform */
  categoryId?: string | number;
  /** Current attribute values for this platform */
  attributeValues?: Record<string, string | number>;
  /** Callback when category ID changes */
  onCategoryChange: (categoryId: string) => void;
  /** Callback when an attribute value changes */
  onAttributeChange: (key: string, value: string | number) => void;
  /** Optional placeholder for category input */
  categoryPlaceholder?: string;
  /** Optional label for category input */
  categoryLabel?: string;
}

const PlatformOverrideCard = ({
  platform,
  platformLabel,
  isConnected,
  isDisabled = false,
  categoryId,
  attributeValues = {},
  onCategoryChange,
  onAttributeChange,
  categoryPlaceholder = 'Enter category ID',
  categoryLabel = 'Category ID',
}: PlatformOverrideCardProps) => {
  // Toggle state: whether customization is enabled for this platform
  const [isCustomizing, setIsCustomizing] = useState(() => {
    // Auto-enable if there's already a category ID set
    return Boolean(categoryId);
  });
  
  // Expanded/collapsed state for the card content
  const [isExpanded, setIsExpanded] = useState(() => Boolean(categoryId));
  
  // Dynamic attributes fetched from backend
  const [attributes, setAttributes] = useState<PlatformAttributeField[]>([]);
  const [isLoadingAttributes, setIsLoadingAttributes] = useState(false);
  const [attributeError, setAttributeError] = useState<string | null>(null);
  
  // Debounce timer for category ID changes
  const [debouncedCategoryId, setDebouncedCategoryId] = useState(categoryId);
  
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
      return;
    }
    
    setIsLoadingAttributes(true);
    setAttributeError(null);
    
    try {
      const response = await getPlatformCategoryAttributes(
        platform,
        debouncedCategoryId
      );
      setAttributes(response.required_fields || []);
    } catch (err) {
      console.error(`Failed to fetch ${platform} attributes:`, err);
      setAttributeError(
        err instanceof Error ? err.message : 'Failed to load attributes'
      );
      setAttributes([]);
    } finally {
      setIsLoadingAttributes(false);
    }
  }, [debouncedCategoryId, platform, isCustomizing]);
  
  useEffect(() => {
    fetchAttributes();
  }, [fetchAttributes]);
  
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
  
  // Render attribute input based on type
  const renderAttributeInput = (attr: PlatformAttributeField) => {
    const currentValue = attributeValues[attr.key];
    
    if (attr.type === 'select' && attr.options && attr.options.length > 0) {
      return (
        <Select
          value={currentValue?.toString() || ''}
          onValueChange={(value) => onAttributeChange(attr.key, value)}
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
    
    if (attr.type === 'number') {
      return (
        <Input
          type="number"
          value={currentValue || ''}
          onChange={(e) => onAttributeChange(attr.key, e.target.value)}
          placeholder={`Enter ${attr.label.toLowerCase()}`}
          disabled={isDisabled}
        />
      );
    }
    
    // Default: text input
    return (
      <Input
        type="text"
        value={currentValue || ''}
        onChange={(e) => onAttributeChange(attr.key, e.target.value)}
        placeholder={`Enter ${attr.label.toLowerCase()}`}
        disabled={isDisabled}
      />
    );
  };
  
  if (!isConnected) {
    return (
      <Card className="border-neutral-700 bg-neutral-800/30 opacity-60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-neutral-400 flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            {platformLabel}
          </CardTitle>
          <CardDescription className="text-xs text-neutral-500">
            Not connected – connect {platformLabel} to customize
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
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
        </div>
        
        {!isCustomizing && (
          <CardDescription className="text-xs text-neutral-500 mt-1">
            Using default category mapping
          </CardDescription>
        )}
      </CardHeader>
      
      {isExpanded && isCustomizing && (
        <CardContent className="pt-0 space-y-4">
          {/* Category ID Input */}
          <div className="space-y-2">
            <Label 
              htmlFor={`${platform}-category-id`} 
              className="text-xs text-neutral-400"
            >
              {categoryLabel}
            </Label>
            <Input
              id={`${platform}-category-id`}
              type={platform === 'olx' ? 'number' : 'text'}
              value={categoryId || ''}
              onChange={(e) => onCategoryChange(e.target.value)}
              placeholder={categoryPlaceholder}
              disabled={isDisabled}
              className="text-sm"
            />
          </div>
          
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
          {!isLoadingAttributes && attributes.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-neutral-700">
              <p className="text-xs text-neutral-400 font-medium">
                Required Attributes ({attributes.filter(a => a.required).length})
              </p>
              
              <div className="grid grid-cols-1 gap-3">
                {attributes
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
              {attributes.filter(a => !a.required).length > 0 && (
                <details className="pt-2">
                  <summary className="text-xs text-neutral-500 cursor-pointer hover:text-neutral-400">
                    Optional attributes ({attributes.filter(a => !a.required).length})
                  </summary>
                  <div className="grid grid-cols-1 gap-3 pt-3">
                    {attributes
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
           attributes.length === 0 && (
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
