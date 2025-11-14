import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ItemFormData, ItemImage, GeneratedItemDataWithVinted } from '@/types/item';
import ImageUploader from './ImageUploader';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getTranslations, getCurrentLanguage } from '@/components/language-utils';
import { addItemFormTranslations } from '@/utils/translations/add-item-form-translations';

interface AddItemFormProps {
  onComplete: (generatedData: GeneratedItemDataWithVinted) => void;
  language?: string;
}

/**
 * AddItemForm now sends **only the R2 public URLs** of each uploaded image to the
 * backend, instead of re‑uploading binary data. This dramatically reduces
 * payload size and lets the server (or GPT‑4o Vision) fetch the images directly.
 */
const AddItemForm = ({ onComplete, language }: AddItemFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<ItemImage[]>([]);
  const [generateEnhancedImage, setGenerateEnhancedImage] = useState(true);
  const { user } = useAuth();
  const t = getTranslations(addItemFormTranslations);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ItemFormData>({
    defaultValues: {
      title: '',
      expected_price: '',
    },
  });

  const onSubmit = async (data: ItemFormData) => {
    if (images.length === 0) {
      toast({
        title: t.toast.noImagesTitle,
        description: t.toast.noImagesDesc,
        variant: 'destructive',
      });
      return;
    }

    // Ensure every image has finished uploading. If any is still uploading, block submit.
    const stillUploading = images.some((img) => !img.isUploaded);
    if (stillUploading) {
      toast({
        title: t.toast.uploadInProgressTitle,
        description: t.toast.uploadInProgressDesc,
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      /**
       * Build the JSON payload - simplified to only images + optional title + optional expected_price
       * AI generates all other fields (brand, description, condition, category, size, gender)
       */
      const payload: Record<string, any> = {
        images: images.map((img) => img.url),
        generate_enhanced_image: generateEnhancedImage,
      };

      // Only add title and expected_price if user provided them
      if (data.title && data.title.trim()) {
        payload.title = data.title.trim();
      }
      if (data.expected_price && data.expected_price.trim()) {
        payload.expected_price = parseFloat(data.expected_price.trim());
      }

      const token = localStorage.getItem('flipit_token');
      const response = await fetch('/api/FlipIt/api/items/propose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to generate item data');
      }

      const generatedData = await response.json();

      console.log('📦 /propose API Response:', generatedData);

      // Transform API response to match our UI representation
      const [minPrice, maxPrice] = generatedData.price_range || [];

      // Avoid duplicating images: some backends echo the same URLs back
      const existingUrls = new Set(images.map((img) => img.url));
      const aiImages: ItemImage[] = (generatedData.images || [])
        .filter((url: string) => !existingUrls.has(url))
        .map((url: string, idx: number) => ({
          id: `generated-${idx}`,
          url,
          isUploaded: true,
        }));

      // 🍌 Add enhanced images from nano banana (if available)
      const enhancedImages: ItemImage[] = (generatedData.enhanced_images || [])
        .map((url: string, idx: number) => ({
          id: `enhanced-${idx}`,
          url,
          isUploaded: true,
          enhanced: true, // Flag for UI display
        }));

      if (enhancedImages.length > 0) {
        console.log('🎨 Enhanced images received:', enhancedImages);
      }

      const transformedData: GeneratedItemDataWithVinted = {
        // All fields from AI (user only provided title and expected_price)
        title: generatedData.title || data.title || 'Generated Title',
        description: generatedData.description || 'AI-generated description',
        brand: generatedData.brand || '',
        condition: generatedData.condition || 'Used as new',
        category: generatedData.category || 'Generated category',
        price: generatedData.price?.toString() || data.expected_price || '0',
        catalog_path: generatedData.catalog_path,
        size: generatedData.size,
        draft_id: generatedData.draft_id,
        gender: generatedData.gender,
        priceRange: {
          min: minPrice?.toString() || '',
          max: maxPrice?.toString() || '',
        },
        images: [...images, ...aiImages, ...enhancedImages], // Include enhanced images
        // Include Vinted dynamic fields if present
        vinted_field_definitions: generatedData.vinted_field_definitions,
        vinted_field_mappings: generatedData.vinted_field_mappings,
        // Include AI-generated metadata
        brand_id: generatedData.brand_id,
        brand_title: generatedData.brand_title,
        brand_confidence: generatedData.brand_confidence,
        model_id: generatedData.model_id,
        package_size_id: generatedData.package_size_id,
        package_size: generatedData.package_size,
        // 🍌 Pass enhanced_images separately for display logic
        enhanced_images: generatedData.enhanced_images,
      };

      console.log('✅ Transformed data for review form:', transformedData);

      onComplete(transformedData);
    } catch (error) {
      console.error('Error generating item data:', error);
      toast({
        title: t.toast.errorTitle,
        description: t.toast.errorDesc,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Images - REQUIRED */}
      <div>
        <h3 className="text-lg font-medium mb-4 text-neutral-300">
          {t.sections.uploadImages} <span className="text-red-500">*</span>
        </h3>
        <ImageUploader images={images} onChange={setImages} isDisabled={isSubmitting} />
        <p className="text-sm text-slate-400 mt-2">
          {t.toast.noImagesDesc}
        </p>
      </div>

      {/* Optional user inputs - title and expected price only */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-neutral-300">{t.sections.optionalDetails}</h3>
        <p className="text-sm text-slate-400">
          {t.sections.helperText}
        </p>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-neutral-300">
              {t.labels.title} <span className="text-slate-500 text-xs">(optional)</span>
            </Label>
            <Input 
              id="title" 
              placeholder={t.placeholders.title}
              {...register('title')} 
              disabled={isSubmitting} 
            />
          </div>

          <div>
            <Label htmlFor="expected_price" className="text-neutral-300">
              {t.labels.expectedPrice} <span className="text-slate-500 text-xs">(optional)</span>
            </Label>
            <Input 
              id="expected_price" 
              type="number"
              step="0.01"
              min="0"
              placeholder={t.placeholders.expectedPrice}
              {...register('expected_price')} 
              disabled={isSubmitting} 
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="flex-1">
              <Label htmlFor="enhance-toggle" className="text-neutral-300 cursor-pointer">
                🎨 Generate AI-Enhanced Image
              </Label>
              <p className="text-xs text-slate-400 mt-1">
                Use Gemini to create a professional product photo with improved background
              </p>
            </div>
            <Switch
              id="enhance-toggle"
              checked={generateEnhancedImage}
              onCheckedChange={setGenerateEnhancedImage}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting || images.length === 0} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t.buttons.generating}
          </>
        ) : (
          t.buttons.continue
        )}
      </Button>
    </form>
  );
};

export default AddItemForm;
