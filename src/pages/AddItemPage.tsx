import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { GeneratedItemDataWithVinted, Platform } from '@/types/item';
import { Loader2 } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { getTranslations, getCurrentLanguage, getLocalizedPathForCurrentLanguage } from '@/components/language-utils';
import { addItemTranslations } from '@/utils/translations/add-item-translations';
import { AnimatedGradientBackground } from '@/components/AnimatedGradientBackground';
import { fetchItemDetail } from '@/lib/api/items';
import {
  fetchPlatformHealth,
  toPlatformConnectedMap,
  type PlatformHealthResponse,
} from '@/lib/api/platform-health';
import type { ReviewItemFormMode } from '@/components/review-item-form-mode';
import { getPublishedPlatforms, toReviewFormData } from '@/lib/items/review-form-adapter';
import { ListingEditorCore } from '@/components/listing-editor/ListingEditorCore';
import {
  clearListingEditorDraft,
  persistListingEditorDraft,
  readListingEditorDraft,
  type AddItemFormSnapshot,
  type ReviewItemFormSnapshot,
} from '@/lib/listing-editor-draft';

const AddItemPage = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const language = getCurrentLanguage();
  const t = getTranslations(addItemTranslations);
  const [step, setStep] = useState<'add' | 'review'>('add');
  const [generatedData, setGeneratedData] = useState<GeneratedItemDataWithVinted | null>(null);
  const [addItemSnapshot, setAddItemSnapshot] = useState<AddItemFormSnapshot | undefined>();
  const [reviewSnapshot, setReviewSnapshot] = useState<ReviewItemFormSnapshot | undefined>();
  const [sessionDraftReady, setSessionDraftReady] = useState(false);
  const [isLoadingItem, setIsLoadingItem] = useState(false);
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [publishedPlatforms, setPublishedPlatforms] = useState<Platform[]>([]);
  const [connectedPlatforms, setConnectedPlatforms] = useState<Record<Platform, boolean>>({
    facebook: false,
    olx: false,
    vinted: false,
    ebay: false,
    allegro: false,
    etsy: false,
  });
  const [platformHealth, setPlatformHealth] = useState<PlatformHealthResponse['platforms'] | null>(null);
  const [isCheckingPlatformConnections, setIsCheckingPlatformConnections] = useState(true);
  const [platformConnectionCheckFailed, setPlatformConnectionCheckFailed] = useState(false);
  const editId = searchParams.get('edit');
  const editorModeParam = searchParams.get('mode');
  const publishParam = searchParams.get('publish');
  const publishPlatform = (['facebook', 'olx', 'vinted', 'ebay', 'allegro', 'etsy'] as Platform[]).includes(publishParam as Platform)
    ? (publishParam as Platform)
    : null;
  const reviewMode: ReviewItemFormMode = editId
    ? (editorModeParam === 'republish' || publishPlatform ? 'republish' : 'edit')
    : 'add';

  useEffect(() => {
    if (isLoading || !isAuthenticated || !user?.id) {
      return;
    }

    const savedDraft = readListingEditorDraft(user.id);
    if (!editId && savedDraft?.kind === 'add') {
      setAddItemSnapshot(savedDraft.data);
    }
    if (
      savedDraft?.kind === 'review' &&
      savedDraft.data.editItemId === (editId || undefined)
    ) {
      setGeneratedData(savedDraft.data.data);
      setReviewSnapshot(savedDraft.data);
      setEditItemId(savedDraft.data.editItemId || null);
      setPublishedPlatforms(savedDraft.data.publishedPlatforms || []);
      setStep('review');
    }
    setSessionDraftReady(true);
  }, [editId, isAuthenticated, isLoading, user?.id]);

  const redirectToLoginWithReturn = useCallback(() => {
    const returnTo = `${window.location.pathname}${window.location.search}`;
    navigate(`${getLocalizedPathForCurrentLanguage('/login')}?returnTo=${encodeURIComponent(returnTo)}`, { replace: true });
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
      setIsCheckingPlatformConnections(true);
      setPlatformConnectionCheckFailed(false);
      try {
        const health = await fetchPlatformHealth();
        setPlatformHealth(health.platforms);
        setConnectedPlatforms(toPlatformConnectedMap(health.platforms));
      } catch (error) {
        setPlatformHealth(null);
        if (error instanceof Error && error.message.includes('Authentication')) {
          toast({
            title: t.sessionExpired,
            description: t.sessionMessage,
            variant: "destructive",
          });
          redirectToLoginWithReturn();
          return;
        }
        setPlatformConnectionCheckFailed(true);
        console.error('Error fetching connected platforms:', error);
      } finally {
        setIsCheckingPlatformConnections(false);
      }
    };

    if (isAuthenticated) {
      fetchConnectedPlatforms();
    }
  }, [
    isAuthenticated,
    isLoading,
    redirectToLoginWithReturn,
    toast,
    t.authMessage,
    t.authRequired,
    t.sessionExpired,
    t.sessionMessage,
  ]);

  const hasConnectedPlatform = Object.values(connectedPlatforms).some(Boolean);
  const showNoPlatformConnectionNotice =
    step === 'add' &&
    !editId &&
    !isCheckingPlatformConnections &&
    !platformConnectionCheckFailed &&
    !hasConnectedPlatform;

  useEffect(() => {
    if (!isAuthenticated || !editId || !sessionDraftReady) {
      return;
    }

    if (reviewSnapshot?.editItemId === editId) {
      setEditItemId(editId);
      setPublishedPlatforms(reviewSnapshot.publishedPlatforms || []);
      setStep('review');
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
        const errorMessage = error instanceof Error ? error.message : t.toast.loadError;
        toast({
          title: t.toast.loadErrorTitle,
          description: errorMessage,
          variant: "destructive",
        });
        navigate(getLocalizedPathForCurrentLanguage('/user/items'));
      } finally {
        setIsLoadingItem(false);
      }
    };

    loadEditItem();
  }, [
    editId,
    isAuthenticated,
    navigate,
    reviewSnapshot,
    sessionDraftReady,
    t.toast.loadError,
    t.toast.loadErrorTitle,
    toast,
  ]);
  
  const handleComplete = (data: GeneratedItemDataWithVinted) => {
    const nextReviewSnapshot: ReviewItemFormSnapshot = { data };
    setGeneratedData(data);
    setReviewSnapshot(nextReviewSnapshot);
    setAddItemSnapshot(undefined);
    persistListingEditorDraft(user?.id, {
      version: 1,
      kind: 'review',
      data: nextReviewSnapshot,
    });
    setStep('review');
  };
  
  const handleBack = () => {
    if (editId) {
      clearListingEditorDraft(user?.id);
      navigate(getLocalizedPathForCurrentLanguage(`/user/items/${editId}`));
      return;
    }
    clearListingEditorDraft(user?.id);
    setAddItemSnapshot(undefined);
    setReviewSnapshot(undefined);
    setStep('add');
  };
  
  if (isLoading || isLoadingItem) {
    return (
      <div className="relative min-h-screen text-white overflow-hidden">
        <SEOHead
          title={`${t.pageTitle} | FlipIt`}
          description={t.addCard.description}
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
      platformHealth={platformHealth}
      showNoPlatformConnectionNotice={showNoPlatformConnectionNotice}
      platformConnectionNotice={t.platformConnectionNotice}
      onComplete={handleComplete}
      onBack={handleBack}
      editItemId={editItemId || undefined}
      publishedPlatforms={publishedPlatforms}
      publishPlatform={publishPlatform || undefined}
      addItemSnapshot={addItemSnapshot}
      reviewSnapshot={reviewSnapshot}
      shouldPersistDraft={sessionDraftReady}
    />
  );

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      <SEOHead
        title={`${step === 'add' ? t.pageTitle : t.reviewTitle} | FlipIt`}
        description={step === 'add' ? t.addCard.description : t.reviewCard.description}
        robots="noindex, nofollow"
      />
      <AnimatedGradientBackground />
      {editorContent}
    </div>
  );
};

export default AddItemPage;
