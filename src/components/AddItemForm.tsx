import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ItemFormData, ItemImage, GeneratedItemData } from '@/types/item';
import ImageUploader from './ImageUploader';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getTranslations, getCurrentLanguage } from '@/components/language-utils';
import { addItemFormTranslations } from '@/utils/translations/add-item-form-translations';

interface AddItemFormProps {
  onComplete: (generatedData: GeneratedItemData) => void;
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
  const [catalogPath, setCatalogPath] = useState('');
  const { user } = useAuth();
  const t = getTranslations(addItemFormTranslations);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ItemFormData>({
    defaultValues: {
      title: '',
      description: '',
      brand: '',
      condition: '',
      category: '',
      price: '',
      size: '',
      gender: '',
    },
  });

  /** Helper that conditionally adds properties only when they have content */
  const maybe = <T extends object, K extends keyof T>(obj: T, key: K, value: T[K]) => {
    if (value !== undefined && value !== null && value !== '') {
      obj[key] = value;
    }
  };

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
       * Build the JSON payload. We only send scalar fields + `images: string[]`.
       * The server can download images from our CDN when needed.
       */
      const payload: Record<string, any> = {
        images: images.map((img) => img.url), // ⇦ only the URLs!
      };

      maybe(payload, 'title', data.title);
      maybe(payload, 'description', data.description);
      maybe(payload, 'brand', data.brand);
      maybe(payload, 'condition', data.condition);
      maybe(payload, 'category', data.category);
      maybe(payload, 'price', data.price);
      maybe(payload, 'size', data.size);
      maybe(payload, 'catalog_path', catalogPath);
      maybe(payload, 'gender', data.gender);

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

      const transformedData: GeneratedItemData = {
        title: generatedData.title || data.title,
        description: generatedData.description || data.description,
        brand: generatedData.brand || data.brand,
        condition: generatedData.condition || data.condition,
        category: generatedData.category || data.category,
        price: generatedData.price?.toString() || data.price,
        catalog_path: generatedData.catalog_path || catalogPath,
        size: generatedData.size || data.size,
        draft_id: generatedData.draft_id,
        gender: generatedData.gender || data.gender,
        priceRange: {
          min: minPrice?.toString() || '',
          max: maxPrice?.toString() || '',
        },
        images: [...images, ...aiImages],
      };

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
      {/* Images */}
      <div>
        <h3 className="text-lg font-medium mb-4 text-neutral-300">{t.sections.uploadImages}</h3>
        <ImageUploader images={images} onChange={setImages} isDisabled={isSubmitting} />
      </div>

      {/* Optional details */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-neutral-300">{t.sections.itemDetails}</h3>
        <p className="text-sm text-slate-500">{t.sections.helperText}</p>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-neutral-300">
              {t.labels.title}
            </Label>
            <Input id="title" placeholder={t.placeholders.title} {...register('title')} disabled={isSubmitting} />
          </div>

          <div>
            <Label htmlFor="description" className="text-neutral-300">
              {t.labels.description}
            </Label>
            <Textarea
              id="description"
              placeholder={t.placeholders.description}
              className="min-h-[100px]"
              {...register('description')}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="brand" className="text-neutral-300">
                {t.labels.brand}
              </Label>
              <Input id="brand" placeholder={t.placeholders.brand} {...register('brand')} disabled={isSubmitting} />
            </div>

            <div>
              <Label htmlFor="condition" className="text-neutral-300">
                {t.labels.condition}
              </Label>
              <Label htmlFor="condition" className="text-neutral-300">
                {t.labels.condition}
              </Label>
              <Input id="condition" placeholder={t.placeholders.condition} {...register('condition')} disabled={isSubmitting} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="category" className="text-neutral-300">
                {t.labels.category}
              </Label>
              <Input id="category" placeholder={t.placeholders.category} {...register('category')} disabled={isSubmitting} />
            </div>
            <div>
              <Label htmlFor="price" className="text-neutral-300">
                {t.labels.price}
              </Label>
              <Input id="price" type="text" placeholder={t.placeholders.price} {...register('price')} disabled={isSubmitting} />
            </div>
            <div>
              <Label htmlFor="size" className="text-neutral-300">
                {t.labels.size}
              </Label>
              <Input id="size" placeholder={t.placeholders.size} {...register('size')} disabled={isSubmitting} />
            </div>
            <div>
              <Label htmlFor="gender" className="text-neutral-300">
                {t.labels.gender}
              </Label>
              <Input id="gender" placeholder={t.placeholders.gender} {...register('gender')} disabled={isSubmitting} />
            </div>
          </div>
        </div>
      </div>

      {/* Hidden catalog path */}
      <input type="hidden" name="catalog_path" value={catalogPath} readOnly />

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
