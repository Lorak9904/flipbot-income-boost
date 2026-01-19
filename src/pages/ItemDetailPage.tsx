import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { deletePlatformListings, fetchItemDetail } from '@/lib/api/items';
import { Platform, UserItem } from '@/types/item';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BackButtonGradient, BackButtonGhost } from '@/components/ui/button-presets';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, ArrowLeft, CheckCircle2, XCircle, Clock, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { SEOHead } from '@/components/SEOHead';
import { format } from 'date-fns';
import { cdnThumb, resolveItemImageUrl } from '@/lib/images';
import { ImagePreview } from '@/components/ImagePreview';
import { ItemActions } from '@/components/ItemActions';
import { useQuery } from '@tanstack/react-query';
import { AnimatedGradientBackground } from '@/components/AnimatedGradientBackground';
import { getTranslations } from '@/components/language-utils';
import { itemDetailTranslations } from '@/utils/translations/item-detail-translations';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 * i, duration: 0.6, ease: 'easeOut' },
  }),
};

const ItemDetailPage = () => {
  const { uuid } = useParams<{ uuid: string }>();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const t = getTranslations(itemDetailTranslations);

  const [item, setItem] = useState<UserItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Image preview state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [deletePlatform, setDeletePlatform] = useState<Platform | null>(null);
  const [isDeletingPlatform, setIsDeletingPlatform] = useState(false);

  // Fetch connected platforms for action buttons
  const { data: connectedPlatforms } = useQuery({
    queryKey: ['connected-platforms'],
    queryFn: async () => {
      const token = localStorage.getItem('flipit_token');
      const response = await fetch("/api/connected-platforms", {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) return {};
      return response.json();
    },
    enabled: !!isAuthenticated,
    staleTime: 30000,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to view item details',
        variant: 'destructive',
      });
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate, toast]);

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
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    loadItem();
  }, [isAuthenticated, uuid, navigate, toast]);

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

  const formatPlatformLabel = (platform: Platform) => {
    if (platform === 'ebay') return 'eBay';
    if (platform === 'olx') return 'OLX';
    if (platform === 'facebook') return 'Facebook';
    return platform.charAt(0).toUpperCase() + platform.slice(1);
  };

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
              <p className="text-red-400 mb-4">{error || 'Item not found'}</p>
              <BackButtonGradient 
                onClick={() => navigate('/user/items')}
              >
                Back to Items
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
        title={`${item.title} - My Items - FlipIt`}
        description={item.description}
      />
      <div className="relative min-h-screen text-white overflow-hidden">
        <AnimatedGradientBackground />

        <div className="relative container mx-auto px-4 py-8 max-w-5xl">
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
              Back to Items
            </BackButtonGhost>
          </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={1}
        >
          <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-sm">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-2xl sm:text-3xl text-white break-words">{item.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      className={item.stage === 'published' 
                        ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50 text-sm px-2 py-0.5' 
                        : 'bg-neutral-700/50 text-neutral-300 border-neutral-600 text-sm px-2 py-0.5'}
                    >
                      {item.stage}
                    </Badge>
                  </div>
                </div>
                <div className="flex-shrink-0 w-full sm:w-auto">
                  <ItemActions 
                    item={item} 
                    connectedPlatforms={connectedPlatforms || {}}
                    onRefresh={() => {
                      // Reload item data
                      if (uuid) {
                        fetchItemDetail(uuid).then(setItem).catch(console.error);
                      }
                    }}
                  />
                </div>
              </div>
              <CardDescription className="text-base text-neutral-400">
                {item.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Images */}
              {item.images && item.images.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 text-white">Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {item.images.map((image, index) => {
                      const imageUrl = resolveItemImageUrl(image);
                      if (!imageUrl) return null;
                      return (
                        <img
                          key={`${imageUrl}-${index}`}
                          src={cdnThumb(imageUrl)}
                          alt={`${item.title} - ${index + 1}`}
                          className="w-full h-48 object-cover rounded-md border border-neutral-800 cursor-pointer hover:opacity-80 hover:ring-2 hover:ring-cyan-400/50 transition-all"
                          loading="lazy"
                          onClick={() => {
                            setPreviewIndex(index);
                            setPreviewOpen(true);
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              <Separator className="my-6 bg-neutral-800" />

              {/* Item Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-white">Details</h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-neutral-400">UUID:</dt>
                      <dd className="font-mono text-xs text-neutral-300 break-all">{item.uuid}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-neutral-400">Status:</dt>
                      <dd className="font-medium text-white">
                        <Badge className={
                          item.status === 'active' 
                            ? 'bg-green-500/20 text-green-400 border-green-500/50'
                            : item.status === 'sold'
                            ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                            : item.status === 'draft'
                            ? 'bg-neutral-700/50 text-neutral-300 border-neutral-600'
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                        }
                        >
                          {item.status}
                        </Badge>
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-neutral-400">Price:</dt>
                      <dd className="font-semibold text-xl bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">
                        ${item.price}
                      </dd>
                    </div>
                    {item.brand && (
                      <div className="flex justify-between">
                        <dt className="text-neutral-400">Brand:</dt>
                        <dd className="font-medium text-white">{item.brand}</dd>
                      </div>
                    )}
                    {item.condition && (
                      <div className="flex justify-between">
                        <dt className="text-neutral-400">Condition:</dt>
                        <dd className="font-medium text-white">{item.condition}</dd>
                      </div>
                    )}
                    {item.category && (
                      <div className="flex justify-between">
                        <dt className="text-neutral-400">Category:</dt>
                        <dd className="font-medium text-white">{item.category}</dd>
                      </div>
                    )}
                    {item.size && (
                      <div className="flex justify-between">
                        <dt className="text-neutral-400">Size:</dt>
                        <dd className="font-medium text-white">{item.size}</dd>
                      </div>
                    )}
                    {item.gender && (
                      <div className="flex justify-between">
                        <dt className="text-neutral-400">Gender:</dt>
                        <dd className="font-medium text-white">{item.gender}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 text-white">Timestamps</h3>
                  <dl className="space-y-2">
                    {item.created_at && (
                      <div className="flex justify-between">
                        <dt className="text-neutral-400">Created:</dt>
                        <dd className="font-medium text-white">
                          {format(new Date(item.created_at), 'PPp')}
                        </dd>
                      </div>
                    )}
                    {item.updated_at && (
                      <div className="flex justify-between">
                        <dt className="text-neutral-400">Updated:</dt>
                        <dd className="font-medium text-white">
                          {format(new Date(item.updated_at), 'PPp')}
                        </dd>
                      </div>
                    )}
                    {item.published_at && (
                      <div className="flex justify-between">
                        <dt className="text-neutral-400">Published:</dt>
                        <dd className="font-medium text-white">
                          {format(new Date(item.published_at), 'PPp')}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>

              <Separator className="my-6 bg-neutral-800" />

              {/* Enriched Analysis Data */}
              {(item.description_full || item.weight_kg || item.dimensions_cm || item.shipping_advice || item.catalog_path) && (
                <>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 text-white">Enriched Analysis</h3>
                    
                    {item.description_full && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-neutral-400 mb-2">Full Description</h4>
                        <p className="text-white whitespace-pre-wrap">{item.description_full}</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {item.weight_kg && (
                        <div>
                          <h4 className="text-sm font-medium text-neutral-400 mb-1">Weight</h4>
                          <p className="text-white">{item.weight_kg} kg</p>
                        </div>
                      )}
                      
                      {item.dimensions_cm && (
                        <div>
                          <h4 className="text-sm font-medium text-neutral-400 mb-1">Dimensions (cm)</h4>
                          <pre className="text-white text-xs bg-neutral-900/50 p-2 rounded border border-neutral-800 overflow-auto">
                            {JSON.stringify(item.dimensions_cm, null, 2)}
                          </pre>
                        </div>
                      )}
                      
                      {item.catalog_path && (
                        <div>
                          <h4 className="text-sm font-medium text-neutral-400 mb-1">Catalog Path</h4>
                          <p className="text-white text-sm">{item.catalog_path}</p>
                        </div>
                      )}
                      
                      {item.shipping_advice && (
                        <div className="md:col-span-2">
                          <h4 className="text-sm font-medium text-neutral-400 mb-1">Shipping Advice</h4>
                          <pre className="text-white text-xs bg-neutral-900/50 p-2 rounded border border-neutral-800 overflow-auto">
                            {JSON.stringify(item.shipping_advice, null, 2)}
                          </pre>
                        </div>
                      )}
                      
                      {item.analysis && (
                        <div className="md:col-span-2">
                          <h4 className="text-sm font-medium text-neutral-400 mb-1">AI Analysis</h4>
                          <pre className="text-white text-xs bg-neutral-900/50 p-2 rounded border border-neutral-800 overflow-auto max-h-96">
                            {JSON.stringify(item.analysis, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Separator className="my-6 bg-neutral-800" />
                </>
              )}

              {/* Platforms */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-white">Target Platforms</h3>
                <div className="flex gap-2">
                  {(Array.isArray(item.platforms) ? item.platforms : []).map((platform) => (
                    <Badge 
                      key={platform} 
                      className="text-base px-3 py-1 bg-neutral-800/50 text-neutral-300 border-neutral-700"
                    >
                      {platform}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Publish Results */}
              {item.publish_results && item.publish_results.length > 0 && (
                <>
                  <Separator className="my-6 bg-neutral-800" />
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-white">Publish Results</h3>
                    <div className="space-y-3">
                      {item.publish_results.map((result) => {
                        const isSuccess = result.status === 'success' || result.success;
                        const isPending = result.status === 'pending';
                        const isError = result.status === 'error' || result.error_message;
                        const canRemove = isSuccess && (result.platform === 'olx' || result.platform === 'ebay');
                        
                        return (
                          <Card 
                            key={result.platform}
                            className="bg-neutral-800/30 border-neutral-700"
                          >
                            <CardContent className="pt-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3 flex-1">
                                  {isSuccess ? (
                                    <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5" />
                                  ) : isError ? (
                                    <XCircle className="h-5 w-5 text-red-400 mt-0.5" />
                                  ) : (
                                    <Clock className="h-5 w-5 text-neutral-400 mt-0.5" />
                                  )}
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-semibold capitalize text-white">
                                        {result.platform}
                                      </span>
                                      {isSuccess && (
                                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50">
                                          Published
                                        </Badge>
                                      )}
                                      {isPending && (
                                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
                                          Pending
                                        </Badge>
                                      )}
                                      {isError && (
                                        <Badge className="bg-red-500/20 text-red-400 border-red-500/50">
                                          Error
                                        </Badge>
                                      )}
                                    </div>
                                    
                                    {/* Listing URL */}
                                    {result.listing_url && (
                                      <div className="mt-2">
                                        <a 
                                          href={result.listing_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-sm text-cyan-400 hover:text-cyan-300 hover:underline"
                                        >
                                          View listing on {result.platform} →
                                        </a>
                                      </div>
                                    )}
                                    
                                    {/* External ID */}
                                    {result.external_id && (
                                      <p className="text-sm text-neutral-400 mt-1">
                                        ID: {result.external_id}
                                      </p>
                                    )}
                                    
                                    {/* Legacy post_id */}
                                    {!result.external_id && result.post_id && (
                                      <p className="text-sm text-neutral-400 mt-1">
                                        Post ID: {result.post_id}
                                      </p>
                                    )}
                                    
                                    {/* Status message */}
                                    {result.message && (
                                      <p className={`text-sm mt-1 ${isError ? 'text-red-400' : 'text-neutral-400'}`}>
                                        {result.message}
                                      </p>
                                    )}
                                    
                                    {/* Legacy error_message */}
                                    {!result.message && result.error_message && (
                                      <p className="text-sm text-red-400 mt-1">
                                        Error: {result.error_message}
                                      </p>
                                    )}
                                    
                                    {/* Timestamp */}
                                    {(result.updated_at || result.published_at) && (() => {
                                      try {
                                        const dateStr = result.updated_at || result.published_at;
                                        const date = new Date(dateStr!);
                                        if (!isNaN(date.getTime())) {
                                          return (
                                            <p className="text-xs text-neutral-500 mt-1">
                                              {format(date, 'PPp')}
                                            </p>
                                          );
                                        }
                                      } catch (e) {
                                        console.warn('Invalid date:', result);
                                      }
                                      return null;
                                    })()}
                                  </div>
                                </div>
                                {canRemove && (
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="shrink-0"
                                    onClick={() => setDeletePlatform(result.platform as Platform)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    {t.actions.deleteFromPlatform}
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
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
