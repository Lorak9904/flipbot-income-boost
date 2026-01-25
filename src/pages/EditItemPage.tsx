import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { UserItem, ItemImage } from '@/types/item';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { BackButtonGhost, AddItemButton, SecondaryAction } from '@/components/ui/button-presets';
import { motion } from 'framer-motion';
import { Loader2, Save, Settings2, Sparkles, Info } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { AnimatedGradientBackground } from '@/components/AnimatedGradientBackground';
import { fetchItemDetail, updateItem, UpdateItemPayload, enhanceItemImages } from '@/lib/api/items';
import { resolveItemImageUrl, cdnThumb } from '@/lib/images';
import ImageUploader from '@/components/ImageUploader';
import { PlatformOverridesModal } from '@/components/PlatformOverridesModal';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 * i, duration: 0.6, ease: 'easeOut' },
  }),
};

const EditItemPage = () => {
  const { uuid } = useParams<{ uuid: string }>();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [item, setItem] = useState<UserItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showOverridesModal, setShowOverridesModal] = useState(false);
  const [enhancing, setEnhancing] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [brand, setBrand] = useState('');
  const [condition, setCondition] = useState('');
  const [category, setCategory] = useState('');
  const [size, setSize] = useState('');
  const [images, setImages] = useState<ItemImage[]>([]);

  // Track if there are unsaved changes
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to edit items',
        variant: 'destructive',
      });
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate, toast]);

  useEffect(() => {
    if (!isAuthenticated || !uuid) return;

    const loadItem = async () => {
      setLoading(true);
      try {
        const itemData = await fetchItemDetail(uuid);
        setItem(itemData);

        // Initialize form fields
        setTitle(itemData.title || '');
        setDescription(itemData.description || '');
        setPrice(itemData.price ? String(itemData.price) : '');
        setBrand(itemData.brand || '');
        setCondition(itemData.condition || '');
        setCategory(itemData.category || '');
        setSize(itemData.size || '');

        // Convert images to ItemImage format
        const imageUrls = (itemData.images || [])
          .map((img) => resolveItemImageUrl(img))
          .filter((url): url is string => Boolean(url));

        const convertedImages: ItemImage[] = imageUrls.map((url, index) => ({
          id: `existing-${index}`,
          url,
          isUploaded: true,
        }));
        setImages(convertedImages);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load item';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        navigate('/user/items');
      } finally {
        setLoading(false);
      }
    };

    loadItem();
  }, [isAuthenticated, uuid, navigate, toast]);

  // Detect changes (including image changes)
  useEffect(() => {
    if (!item) return;

    // Check text field changes
    const textChanged =
      title !== (item.title || '') ||
      description !== (item.description || '') ||
      price !== (item.price ? String(item.price) : '') ||
      brand !== (item.brand || '') ||
      condition !== (item.condition || '') ||
      category !== (item.category || '') ||
      size !== (item.size || '');

    // Check image changes (order, additions, deletions)
    const currentImageUrls = images.map((img) => img.url).join(',');
    const originalImageUrls = ((item.images || []) as string[]).join(',');
    const imagesChanged = currentImageUrls !== originalImageUrls;

    setHasChanges(textChanged || imagesChanged);
  }, [title, description, price, brand, condition, category, size, images, item]);

  const handleSave = async () => {
    if (!uuid) return;

    setSaving(true);
    try {
      const payload: UpdateItemPayload = {
        title,
        description,
        price: parseFloat(price) || 0,
        brand,
        condition,
        category,
        size,
        images: images.map((img) => img.url),
      };

      await updateItem(uuid, payload);

      toast({
        title: '✅ Item updated',
        description: 'Your changes have been saved.',
      });

      // Redirect to item detail page
      navigate(`/user/items/${uuid}`);
    } catch (error) {
      toast({
        title: '❌ Failed to save',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEnhanceImages = async () => {
    if (!uuid || images.length === 0) {
      toast({
        title: 'No images to enhance',
        description: 'Please add images before enhancing',
        variant: 'destructive',
      });
      return;
    }

    setEnhancing(true);
    try {
      // Send current image order from frontend (respects user's reordering)
      const imageUrls = images.map((img) => img.url);
      const result = await enhanceItemImages(uuid, imageUrls);

      // Update images with enhanced version (prepended to list)
      const enhancedImages: ItemImage[] = result.all_images.map((url, index) => ({
        id: `enhanced-${index}`,
        url,
        isUploaded: true,
      }));

      setImages(enhancedImages);

      toast({
        title: '✨ Images enhanced',
        description: 'Your images have been enhanced with AI (1 credit used)',
      });

      setHasChanges(false);

      // Reload item to get updated data
      const updatedItem = await fetchItemDetail(uuid);
      setItem(updatedItem);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: '❌ Enhancement failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setEnhancing(false);
    }
  };

  const isPublished = item?.stage === 'published';
  const lastUpdated = item?.updated_at;
  const lastPublished = item?.published_at;
  const hasUnpublishedChanges =
    isPublished && lastUpdated && lastPublished && new Date(lastUpdated) > new Date(lastPublished);

  if (authLoading || loading) {
    return (
      <div className="relative min-h-screen bg-neutral-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="relative min-h-screen bg-neutral-950 text-white">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Card className="p-12 bg-neutral-900/50 border-neutral-800 backdrop-blur-sm">
            <div className="text-center">
              <p className="text-red-400 mb-4">Item not found</p>
              <BackButtonGhost onClick={() => navigate('/user/items')}>Back to Items</BackButtonGhost>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead title={`Edit ${item.title} - FlipIt`} description={item.description} />
      <div className="relative min-h-screen text-white overflow-hidden">
        <AnimatedGradientBackground />

        <div className="relative container mx-auto px-4 py-8 max-w-4xl">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-6">
            <BackButtonGhost onClick={() => navigate(`/user/items/${uuid}`)} className="mb-4">
              Back to Item
            </BackButtonGhost>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
            <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl text-white">Edit Item</CardTitle>
                    <CardDescription className="text-neutral-400 mt-2">
                      Update your listing details
                    </CardDescription>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    {hasChanges && (
                      <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50">
                        Unsaved Changes
                      </Badge>
                    )}
                    {hasUnpublishedChanges && (
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                        Modified After Publish
                      </Badge>
                    )}
                  </div>
                </div>
                {lastUpdated && (
                  <p className="text-sm text-neutral-500 mt-2">
                    Last updated: {format(new Date(lastUpdated), 'PPp')}
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Images */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-white">Images</Label>
                    {images.length > 0 && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <SecondaryAction
                              onClick={handleEnhanceImages}
                              disabled={enhancing}
                              className="flex items-center gap-2 h-8 text-xs px-3"
                            >
                              {enhancing ? (
                                <>
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                  Enhancing...
                                </>
                              ) : (
                                <>
                                  <Sparkles className="h-3 w-3" />
                                  Enhance with AI
                                </>
                              )}
                            </SecondaryAction>
                          </TooltipTrigger>
                          <TooltipContent className="bg-neutral-800 text-white border-neutral-700">
                            <p className="flex items-center gap-2">
                              <Info className="h-3 w-3" />
                              Generates professional product photos (costs 1 credit)
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  <ImageUploader images={images} onChange={setImages} />
                </div>

                {/* Title */}
                <div>
                  <Label htmlFor="title" className="text-white">
                    Title
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-neutral-800 border-neutral-700 text-white mt-2"
                    placeholder="Item title"
                  />
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description" className="text-white">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-neutral-800 border-neutral-700 text-white mt-2 min-h-[120px]"
                    placeholder="Item description"
                  />
                </div>

                {/* Price, Brand, Condition - Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="price" className="text-white">
                      Price
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="bg-neutral-800 border-neutral-700 text-white mt-2"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="brand" className="text-white">
                      Brand
                    </Label>
                    <Input
                      id="brand"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="bg-neutral-800 border-neutral-700 text-white mt-2"
                      placeholder="Brand name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="condition" className="text-white">
                      Condition
                    </Label>
                    <Input
                      id="condition"
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                      className="bg-neutral-800 border-neutral-700 text-white mt-2"
                      placeholder="e.g., New, Used"
                    />
                  </div>
                </div>

                {/* Category, Size - Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category" className="text-white">
                      Category
                    </Label>
                    <Input
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="bg-neutral-800 border-neutral-700 text-white mt-2"
                      placeholder="Item category"
                    />
                  </div>
                  <div>
                    <Label htmlFor="size" className="text-white">
                      Size
                    </Label>
                    <Input
                      id="size"
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                      className="bg-neutral-800 border-neutral-700 text-white mt-2"
                      placeholder="Size (if applicable)"
                    />
                  </div>
                </div>

                {/* Platform Overrides Button */}
                {isPublished && (
                  <div className="pt-4 border-t border-neutral-800">
                    <SecondaryAction
                      onClick={() => setShowOverridesModal(true)}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <Settings2 className="h-4 w-4" />
                      Platform-Specific Settings
                    </SecondaryAction>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <AddItemButton
                    onClick={handleSave}
                    disabled={saving || !hasChanges}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </AddItemButton>
                  <SecondaryAction onClick={() => navigate(`/user/items/${uuid}`)}>
                    Cancel
                  </SecondaryAction>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Platform Overrides Modal */}
      {item && (
        <PlatformOverridesModal
          item={item}
          open={showOverridesModal}
          onOpenChange={setShowOverridesModal}
          onSave={async () => {
            // Reload item to get updated overrides
            const updatedItem = await fetchItemDetail(uuid!);
            setItem(updatedItem);
          }}
        />
      )}
    </>
  );
};

export default EditItemPage;
