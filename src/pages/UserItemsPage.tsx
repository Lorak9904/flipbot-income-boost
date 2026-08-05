import { useCallback, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  fetchUserItems,
  fetchItemStats,
  refreshListingStatuses,
  fetchDuplicateSuggestions,
  mergeDuplicateItems,
  dismissDuplicateSuggestion,
  unmergeDuplicateItem,
  bulkMergeDuplicateSuggestions,
  type DuplicateSuggestion,
} from '@/lib/api/items';
import { UserItem, ItemStats, Platform, ItemStatus } from '@/types/item';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NotificationAction } from '@/components/ui/notification-action';
import { PaginationButton, AddItemButton } from '@/components/ui/button-presets';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Package, Filter, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { SEOHead } from '@/components/SEOHead';
import { cdnGrid, resolveItemImageUrl } from '@/lib/images';
import { formatMoney } from '@/lib/currency';
import { getLocalizedPathForCurrentLanguage, getTranslations } from '@/components/language-utils';
import { userItemsTranslations } from '@/utils/translations/user-items-translations';
import { StatCard, StatCardSkeleton } from '@/components/my_items/stat-card';
import { SyncListingsButton } from '@/components/my_items/sync-listings-button';
import { AnimatedGradientBackground } from '@/components/AnimatedGradientBackground';
import { PlatformLifecycleChips } from '@/components/my_items/platform-lifecycle-chips';
import { DuplicateSuggestionsPanel } from '@/components/my_items/duplicate-suggestions-panel';
import { buildListingEditorUrl } from '@/lib/listing-editor/navigation';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 * i, duration: 0.6, ease: 'easeOut' },
  }),
};

function ItemThumbnail({
  imageUrl,
  title,
  imageUnavailable,
  noImage,
}: {
  imageUrl: string;
  title: string;
  imageUnavailable: string;
  noImage: string;
}) {
  const [failed, setFailed] = useState(false);
  const src = imageUrl && !failed ? cdnGrid(imageUrl) : '';

  if (!src) {
    return (
      <div className="w-full h-48 rounded-md mb-4 border border-neutral-800 bg-neutral-950/70 flex flex-col items-center justify-center text-neutral-500">
        <Package className="h-10 w-10 mb-2" />
        <span className="text-sm">{imageUrl ? imageUnavailable : noImage}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={title}
      className="w-full h-48 object-cover rounded-md mb-4 border border-neutral-800"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

const getStatusBadgeClass = (status: ItemStatus) => {
  if (status === 'active') return 'bg-green-500/20 text-green-400 border-green-500/50';
  if (status === 'sold') return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
  if (status === 'draft') return 'bg-neutral-700/50 text-neutral-300 border-neutral-600';
  if (status === 'blocked') return 'bg-red-500/20 text-red-400 border-red-500/50';
  if (status === 'removed') return 'bg-neutral-500/20 text-neutral-300 border-neutral-500/50';
  return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
};

const UserItemsPage = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const t = getTranslations(userItemsTranslations);

  const [items, setItems] = useState<UserItem[]>([]);
  const [stats, setStats] = useState<ItemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshingStatuses, setRefreshingStatuses] = useState(false);
  const [duplicateSuggestions, setDuplicateSuggestions] = useState<DuplicateSuggestion[]>([]);
  const [loadingDuplicateSuggestions, setLoadingDuplicateSuggestions] = useState(false);
  const [mergingDuplicateKey, setMergingDuplicateKey] = useState<string | null>(null);
  const [dismissingDuplicateKey, setDismissingDuplicateKey] = useState<string | null>(null);
  const [bulkMergingDuplicates, setBulkMergingDuplicates] = useState(false);

  // Pagination and filters from URL params
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = 10;
  const statusParam = searchParams.get('status');
  const platformParam = searchParams.get('platform');
  const statusOptions: Array<ItemStatus | 'all'> = [
    'all',
    'draft',
    'active',
    'inactive',
    'sold',
    'expired',
    'removed',
    'blocked',
  ];
  const platformOptions: Array<Platform | 'all'> = ['all', 'facebook', 'olx', 'vinted', 'ebay', 'allegro', 'etsy'];
  const statusFilter: ItemStatus | 'all' = statusParam && statusOptions.includes(statusParam as ItemStatus | 'all')
    ? (statusParam as ItemStatus | 'all')
    : 'all';
  const platformFilter: Platform | 'all' =
    platformParam && platformOptions.includes(platformParam as Platform | 'all')
      ? (platformParam as Platform | 'all')
      : 'all';
  const hasActiveFilters = statusFilter !== 'all' || platformFilter !== 'all';

  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const loginRedirect = `${getLocalizedPathForCurrentLanguage('/login')}?returnTo=${encodeURIComponent(`${location.pathname}${location.search}`)}`;
  const visibleItemIdsKey = items.map((item) => item.uuid).filter(Boolean).join(',');

  const loadItems = useCallback(
    async ({ showLoading = true }: { showLoading?: boolean } = {}) => {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);
      try {
        const params: {
          page: number;
          page_size: number;
          status?: ItemStatus;
          platform?: Platform;
        } = {
          page,
          page_size: pageSize,
        };

        if (statusFilter !== 'all') params.status = statusFilter;
        if (platformFilter !== 'all') params.platform = platformFilter;

        const response = await fetchUserItems(params);
        setItems(response.items);
        setTotal(response.total);
        setTotalPages(response.total_pages);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load items';
        setError(errorMessage);
        if (errorMessage.includes('Authentication')) {
          navigate(loginRedirect, { replace: true });
        }
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    [loginRedirect, navigate, page, pageSize, platformFilter, statusFilter]
  );

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: t.authRequired,
        description: t.authMessage,
        variant: 'destructive',
      });
      navigate(loginRedirect, { replace: true });
    }
  }, [authLoading, isAuthenticated, loginRedirect, navigate, toast, t.authMessage, t.authRequired]);

  useEffect(() => {
    if (!isAuthenticated) return;

    loadItems();
  }, [isAuthenticated, loadItems]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadStats = async () => {
      setStatsLoading(true);
      try {
        const statsData = await fetchItemStats();
        setStats(statsData);
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setStatsLoading(false);
      }
    };

    loadStats();
  }, [isAuthenticated]);

  const loadDuplicateSuggestions = useCallback(async () => {
    const itemIds = visibleItemIdsKey ? visibleItemIdsKey.split(',') : [];
    if (itemIds.length === 0) {
      setDuplicateSuggestions([]);
      return;
    }

    setLoadingDuplicateSuggestions(true);
    try {
      const response = await fetchDuplicateSuggestions({ item_ids: itemIds, limit: 10 });
      setDuplicateSuggestions(response.suggestions);
    } catch (err) {
      console.error('Failed to load duplicate suggestions:', err);
      setDuplicateSuggestions([]);
    } finally {
      setLoadingDuplicateSuggestions(false);
    }
  }, [visibleItemIdsKey]);

  useEffect(() => {
    if (!isAuthenticated || loading) return;
    loadDuplicateSuggestions();
  }, [isAuthenticated, loading, loadDuplicateSuggestions]);

  const handleFilterChange = (filterType: 'status' | 'platform', value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (filterType === 'status') {
      if (value === 'all') {
        newParams.delete('status');
      } else {
        newParams.set('status', value);
      }
    } else {
      newParams.set(filterType, value);
    }
    newParams.set('page', '1'); // Reset to first page when filtering
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
  };

  const goToAddItemPage = () => {
    navigate(getLocalizedPathForCurrentLanguage(buildListingEditorUrl({ mode: 'add' })));
  };

  /**
   * Refresh items list and stats after sync
   */
  const handleSyncComplete = async () => {
    await loadItems();

    // Reload stats
    try {
      const statsData = await fetchItemStats();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to reload stats after sync:', err);
    }
  };

  const handleRefreshStatuses = async () => {
    if (items.length === 0) return;

    setRefreshingStatuses(true);
    try {
      const platforms = new Set<Platform>();
      items.forEach((item) => {
        item.platforms?.forEach((platform) => platforms.add(platform));
        item.publish_results?.forEach((result) => platforms.add(result.platform));
      });

      const response = await refreshListingStatuses({
        item_ids: items.map((item) => item.uuid),
        platforms: platformFilter !== 'all' ? [platformFilter] : Array.from(platforms),
      });

      if (response.items.length > 0) {
        setItems(response.items);
      }
      await loadItems({ showLoading: false });

      const resultValues = Object.values(response.results);
      const unsupportedCount = resultValues.filter((result) => result?.status === 'unsupported').length;
      const hasSuccessfulRefresh = resultValues.some(
        (result) => result?.status === 'success' || result?.status === 'partial_success'
      );

      if (response.status === 'error') {
        toast({
          title: t.statusRefresh.failedTitle,
          description: t.statusRefresh.failedDescription,
          variant: 'destructive',
        });
      } else if (response.status === 'unsupported' || !hasSuccessfulRefresh) {
        toast({
          title: t.statusRefresh.unavailableTitle,
          description: t.statusRefresh.unavailableDescription,
        });
      } else {
        toast({
          title: response.status === 'partial_success' ? t.statusRefresh.partialTitle : t.statusRefresh.successTitle,
          description: unsupportedCount
            ? t.statusRefresh.partialDescription
            : t.statusRefresh.successDescription,
        });
      }
    } catch (err) {
      console.error('Failed to refresh listing statuses:', err);
      toast({
        title: t.statusRefresh.failedTitle,
        description: t.statusRefresh.failedDescription,
        variant: 'destructive',
      });
    } finally {
      setRefreshingStatuses(false);
    }
  };

  const handleUnmergeDuplicates = async (mergedItemIds: string[]) => {
    if (mergedItemIds.length === 0) return;

    try {
      for (const mergedItemId of mergedItemIds) {
        await unmergeDuplicateItem(mergedItemId);
      }
      await loadItems({ showLoading: false });
      await loadDuplicateSuggestions();
      try {
        const statsData = await fetchItemStats();
        setStats(statsData);
      } catch (err) {
        console.error('Failed to reload stats after duplicate unmerge:', err);
      }
      toast({
        title: t.duplicateSuggestions.unmergedTitle,
        description: t.duplicateSuggestions.unmergedDescription,
      });
    } catch (err) {
      console.error('Failed to undo duplicate merge:', err);
      toast({
        title: t.duplicateSuggestions.unmergeErrorTitle,
        description: t.duplicateSuggestions.unmergeErrorDescription,
        variant: 'destructive',
      });
    }
  };

  const handleMergeDuplicate = async (suggestion: DuplicateSuggestion, primaryItemId: string) => {
    setMergingDuplicateKey(suggestion.key);
    try {
      const duplicateItemId =
        primaryItemId === suggestion.primary_item.uuid
          ? suggestion.duplicate_item.uuid
          : suggestion.primary_item.uuid;
      const mergeResult = await mergeDuplicateItems(primaryItemId, duplicateItemId);
      setDuplicateSuggestions((current) =>
        current.filter((candidate) => candidate.key !== suggestion.key)
      );
      await loadItems({ showLoading: false });
      try {
        const statsData = await fetchItemStats();
        setStats(statsData);
      } catch (err) {
        console.error('Failed to reload stats after duplicate merge:', err);
      }
      toast({
        title: t.duplicateSuggestions.mergedTitle,
        description: t.duplicateSuggestions.mergedDescription,
        action: (
          <NotificationAction
            altText={t.duplicateSuggestions.undoButton}
            onClick={() => void handleUnmergeDuplicates([mergeResult.merged_item_id])}
          >
            {t.duplicateSuggestions.undoButton}
          </NotificationAction>
        ),
      });
    } catch (err) {
      console.error('Failed to merge duplicate listings:', err);
      toast({
        title: t.duplicateSuggestions.mergeErrorTitle,
        description: t.duplicateSuggestions.mergeErrorDescription,
        variant: 'destructive',
      });
    } finally {
      setMergingDuplicateKey(null);
    }
  };

  const handleDismissDuplicate = async (suggestion: DuplicateSuggestion) => {
    setDismissingDuplicateKey(suggestion.key);
    try {
      await dismissDuplicateSuggestion(suggestion.primary_item.uuid, suggestion.duplicate_item.uuid);
      setDuplicateSuggestions((current) =>
        current.filter((candidate) => candidate.key !== suggestion.key)
      );
      toast({
        title: t.duplicateSuggestions.dismissedTitle,
        description: t.duplicateSuggestions.dismissedDescription,
      });
    } catch (err) {
      console.error('Failed to dismiss duplicate suggestion:', err);
      toast({
        title: t.duplicateSuggestions.dismissErrorTitle,
        description: t.duplicateSuggestions.dismissErrorDescription,
        variant: 'destructive',
      });
    } finally {
      setDismissingDuplicateKey(null);
    }
  };

  const handleBulkMergeDuplicates = async (suggestionsToMerge: DuplicateSuggestion[]) => {
    const safeSuggestions = suggestionsToMerge.filter(
      (suggestion) => suggestion.confidence === 'high' && (suggestion.field_conflicts?.length || 0) === 0
    );
    if (safeSuggestions.length === 0) return;

    setBulkMergingDuplicates(true);
    try {
      const response = await bulkMergeDuplicateSuggestions(
        safeSuggestions.map((suggestion) => ({
          primary_item_id: suggestion.primary_item.uuid,
          duplicate_item_id: suggestion.duplicate_item.uuid,
        }))
      );
      const mergedItemIds = response.results
        .filter((result) => result.status === 'merged' && result.merged_item_id)
        .map((result) => result.merged_item_id as string);
      if (response.merged_count === 0) {
        throw new Error('No duplicate suggestions were merged.');
      }
      const mergedIds = new Set(mergedItemIds);

      setDuplicateSuggestions((current) =>
        current.filter((suggestion) => !mergedIds.has(suggestion.duplicate_item.uuid))
      );
      await loadItems({ showLoading: false });
      try {
        const statsData = await fetchItemStats();
        setStats(statsData);
      } catch (err) {
        console.error('Failed to reload stats after bulk duplicate merge:', err);
      }
      toast({
        title: t.duplicateSuggestions.bulkMergedTitle,
        description: t.duplicateSuggestions.bulkMergedDescription.replace(
          '{count}',
          response.merged_count.toString()
        ),
        action:
          mergedItemIds.length > 0 ? (
            <NotificationAction
              altText={t.duplicateSuggestions.undoButton}
              onClick={() => void handleUnmergeDuplicates(mergedItemIds)}
            >
              {t.duplicateSuggestions.undoButton}
            </NotificationAction>
          ) : undefined,
      });
    } catch (err) {
      console.error('Failed to bulk merge duplicate listings:', err);
      toast({
        title: t.duplicateSuggestions.bulkMergeErrorTitle,
        description: t.duplicateSuggestions.bulkMergeErrorDescription,
        variant: 'destructive',
      });
    } finally {
      setBulkMergingDuplicates(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={`${t.pageTitle} - FlipIt`}
        description={t.pageDescription}
      />
      <div className="relative min-h-screen overflow-hidden text-white">
        <AnimatedGradientBackground />

        <div className="relative container mx-auto px-4 py-12 md:py-16">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mb-8"
          >
            <div className="flex flex-col gap-3 mb-3 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-3xl font-bold leading-tight text-white md:text-4xl">
                {t.pageTitle}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshStatuses}
                  disabled={loading || refreshingStatuses || items.length === 0}
                  className="min-h-11 border-neutral-700 bg-neutral-900 text-neutral-100 hover:bg-neutral-800 hover:text-white"
                >
                  {refreshingStatuses ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  {refreshingStatuses ? t.actions.refreshingStatuses : t.actions.refreshStatuses}
                </Button>
                <SyncListingsButton onSyncComplete={handleSyncComplete} />
              </div>
            </div>
            <p className="text-sm text-neutral-300 md:text-base">
              {t.pageDescription}
            </p>
          </motion.div>

        {/* Statistics Cards */}
        {statsLoading ? (
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
        ) : stats ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
            className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4"
          >
            <StatCard
              label={t.stats.totalItems}
              value={stats.total_items}
              tint="cyan"
            />
            <StatCard
              label={t.stats.published}
              value={stats.published_items}
              tint="fuchsia"
            />
            <StatCard
              label={t.stats.drafts}
              value={stats.draft_items}
              tint="violet"
            />
            <StatCard
              label={t.stats.successRate}
              value={`${(stats.publish_success_rate ?? 0).toFixed(1)}%`}
              tint="teal"
            />
          </motion.div>
        ) : null}

        {/* Filters */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={3}
          className="mb-6 flex flex-col gap-4 rounded-lg border border-neutral-800 bg-neutral-900/30 p-4 backdrop-blur-sm sm:flex-row sm:flex-wrap sm:items-center"
        >
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-cyan-400" />
            <span className="text-sm font-medium text-white">{t.filters.label}</span>
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => handleFilterChange('status', value)}
          >
            <SelectTrigger className="w-full border-neutral-700 bg-neutral-800/50 text-white sm:w-[150px]">
              <SelectValue placeholder={t.filters.allStatuses} />
            </SelectTrigger>
            <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
              <SelectItem value="all">{t.filters.allStatuses}</SelectItem>
              <SelectItem value="draft">{t.filters.draft}</SelectItem>
              <SelectItem value="active">{t.filters.active}</SelectItem>
              <SelectItem value="inactive">{t.filters.inactive}</SelectItem>
              <SelectItem value="sold">{t.filters.sold}</SelectItem>
              <SelectItem value="expired">{t.filters.expired}</SelectItem>
              <SelectItem value="removed">{t.filters.removed}</SelectItem>
              <SelectItem value="blocked">{t.filters.blocked}</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={platformFilter}
            onValueChange={(value) => handleFilterChange('platform', value)}
          >
            <SelectTrigger className="w-full border-neutral-700 bg-neutral-800/50 text-white sm:w-[150px]">
              <SelectValue placeholder={t.filters.allPlatforms} />
            </SelectTrigger>
            <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
              <SelectItem value="all">{t.filters.allPlatforms}</SelectItem>
              <SelectItem value="facebook">{t.filters.facebook}</SelectItem>
              <SelectItem value="olx">{t.filters.olx}</SelectItem>
              <SelectItem value="vinted">{t.filters.vinted}</SelectItem>
              <SelectItem value="ebay">{t.filters.ebay}</SelectItem>
              <SelectItem value="allegro">{t.filters.allegro}</SelectItem>
              <SelectItem value="etsy">{t.filters.etsy}</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {!loadingDuplicateSuggestions && duplicateSuggestions.length > 0 && (
          <DuplicateSuggestionsPanel
            suggestions={duplicateSuggestions}
            mergingKey={mergingDuplicateKey}
            dismissingKey={dismissingDuplicateKey}
            bulkMerging={bulkMergingDuplicates}
            copy={t.duplicateSuggestions}
            onMerge={handleMergeDuplicate}
            onDismiss={handleDismissDuplicate}
            onBulkMerge={handleBulkMergeDuplicates}
          />
        )}

        {/* Items List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
          </div>
        ) : error ? (
          <Card className="p-12 bg-neutral-900/50 backdrop-blur-sm ring-1 ring-neutral-700 border-0">
            <div className="text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <AddItemButton 
                onClick={() => window.location.reload()}
              >
                {t.retry}
              </AddItemButton>
            </div>
          </Card>
        ) : items.length === 0 ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={3}
          >
            <Card className="p-12 bg-neutral-900/50 backdrop-blur-sm ring-1 ring-neutral-700 border-0">
              <div className="text-center">
                <Package className="h-16 w-16 mx-auto mb-4 text-neutral-500" />
                <h3 className="text-xl font-semibold mb-2 text-white">{t.empty.title}</h3>
                <p className="text-neutral-400 mb-4">
                  {hasActiveFilters
                    ? t.empty.description.filtered
                    : t.empty.description.noItems}
                </p>
                <AddItemButton 
                  onClick={goToAddItemPage}
                >
                  {t.empty.addButton}
                </AddItemButton>
              </div>
            </Card>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={3}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
            >
              {items.map((item) => {
                const primaryImage = resolveItemImageUrl(item.images?.[0]);
                const title = item.title || t.item.untitled;
                const itemUrl = getLocalizedPathForCurrentLanguage(`/user/items/${item.uuid}`);
                const openListingLabel = t.item.openListing.replace('{title}', title);

                return (
                  <article key={item.uuid} className="group">
                    <Card className="border-0 bg-neutral-900/50 backdrop-blur-sm ring-1 ring-neutral-700 transition-all duration-300 group-hover:-translate-y-1 group-hover:ring-cyan-400/40 group-hover:shadow-xl">
                      <CardHeader>
                        <div className="mb-2 flex items-start justify-between gap-3">
                          <CardTitle className="line-clamp-2 text-lg text-white">
                            <Link
                              to={itemUrl}
                              className="rounded-sm outline-none hover:text-cyan-200 focus-visible:ring-2 focus-visible:ring-cyan-400"
                            >
                              {title}
                            </Link>
                          </CardTitle>
                          <Badge className={getStatusBadgeClass(item.status)}>
                            {t.item.statuses[item.status]}
                          </Badge>
                        </div>
                        <CardDescription className="line-clamp-2 text-neutral-400">
                          {item.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Link to={itemUrl} aria-label={openListingLabel} className="block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400">
                          <ItemThumbnail
                            imageUrl={primaryImage}
                            title={title}
                            imageUnavailable={t.item.imageUnavailable}
                            noImage={t.item.noImage}
                          />
                        </Link>
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-2xl font-bold text-white">
                            {formatMoney(item.price, item.currency)}
                          </span>
                        </div>
                        <PlatformLifecycleChips item={item} copy={t.lifecycle} />
                        {item.brand && (
                          <p className="mt-3 text-sm text-neutral-400">
                            {t.item.brand} {item.brand}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </article>
                );
              })}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={4}
                className="flex justify-center items-center gap-2"
              >
                <PaginationButton
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t.pagination.previous}
                </PaginationButton>
                <span className="text-sm text-neutral-300">
                  {t.pagination.pageInfo
                    .replace('{page}', page.toString())
                    .replace('{totalPages}', totalPages.toString())
                    .replace('{total}', total.toString())}
                </span>
                <PaginationButton
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                >
                  {t.pagination.next}
                  <ChevronRight className="h-4 w-4" />
                </PaginationButton>
              </motion.div>
            )}
          </>
        )}
        </div>
      </div>
    </>
  );
};

export default UserItemsPage;
