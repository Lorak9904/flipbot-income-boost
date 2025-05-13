import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Lock, Check, AlertCircle, Loader2, X } from 'lucide-react';
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


import { useExtensionCheck } from "@/hooks/useExtensionCheck";

const EXTENSION_ID = "your_extension_id_here"; // from Chrome Web Store URL

export function Dashboard() {
  const extensionInstalled = useExtensionCheck(EXTENSION_ID);

  return (
    <div>
      <h1>Welcome to FlipIt</h1>

      {extensionInstalled === false && (
        <div className="bg-yellow-100 text-yellow-900 p-4 rounded-md mt-4">
          🚫 Our extension isn’t detected. Please{" "}
          <a
            href={`https://chrome.google.com/webstore/detail/legmgkojkpeflgbamlebigjffgmiiiej`}
            target="_blank"
            className="underline text-blue-600"
          >
            install it from the Chrome Web Store
          </a>{" "}
          and visit Facebook.
        </div>
      )}

      {extensionInstalled === true && (
        <p className="text-green-600 mt-4">✅ Extension is active!</p>
      )}
    </div>
  );
}


const ConnectAccountCard = ({ platform, platformName, logoSrc, isConnected: initialConnected, onConnected }: ConnectAccountCardProps) => {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>(
    initialConnected ? 'connected' : 'idle'
  );
  const [isConnected, setIsConnected] = useState(initialConnected);
  const [showManual, setShowManual] = useState(false);
  const [manualCookies, setManualCookies] = useState("");
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
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
              <img src={logoSrc} alt={`${platformName} logo`} className="h-8 w-auto" />
            </div>
            <h3 className="font-semibold text-lg text-white">{platformName}</h3>
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
              <Button
                variant="outline"
                className="mt-4 text-red-500 border-red-300 hover:bg-red-50 hover:text-red-700 transition"
                onClick={async () => {
                  try {
                    const token = localStorage.getItem('flipit_token');
                    const response = await fetch(`http://127.0.0.1:8000/FlipIt/api/delete-session/${platform}`, {
                      method: 'DELETE',
                      headers: {
                        'Authorization': `Bearer ${token}`,
                      },
                    });
                    if (!response.ok) throw new Error('Failed to disconnect');
                    setIsConnected(false);
                    setStatus('idle');
                    toast.success(`${platformName} disconnected.`);
                    if (onConnected) onConnected();
                  } catch (error) {
                    toast.error('Failed to disconnect. Please try again.');
                  }
                }}
              >
                <X className="w-4 h-4 mr-2" /> Disconnect
              </Button>
            </div>
          ) : showManual ? (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setStatus('connecting');
                try {
                  const token = localStorage.getItem('flipit_token');
                  const response = await fetch("http://127.0.0.1:8000/FlipIt/api/manual-connect", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      "Authorization": `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      platform,
                      cookies: manualCookies,
                      duration: "7d",
                    }),
                  });
                  if (!response.ok) throw new Error("Failed to connect manually");
                  setIsConnected(true);
                  setStatus('connected');
                  toast.success(`Manually connected to ${platformName}`);
                  setShowManual(false);
                  setManualCookies("");
                  if (onConnected) onConnected();
                } catch (error) {
                  setStatus('error');
                  toast.error("Manual connection failed. Please check your cookies and try again.");
                }
              }}
              className="space-y-4"
            >
              <p className="text-slate-300">
                Paste your cookies for <b>{platformName}</b> below. Your user ID will be linked automatically.
              </p>
              <textarea
                className="w-full p-2 border rounded"
                rows={4}
                placeholder="Paste cookies here..."
                value={manualCookies}
                onChange={e => setManualCookies(e.target.value)}
                required
              />
              <div className="flex gap-2">
                <Button type="submit" className="bg-teal-500 hover:bg-teal-600 text-white" disabled={status === 'connecting'}>
                  {status === 'connecting' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Connect Manually
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowManual(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-slate-300">
                Connect your {platformName} account to let FlipIt find and flip items automatically.
              </p>
              <div className="flex flex-col gap-2">
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
                      Automated Connect
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="text-teal-500 border-teal-500"
                  onClick={() => setShowManual(true)}
                >
                  Manual Connect
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ConnectAccountCard;
