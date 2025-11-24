import { useState } from 'react';
import { 
  GeneratedItemData, 
  GeneratedItemDataWithVinted, 
  ItemImage, 
  Platform, 
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
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, CreditCard, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getTranslations, getCurrentLanguage } from '@/components/language-utils';
import { reviewItemFormTranslations } from '@/utils/translations/review-item-form-translations';
import { useCredits } from '@/hooks/useCredits';
import { InsufficientCreditsAlert } from '@/components/credits';
import { parseInsufficientCreditsError, parseErrorResponse } from '@/lib/api/error-handler';

interface ReviewItemFormProps {
  initialData: GeneratedItemDataWithVinted;
  connectedPlatforms: Record<Platform, boolean>;
  onBack: () => void;
  language?: string;
}

const ReviewItemForm = ({ initialData, connectedPlatforms, onBack, language }: ReviewItemFormProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [insufficientCreditsError, setInsufficientCreditsError] = useState<{
    required: number;
    available: number;
  } | null>(null);
  // Ensure draft_id is preserved in state
  const [data, setData] = useState<GeneratedItemData & { draft_id?: string }>(initialData);
  const navigate = useNavigate();
  const { data: credits } = useCredits();
  const t = getTranslations(reviewItemFormTranslations);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(
    Object.entries(connectedPlatforms)
      .filter(([_, isConnected]) => isConnected)
      .map(([platform]) => platform as Platform)
  );
  
  // Separate state for dynamic Vinted fields
  const [dynamicFieldValues, setDynamicFieldValues] = useState<Record<string, VintedFieldMapping>>(
    initialData.vinted_field_mappings || {}
  );
  
  // Debug: Log initial data on mount
  console.log('📝 ReviewItemForm initialized:', initialData);
  console.log('🔍 Vinted field definitions:', initialData.vinted_field_definitions);
  console.log('🔍 Vinted field mappings:', initialData.vinted_field_mappings);
  console.log('🔍 Brand data:', { brand: initialData.brand, brand_id: initialData.brand_id, brand_title: initialData.brand_title });
  console.log('🎨 Enhanced images:', initialData.enhanced_images);
  
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
  
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (selectedPlatforms.length === 0) {
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

    

    const token = localStorage.getItem('flipit_token');
    
    // Build a clean payload the API will accept
    // Deduplicate image URLs to avoid accidental duplicates
    const uniqueImageUrls = Array.from(new Set(data.images.map(img => img.url)));
    const payload: any = {
      draft_id: data.draft_id,
      images: uniqueImageUrls,
      title: data.title,
      category: data.category,
      price: numericPrice,
      description: data.description,
      catalog_path: data.catalog_path,
      platforms: selectedPlatforms,
    };
    
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
      
      throw new Error('Failed to publish item');
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
    toast({
      title: t.toast.errorTitle,
      description: t.toast.errorDesc,
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
        
        {/* 🍌 Display enhanced images separately if available */}
        {initialData.enhanced_images && initialData.enhanced_images.length > 0 && (
          <div className="mt-6 border-t border-neutral-700 pt-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🎨</span>
              <h4 className="text-md font-medium text-neutral-300">
                AI-Enhanced Images
              </h4>
              <span className="text-xs text-slate-400 bg-neutral-800 px-2 py-1 rounded">
                Gemini 2.5 Flash
              </span>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              These images have been automatically enhanced with improved backgrounds and lighting while preserving the original product.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {initialData.enhanced_images.map((url, idx) => (
                <div key={`enhanced-${idx}`} className="relative rounded-lg overflow-hidden border border-neutral-700">
                  <img 
                    src={url} 
                    alt={`AI Enhanced ${idx + 1}`} 
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-purple-600/90 text-white text-xs px-2 py-1 rounded">
                    Enhanced
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="space-y-4 ">
        <h3 className="text-lg font-medium text-neutral-300">{t.sections.itemDetails}</h3>
        
        <div>
          <Label htmlFor="title" className="text-neutral-300">{t.labels.title}</Label>
          <Input 
            id="title"
            value={data.title}
            onChange={(e) => updateField('title', e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="description" className="text-neutral-300">{t.labels.description}</Label>
          <Textarea 
            id="description" 
            value={data.description}
            onChange={(e) => updateField('description', e.target.value)}
            className="min-h-[150px]"
            disabled={isSubmitting}
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category hidden - still sent to backend but not displayed to user */}
          <div className="hidden">
            <Input 
              id="category" 
              value={data.category}
              onChange={(e) => updateField('category', e.target.value)}
            />
          </div>
          
          {/* Show brand as read-only if available */}
          {initialData.brand && (
            <div>
              <Label className="text-neutral-300">Brand</Label>
              <div className="flex items-center h-10 px-3 py-2 rounded-md border border-neutral-700 bg-neutral-800/50 text-neutral-300">
                {initialData.brand}
                {initialData.brand_confidence && (
                  <span className="ml-2 text-xs text-slate-400">
                    ({initialData.brand_confidence})
                  </span>
                )}
              </div>
            </div>
          )}
          
          <div>
            <Label htmlFor="price" className="text-neutral-300">{t.labels.price}</Label>
            <Input 
              id="price" 
              value={data.price}
              onChange={(e) => updateField('price', e.target.value)}
              disabled={isSubmitting}
              required
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
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-neutral-300">{t.sections.publishPlatforms}</h3>
        
        <div className="flex flex-col gap-3">
          {Object.entries(connectedPlatforms).map(([platform, isConnected]) => {
            const typedPlatform = platform as Platform;
            const platformName = t.platforms[typedPlatform] || platform.charAt(0).toUpperCase() + platform.slice(1);
            return (
              <div key={platform} className="flex items-center space-x-2 text-neutral-300">
                <Checkbox 
                  id={`platform-${platform}`}
                  checked={selectedPlatforms.includes(typedPlatform)}
                  onCheckedChange={() => handlePlatformToggle(typedPlatform)}
                  disabled={!isConnected || isSubmitting}
                />
                <Label 
                  htmlFor={`platform-${platform}`}
                  className={!isConnected ? "text-slate-400 " : ""}
                >
                  {platformName}
                  {!isConnected && ` ${t.helper.notConnected}`}
                </Label>
              </div>
            );
          })}
        </div>
        
        {/* Credits cost preview */}
        {selectedPlatforms.length > 0 && (
          <div className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg border border-neutral-700">
            <div className="flex items-center gap-2 text-sm text-neutral-300">
              <CreditCard className="h-4 w-4 text-cyan-400" />
              <span>Publishing cost:</span>
            </div>
            <span className="text-sm font-semibold text-cyan-400">
              {selectedPlatforms.length} {selectedPlatforms.length === 1 ? 'credit' : 'credits'}
            </span>
          </div>
        )}
        
        {/* Insufficient credits warning */}
        {selectedPlatforms.length > 0 && credits && credits.publish_remaining !== null && credits.publish_remaining < selectedPlatforms.length && (
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
      
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
          {t.buttons.back}
        </Button>
        
        <Button 
          type="submit" 
          disabled={
            isSubmitting || 
            selectedPlatforms.length === 0 ||
            (credits && credits.publish_remaining !== null && credits.publish_remaining < selectedPlatforms.length)
          }
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t.buttons.publishing}
            </>
          ) : credits && credits.publish_remaining !== null && credits.publish_remaining < selectedPlatforms.length ? (
            <>
              <CreditCard className="mr-2 h-4 w-4" /> Insufficient Credits
            </>
          ) : (
            t.buttons.publish
          )}
        </Button>
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
