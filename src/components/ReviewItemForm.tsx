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
import { useNavigate } from 'react-router-dom';
import { getTranslations, getCurrentLanguage } from '@/components/language-utils';
import { reviewItemFormTranslations } from '@/utils/translations/review-item-form-translations';

interface ReviewItemFormProps {
  initialData: GeneratedItemData;
  connectedPlatforms: Record<Platform, boolean>;
  onBack: () => void;
  language?: string;
}

const ReviewItemForm = ({ initialData, connectedPlatforms, onBack, language }: ReviewItemFormProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Ensure draft_id is preserved in state
  const [data, setData] = useState<GeneratedItemData & { draft_id?: string }>(initialData);
  const navigate = useNavigate();
  const t = getTranslations(reviewItemFormTranslations);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(
    Object.entries(connectedPlatforms)
      .filter(([_, isConnected]) => isConnected)
      .map(([platform]) => platform as Platform)
  );
  
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
    const payload = {
      draft_id: data.draft_id,
      images: uniqueImageUrls,
      title: data.title,
      brand: data.brand,
      condition: data.condition,
      category: data.category,
      size: data.size,
      gender: data.gender,
      price: numericPrice,
      description: data.description,
      catalog_path: data.catalog_path,
      platforms: selectedPlatforms,
    };
    console.log(data.draft_id)
    console.log(payload)


    const response = await fetch('/api/FlipIt/api/items/publish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
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

    setTimeout(() => {
      navigate('/');
    }, 1500); // 1.5 seconds, adjust as needed
    
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
          <div>
            <Label htmlFor="brand" className="text-neutral-300">{t.labels.brand}</Label>
            <Input 
              id="brand" 
              value={data.brand}
              onChange={(e) => updateField('brand', e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <Label htmlFor="condition" className="text-neutral-300">{t.labels.condition}</Label>
            <Input 
              id="condition" 
              value={data.condition}
              onChange={(e) => updateField('condition', e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="category" className="text-neutral-300">{t.labels.category}</Label>
            <Input 
              id="category" 
              value={data.category}
              onChange={(e) => updateField('category', e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>
          <div>
            <Label htmlFor="size" className="text-neutral-300">{t.labels.size}</Label>
            <Input 
              id="size" 
              value={data.size}
              onChange={(e) => updateField('size', e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>
          <div>
            <Label htmlFor="gender" className="text-neutral-300">{t.labels.gender}</Label>
            <Input 
              id="gender" 
              value={data.gender}
              onChange={(e) => updateField('gender', e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>
          
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
      </div>
      
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
          {t.buttons.back}
        </Button>
        
        <Button type="submit" disabled={isSubmitting || selectedPlatforms.length === 0}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t.buttons.publishing}
            </>
          ) : (
            t.buttons.publish
          )}
        </Button>
      </div>
    </form>
  );
};

export default ReviewItemForm;
