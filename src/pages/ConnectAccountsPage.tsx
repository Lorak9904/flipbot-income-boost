import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import ConnectAccountCard from '@/components/ConnectAccountCard';
import { CheckCircle, ArrowRight, Lock, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 * i, duration: 0.6, ease: 'easeOut' },
  }),
};

const ConnectAccountsPage = () => {
  const [connectedPlatforms, setConnectedPlatforms] = useState<Record<string, boolean>>({
    facebook: false,
    olx: false,
    vinted: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please log in to connect your accounts");
      navigate("/login");
      return;
    }

    const fetchConnectedPlatforms = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('flipit_token');
        
        const response = await fetch("/api/FlipIt/api/connected-platforms", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            toast.error("Your session has expired. Please log in again.");
            navigate("/login");
            return;
          }
          throw new Error("Failed to fetch connected platforms");
        }

        const data = await response.json();
        setConnectedPlatforms(data);
      } catch (error) {
        console.error("Error fetching connected platforms:", error);
        toast.error("Failed to load connected platforms. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchConnectedPlatforms();
  }, [isAuthenticated, navigate]);

  const handleAccountConnected = (platform: 'facebook' | 'olx' | 'vinted') => {
    setConnectedPlatforms(prev => ({
      ...prev,
      [platform]: true
    }));
  };

  if (isLoading) {
    return (
      <div className="relative min-h-screen text-white overflow-hidden">
        {/* Background from HomePage */}
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

        <div className="container mx-auto min-h-[70vh] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-cyan-400" />
            <p className="text-xl text-neutral-300">Loading your connected platforms...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
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
      <div className="container mx-auto py-12 relative z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="max-w-4xl mx-auto"
        >
          <div className="mb-8 text-center">
            <motion.h1 
              variants={fadeUp}
              className="text-3xl md:text-4xl font-bold mb-3"
            >
              Connect Your Accounts
            </motion.h1>
            <motion.p 
              variants={fadeUp}
              custom={1}
              className="text-neutral-300 text-lg max-w-2xl mx-auto"
            >
              Connect your marketplace accounts to let FlipIt automatically find and flip items for maximum profit.
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ConnectAccountCard
              platform="facebook"
              platformName="Facebook"
              logoSrc="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/2021_Facebook_icon.svg/2048px-2021_Facebook_icon.svg.png"
              isConnected={connectedPlatforms.facebook}
              onConnected={() => handleAccountConnected('facebook')}
            />
            <ConnectAccountCard
              platform="olx"
              platformName="OLX"
              logoSrc="https://images.seeklogo.com/logo-png/39/1/olx-logo-png_seeklogo-390322.png"
              isConnected={connectedPlatforms.olx}
              onConnected={() => handleAccountConnected('olx')}
            />
            <ConnectAccountCard
              platform="vinted"
              platformName="Vinted"
              logoSrc="https://upload.wikimedia.org/wikipedia/commons/2/29/Vinted_logo.png"
              isConnected={connectedPlatforms.vinted}
              onConnected={() => handleAccountConnected('vinted')}
            />
          </div>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mt-12 text-center"
          >
            <p className="text-neutral-400 mb-6">
              {Object.values(connectedPlatforms).some(connected => connected) 
                ? "Great! You've connected at least one platform. FlipIt will start analyzing for flipping opportunities."
                : "Connect at least one marketplace account to get started with FlipIt."}
            </p>
            <Button 
              asChild 
              className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:to-fuchsia-600 text-white"
            >
              <Link to="/">
                Return to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ConnectAccountsPage;