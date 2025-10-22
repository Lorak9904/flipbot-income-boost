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
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">My Items</h1>
          <p className="text-muted-foreground">
            View and manage all your listings across platforms
          </p>
        </motion.div>

        {/* Statistics Cards */}
        {statsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted animate-pulse rounded" />
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
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Items</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.total_items}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Published</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.published_items}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Drafts</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.draft_items}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Success Rate</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {stats.publish_success_rate.toFixed(1)}%
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
          className="flex flex-wrap gap-4 mb-6"
        >
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          <Select
            value={stageFilter || 'all'}
            onValueChange={(value) => handleFilterChange('stage', value)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All stages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All stages</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={platformFilter || 'all'}
            onValueChange={(value) => handleFilterChange('platform', value)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All platforms" />
            </SelectTrigger>
            <SelectContent>
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
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Card className="p-12">
            <div className="text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          </Card>
        ) : items.length === 0 ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={3}
          >
            <Card className="p-12">
              <div className="text-center">
                <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No items found</h3>
                <p className="text-muted-foreground mb-4">
                  {stageFilter || platformFilter
                    ? 'Try adjusting your filters'
                    : 'Start by adding your first item'}
                </p>
                <Button onClick={() => navigate('/add-item')}>Add Item</Button>
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
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleItemClick(item.uuid)}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-lg line-clamp-2">
                        {item.title}
                      </CardTitle>
                      <Badge
                        variant={item.stage === 'published' ? 'default' : 'secondary'}
                      >
                        {item.stage}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {item.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {item.images && item.images.length > 0 && (
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-48 object-cover rounded-md mb-4"
                      />
                    )}
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-2xl font-bold">${item.price}</span>
                      <div className="flex gap-1">
                        {item.platforms.map((platform) => (
                          <Badge key={platform} variant="outline">
                            {platform}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {item.brand && (
                      <p className="text-sm text-muted-foreground">
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
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm">
                  Page {page} of {totalPages} ({total} items)
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default UserItemsPage;
