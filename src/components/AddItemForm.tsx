import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ItemFormData, ItemImage, GeneratedItemData, Platform } from '@/types/item';
import ImageUploader from './ImageUploader';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import imageCompression from 'browser-image-compression';

interface AddItemFormProps {
  onComplete: (generatedData: GeneratedItemData) => void;
}

const AddItemForm = ({ onComplete }: AddItemFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<ItemImage[]>([]);
  const [catalogPath, setCatalogPath] = useState('');
  const { user } = useAuth();
  
  const { register, handleSubmit, formState: { errors } } = useForm<ItemFormData>({
    defaultValues: {
      title: '',
      description: '',
      brand: '',
      condition: '',
      category: '',
      price: '',
    }
  });
  
  const onSubmit = async (data: ItemFormData) => {
    if (images.length === 0) {
      toast({
        title: "No images",
        description: "Please add at least one image of your item",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      if (data.title) formData.append('title', data.title);
      if (data.description) formData.append('description', data.description);
      if (data.brand) formData.append('brand', data.brand);
      if (data.condition) formData.append('condition', data.condition);
      if (data.category) formData.append('category', data.category);
      if (data.price !== undefined && data.price !== null && data.price !== '') {
        formData.append('price', String(data.price));
      }
      if (catalogPath) {
        formData.append('catalog_path', catalogPath);
      }

      // Compress and add images
      for (const image of images) {
        if (image.file) {
          try {
            const compressedFile = await imageCompression(image.file, {
              maxSizeMB: 1,
              maxWidthOrHeight: 1000,
              useWebWorker: true,
            });
            formData.append('images', compressedFile, image.file.name);
          } catch (err) {
            console.error('Image compression failed:', err);
            toast({
              title: "Image compression failed",
              description: `Could not compress ${image.file.name}. Uploading original file.`,
              variant: "destructive",
            });
            formData.append('images', image.file);
          }
        }
      }

      // Send request
      const token = localStorage.getItem('flipit_token');
      const response = await fetch('/api/FlipIt/api/items/propose', {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined,
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to generate item data');
      }

      const generatedData = await response.json();
      // console.log('Generated item:', generatedData);

      // Transform API response to match our expected format
      const [minPrice, maxPrice] = generatedData.price_range || [];

      const transformedData: GeneratedItemData = {
        title: generatedData.title || data.title,
        description: generatedData.description || data.description,
        brand: generatedData.brand || data.brand,
        condition: generatedData.condition || data.condition,
        category: generatedData.category || data.category,
        price: generatedData.price?.toString() || data.price,
        catalog_path: generatedData.catalog_path || catalogPath,
        priceRange: {
          min: minPrice?.toString() || '',
          max: maxPrice?.toString() || '',
        },
        images: generatedData.images ? [
          ...images,
          ...generatedData.images.map((url: string, index: number) => ({
            id: `generated-${index}`,
            url,
            isUploaded: true
          }))
        ] : images,
        // catalog_path: generatedData.catalog_path || catalogPath || '',
      };

      onComplete(transformedData);
    } catch (error) {
      console.error('Error generating item data:', error);
      toast({
        title: "Error",
        description: "Failed to generate item data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div>
        <h3 className="text-lg font-medium mb-4">Upload Images</h3>
        <ImageUploader 
          images={images} 
          onChange={setImages} 
          isDisabled={isSubmitting}
        />
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Item Details (Optional)</h3>
        <p className="text-sm text-slate-500">
          Fill in what you know. Our system will help generate the rest.
        </p>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input 
              id="title"
              placeholder="e.g., Nike Air Max 90"
              {...register('title')}
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              placeholder="Describe your item"
              className="min-h-[100px]"
              {...register('description')}
              disabled={isSubmitting}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="brand">Brand</Label>
              <Input 
                id="brand" 
                placeholder="e.g., Nike, Samsung, IKEA"
                {...register('brand')}
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <Label htmlFor="condition">Condition</Label>
              <Input 
                id="condition" 
                placeholder="e.g., New, Used - Like New"
                {...register('condition')}
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Input 
                id="category" 
                placeholder="e.g., Electronics, Clothing"
                {...register('category')}
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <Label htmlFor="price">Price</Label>
              <Input 
                id="price" 
                type="text"
                placeholder="e.g., 49.99"
                {...register('price')}
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Hidden input for catalog_path */}
      <input type="hidden" name="catalog_path" value={catalogPath} readOnly />
      
      <Button type="submit" disabled={isSubmitting || images.length === 0} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          'Continue'
        )}
      </Button>
    </form>
  );
};

export default AddItemForm;
