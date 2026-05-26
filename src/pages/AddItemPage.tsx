import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { GeneratedItemDataWithVinted, Platform } from '@/types/item';
import { Loader2 } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { getTranslations, getCurrentLanguage } from '@/components/language-utils';
import { addItemTranslations } from '@/utils/translations/add-item-translations';
import { AnimatedGradientBackground } from '@/components/AnimatedGradientBackground';
import { fetchItemDetail } from '@/lib/api/items';
import { fetchPlatformHealth, toPlatformConnectedMap } from '@/lib/api/platform-health';
import type { ReviewItemFormMode } from '@/components/review-item-form-mode';
import { getPublishedPlatforms, toReviewFormData } from '@/lib/items/review-form-adapter';
import { ListingEditorModal } from '@/components/listing-editor/ListingEditorModal';
import { ListingEditorCore } from '@/components/listing-editor/ListingEditorCore';
import { isSafeReturnPath } from '@/lib/listing-editor/navigation';

const AddItemPage = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const language = getCurrentLanguage();
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
    ebay: false,
    allegro: false,
  });
  const editId = searchParams.get('edit');
  const publishParam = searchParams.get('publish');
  const modalParam = searchParams.get('modal');
  const returnToParam = searchParams.get('returnTo');
  const publishPlatform = (['facebook', 'olx', 'vinted', 'ebay', 'allegro'] as Platform[]).includes(publishParam as Platform)
    ? (publishParam as Platform)
    : null;
  const isModalView = modalParam === '1';
  const returnToPath =
    isSafeReturnPath(returnToParam) && !returnToParam.startsWith('/add-item')
      ? returnToParam
      : '/user/items';
  const reviewMode: ReviewItemFormMode = editId
    ? (publishPlatform ? 'republish' : 'edit')
    : 'add';

  const closeModal = () => {
    navigate(returnToPath, { replace: true });
  };

  const redirectToLoginWithReturn = useCallback(() => {
    const returnTo = `${window.location.pathname}${window.location.search}`;
    navigate(`/login?returnTo=${encodeURIComponent(returnTo)}`, { replace: true });
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('flipit_token');
    if (!token) {
      toast({
        title: t.authRequired,
        description: t.authMessage,
        variant: "destructive",
      });
      redirectToLoginWithReturn();
      return;
    }

    if (!isLoading && !isAuthenticated) {
      toast({
        title: t.authRequired,
        description: t.authMessage,
      });
      redirectToLoginWithReturn();
      return;
    }

    const fetchConnectedPlatforms = async () => {
      try {
        const health = await fetchPlatformHealth();
        setConnectedPlatforms(toPlatformConnectedMap(health.platforms));
      } catch (error) {
        if (error instanceof Error && error.message.includes('Authentication')) {
          toast({
            title: t.sessionExpired,
            description: t.sessionMessage,
            variant: "destructive",
          });
          redirectToLoginWithReturn();
          return;
        }
        console.error('Error fetching connected platforms:', error);
      }
    };

    if (isAuthenticated) {
      fetchConnectedPlatforms();
    }
  }, [isAuthenticated, isLoading, redirectToLoginWithReturn, toast]);

  useEffect(() => {
    if (!isAuthenticated || !editId) {
      return;
    }

    const loadEditItem = async () => {
      setIsLoadingItem(true);
      try {
        const item = await fetchItemDetail(editId);
        const transformed = toReviewFormData(item);
        setGeneratedData(transformed);
        setEditItemId(item.uuid);
        setPublishedPlatforms(getPublishedPlatforms(item));

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
  }, [editId, isAuthenticated, navigate, toast]);
  
  const handleComplete = (data: GeneratedItemDataWithVinted) => {
    setGeneratedData(data);
    setStep('review');
  };
  
  const handleBack = () => {
    if (editId) {
      if (isModalView) {
        closeModal();
        return;
      }
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
          description="Add an item for marketplace automation — FlipIt generates descriptions, pricing, and categories, then crosslists to OLX, Vinted, Facebook Marketplace, eBay, and Allegro."
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

  const editorContent = (
    <ListingEditorCore
      step={step}
      pageTitle={t.pageTitle}
      reviewTitle={t.reviewTitle}
      addCardTitle={t.addCard.title}
      addCardDescription={t.addCard.description}
      reviewCardTitle={t.reviewCard.title}
      reviewCardDescription={t.reviewCard.description}
      language={language}
      generatedData={generatedData}
      reviewMode={reviewMode}
      connectedPlatforms={connectedPlatforms}
      onComplete={handleComplete}
      onBack={handleBack}
      editItemId={editItemId || undefined}
      publishedPlatforms={publishedPlatforms}
      publishPlatform={publishPlatform || undefined}
    />
  );

  if (isModalView) {
    return (
      <>
        <SEOHead
          title={`${step === 'add' ? t.pageTitle : t.reviewTitle} | FlipIt`}
          description={step === 'add' ? t.addCard.description : t.reviewCard.description}
          canonicalUrl="https://myflipit.live/add-item"
          robots="noindex, nofollow"
        />
        <ListingEditorModal
          open
          onOpenChange={(open) => {
            if (!open) {
              closeModal();
            }
          }}
        >
          <div className="relative min-h-full text-white overflow-hidden">
            <AnimatedGradientBackground />
            {editorContent}
          </div>
        </ListingEditorModal>
      </>
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
      {editorContent}
    </div>
  );
};

export default AddItemPage;
