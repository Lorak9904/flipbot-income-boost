
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Lock, Check, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface ConnectAccountCardProps {
  platform: 'facebook' | 'olx' | 'vinted';
  platformName: string;
  logoSrc: string;
  onConnected?: () => void;
}

const ConnectAccountCard = ({ platform, platformName, logoSrc, onConnected }: ConnectAccountCardProps) => {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [duration, setDuration] = useState<'24h' | '3d' | '7d'>('24h');
  const [sessionKey, setSessionKey] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  const handleConnect = async () => {
    if (showManualInput && !sessionKey) {
      toast.error("Please enter your session key first");
      return;
    }

    setStatus('connecting');
    
    try {
      // API integration with backend
      const response = await fetch(`/FlipIt/api/connect/${platform}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform,
          cookies: sessionKey || "auto-generated-session", // In a real implementation, we'd handle oauth or session capture
          duration
        }),
      });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (!response.ok) {
        throw new Error('Connection failed');
      }
      
      setStatus('connected');
      toast.success(`${platformName} connected successfully!`);
      
      if (onConnected) {
        onConnected();
      }
    } catch (error) {
      console.error('Connection error:', error);
      setStatus('error');
      toast.error(`Failed to connect ${platformName}. Please try again.`);
    }
  };

  const handleDurationChange = (newDuration: '24h' | '3d' | '7d') => {
    setDuration(newDuration);
  };

  const handleRetry = () => {
    setStatus('idle');
    setSessionKey('');
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="w-full overflow-hidden h-full">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                <img src={logoSrc} alt={`${platformName} logo`} className="h-8 w-auto" />
              </div>
              <h3 className="font-semibold text-lg">{platformName}</h3>
            </div>
            {status === 'connected' && (
              <div className="bg-flipbot-green/10 text-flipbot-green px-2 py-1 rounded-full text-sm flex items-center gap-1">
                <Check className="h-4 w-4" /> Connected
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {status === 'connected' ? (
            <div className="text-center py-4 space-y-2">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="mx-auto bg-flipbot-green/10 w-16 h-16 rounded-full flex items-center justify-center"
              >
                <Check className="h-8 w-8 text-flipbot-green" />
              </motion.div>
              <p className="text-lg font-medium text-flipbot-green">Successfully Connected!</p>
              <p className="text-gray-600">
                FlipIt is now analyzing {platformName} for flipping opportunities.
              </p>
            </div>
          ) : status === 'error' ? (
            <div className="text-center py-4 space-y-2">
              <div className="mx-auto bg-red-100 w-16 h-16 rounded-full flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
              <p className="text-lg font-medium text-red-500">Connection Failed</p>
              <p className="text-gray-600">
                We couldn't connect to your {platformName} account. Please check your session key and try again.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600">
                Connect your {platformName} account to let FlipIt find and flip items automatically.
              </p>

              {showManualInput && (
                <div className="space-y-2">
                  <label htmlFor={`session-${platform}`} className="block text-sm font-medium">
                    {platformName} Session Key
                  </label>
                  <div className="flex gap-2">
                    <input
                      id={`session-${platform}`}
                      type="text"
                      value={sessionKey}
                      onChange={(e) => setSessionKey(e.target.value)}
                      placeholder="Paste your session key here"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-flipbot-teal"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm font-medium">Access Duration</p>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => handleDurationChange('24h')}
                    className={`flex-1 py-1 text-sm rounded-md transition-all ${
                      duration === '24h' ? 'bg-white shadow text-flipbot-teal' : 'text-gray-600 hover:bg-white/50'
                    }`}
                  >
                    24 hours
                  </button>
                  <button
                    onClick={() => handleDurationChange('3d')}
                    className={`flex-1 py-1 text-sm rounded-md transition-all ${
                      duration === '3d' ? 'bg-white shadow text-flipbot-teal' : 'text-gray-600 hover:bg-white/50'
                    }`}
                  >
                    3 days
                  </button>
                  <button
                    onClick={() => handleDurationChange('7d')}
                    className={`flex-1 py-1 text-sm rounded-md transition-all ${
                      duration === '7d' ? 'bg-white shadow text-flipbot-teal' : 'text-gray-600 hover:bg-white/50'
                    }`}
                  >
                    7 days
                  </button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          {status === 'idle' && (
            <>
              <Button 
                variant={showManualInput ? "default" : "secondary"} 
                size="lg" 
                rounded="xl"
                className={`w-full ${showManualInput ? 'bg-gradient-to-r from-flipbot-teal to-flipbot-purple' : ''}`}
                onClick={handleConnect}
              >
                Connect {platformName}
              </Button>

              {!showManualInput && (
                <button 
                  onClick={() => setShowManualInput(true)}
                  className="text-sm text-gray-500 hover:text-flipbot-teal"
                >
                  Use manual connection
                </button>
              )}
              
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                <Lock className="h-3 w-3" /> 
                <span>FlipIt never posts without your permission. Your data is encrypted.</span>
              </div>
            </>
          )}
          
          {status === 'connecting' && (
            <Button 
              variant="secondary" 
              size="lg" 
              rounded="xl"
              className="w-full"
              disabled
            >
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Connecting...
            </Button>
          )}
          
          {status === 'error' && (
            <Button 
              variant="outline" 
              size="lg"
              rounded="xl"
              className="w-full border-red-200 text-red-500 hover:bg-red-50"
              onClick={handleRetry}
            >
              Try Again
            </Button>
          )}
          
          {status === 'connected' && (
            <Button 
              variant="outline" 
              size="default"
              rounded="lg"
              className="w-full border-flipbot-red/20 text-flipbot-red hover:bg-flipbot-red/5"
              onClick={() => {
                setStatus('idle');
                if (onConnected) {
                  // This is just for the demo to decrement the counter
                  // In a real app, you'd call a different callback
                }
              }}
            >
              Disconnect
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default ConnectAccountCard;
