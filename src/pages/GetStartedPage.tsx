import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SEOHead } from '@/components/SEOHead';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Users, ArrowRight } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getTranslations } from '../components/language-utils';
import { getStartedTranslations } from './getstarted-translations';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 * i, duration: 0.6, ease: 'easeOut' },
  }),
};

const GetStartedPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const t = getTranslations(getStartedTranslations);
  const pageTitle = 'Join the myflipit.live marketplace automation waitlist';
  const pageDescription = 'Reserve early access to FlipIt — marketplace automation that speeds up selling on OLX, Vinted, and Facebook by automatically generating descriptions, pricing, and categories.';
  const keywords = [
    'automated reselling platform waitlist',
    'OLX reselling automation',
    'Vinted flipping tools',
    'marketplace automation',
    'online arbitrage software',
    'reselling side hustle',
  ];
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'FlipIt',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'PLN',
      availability: 'https://schema.org/PreOrder',
    },
    potentialAction: {
      '@type': 'RegisterAction',
      target: 'https://myflipit.live/get-started',
      name: 'Join the FlipIt automated reselling waitlist',
    },
  };

  useEffect(() => {
    fetch("/api/waitlist/token")
      .then(res => res.json())
      .then(data => setToken(data.token))
      .catch(() => toast({ 
        title: t.toastErrorTitle, 
        variant: "destructive", 
        description: t.tokenErrorDescription 
      }));
  }, [toast, t]);

  const submitWaitlistEntry = async (entry: { name: string; email: string }) => {
    if (!token) throw new Error("Missing waitlist token");
    const response = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...entry, token }),
    });

    if (!response.ok) {
      let errorMsg = "Failed to join waitlist";
      try {
        const error = await response.json();
        if (Array.isArray(error.detail)) {
          errorMsg = error.detail.map((d: any) => d.msg).join(" ");
        } else if (typeof error.detail === "string") {
          errorMsg = error.detail;
        }
      } catch {
        errorMsg = response.statusText;
      }
      throw new Error(errorMsg);
    }
    return response.json();
  };

  const waitlistMutation = useMutation({
    mutationFn: submitWaitlistEntry,
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: t.toastSuccessTitle,
        description: t.toastSuccessDescription,
      });
    },
    onError: (error: Error) => {
      setIsSubmitting(false);
      toast({
        title: t.toastErrorTitle,
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    waitlistMutation.mutate({ name, email });
  };

  const benefits = [
    {
      title: t.benefit1Title,
      desc: t.benefit1Description
    },
    {
      title: t.benefit2Title,
      desc: t.benefit2Description
    },
    {
      title: t.benefit3Title,
      desc: t.benefit3Description
    },
    {
      title: t.benefit4Title,
      desc: t.benefit4Description
    }
  ];

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        canonicalUrl="https://myflipit.live/get-started"
        keywords={keywords}
        structuredData={structuredData}
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

      {/* Hero Section */}
      <section className="relative py-24">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6"
          >
            {t.heroTitle} <span className="text-cyan-400">{t.heroTitleHighlight}</span> {t.heroTitleEnd}
          </motion.h1>
          <motion.p
            custom={1}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="max-w-2xl mx-auto text-lg text-neutral-300"
          >
            {t.heroDescription}
          </motion.p>
        </div>
      </section>

      {/* Waitlist Form */}
      <section className="relative py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="bg-neutral-900/50 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-xl ring-1 ring-cyan-400/20"
            >
              {!isSubmitted ? (
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-6">
                    {t.formTitle}
                  </h2>
                  <div className="flex items-center gap-2 text-cyan-400 mb-8">
                    <Users className="h-5 w-5" />
                    <span className="font-medium">143 {t.waitlistCount}</span>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="block font-medium text-neutral-300">
                        {t.nameLabel}
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
                        placeholder={t.namePlaceholder}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="email" className="block font-medium text-neutral-300">
                        {t.emailLabel}
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
                        placeholder={t.emailPlaceholder}
                        required
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full py-6 text-lg bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:to-fuchsia-600"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? t.joiningButton : t.joinButton}
                    </Button>
                  </form>
                  
                  <p className="text-sm text-neutral-500 mt-6 text-center">
                    {t.privacyText}
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">
                    {t.successTitle}
                  </h2>
                  <p className="text-lg text-neutral-300 mb-6">
                    {t.successDescription}
                  </p>
                  <div className="bg-neutral-800/50 p-6 rounded-lg border border-cyan-400/20 mx-auto max-w-md">
                    <h4 className="font-medium mb-2 text-cyan-400">{t.whileYouWaitTitle}</h4>
                    <p className="text-neutral-300 mb-4">
                      {t.whileYouWaitText1}
                    </p>
                    <p className="text-neutral-300">
                      {t.whileYouWaitText2}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="relative py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="text-2xl md:text-3xl font-bold mb-10 text-center"
            >
              {t.benefitsTitle}
            </motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {benefits.map((benefit, i) => (
                <motion.div
                  key={benefit.title}
                  custom={i+1}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="bg-neutral-900/50 backdrop-blur-sm rounded-xl p-6 ring-1 ring-cyan-400/20"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-cyan-400/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-cyan-400 font-medium">{i+1}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl mb-2">{benefit.title}</h3>
                      <p className="text-neutral-300">{benefit.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-16 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            {t.finalCtaTitle}
          </h2>
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/20 hover:to-fuchsia-600"
          >
            <Link to="/get-started" className="flex items-center gap-2">
              {t.finalCtaButton} <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </motion.div>
      </section>
    </div>
  );
};

export default GetStartedPage;








