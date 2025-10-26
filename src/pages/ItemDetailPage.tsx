import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { fetchItemDetail } from '@/lib/api/items';
import { UserItem } from '@/types/item';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, ArrowLeft, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { SEOHead } from '@/components/SEOHead';
import { format } from 'date-fns';
import { cdnLarge, cdnThumb } from '@/lib/images';

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

  const [item, setItem] = useState<UserItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
              <Button 
                onClick={() => navigate('/user/items')}
                className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:from-cyan-600 hover:to-fuchsia-600"
              >
                Back to Items
              </Button>
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

        <div className="relative container mx-auto px-4 py-8 max-w-5xl">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mb-6"
          >
            <Button
              variant="ghost"
              onClick={() => navigate('/user/items')}
              className="mb-4 text-white hover:bg-neutral-800/50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Items
            </Button>
          </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={1}
        >
          <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-sm">
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <CardTitle className="text-3xl text-white">{item.title}</CardTitle>
                <Badge
                  className={item.stage === 'published' 
                    ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50 text-lg px-3 py-1' 
                    : 'bg-neutral-700/50 text-neutral-300 border-neutral-600 text-lg px-3 py-1'}
                >
                  {item.stage}
                </Badge>
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
                    {item.images.map((image, index) => (
                      <img
                        key={index}
                        src={cdnThumb(image)}
                        alt={`${item.title} - ${index + 1}`}
                        className="w-full h-48 object-cover rounded-md border border-neutral-800"
                        loading="lazy"
                      />
                    ))}
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
                    <div className="flex justify-between">
                      <dt className="text-neutral-400">Created:</dt>
                      <dd className="font-medium text-white">
                        {format(new Date(item.created_at), 'PPp')}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-neutral-400">Updated:</dt>
                      <dd className="font-medium text-white">
                        {format(new Date(item.updated_at), 'PPp')}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <Separator className="my-6 bg-neutral-800" />

              {/* Platforms */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-white">Target Platforms</h3>
                <div className="flex gap-2">
                  {item.platforms.map((platform) => (
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
                      {item.publish_results.map((result) => (
                        <Card 
                          key={result.platform}
                          className="bg-neutral-800/30 border-neutral-700"
                        >
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3 flex-1">
                                {result.success ? (
                                  <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5" />
                                ) : result.error_message ? (
                                  <XCircle className="h-5 w-5 text-red-400 mt-0.5" />
                                ) : (
                                  <Clock className="h-5 w-5 text-neutral-400 mt-0.5" />
                                )}
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold capitalize text-white">
                                      {result.platform}
                                    </span>
                                    {result.success && (
                                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50">
                                        Published
                                      </Badge>
                                    )}
                                  </div>
                                  {result.post_id && (
                                    <p className="text-sm text-neutral-400">
                                      Post ID: {result.post_id}
                                    </p>
                                  )}
                                  {result.published_at && (
                                    <p className="text-sm text-neutral-400">
                                      Published: {format(new Date(result.published_at), 'PPp')}
                                    </p>
                                  )}
                                  {result.error_message && (
                                    <p className="text-sm text-red-400 mt-1">
                                      Error: {result.error_message}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
        </div>
      </div>
    </>
  );
};

export default ItemDetailPage;
