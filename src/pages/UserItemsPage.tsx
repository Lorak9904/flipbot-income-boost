import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { fetchUserItems, fetchItemStats } from '@/lib/api/items';
import { UserItem, ItemStats, Platform, ItemStage } from '@/types/item';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

  const [items, setItems] = useState<UserItem[]>([]);
  const [stats, setStats] = useState<ItemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination and filters from URL params
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = 10;
  const stageFilter = searchParams.get('stage') as ItemStage | null;
  const platformFilter = searchParams.get('platform') as Platform | null;

  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to view your items',
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
          stage?: ItemStage;
          platform?: Platform;
        } = {
          page,
          page_size: pageSize,
        };

        if (stageFilter) params.stage = stageFilter;
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
  }, [isAuthenticated, page, pageSize, stageFilter, platformFilter, navigate]);

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

  const handleFilterChange = (filterType: 'stage' | 'platform', value: string) => {
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
        title="My Items - FlipIt"
        description="View and manage all your listed items"
      />
      <div className="relative min-h-screen text-white overflow-hidden">
        {/* Unified Animated Gradient Background */}
        <div className="fixed inset-0 -z-20">
          <div className="absolute inset-0 bg-neutral-950"></div>
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 1 }}
              animate={{ opacity: [1, 0.7, 1] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              style={{
                background:
                  "radial-gradient(circle at 20% 20%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)",
              }}
            />
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0.7 }}
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
              style={{
                background:
                  "radial-gradient(circle at 80% 40%, rgba(6, 182, 212, 0.25) 0%, transparent 50%)",
              }}
            />
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0.5 }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
              style={{
                background:
                  "radial-gradient(circle at 40% 80%, rgba(168, 85, 247, 0.2) 0%, transparent 50%)",
              }}
            />
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0.3 }}
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
              style={{
                background:
                  "radial-gradient(circle at 90% 90%, rgba(236, 72, 153, 0.15) 0%, transparent 50%)",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)",
              }}
            />
          </div>
        </div>

        <div className="relative container mx-auto px-4 py-12 md:py-16">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mb-8 text-center md:text-left"
          >
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3 bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">
              My Items
            </h1>
            <p className="text-neutral-300 text-lg">
              View and manage all your listings across platforms
            </p>
          </motion.div>

        {/* Statistics Cards */}
        {statsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="bg-neutral-900/50 border-neutral-800 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-neutral-800 animate-pulse rounded" />
                </CardContent>
              </Card>
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
            <Card className="bg-gradient-to-br from-cyan-500/30 via-cyan-500/10 to-neutral-900/70 border-cyan-400/40 backdrop-blur-sm hover:border-cyan-400/70 hover:shadow-xl hover:shadow-cyan-500/30 transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="pb-2">
                <CardDescription className="text-neutral-200 font-medium">Total Items</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">
                  {stats.total_items}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-cyan-500/30 via-cyan-500/10 to-neutral-900/70 border-cyan-400/40 backdrop-blur-sm hover:border-cyan-400/70 hover:shadow-xl hover:shadow-cyan-500/30 transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="pb-2">
                <CardDescription className="text-neutral-200 font-medium">Published</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-cyan-400">{stats.published_items}</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-fuchsia-500/30 via-fuchsia-500/10 to-neutral-900/70 border-fuchsia-400/40 backdrop-blur-sm hover:border-fuchsia-400/70 hover:shadow-xl hover:shadow-fuchsia-500/30 transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="pb-2">
                <CardDescription className="text-neutral-200 font-medium">Drafts</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-fuchsia-400">{stats.draft_items}</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-emerald-500/30 via-emerald-500/10 to-neutral-900/70 border-emerald-400/40 backdrop-blur-sm hover:border-emerald-400/70 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="pb-2">
                <CardDescription className="text-neutral-200 font-medium">Success Rate</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-emerald-400">
                  {(stats.publish_success_rate ?? 0).toFixed(1)}%
                </p>
              </CardContent>
            </Card>
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
            <span className="text-sm font-medium text-white">Filters:</span>
          </div>
          <Select
            value={stageFilter || 'all'}
            onValueChange={(value) => handleFilterChange('stage', value)}
          >
            <SelectTrigger className="w-[150px] bg-neutral-800/50 border-neutral-700 text-white">
              <SelectValue placeholder="All stages" />
            </SelectTrigger>
            <SelectContent className="bg-neutral-900 border-neutral-800">
              <SelectItem value="all">All stages</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={platformFilter || 'all'}
            onValueChange={(value) => handleFilterChange('platform', value)}
          >
            <SelectTrigger className="w-[150px] bg-neutral-800/50 border-neutral-700 text-white">
              <SelectValue placeholder="All platforms" />
            </SelectTrigger>
            <SelectContent className="bg-neutral-900 border-neutral-800">
              <SelectItem value="all">All platforms</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="olx">OLX</SelectItem>
              <SelectItem value="vinted">Vinted</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Items List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
          </div>
        ) : error ? (
          <Card className="p-12 bg-neutral-900/50 border-neutral-800 backdrop-blur-sm">
            <div className="text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <Button 
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:from-cyan-600 hover:to-fuchsia-600"
              >
                Retry
              </Button>
            </div>
          </Card>
        ) : items.length === 0 ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={3}
          >
            <Card className="p-12 bg-neutral-900/50 border-neutral-800 backdrop-blur-sm">
              <div className="text-center">
                <Package className="h-16 w-16 mx-auto mb-4 text-neutral-500" />
                <h3 className="text-xl font-semibold mb-2 text-white">No items found</h3>
                <p className="text-neutral-400 mb-4">
                  {stageFilter || platformFilter
                    ? 'Try adjusting your filters'
                    : 'Start by adding your first item'}
                </p>
                <Button 
                  onClick={() => navigate('/add-item')}
                  className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:from-cyan-600 hover:to-fuchsia-600"
                >
                  Add Item
                </Button>
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
              {items.map((item) => (
                <Card
                  key={item.uuid}
                  className="cursor-pointer hover:shadow-xl hover:shadow-cyan-500/10 hover:border-cyan-500/50 transition-all bg-neutral-900/50 border-neutral-800 backdrop-blur-sm"
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
                    {item.images && item.images.length > 0 && (
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-48 object-cover rounded-md mb-4 border border-neutral-800"
                      />
                    )}
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">
                        ${item.price}
                      </span>
                      <div className="flex gap-1">
                        {item.platforms.map((platform) => (
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
                        Brand: {item.brand}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  className="bg-neutral-800/50 border-neutral-700 text-white hover:bg-neutral-800 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm text-neutral-300">
                  Page {page} of {totalPages} ({total} items)
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                  className="bg-neutral-800/50 border-neutral-700 text-white hover:bg-neutral-800 disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
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
