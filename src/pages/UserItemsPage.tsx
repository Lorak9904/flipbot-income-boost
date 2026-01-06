import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { fetchUserItems, fetchItemStats } from '@/lib/api/items';
import { UserItem, ItemStats, Platform, ItemStatus } from '@/types/item';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PaginationButton, AddItemButton, BackButtonGradient } from '@/components/ui/button-presets';
import { Badge } from '@/components/ui/badge';
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

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 * i, duration: 0.6, ease: 'easeOut' },
  }),
};

const UserItemsPage = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
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
  const statusFilter = searchParams.get('status') as ItemStatus | null;
  const platformFilter = searchParams.get('platform') as Platform | null;

  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: t.authRequired,
        description: t.authMessage,
        variant: 'destructive',
      });
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate, toast]);

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
          platform?: Platform;
        } = {
          page,
          page_size: pageSize,
        };

        if (statusFilter) params.status = statusFilter;
        if (platformFilter) params.platform = platformFilter;

        const response = await fetchUserItems(params);
        setItems(response.items);
        setTotal(response.total);
        setTotalPages(response.total_pages);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load items';
        setError(errorMessage);
        if (errorMessage.includes('Authentication')) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, [isAuthenticated, page, pageSize, statusFilter, platformFilter, navigate]);

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

  const handleFilterChange = (filterType: 'status' | 'platform', value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === 'all') {
      newParams.delete(filterType);
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

  const handleItemClick = (uuid: string) => {
    navigate(`/user/items/${uuid}`);
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
        platform?: Platform;
      } = {
        page,
        page_size: pageSize,
      };

      if (statusFilter) params.status = statusFilter;
      if (platformFilter) params.platform = platformFilter;

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
              <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">
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

        {/* Filters */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={2}
          className="flex flex-wrap gap-4 mb-6 items-center bg-neutral-900/30 backdrop-blur-sm border border-neutral-800 rounded-lg p-4"
        >
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-cyan-400" />
            <span className="text-sm font-medium text-white">{t.filters.label}</span>
          </div>
          <Select
            value={statusFilter || 'all'}
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
            value={platformFilter || 'all'}
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
                  {stageFilter || platformFilter
                    ? t.empty.description.filtered
                    : t.empty.description.noItems}
                </p>
                <AddItemButton 
                  onClick={() => navigate('/add-item')}
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
                        <Badge
                          className={item.stage === 'published' 
                            ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50' 
                            : 'bg-neutral-700/50 text-neutral-300 border-neutral-600'}
                        >
                          {item.stage}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2 text-neutral-400">
                        {item.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {primaryImage && (
                        <img
                          src={cdnGrid(primaryImage)}
                          alt={item.title}
                          className="w-full h-48 object-cover rounded-md mb-4 border border-neutral-800"
                          loading="lazy"
                        />
                      )}
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">
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
