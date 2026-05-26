import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { fetchUserItems, fetchItemStats } from '@/lib/api/items';
import { UserItem, ItemStats, Platform, ItemStatus, ItemStatusGroup } from '@/types/item';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PaginationButton, AddItemButton, BackButtonGradient } from '@/components/ui/button-presets';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Package, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { SEOHead } from '@/components/SEOHead';
import { cdnGrid, resolveItemImageUrl } from '@/lib/images';
import { getTranslations } from '@/components/language-utils';
import { userItemsTranslations } from '@/utils/translations/user-items-translations';
import { StatCard, StatCardSkeleton } from '@/components/my_items/stat-card';
import { SyncListingsButton } from '@/components/my_items/sync-listings-button';
import { AnimatedGradientBackground } from '@/components/AnimatedGradientBackground';
import { buildListingEditorUrl } from '@/lib/listing-editor/navigation';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 * i, duration: 0.6, ease: 'easeOut' },
  }),
};

function ItemThumbnail({ imageUrl, title }: { imageUrl: string; title: string }) {
  const [failed, setFailed] = useState(false);
  const src = imageUrl && !failed ? cdnGrid(imageUrl) : '';

  if (!src) {
    return (
      <div className="w-full h-48 rounded-md mb-4 border border-neutral-800 bg-neutral-950/70 flex flex-col items-center justify-center text-neutral-500">
        <Package className="h-10 w-10 mb-2" />
        <span className="text-sm">{imageUrl ? 'Image unavailable' : 'No image'}</span>
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

  // Pagination and filters from URL params
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = 10;
  const statusParam = searchParams.get('status');
  const statusGroupParam = searchParams.get('status_group');
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
  const statusGroupOptions: Array<ItemStatusGroup | 'all'> = [
    'live',
    'drafts',
    'needs_attention',
    'sold_ended',
    'all',
  ];
  const platformOptions: Array<Platform | 'all'> = ['all', 'facebook', 'olx', 'vinted', 'ebay', 'allegro'];
  const hasExplicitStatusFilter =
    !!statusParam && statusOptions.includes(statusParam as ItemStatus | 'all');
  const statusFilter: ItemStatus | 'all' = statusParam && statusOptions.includes(statusParam as ItemStatus | 'all')
    ? (statusParam as ItemStatus | 'all')
    : 'all';
  const statusGroupFilter: ItemStatusGroup | 'all' =
    statusGroupParam && statusGroupOptions.includes(statusGroupParam as ItemStatusGroup | 'all')
      ? (statusGroupParam as ItemStatusGroup | 'all')
      : hasExplicitStatusFilter
        ? 'all'
        : 'live';
  const platformFilter: Platform | 'all' =
    platformParam && platformOptions.includes(platformParam as Platform | 'all')
      ? (platformParam as Platform | 'all')
      : 'all';
  const hasActiveFilters =
    statusFilter !== 'all' || platformFilter !== 'all' || statusGroupFilter !== 'live';

  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const loginRedirect = `/login?returnTo=${encodeURIComponent(`${location.pathname}${location.search}`)}`;

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

    const loadItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const params: {
          page: number;
          page_size: number;
          status?: ItemStatus;
          status_group?: ItemStatusGroup;
          platform?: Platform;
        } = {
          page,
          page_size: pageSize,
        };

        if (statusGroupFilter !== 'all' && statusFilter === 'all') params.status_group = statusGroupFilter;
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
        setLoading(false);
      }
    };

    loadItems();
  }, [isAuthenticated, page, pageSize, statusFilter, statusGroupFilter, platformFilter, navigate, loginRedirect]);

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

  const handleStatusGroupChange = (value: ItemStatusGroup | 'all') => {
    const newParams = new URLSearchParams(searchParams);
    if (value === 'live') {
      newParams.delete('status_group');
    } else {
      newParams.set('status_group', value);
    }
    newParams.set('status', 'all');
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleFilterChange = (filterType: 'status' | 'platform', value: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set(filterType, value);
    if (filterType === 'status') {
      newParams.set('status_group', 'all');
    }
    newParams.set('page', '1'); // Reset to first page when filtering
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
  };

  const handleItemClick = (uuid: string) => {
    navigate(`/user/items/${uuid}`);
  };

  const openAddItemModal = () => {
    navigate(
      buildListingEditorUrl({
        mode: 'add',
        modal: true,
        returnTo: `${location.pathname}${location.search}`,
      })
    );
  };

  /**
   * Refresh items list and stats after sync
   */
  const handleSyncComplete = async () => {
    // Reload items
    setLoading(true);
    try {
      const params: {
        page: number;
        page_size: number;
        status?: ItemStatus;
        status_group?: ItemStatusGroup;
        platform?: Platform;
      } = {
        page,
        page_size: pageSize,
      };

      if (statusGroupFilter !== 'all' && statusFilter === 'all') params.status_group = statusGroupFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (platformFilter !== 'all') params.platform = platformFilter;

      const response = await fetchUserItems(params);
      setItems(response.items);
      setTotal(response.total);
      setTotalPages(response.total_pages);
    } catch (err) {
      console.error('Failed to reload items after sync:', err);
    } finally {
      setLoading(false);
    }

    // Reload stats
    try {
      const statsData = await fetchItemStats();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to reload stats after sync:', err);
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
      <div className="relative min-h-screen text-white overflow-hidden">
        <AnimatedGradientBackground />

        <div className="relative container mx-auto px-4 py-12 md:py-16">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-3">
              <h1 className="fluid-text font-extrabold bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent text-balance">
                {t.pageTitle}
              </h1>
              <SyncListingsButton onSyncComplete={handleSyncComplete} />
            </div>
            <p className="text-neutral-300 text-lg">
              {t.pageDescription}
            </p>
          </motion.div>

        {/* Statistics Cards */}
        {statsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
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

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={2}
          className="mb-4"
        >
          <Tabs value={statusGroupFilter} onValueChange={(value) => handleStatusGroupChange(value as ItemStatusGroup | 'all')}>
            <TabsList className="h-auto w-full flex-wrap justify-start gap-2 rounded-lg border border-neutral-800 bg-neutral-900/40 p-2">
              <TabsTrigger value="live" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300">
                {t.statusTabs.live}
              </TabsTrigger>
              <TabsTrigger value="drafts" className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-300">
                {t.statusTabs.drafts}
              </TabsTrigger>
              <TabsTrigger value="needs_attention" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">
                {t.statusTabs.needsAttention}
              </TabsTrigger>
              <TabsTrigger value="sold_ended" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300">
                {t.statusTabs.soldEnded}
              </TabsTrigger>
              <TabsTrigger value="all" className="data-[state=active]:bg-neutral-700/70 data-[state=active]:text-neutral-100">
                {t.statusTabs.all}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={3}
          className="flex flex-wrap gap-4 mb-6 items-center bg-neutral-900/30 backdrop-blur-sm border border-neutral-800 rounded-lg p-4"
        >
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-cyan-400" />
            <span className="text-sm font-medium text-white">{t.filters.label}</span>
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => handleFilterChange('status', value)}
          >
            <SelectTrigger className="w-[150px] bg-neutral-800/50 border-neutral-700 text-white">
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
            <SelectTrigger className="w-[150px] bg-neutral-800/50 border-neutral-700 text-white">
              <SelectValue placeholder={t.filters.allPlatforms} />
            </SelectTrigger>
            <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
              <SelectItem value="all">{t.filters.allPlatforms}</SelectItem>
              <SelectItem value="facebook">{t.filters.facebook}</SelectItem>
              <SelectItem value="olx">{t.filters.olx}</SelectItem>
              <SelectItem value="vinted">{t.filters.vinted}</SelectItem>
              <SelectItem value="ebay">{t.filters.ebay}</SelectItem>
              <SelectItem value="allegro">{t.filters.allegro}</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

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
                  onClick={openAddItemModal}
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
                const platforms = Array.isArray(item.platforms) ? item.platforms : [];

                return (
                  <Card
                    key={item.uuid}
                    className="cursor-pointer bg-neutral-900/50 backdrop-blur-sm ring-1 ring-neutral-700 transition-all duration-300 hover:ring-cyan-400/40 hover:shadow-xl hover:-translate-y-1 border-0"
                    onClick={() => handleItemClick(item.uuid)}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <CardTitle className="text-lg line-clamp-2 text-white">
                          {item.title}
                        </CardTitle>
                        {item.stage && (
                          <Badge
                            className={item.stage === 'published' 
                              ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50' 
                              : 'bg-neutral-700/50 text-neutral-300 border-neutral-600'}
                          >
                            {item.stage}
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="line-clamp-2 text-neutral-400">
                        {item.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ItemThumbnail imageUrl={primaryImage} title={item.title} />
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent text-balance">
                          ${item.price}
                        </span>
                        <div className="flex gap-1">
                          {platforms.map((platform) => (
                            <Badge 
                              key={platform} 
                              className="bg-neutral-800/50 text-neutral-300 border-neutral-700"
                            >
                              {platform}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {item.brand && (
                        <p className="text-sm text-neutral-400">
                          {t.item.brand} {item.brand}
                        </p>
                      )}
                    </CardContent>
                  </Card>
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
