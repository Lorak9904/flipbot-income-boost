import { useState } from 'react';
import { GeneratedItemData, ItemImage, Platform } from '@/types/item';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import ImageUploader from './ImageUploader';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ReviewItemFormProps {
  initialData: GeneratedItemData;
  connectedPlatforms: Record<Platform, boolean>;
  onBack: () => void;
}

const ReviewItemForm = ({ initialData, connectedPlatforms, onBack }: ReviewItemFormProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<GeneratedItemData>(initialData);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(
    Object.entries(connectedPlatforms)
      .filter(([_, isConnected]) => isConnected)
      .map(([platform]) => platform as Platform)
  );
  
  const updateField = (field: keyof GeneratedItemData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };
  
  const handlePlatformToggle = (platform: Platform) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };
  
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (selectedPlatforms.length === 0) {
    toast({
      title: "No platforms selected",
      description: "Please select at least one platform to publish to",
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


    
    // Prepare FormData
    const formData = new FormData();
    // Append images as files
    data.images.forEach((img: any) => {
      if (data.catalog_path) {
        formData.append('catalog_path', data.catalog_path);
    }
      // If your image object has a File, use it; otherwise, fetch and convert the URL to a Blob/File
      if (img.file) {
        formData.append('images', img.file);
      } else if (img.url && img.url.startsWith('blob:')) {
        // If you only have a blob URL, fetch it and convert to File
        // (This is needed if you use canvas or similar in the uploader)
        // Example:
        // const blob = await fetch(img.url).then(r => r.blob());
        // formData.append('images', new File([blob], 'image.jpg', { type: blob.type }));
      } else if (img.url) {
        // If you have a server path, you can't re-upload it as a file
        // You must keep the File reference from the original upload step!
      }
    });
    formData.append('title', data.title);
    formData.append('brand', data.brand || '');
    formData.append('condition', data.condition || '');
    formData.append('price', numericPrice.toString());
    formData.append('description', data.description);
    formData.append('category', data.category);
    selectedPlatforms.forEach(p => formData.append('platforms', p));

    const token = localStorage.getItem('flipit_token');
    const response = await fetch('/api/FlipIt/api/items/publish', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Do NOT set Content-Type here; browser will set it for FormData
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to publish item');
    }

    const result = await response.json();

    toast({
      title: "Success!",
      description: "Your item has been published successfully",
    });

    window.location.href = '/app/';

  } catch (error) {
    console.error('Error publishing item:', error);
    toast({
      title: "Error",
      description: "Failed to publish item. Please try again.",
      variant: "destructive",
    });
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h3 className="text-lg font-medium mb-4">Images</h3>
        <ImageUploader 
          images={data.images} 
          onChange={(images) => updateField('images', images)} 
          isDisabled={isSubmitting}
        />
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Item Details</h3>
        
        <div>
          <Label htmlFor="title">Title</Label>
          <Input 
            id="title"
            value={data.title}
            onChange={(e) => updateField('title', e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="description">Description</Label>
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
          <div>
            <Label htmlFor="brand">Brand</Label>
            <Input 
              id="brand" 
              value={data.brand}
              onChange={(e) => updateField('brand', e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <Label htmlFor="condition">Condition</Label>
            <Input 
              id="condition" 
              value={data.condition}
              onChange={(e) => updateField('condition', e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">Category</Label>
            <Input 
              id="category" 
              value={data.category}
              onChange={(e) => updateField('category', e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="price">Price</Label>
            <Input 
              id="price" 
              value={data.price}
              onChange={(e) => updateField('price', e.target.value)}
              disabled={isSubmitting}
              required
            />
            {data.priceRange.min && data.priceRange.max && (
              <p className="text-xs text-slate-500 mt-1">
                Suggested price range: PLN{data.priceRange.min} - PLN{data.priceRange.max}
              </p>
            )}
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Publish to Platforms</h3>
        
        <div className="flex flex-col gap-3">
          {Object.entries(connectedPlatforms).map(([platform, isConnected]) => {
            const typedPlatform = platform as Platform;
            return (
              <div key={platform} className="flex items-center space-x-2">
                <Checkbox 
                  id={`platform-${platform}`}
                  checked={selectedPlatforms.includes(typedPlatform)}
                  onCheckedChange={() => handlePlatformToggle(typedPlatform)}
                  disabled={!isConnected || isSubmitting}
                />
                <Label 
                  htmlFor={`platform-${platform}`}
                  className={!isConnected ? "text-slate-400" : ""}
                >
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  {!isConnected && " (not connected)"}
                </Label>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
          Back
        </Button>
        
        <Button type="submit" disabled={isSubmitting || selectedPlatforms.length === 0}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Publishing...
            </>
          ) : (
            'Publish Item'
          )}
        </Button>
      </div>
    </form>
  );
};

export default ReviewItemForm;
