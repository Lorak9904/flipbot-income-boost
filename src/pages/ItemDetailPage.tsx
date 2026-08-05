import {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Check, Loader2, Pencil, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { SEOHead } from '@/components/SEOHead';
import { resolveItemImageUrl } from '@/lib/images';
import { ImagePreview } from '@/components/ImagePreview';
import { ItemActions } from '@/components/ItemActions';
import { useQuery } from '@tanstack/react-query';
import { AnimatedGradientBackground } from '@/components/AnimatedGradientBackground';
import { getCurrentLanguage, getLocalizedPathForCurrentLanguage, getTranslations } from '@/components/language-utils';
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
  return { description: value };
};

type InlineEditableField = RegeneratableItemField;

const ItemDetailPage = () => {
  const { uuid } = useParams<{ uuid: string }>();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const t = getTranslations(itemDetailTranslations);
  const reviewT = getTranslations(reviewItemFormTranslations);
  const language = getCurrentLanguage();
  const editToastShownRef = useRef(false);

  const [item, setItem] = useState<UserItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [regeneratingField, setRegeneratingField] = useState<RegeneratableItemField | null>(null);
  const [editingField, setEditingField] = useState<InlineEditableField | null>(null);
  const [fieldDrafts, setFieldDrafts] = useState<Record<InlineEditableField, string>>({
    title: '',
    description: '',
  });
  const [savingField, setSavingField] = useState<InlineEditableField | null>(null);

  // Image preview state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [deletePlatform, setDeletePlatform] = useState<Platform | null>(null);
  const [isDeletingPlatform, setIsDeletingPlatform] = useState(false);
  const loginRedirect = `${getLocalizedPathForCurrentLanguage('/login')}?returnTo=${encodeURIComponent(`${location.pathname}${location.search}`)}`;

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
        title: t.authenticationRequired,
        description: t.authenticationMessage,
        variant: 'destructive',
      });
      navigate(loginRedirect, { replace: true });
    }
  }, [
    authLoading,
    isAuthenticated,
    loginRedirect,
    navigate,
    t.authenticationMessage,
    t.authenticationRequired,
    toast,
  ]);

  useEffect(() => {
    if (!isAuthenticated || !uuid) return;

    const loadItem = async () => {
      setLoading(true);
      setError(null);
      try {
        const itemData = await fetchItemDetail(uuid);
        setItem(itemData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : t.unknownError;
        setError(errorMessage);
        toast({
          title: t.loadErrorTitle,
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
  }, [
    isAuthenticated,
    uuid,
    navigate,
    toast,
    loginRedirect,
    t.loadErrorTitle,
    t.unknownError,
  ]);

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
    if (statusValue === 'removed') return 'bg-neutral-500/20 text-neutral-300 border-neutral-500/50';
    return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
  };

  const aiFieldLabels: Record<RegeneratableItemField, string> = {
    title: reviewT.labels.title,
    description: reviewT.labels.description,
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

  const startInlineEdit = (field: InlineEditableField, value?: string | null) => {
    setFieldDrafts((current) => ({ ...current, [field]: value || '' }));
    setEditingField(field);
  };

  const updateInlineDraft = (field: InlineEditableField, value: string) => {
    setFieldDrafts((current) => ({ ...current, [field]: value }));
  };

  const cancelInlineEdit = (event?: MouseEvent<HTMLButtonElement>) => {
    event?.preventDefault();
    setEditingField(null);
  };

  const saveInlineField = async (field: InlineEditableField) => {
    if (!uuid || !item || savingField === field) return;

    const nextValue = fieldDrafts[field].trim();
    const currentValue = String(item[field] || '').trim();

    if (field === 'title' && !nextValue) {
      toast({
        title: t.inlineEdit.titleRequired,
        description: t.inlineEdit.titleRequiredDescription,
        variant: 'destructive',
      });
      return;
    }

    if (nextValue === currentValue) {
      setEditingField(null);
      return;
    }

    setSavingField(field);
    try {
      const updatedItem = await updateItem(uuid, buildRegeneratedFieldUpdate(field, nextValue));
      setItem(updatedItem);
      setEditingField(null);
      toast({
        title: t.inlineEdit.saved,
        description: t.inlineEdit.savedDescription(aiFieldLabels[field]),
      });
    } catch (error) {
      toast({
        title: t.inlineEdit.saveError,
        description: error instanceof Error ? error.message : t.unknownError,
        variant: 'destructive',
      });
    } finally {
      setSavingField(null);
    }
  };

  const handleInlineKeyDown = (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>, field: InlineEditableField) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      setEditingField(null);
      return;
    }

    if (field === 'title' && event.key === 'Enter') {
      event.preventDefault();
      void saveInlineField(field);
      return;
    }

    if (field === 'description' && event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      void saveInlineField(field);
    }
  };

  const handleRegeneratedField = async (field: RegeneratableItemField, value: string) => {
    if (!uuid) return;

    startInlineEdit(field, value);
  };

  const renderAiRegenerationControl = (field: RegeneratableItemField) => (
    <AiFieldRegenerationControl
      itemId={uuid}
      field={field}
      fieldLabel={aiFieldLabels[field]}
      context={regenerationContext}
      disabled={
        isDeletingPlatform ||
        !!editingField ||
        !!savingField ||
        (!!regeneratingField && !fieldIsRegenerating(field))
      }
      successMode="draft"
      onLoadingChange={(loading) => setRegeneratingField(loading ? field : null)}
      onRegenerated={(value) => handleRegeneratedField(field, value)}
    />
  );

  const renderInlineEditableField = (field: InlineEditableField) => {
    const isTitle = field === 'title';
    const isEditing = editingField === field;
    const isSaving = savingField === field;
    const isRegenerating = fieldIsRegenerating(field);
    const value = String(item?.[field] || '');
    const label = aiFieldLabels[field];

    if (isEditing) {
      const sharedClassName =
        'border-cyan-400/50 bg-neutral-950/80 text-white shadow-none focus-visible:ring-cyan-400';
      const editor = isTitle ? (
        <Input
          value={fieldDrafts.title}
          onChange={(event) => updateInlineDraft('title', event.target.value)}
          onBlur={() => void saveInlineField('title')}
          onKeyDown={(event) => handleInlineKeyDown(event, 'title')}
          disabled={isSaving}
          autoFocus
          aria-label={label}
          className={`h-auto min-h-12 px-3 py-2 text-2xl font-extrabold leading-tight md:text-3xl ${sharedClassName}`}
        />
      ) : (
        <Textarea
          value={fieldDrafts.description}
          onChange={(event) => updateInlineDraft('description', event.target.value)}
          onBlur={() => void saveInlineField('description')}
          onKeyDown={(event) => handleInlineKeyDown(event, 'description')}
          disabled={isSaving}
          autoFocus
          aria-label={label}
          className={`min-h-32 resize-y text-sm leading-6 md:text-base ${sharedClassName}`}
        />
      );

      return (
        <div className={isTitle ? 'flex items-start gap-2' : 'mt-4 flex items-start gap-2'}>
          <div className="min-w-0 flex-1">{editor}</div>
          <div className="flex shrink-0 gap-1">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label={t.inlineEdit.save(label)}
              disabled={isSaving}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => void saveInlineField(field)}
              className="h-11 w-11 border border-emerald-400/20 bg-emerald-400/5 text-emerald-300 hover:bg-emerald-400/10 hover:text-emerald-100"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label={t.inlineEdit.cancel(label)}
              disabled={isSaving}
              onMouseDown={(event) => event.preventDefault()}
              onClick={cancelInlineEdit}
              className="h-11 w-11 border border-neutral-700 bg-neutral-900/60 text-neutral-300 hover:bg-neutral-800 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className={isTitle ? 'flex items-start gap-3' : 'mt-4 flex items-start gap-3'}>
        {isTitle ? (
          <h1
            className={`min-w-0 flex-1 break-words text-3xl font-extrabold leading-tight text-white md:text-4xl ${isRegenerating ? 'opacity-60' : ''}`}
          >
            {value || t.inlineEdit.untitled}
          </h1>
        ) : (
          <p
            className={`max-w-3xl flex-1 whitespace-pre-wrap text-sm leading-6 text-neutral-300 md:text-base ${isRegenerating ? 'opacity-60' : ''}`}
          >
            {value || t.inlineEdit.noDescription}
          </p>
        )}
        <div className="flex shrink-0 gap-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label={t.inlineEdit.edit(label)}
            disabled={isDeletingPlatform || !!editingField || !!savingField}
            onClick={() => startInlineEdit(field, value)}
            className="h-11 w-11 border border-neutral-700 bg-neutral-900/60 text-neutral-300 hover:bg-neutral-800 hover:text-white"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          {renderAiRegenerationControl(field)}
        </div>
      </div>
    );
  };

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
  const getMarketplaceUpdateActionLabel = useCallback(
    (platforms: Platform[]) =>
      platforms.length === 1
        ? t.actions.updateMarketplaceListing.replace('{platform}', formatPlatformLabel(platforms[0]))
        : t.actions.updateChangedMarketplaces.replace(' ({count})', '').replace('{count}', ''),
    [t.actions.updateChangedMarketplaces, t.actions.updateMarketplaceListing]
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
      toast({
        title: t.editResult.saved,
        description: dirty.length === 1
          ? t.editResult.waitingOne(labels, actionLabel)
          : t.editResult.waitingMany(labels, actionLabel),
      });
    } else {
      toast({
        title: t.editResult.saved,
        description: t.editResult.noMarketplaceChanges,
      });
    }

    editToastShownRef.current = true;
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('updated');
    nextParams.delete('dirty');
    setSearchParams(nextParams, { replace: true });
  }, [
    item,
    searchParams,
    setSearchParams,
    toast,
    dirtySyncPlatforms,
    getMarketplaceUpdateActionLabel,
    t.editResult,
  ]);

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
              <p className="text-red-400 mb-4">{error || t.listingNotFound}</p>
              <BackButtonGradient 
                onClick={() => navigate(getLocalizedPathForCurrentLanguage('/user/items'))}
              >
                {t.backToItems}
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
        title={t.seoTitle(item.title || t.inlineEdit.untitled)}
        description={item.description}
        language={language}
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
              onClick={() => navigate(getLocalizedPathForCurrentLanguage('/user/items'))}
              className="mb-4"
            >
              {t.backToItems}
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
                    <Badge className={getStatusBadgeClass(item.status)}>
                      {(t.status as Record<string, string>)[item.status] || t.status.unknown}
                    </Badge>
                    {dirtySyncPlatforms.length > 0 && (
                      <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/50">
                        {t.sections.pendingActions(dirtySyncPlatforms.length)}
                      </Badge>
                    )}
                  </div>

                  {renderInlineEditableField('title')}
                  {renderInlineEditableField('description')}

                  <div className="mt-4">
                    <ListingIdentityBar item={item} t={t} language={language} />
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
              t={t}
            />

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
              <div className="space-y-6">
                <ListingOverviewGrid
                  item={item}
                  statusBadgeClass={getStatusBadgeClass}
                  formatPlatformLabel={formatPlatformLabel}
                  t={t}
                  language={language}
                />

                <PublishingStatusPanel
                  item={item}
                  t={t}
                  onRemovePlatform={setDeletePlatform}
                  formatPlatformLabel={formatPlatformLabel}
                  language={language}
                />

                <MarketplaceStatisticsSection itemId={item.uuid} platforms={statisticsPlatforms} language={language} />

                <ListingActivityPanel item={item} formatPlatformLabel={formatPlatformLabel} t={t} language={language} />

                <ListingAdvancedDetails item={item} formatPlatformLabel={formatPlatformLabel} t={t} language={language} />
              </div>

              <aside className="order-first space-y-4 lg:sticky lg:top-24 lg:order-last">
                <ListingMediaPanel
                  item={item}
                  imageUrls={imageUrls}
                  t={t}
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
                  t={t}
                  language={language}
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
