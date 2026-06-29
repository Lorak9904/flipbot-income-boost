import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  deletePlatformListings,
  fetchItemDetail,
  updateItem,
  type RegeneratableItemField,
  type UpdateItemPayload,
} from '@/lib/api/items';
import { Platform, UserItem } from '@/types/item';
import { Card } from '@/components/ui/card';
import { BackButtonGradient, BackButtonGhost } from '@/components/ui/button-presets';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { SEOHead } from '@/components/SEOHead';
import { resolveItemImageUrl } from '@/lib/images';
import { ImagePreview } from '@/components/ImagePreview';
import { ItemActions } from '@/components/ItemActions';
import { useQuery } from '@tanstack/react-query';
import { AnimatedGradientBackground } from '@/components/AnimatedGradientBackground';
import { getTranslations } from '@/components/language-utils';
import { itemDetailTranslations } from '@/utils/translations/item-detail-translations';
import { fetchPlatformHealth, toPlatformConnectedMap } from '@/lib/api/platform-health';
import { AiFieldRegenerationControl } from '@/components/listing-editor/AiFieldRegenerationControl';
import { reviewItemFormTranslations } from '@/utils/translations/review-item-form-translations';
import { MarketplaceStatisticsSection } from '@/components/statistics/MarketplaceStatisticsSection';
import { ALL_PLATFORMS, formatPlatformLabel } from '@/lib/platforms';
import {
  ListingActionPanel,
  ListingActivityPanel,
  ListingAdvancedDetails,
  ListingIdentityBar,
  ListingMediaPanel,
  ListingOverviewGrid,
  PendingPublishBanner,
  PublishingStatusPanel,
} from '@/components/listing-detail/ListingDetailSections';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 * i, duration: 0.6, ease: 'easeOut' },
  }),
};

const buildRegeneratedFieldUpdate = (
  field: RegeneratableItemField,
  value: string
): UpdateItemPayload => {
  if (field === 'title') return { title: value };
  if (field === 'description') return { description: value };
  if (field === 'brand') return { brand: value };
  if (field === 'condition') return { condition: value };
  if (field === 'category') return { category: value };
  return { size: value };
};

const ItemDetailPage = () => {
  const { uuid } = useParams<{ uuid: string }>();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const t = getTranslations(itemDetailTranslations);
  const reviewT = getTranslations(reviewItemFormTranslations);
  const editToastShownRef = useRef(false);

  const [item, setItem] = useState<UserItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [regeneratingField, setRegeneratingField] = useState<RegeneratableItemField | null>(null);

  // Image preview state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [deletePlatform, setDeletePlatform] = useState<Platform | null>(null);
  const [isDeletingPlatform, setIsDeletingPlatform] = useState(false);
  const loginRedirect = `/login?returnTo=${encodeURIComponent(`${location.pathname}${location.search}`)}`;

  // Fetch connected platforms for action buttons
  const { data: connectedPlatforms } = useQuery({
    queryKey: ['connected-platforms'],
    queryFn: async () => {
      try {
        const health = await fetchPlatformHealth();
        return toPlatformConnectedMap(health.platforms);
      } catch (error) {
        return {
          facebook: false,
          olx: false,
          vinted: false,
          ebay: false,
          allegro: false,
          etsy: false,
        };
      }
    },
    enabled: !!isAuthenticated,
    staleTime: 30000,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to view listing details',
        variant: 'destructive',
      });
      navigate(loginRedirect, { replace: true });
    }
  }, [authLoading, isAuthenticated, loginRedirect, navigate, toast]);

  useEffect(() => {
    if (!isAuthenticated || !uuid) return;

    const loadItem = async () => {
      setLoading(true);
      setError(null);
      try {
        const itemData = await fetchItemDetail(uuid);
        setItem(itemData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load item';
        setError(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        if (errorMessage.includes('Authentication')) {
          navigate(loginRedirect, { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };

    loadItem();
  }, [isAuthenticated, uuid, navigate, toast, loginRedirect]);

  const handleDeletePlatform = async () => {
    if (!uuid || !deletePlatform) return;
    setIsDeletingPlatform(true);
    try {
      await deletePlatformListings(uuid, [deletePlatform]);
      toast({
        title: t.toasts.deletePlatformSuccess.replace('{platform}', formatPlatformLabel(deletePlatform)),
      });
      const itemData = await fetchItemDetail(uuid);
      setItem(itemData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t.toasts.deletePlatformError.replace('{platform}', formatPlatformLabel(deletePlatform));
      toast({
        title: t.toasts.deletePlatformError.replace('{platform}', formatPlatformLabel(deletePlatform)),
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsDeletingPlatform(false);
      setDeletePlatform(null);
    }
  };

  const getStatusBadgeClass = (statusValue: string) => {
    if (statusValue === 'active') return 'bg-green-500/20 text-green-400 border-green-500/50';
    if (statusValue === 'sold') return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
    if (statusValue === 'draft') return 'bg-neutral-700/50 text-neutral-300 border-neutral-600';
    if (statusValue === 'blocked') return 'bg-red-500/20 text-red-400 border-red-500/50';
    return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
  };

  const aiFieldLabels: Record<RegeneratableItemField, string> = {
    title: reviewT.labels.title,
    description: reviewT.labels.description,
    brand: reviewT.labels.brand,
    condition: reviewT.labels.condition,
    category: reviewT.labels.category,
    size: reviewT.labels.size,
  };

  const fieldIsRegenerating = (field: RegeneratableItemField) => regeneratingField === field;

  const regenerationContext = useMemo<Record<string, unknown>>(
    () =>
      item
        ? {
            title: item.title,
            description: item.description,
            brand: item.brand,
            condition: item.condition,
            category: item.category,
            size: item.size,
            price: item.price,
            currency: item.currency,
            catalog_path: item.catalog_path,
          }
        : {},
    [item]
  );

  const handleRegeneratedField = async (field: RegeneratableItemField, value: string) => {
    if (!uuid) return;

    const updatedItem = await updateItem(uuid, buildRegeneratedFieldUpdate(field, value));
    setItem(updatedItem);
  };

  const renderAiRegenerationControl = (field: RegeneratableItemField) => (
    <AiFieldRegenerationControl
      itemId={uuid}
      field={field}
      fieldLabel={aiFieldLabels[field]}
      context={regenerationContext}
      disabled={isDeletingPlatform || (!!regeneratingField && !fieldIsRegenerating(field))}
      successMode="saved"
      onLoadingChange={(loading) => setRegeneratingField(loading ? field : null)}
      onRegenerated={(value) => handleRegeneratedField(field, value)}
    />
  );

  const publishedPlatformSet = useMemo(
    () =>
      new Set(
        (item?.publish_results || [])
          .filter((result) => result.status === 'success' || result.success)
          .map((result) => result.platform)
      ),
    [item]
  );

  const dirtySyncPlatforms = useMemo(
    () =>
      (['olx', 'ebay', 'allegro', 'etsy'] as Platform[]).filter((platform) => {
        const syncStatus = item?.platform_sync_status?.[platform];
        return publishedPlatformSet.has(platform) && !!syncStatus?.dirty;
      }),
    [item, publishedPlatformSet]
  );
  const getMarketplaceUpdateActionLabel = useCallback((platforms: Platform[]) =>
    platforms.length === 1
      ? `Publish changes to ${formatPlatformLabel(platforms[0])}`
      : 'Publish changes to all marketplaces',
    []
  );
  const pendingMarketplaceLabels = dirtySyncPlatforms
    .map((platform) => formatPlatformLabel(platform))
    .join(', ');
  const pendingMarketplaceActionLabel = getMarketplaceUpdateActionLabel(dirtySyncPlatforms);
  const statisticsPlatforms = useMemo<Platform[]>(() => {
    const selected = Array.isArray(item?.platforms) ? item.platforms : [];
    const published = (item?.publish_results || [])
      .filter((result) => result.status === 'success' || result.success)
      .map((result) => result.platform);
    const allowed = new Set(ALL_PLATFORMS);
    return Array.from(new Set([...selected, ...published])).filter((platform): platform is Platform =>
      allowed.has(platform as Platform)
    );
  }, [item]);
  const imageUrls = useMemo(
    () =>
      (item?.images || [])
        .map((image) => resolveItemImageUrl(image))
        .filter((url): url is string => Boolean(url)),
    [item?.images]
  );

  useEffect(() => {
    if (!item || editToastShownRef.current) return;
    if (searchParams.get('updated') !== '1') return;

    const dirtyQuery = searchParams.get('dirty');
    const dirtyFromQuery = (dirtyQuery ? dirtyQuery.split(',') : [])
      .map((value) => value.trim().toLowerCase())
      .filter((value): value is Platform =>
        ['facebook', 'olx', 'vinted', 'ebay', 'allegro', 'etsy'].includes(value)
      );
    const dirty = dirtyFromQuery.length > 0 ? dirtyFromQuery : dirtySyncPlatforms;

    if (dirty.length > 0) {
      const labels = dirty.map((platform) => formatPlatformLabel(platform)).join(', ');
      const actionLabel = getMarketplaceUpdateActionLabel(dirty);
      const subject = dirty.length === 1 ? `${labels} listing is` : `${labels} listings are`;
      toast({
        title: 'Saved in FlipIt',
        description: `${subject} waiting for publishing. Use "${actionLabel}" to send these changes live.`,
      });
    } else {
      toast({
        title: 'Saved in FlipIt',
        description: 'No marketplace changes need publishing.',
      });
    }

    editToastShownRef.current = true;
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('updated');
    nextParams.delete('dirty');
    setSearchParams(nextParams, { replace: true });
  }, [item, searchParams, setSearchParams, toast, dirtySyncPlatforms, getMarketplaceUpdateActionLabel]);

  if (authLoading || loading) {
    return (
      <div className="relative min-h-screen bg-neutral-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="relative min-h-screen bg-neutral-950 text-white">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Card className="p-12 bg-neutral-900/50 border-neutral-800 backdrop-blur-sm">
            <div className="text-center">
              <p className="text-red-400 mb-4">{error || 'Listing not found'}</p>
              <BackButtonGradient 
                onClick={() => navigate('/user/items')}
              >
                Back to Listings
              </BackButtonGradient>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={`${item.title} - My Listings - FlipIt`}
        description={item.description}
      />
      <div className="relative min-h-screen overflow-hidden bg-neutral-950 text-white">
        <AnimatedGradientBackground />

        <div className="relative container mx-auto max-w-7xl px-4 py-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mb-6"
          >
            <BackButtonGhost
              onClick={() => navigate('/user/items')}
              className="mb-4"
            >
              Back to Listings
            </BackButtonGhost>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
            className="space-y-6"
          >
            <section className="rounded-2xl border border-neutral-800 bg-neutral-950/50 p-5 shadow-2xl shadow-cyan-950/10 backdrop-blur md:p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="mb-3 flex flex-wrap gap-2">
                    {item.stage && (
                      <Badge
                        className={
                          item.stage === 'published'
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                            : 'bg-neutral-700/50 text-neutral-300 border-neutral-600'
                        }
                      >
                        {item.stage}
                      </Badge>
                    )}
                    <Badge className={getStatusBadgeClass(item.status)}>{item.status}</Badge>
                    {dirtySyncPlatforms.length > 0 && (
                      <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/50">
                        {dirtySyncPlatforms.length} marketplace publish pending
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-start gap-3">
                    <h1
                      className={`min-w-0 flex-1 break-words text-3xl font-extrabold leading-tight text-white md:text-4xl ${fieldIsRegenerating('title') ? 'opacity-60' : ''}`}
                    >
                      {item.title}
                    </h1>
                    {renderAiRegenerationControl('title')}
                  </div>

                  <div className="mt-4 flex items-start gap-3">
                    <p
                      className={`max-w-3xl flex-1 whitespace-pre-wrap text-sm leading-6 text-neutral-300 md:text-base ${fieldIsRegenerating('description') ? 'opacity-60' : ''}`}
                    >
                      {item.description}
                    </p>
                    {renderAiRegenerationControl('description')}
                  </div>

                  <div className="mt-4">
                    <ListingIdentityBar item={item} />
                  </div>
                </div>

                <div className="hidden lg:block">
                  <ItemActions
                    item={item}
                    connectedPlatforms={connectedPlatforms || {}}
                    onRefresh={() => {
                      if (uuid) {
                        fetchItemDetail(uuid).then(setItem).catch(console.error);
                      }
                    }}
                    variant="compact"
                  />
                </div>
              </div>
            </section>

            <PendingPublishBanner
              count={dirtySyncPlatforms.length}
              marketplaceLabels={pendingMarketplaceLabels}
              actionLabel={pendingMarketplaceActionLabel}
            />

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
              <main className="space-y-6">
                <ListingOverviewGrid
                  item={item}
                  statusBadgeClass={getStatusBadgeClass}
                  renderAiRegenerationControl={renderAiRegenerationControl}
                  fieldIsRegenerating={fieldIsRegenerating}
                  formatPlatformLabel={formatPlatformLabel}
                />

                <PublishingStatusPanel
                  item={item}
                  t={t}
                  onRemovePlatform={setDeletePlatform}
                  formatPlatformLabel={formatPlatformLabel}
                />

                <MarketplaceStatisticsSection itemId={item.uuid} platforms={statisticsPlatforms} />

                <ListingActivityPanel item={item} formatPlatformLabel={formatPlatformLabel} />

                <ListingAdvancedDetails item={item} formatPlatformLabel={formatPlatformLabel} />
              </main>

              <aside className="order-first space-y-4 lg:sticky lg:top-24 lg:order-last">
                <ListingMediaPanel
                  item={item}
                  imageUrls={imageUrls}
                  onPreview={(index) => {
                    setPreviewIndex(index);
                    setPreviewOpen(true);
                  }}
                />

                <ListingActionPanel
                  item={item}
                  statusBadgeClass={getStatusBadgeClass}
                  dirtySyncCount={dirtySyncPlatforms.length}
                  formatPlatformLabel={formatPlatformLabel}
                  actions={
                    <ItemActions
                      item={item}
                      connectedPlatforms={connectedPlatforms || {}}
                      onRefresh={() => {
                        if (uuid) {
                          fetchItemDetail(uuid).then(setItem).catch(console.error);
                        }
                      }}
                    />
                  }
                />
              </aside>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Image Preview Modal */}
      <Dialog open={!!deletePlatform} onOpenChange={(open) => !open && setDeletePlatform(null)}>
        <DialogContent className="bg-neutral-900 border-neutral-700">
          <DialogHeader>
            <DialogTitle className="text-white">{t.confirmations.deletePlatformTitle}</DialogTitle>
            <DialogDescription className="text-neutral-400">
              {deletePlatform
                ? t.confirmations.deletePlatformDescription.replace('{platform}', formatPlatformLabel(deletePlatform))
                : t.confirmations.deletePlatformDescription.replace('{platform}', '')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeletePlatform(null)} disabled={isDeletingPlatform}>
              {t.confirmations.deleteCancel}
            </Button>
            <Button variant="destructive" onClick={handleDeletePlatform} disabled={isDeletingPlatform}>
              {isDeletingPlatform && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t.confirmations.deletePlatformConfirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {item?.images && item.images.length > 0 && (
        <ImagePreview
          images={item.images.map(img => resolveItemImageUrl(img) || '').filter(Boolean)}
          initialIndex={previewIndex}
          open={previewOpen}
          onOpenChange={setPreviewOpen}
        />
      )}
    </>
  );
};

export default ItemDetailPage;
