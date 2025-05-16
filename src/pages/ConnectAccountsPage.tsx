
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import ConnectAccountCard from '@/components/ConnectAccountCard';
import { CheckCircle, ArrowRight, Lock, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

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
    // Check authentication
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
      <div className="container mx-auto min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-teal-500" />
          <p className="text-xl text-slate-300">Loading your connected platforms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-3">Connect Your Accounts</h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Connect your marketplace accounts to let FlipIt automatically find and flip items for maximum profit.
          </p>
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
        
        <div className="mt-12 text-center">
          <p className="text-slate-400 mb-6">
            {Object.values(connectedPlatforms).some(connected => connected) 
              ? "Great! You've connected at least one platform. FlipIt will start analyzing for flipping opportunities."
              : "Connect at least one marketplace account to get started with FlipIt."}
          </p>
          <Button asChild className="bg-teal-500 hover:bg-teal-600 text-white">
            <Link to="/">
              Return to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConnectAccountsPage;
