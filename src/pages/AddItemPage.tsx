import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { GeneratedItemDataWithVinted, Platform } from '@/types/item';
import AddItemForm from '@/components/AddItemForm';
import ReviewItemForm from '@/components/ReviewItemForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { getTranslations, getCurrentLanguage } from '@/components/language-utils';
import { addItemTranslations } from '@/utils/translations/add-item-translations';
import { AnimatedGradientBackground } from '@/components/AnimatedGradientBackground';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 * i, duration: 0.6, ease: 'easeOut' },
  }),
};

const AddItemPage = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [language, setLanguage] = useState(getCurrentLanguage());
  const t = getTranslations(addItemTranslations);
  const [step, setStep] = useState<'add' | 'review'>('add');
  const [generatedData, setGeneratedData] = useState<GeneratedItemDataWithVinted | null>(null);
  const [connectedPlatforms, setConnectedPlatforms] = useState<Record<Platform, boolean>>({
    facebook: false,
    olx: false,
    vinted: false
  });
  
  useEffect(() => {
    const token = localStorage.getItem('flipit_token');
    if (!token) {
      toast({
        title: t.authRequired,
        description: t.authMessage,
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    if (!isLoading && !isAuthenticated) {
      toast({
        title: t.authRequired,
        description: t.authMessage,
      });
      navigate('/login');
      return;
    }

    const fetchConnectedPlatforms = async () => {
      try {
        const response = await fetch("/api/connected-platforms", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
        if (!response.ok) {
          if (response.status === 401) {
            toast({
              title: t.sessionExpired,
              description: t.sessionMessage,
              variant: "destructive",
            });
            navigate("/login");
            return;
          }
          throw new Error("Failed to fetch connected platforms");
        }
        if (response.ok) {
          const data = await response.json();
          setConnectedPlatforms(data);
        }
      } catch (error) {
        console.error('Error fetching connected platforms:', error);
      }
    };

    if (isAuthenticated) {
      fetchConnectedPlatforms();
    }
  }, [isAuthenticated, isLoading, navigate, toast]);
  
  const handleComplete = (data: GeneratedItemDataWithVinted) => {
    setGeneratedData(data);
    setStep('review');
  };
  
  const handleBack = () => {
    setStep('add');
  };
  
  if (isLoading) {
    return (
      <div className="relative min-h-screen text-white overflow-hidden">
        <SEOHead
          title="Add Item | FlipIt"
          description="Add an item for marketplace automation — FlipIt generates descriptions, pricing, and categories, then crosslists to OLX, Vinted, and Facebook."
          canonicalUrl="https://myflipit.live/add-item"
          robots="noindex, nofollow"
        />
        <AnimatedGradientBackground />

        <div className="container mx-auto py-12">
          <div className="flex justify-center items-center min-h-[50vh]">
            <Loader2 className="h-12 w-12 animate-spin text-cyan-400" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      <SEOHead
        title={`${step === 'add' ? t.pageTitle : t.reviewTitle} | FlipIt`}
        description={step === 'add' ? t.addCard.description : t.reviewCard.description}
        canonicalUrl="https://myflipit.live/add-item"
        robots="noindex, nofollow"
      />
      <AnimatedGradientBackground />

      {/* Content */}
      <div className="container mx-auto py-12 px-4 relative z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="max-w-3xl mx-auto"
        >
          <motion.h1 
            variants={fadeUp}
            className="text-3xl font-bold mb-6"
          >
            {step === 'add' ? t.pageTitle : t.reviewTitle}
          </motion.h1>
          
          {step === 'add' ? (
            <Card className="bg-neutral-900/50 backdrop-blur-sm ring-1 ring-neutral-700 transition-all duration-300 hover:ring-cyan-400/40 hover:shadow-xl border-0">
              <CardHeader>
                <CardTitle className="text-cyan-400">{t.addCard.title}</CardTitle>
                <CardDescription className="text-neutral-300">
                  {t.addCard.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AddItemForm onComplete={handleComplete} language={language} />
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-neutral-900/50 backdrop-blur-sm ring-1 ring-neutral-700 transition-all duration-300 hover:ring-fuchsia-400/40 hover:shadow-xl border-0">
              <CardHeader>
                <CardTitle className="text-fuchsia-400">{t.reviewCard.title}</CardTitle>
                <CardDescription className="text-neutral-300">
                  {t.reviewCard.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {generatedData && (
                  <ReviewItemForm 
                    initialData={generatedData} 
                    connectedPlatforms={connectedPlatforms}
                    onBack={handleBack}
                    language={language}
                  />
                )}
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AddItemPage;
