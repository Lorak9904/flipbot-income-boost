
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Lock, Check, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface ConnectAccountCardProps {
  platform: 'facebook' | 'olx' | 'vinted';
  platformName: string;
  logoSrc: string;
  onConnected?: () => void;
  isConnected: boolean;
}

const ConnectAccountCard = ({ platform, platformName, logoSrc, isConnected: initialConnected, onConnected }: ConnectAccountCardProps) => {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>(
    initialConnected ? 'connected' : 'idle'
  );
  const [isConnected, setIsConnected] = useState(initialConnected);
  const { user } = useAuth();

  const handleConnect = async () => {
    if (!user) {
      toast.error("Please log in to connect your accounts");
      return;
    }

    setStatus('connecting');
    
    try {
      if (platform === 'facebook') {
        // Redirect to Facebook OAuth
        const appId = "YOUR_FACEBOOK_APP_ID"; // Replace with your Facebook App ID
        const redirectUri = encodeURIComponent("http://localhost:3000/facebook-callback");
        window.location.href = `https://www.facebook.com/v13.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=email,public_profile`;
      } else {
        // For demo purposes, simulate connecting to other platforms
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // In a real app, you'd save the connection to the backend
        const response = await fetch(`http://127.0.0.1:8000/FlipIt/api/connect/${platform}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('flipit_token')}`
          },
          body: JSON.stringify({ platform })
        });
        
        if (!response.ok) {
          throw new Error(`Failed to connect ${platformName}`);
        }
        
        setIsConnected(true);
        setStatus('connected');
        toast.success(`Successfully connected to ${platformName}`);
        
        if (onConnected) {
          onConnected();
        }
      }
    } catch (error) {
      console.error(`Error connecting to ${platformName}:`, error);
      setStatus('error');
      toast.error(`Failed to connect to ${platformName}. Please try again.`);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="w-full overflow-hidden h-full border border-slate-700 bg-slate-800/50">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
                <img src={logoSrc} alt={`${platformName} logo`} className="h-8 w-auto" />
              </div>
              <h3 className="font-semibold text-lg text-white">{platformName}</h3>
            </div>
            {isConnected && (
              <div className="bg-teal-500/10 text-teal-400 px-2 py-1 rounded-full text-sm flex items-center gap-1">
                <Check className="h-4 w-4" /> Connected
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {isConnected ? (
            <div className="text-center py-4 space-y-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="mx-auto bg-teal-500/10 w-16 h-16 rounded-full flex items-center justify-center"
              >
                <Check className="h-8 w-8 text-teal-400" />
              </motion.div>
              <p className="text-lg font-medium text-teal-400">Successfully Connected!</p>
              <p className="text-slate-300">
                FlipIt is now analyzing {platformName} for flipping opportunities.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-slate-300">
                Connect your {platformName} account to let FlipIt find and flip items automatically.
              </p>
              <Button 
                onClick={handleConnect} 
                className="w-full bg-teal-500 hover:bg-teal-600 text-white"
                disabled={status === 'connecting'}
              >
                {status === 'connecting' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    Connect {platformName}
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ConnectAccountCard;
