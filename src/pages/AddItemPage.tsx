import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { GeneratedItemData, Platform } from '@/types/item';
import AddItemForm from '@/components/AddItemForm';
import ReviewItemForm from '@/components/ReviewItemForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { getTranslations, getCurrentLanguage } from '@/components/language-utils';
import { addItemTranslations } from '@/utils/translations/add-item-translations';

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
  const [generatedData, setGeneratedData] = useState<GeneratedItemData | null>(null);
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
        const response = await fetch("/api/FlipIt/api/connected-platforms", {
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
  
  const handleComplete = (data: GeneratedItemData) => {
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
          
          <div className="absolute inset-0">
            <div 
              className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-cyan-500/20 to-fuchsia-500/20 blur-3xl"
              style={{
                animation: 'float1 25s ease-in-out infinite',
                left: '10%',
                top: '10%'
              }}
            ></div>
            <div 
              className="absolute w-80 h-80 rounded-full bg-gradient-to-r from-fuchsia-500/15 to-cyan-500/15 blur-3xl"
              style={{
                animation: 'float2 30s ease-in-out infinite',
                right: '15%',
                top: '30%'
              }}
            ></div>
            <div 
              className="absolute w-72 h-72 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-3xl"
              style={{
                animation: 'float3 35s ease-in-out infinite',
                left: '30%',
                bottom: '20%'
              }}
            ></div>
          </div>
        </div>

        {/* CSS Animations */}
        <style>{`
          @keyframes float1 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            25% { transform: translate(30px, -20px) scale(1.1); }
            50% { transform: translate(-20px, 30px) scale(0.9); }
            75% { transform: translate(20px, 10px) scale(1.05); }
          }
          
          @keyframes float2 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(-25px, 20px) scale(1.1); }
            66% { transform: translate(15px, -30px) scale(0.95); }
          }
          
          @keyframes float3 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            20% { transform: translate(20px, -15px) scale(1.05); }
            40% { transform: translate(-30px, 25px) scale(0.9); }
            60% { transform: translate(25px, 20px) scale(1.1); }
            80% { transform: translate(-15px, -25px) scale(0.95); }
          }
        `}</style>

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
        
        <div className="absolute inset-0">
          <div 
            className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-cyan-500/20 to-fuchsia-500/20 blur-3xl"
            style={{
              animation: 'float1 25s ease-in-out infinite',
              left: '10%',
              top: '10%'
            }}
          ></div>
          <div 
            className="absolute w-80 h-80 rounded-full bg-gradient-to-r from-fuchsia-500/15 to-cyan-500/15 blur-3xl"
            style={{
              animation: 'float2 30s ease-in-out infinite',
              right: '15%',
              top: '30%'
            }}
          ></div>
          <div 
            className="absolute w-72 h-72 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-3xl"
            style={{
              animation: 'float3 35s ease-in-out infinite',
              left: '30%',
              bottom: '20%'
            }}
          ></div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(30px, -20px) scale(1.1); }
          50% { transform: translate(-20px, 30px) scale(0.9); }
          75% { transform: translate(20px, 10px) scale(1.05); }
        }
        
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-25px, 20px) scale(1.1); }
          66% { transform: translate(15px, -30px) scale(0.95); }
        }
        
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          20% { transform: translate(20px, -15px) scale(1.05); }
          40% { transform: translate(-30px, 25px) scale(0.9); }
          60% { transform: translate(25px, 20px) scale(1.1); }
          80% { transform: translate(-15px, -25px) scale(0.95); }
        }
      `}</style>

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
            <Card className="bg-neutral-900/50 backdrop-blur-sm border border-cyan-400/20">
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
            <Card className="bg-neutral-900/50 backdrop-blur-sm border border-fuchsia-400/20">
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
