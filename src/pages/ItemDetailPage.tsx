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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="p-12">
          <div className="text-center">
            <p className="text-destructive mb-4">{error || 'Item not found'}</p>
            <Button onClick={() => navigate('/user/items')}>Back to Items</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={`${item.title} - My Items - FlipIt`}
        description={item.description}
      />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/user/items')}
            className="mb-4"
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
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <CardTitle className="text-3xl">{item.title}</CardTitle>
                <Badge
                  variant={item.stage === 'published' ? 'default' : 'secondary'}
                  className="text-lg px-3 py-1"
                >
                  {item.stage}
                </Badge>
              </div>
              <CardDescription className="text-base">
                {item.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Images */}
              {item.images && item.images.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {item.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${item.title} - ${index + 1}`}
                        className="w-full h-48 object-cover rounded-md"
                      />
                    ))}
                  </div>
                </div>
              )}

              <Separator className="my-6" />

              {/* Item Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Details</h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Price:</dt>
                      <dd className="font-semibold text-xl">${item.price}</dd>
                    </div>
                    {item.brand && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Brand:</dt>
                        <dd className="font-medium">{item.brand}</dd>
                      </div>
                    )}
                    {item.condition && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Condition:</dt>
                        <dd className="font-medium">{item.condition}</dd>
                      </div>
                    )}
                    {item.category && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Category:</dt>
                        <dd className="font-medium">{item.category}</dd>
                      </div>
                    )}
                    {item.size && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Size:</dt>
                        <dd className="font-medium">{item.size}</dd>
                      </div>
                    )}
                    {item.gender && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Gender:</dt>
                        <dd className="font-medium">{item.gender}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Timestamps</h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Created:</dt>
                      <dd className="font-medium">
                        {format(new Date(item.created_at), 'PPp')}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Updated:</dt>
                      <dd className="font-medium">
                        {format(new Date(item.updated_at), 'PPp')}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Platforms */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Target Platforms</h3>
                <div className="flex gap-2">
                  {item.platforms.map((platform) => (
                    <Badge key={platform} variant="outline" className="text-base px-3 py-1">
                      {platform}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Publish Results */}
              {item.publish_results && item.publish_results.length > 0 && (
                <>
                  <Separator className="my-6" />
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Publish Results</h3>
                    <div className="space-y-3">
                      {item.publish_results.map((result) => (
                        <Card key={result.platform}>
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3 flex-1">
                                {result.success ? (
                                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                                ) : result.error_message ? (
                                  <XCircle className="h-5 w-5 text-destructive mt-0.5" />
                                ) : (
                                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                                )}
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold capitalize">
                                      {result.platform}
                                    </span>
                                    {result.success && (
                                      <Badge variant="default">Published</Badge>
                                    )}
                                  </div>
                                  {result.post_id && (
                                    <p className="text-sm text-muted-foreground">
                                      Post ID: {result.post_id}
                                    </p>
                                  )}
                                  {result.published_at && (
                                    <p className="text-sm text-muted-foreground">
                                      Published: {format(new Date(result.published_at), 'PPp')}
                                    </p>
                                  )}
                                  {result.error_message && (
                                    <p className="text-sm text-destructive mt-1">
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
    </>
  );
};

export default ItemDetailPage;
