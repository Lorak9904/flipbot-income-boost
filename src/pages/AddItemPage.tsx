import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { GeneratedItemDataWithVinted, ItemImage, Platform } from '@/types/item';
import AddItemForm from '@/components/AddItemForm';
import ReviewItemForm from '@/components/ReviewItemForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { getTranslations, getCurrentLanguage } from '@/components/language-utils';
import { addItemTranslations } from '@/utils/translations/add-item-translations';
import { AnimatedGradientBackground } from '@/components/AnimatedGradientBackground';
import { fetchItemDetail } from '@/lib/api/items';
import { resolveItemImageUrl } from '@/lib/images';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 * i, duration: 0.6, ease: 'easeOut' },
  }),
};

const AddItemPage = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [language, setLanguage] = useState(getCurrentLanguage());
  const t = getTranslations(addItemTranslations);
  const [step, setStep] = useState<'add' | 'review'>('add');
  const [generatedData, setGeneratedData] = useState<GeneratedItemDataWithVinted | null>(null);
  const [isLoadingItem, setIsLoadingItem] = useState(false);
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [publishedPlatforms, setPublishedPlatforms] = useState<Platform[]>([]);
  const [connectedPlatforms, setConnectedPlatforms] = useState<Record<Platform, boolean>>({
    facebook: false,
    olx: false,
    vinted: false,
    ebay: false
  });
  const editId = searchParams.get('edit');
  const publishParam = searchParams.get('publish');
  const publishPlatform = (['facebook', 'olx', 'vinted', 'ebay'] as Platform[]).includes(publishParam as Platform)
    ? (publishParam as Platform)
    : null;

  // Edit flow: transform existing draft into review-form data without re-running AI.
  const buildEditData = (item: any): GeneratedItemDataWithVinted => {
    const imageUrls = (item.images || [])
      .map((img: unknown) => resolveItemImageUrl(img))
      .filter((url: string | null): url is string => Boolean(url));

    const images: ItemImage[] = imageUrls.map((url, index) => ({
      id: `existing-${index}`,
      url,
      isUploaded: true,
    }));

    const analysis = item.analysis && typeof item.analysis === 'object' ? item.analysis : {};
    const platformOverrides =
      item.platform_listing_overrides && typeof item.platform_listing_overrides === 'object'
        ? item.platform_listing_overrides
        : undefined;
    const vintedFieldMappings =
      platformOverrides?.vinted?.field_mappings || analysis.vinted_field_mappings;
    const priceText = item.price !== undefined && item.price !== null ? String(item.price) : '0';

    return {
      title: item.title || '',
      description: item.description || item.description_full || '',
      brand: item.brand || '',
      condition: item.condition || '',
      category: item.category || '',
      price: priceText,
      catalog_path: item.catalog_path || item.catalog_path_detected || '',
      size: item.size || '',
      gender: item.gender,
      draft_id: item.uuid || item.id,
      priceRange: {
        min: '',
        max: '',
      },
      platform_listing_overrides: platformOverrides,
      images,
      vinted_field_definitions: analysis.vinted_field_definitions,
      vinted_field_mappings: vintedFieldMappings,
      brand_id: analysis.brand_id,
      brand_title: analysis.brand_title,
      brand_confidence: analysis.brand_confidence,
      model_id: analysis.model_id,
      package_size_id: analysis.package_size_id,
      package_size: analysis.package_size,
      enhanced_images: analysis.enhanced_images,
    };
  };
  
  useEffect(() => {
    const token = localStorage.getItem('flipit_token');
    if (!token) {
      toast({
        title: t.authRequired,
        description: t.authMessage,
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    if (!isLoading && !isAuthenticated) {
      toast({
        title: t.authRequired,
        description: t.authMessage,
      });
      navigate('/login');
      return;
    }

    const fetchConnectedPlatforms = async () => {
      try {
        const response = await fetch("/api/connected-platforms", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
        if (!response.ok) {
          if (response.status === 401) {
            toast({
              title: t.sessionExpired,
              description: t.sessionMessage,
              variant: "destructive",
            });
            navigate("/login");
            return;
          }
          throw new Error("Failed to fetch connected platforms");
        }
        if (response.ok) {
          const data = await response.json();
          setConnectedPlatforms(data);
        }
      } catch (error) {
        console.error('Error fetching connected platforms:', error);
      }
    };

    if (isAuthenticated) {
      fetchConnectedPlatforms();
    }
  }, [isAuthenticated, isLoading, navigate, toast]);

  useEffect(() => {
    if (!isAuthenticated || !editId) {
      return;
    }

    const loadEditItem = async () => {
      setIsLoadingItem(true);
      try {
        const item = await fetchItemDetail(editId);
        const transformed = buildEditData(item);
        setGeneratedData(transformed);
        setEditItemId(item.uuid);

        const published = (item.publish_results || [])
          .filter((result: any) => result.status === 'success')
          .map((result: any) => result.platform);
        const fallbackPlatforms = (item.platforms_published || item.platforms || []) as Platform[];
        setPublishedPlatforms(published.length > 0 ? published : fallbackPlatforms);

        setStep('review');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load item for edit';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: "destructive",
        });
        navigate('/user/items');
      } finally {
        setIsLoadingItem(false);
      }
    };

    loadEditItem();
  }, [editId, isAuthenticated, navigate, toast, t]);
  
  const handleComplete = (data: GeneratedItemDataWithVinted) => {
    setGeneratedData(data);
    setStep('review');
  };
  
  const handleBack = () => {
    if (editId) {
      navigate(`/user/items/${editId}`);
      return;
    }
    setStep('add');
  };
  
  if (isLoading || isLoadingItem) {
    return (
      <div className="relative min-h-screen text-white overflow-hidden">
        <SEOHead
          title="Add Item | FlipIt"
          description="Add an item for marketplace automation — FlipIt generates descriptions, pricing, and categories, then crosslists to OLX, Vinted, Facebook Marketplace, and eBay."
          canonicalUrl="https://myflipit.live/add-item"
          robots="noindex, nofollow"
        />
        <AnimatedGradientBackground />

        <div className="container mx-auto py-12">
          <div className="flex justify-center items-center min-h-[50vh]">
            <Loader2 className="h-12 w-12 animate-spin text-cyan-400" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      <SEOHead
        title={`${step === 'add' ? t.pageTitle : t.reviewTitle} | FlipIt`}
        description={step === 'add' ? t.addCard.description : t.reviewCard.description}
        canonicalUrl="https://myflipit.live/add-item"
        robots="noindex, nofollow"
      />
      <AnimatedGradientBackground />

      {/* Content */}
      <div className="container mx-auto py-12 px-4 relative z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="max-w-3xl mx-auto"
        >
          <motion.h1 
            variants={fadeUp}
            className="text-3xl font-bold mb-6"
          >
            {step === 'add' ? t.pageTitle : t.reviewTitle}
          </motion.h1>
          
          {step === 'add' ? (
            <Card className="bg-neutral-900/50 backdrop-blur-sm ring-1 ring-neutral-700 transition-all duration-300 hover:ring-cyan-400/40 hover:shadow-xl border-0">
              <CardHeader>
                <CardTitle className="text-cyan-400">{t.addCard.title}</CardTitle>
                <CardDescription className="text-neutral-300">
                  {t.addCard.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AddItemForm onComplete={handleComplete} language={language} />
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-neutral-900/50 backdrop-blur-sm ring-1 ring-neutral-700 transition-all duration-300 hover:ring-fuchsia-400/40 hover:shadow-xl border-0">
              <CardHeader>
                <CardTitle className="text-fuchsia-400">{t.reviewCard.title}</CardTitle>
                <CardDescription className="text-neutral-300">
                  {t.reviewCard.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {generatedData && (
                  <ReviewItemForm 
                    initialData={generatedData} 
                    connectedPlatforms={connectedPlatforms}
                    onBack={handleBack}
                    language={language}
                    editItemId={editItemId || undefined}
                    publishedPlatforms={publishedPlatforms}
                    publishPlatform={publishPlatform || undefined}
                  />
                )}
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AddItemPage;
