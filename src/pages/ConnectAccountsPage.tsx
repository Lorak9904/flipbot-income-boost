import { useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import ConnectAccountCard from '@/components/ConnectAccountCard';
import { CheckCircle, ArrowRight, Lock, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { ConnectOlxButton } from '@/pages/ConnectOlxButton';
import { useToast } from '@/hooks/use-toast';
import { SEOHead } from '@/components/SEOHead';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 * i, duration: 0.6, ease: 'easeOut' },
  }),
};

const ConnectAccountsPage = () => {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const fetchConnectedPlatforms = async (): Promise<Record<string, any>> => {
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
        throw new Error('unauthorized');
      }
      throw new Error("Failed to fetch connected platforms");
    }

    const data = await response.json();
    // Preserve whether a session exists in DB for Vinted
    const vinted_has_session = !!data.vinted;
    // Validate Vinted connection live if session exists
    let vintedConnected = data.vinted;
    let vinted_status_code: number | null = null;
    if (vinted_has_session) {
      try {
        const statusResp = await fetch("/api/FlipIt/api/vinted/status", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
        vinted_status_code = statusResp.status;
        if (statusResp.ok) {
          const st = await statusResp.json();
          vintedConnected = !!st.connected;
          if (typeof st.status_code === 'number') vinted_status_code = st.status_code;
        } else {
          vintedConnected = false;
        }
      } catch {
        vintedConnected = false;
      }
    }
    return { ...data, vinted: vintedConnected, vinted_has_session, vinted_status_code };
  };

  const {
    data: connectedPlatforms,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['connected-platforms'],
    queryFn: fetchConnectedPlatforms,
    enabled: !!localStorage.getItem('flipit_token') && !!isAuthenticated,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  useEffect(() => {
    const token = localStorage.getItem('flipit_token');
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add items",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    if (!!user && isAuthenticated === false) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add items",
        variant: "destructive",
      });
      navigate('/login');
    }
  }, [isAuthenticated, navigate, toast, user]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const platform = params.get("platform");
    const status = params.get("status");
    const reconnect = params.get("reconnect");
    const message = params.get("message");
    
    if (platform === "olx" && status === "connected") {
      toast({
        title: "OLX Connected!",
        description: "Successfully connected to OLX!",
        variant: "default",
      });
      // Immediately refetch to reflect status without manual refresh
      refetch();
      window.history.replaceState({}, document.title, location.pathname);
    }
    
    // Handle reconnect requests (expired token)
    if (reconnect === "olx") {
      toast({
        title: "OLX Reconnection Required",
        description: message || "Your OLX token has expired. Please reconnect your account.",
        variant: "destructive",
      });
      // Clear URL params but keep user on page to reconnect
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location, toast, refetch]);

  const handleAccountConnected = () => {
    // Ensure page status syncs with backend
    queryClient.invalidateQueries({ queryKey: ['connected-platforms'] });
  };

  if (isLoading || !connectedPlatforms) {
    return (
      <div className="relative min-h-screen text-white overflow-hidden">
        <SEOHead
          title="Connect Accounts | FlipIt"
          description="Connect OLX, Vinted, and Facebook to power marketplace automation — AI crosslisting without manual descriptions, pricing, or categories."
          canonicalUrl="https://myflipit.live/connect-accounts"
          robots="noindex, nofollow"
        />
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
      <SEOHead
        title="Connect Accounts | FlipIt"
        description="Connect your marketplaces to enable crosslisting."
        canonicalUrl="https://myflipit.live/connect-accounts"
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
              isConnected={!!connectedPlatforms?.facebook}
              onConnected={handleAccountConnected}
            />
            <ConnectAccountCard
              platform="olx"
              platformName="OLX"
              logoSrc="https://images.seeklogo.com/logo-png/39/1/olx-logo-png_seeklogo-390322.png"
              isConnected={!!connectedPlatforms?.olx}
              onConnected={handleAccountConnected}
              action={!connectedPlatforms?.olx && <ConnectOlxButton />}
            />
            <ConnectAccountCard
              platform="vinted"
              platformName="Vinted"
              logoSrc="https://upload.wikimedia.org/wikipedia/commons/2/29/Vinted_logo.png"
              isConnected={!!connectedPlatforms?.vinted}
              onConnected={handleAccountConnected}
              action={connectedPlatforms?.vinted_has_session && !connectedPlatforms?.vinted ? (
                <div className="space-y-3">
                  <p className="text-slate-300 text-sm">
                    We couldn’t verify your Vinted connection. Try refreshing your cookies.
                  </p>
                  <Button
                    onClick={async () => {
                      const token = localStorage.getItem('flipit_token');
                      try {
                        const resp = await fetch('/api/FlipIt/api/vinted/refresh', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                          },
                        });
                        if (!resp.ok) {
                          const err = await resp.json().catch(() => ({}));
                          throw new Error(err.detail || 'Failed to refresh Vinted cookies');
                        }
                        const body = await resp.json();
                        if (body.connected) {
                          await refetch();
                          toast({ title: 'Vinted Connected', description: 'Cookies refreshed successfully.' });
                        } else {
                          toast({ title: 'Vinted Not Connected', description: `Status ${body.status_code || ''}`, variant: 'destructive' });
                        }
                      } catch (e: any) {
                        toast({ title: 'Refresh Failed', description: e.message, variant: 'destructive' });
                      }
                    }}
                    className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white"
                  >
                    Refresh Vinted Cookies
                  </Button>
                  <Button
                    variant="outline"
                    className="text-red-500 border-red-300 hover:bg-red-50 hover:text-red-700 transition"
                    onClick={async () => {
                      const token = localStorage.getItem('flipit_token');
                      try {
                        const response = await fetch(`/api/FlipIt/api/delete-session/vinted`, {
                          method: 'DELETE',
                          headers: { 'Authorization': `Bearer ${token}` },
                        });
                        if (!response.ok) throw new Error('Failed to disconnect Vinted');
                        await refetch();
                        toast({ title: 'Vinted Disconnected', description: 'Stored cookies removed.' });
                      } catch (err: any) {
                        toast({ title: 'Disconnect Failed', description: err.message, variant: 'destructive' });
                      }
                    }}
                  >
                    Disconnect
                  </Button>
                </div>
              ) : undefined}
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
              {connectedPlatforms && Object.values(connectedPlatforms).some(connected => connected) 
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
