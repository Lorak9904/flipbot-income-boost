
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Lock, Check } from 'lucide-react';

interface ConnectAccountCardProps {
  platform: 'facebook' | 'olx' | 'vinted';
  platformName: string;
  logoSrc: string;
}

const ConnectAccountCard = ({ platform, platformName, logoSrc }: ConnectAccountCardProps) => {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected'>('idle');
  const [duration, setDuration] = useState<'24h' | '3d' | '7d'>('24h');
  const [sessionKey, setSessionKey] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  const handleConnect = async () => {
    if (showManualInput && !sessionKey) {
      return; // Don't proceed if showing manual input but no key entered
    }

    setStatus('connecting');
    
    // Simulate API request
    setTimeout(() => {
      setStatus('connected');
    }, 1500);
  };

  const handleDurationChange = (newDuration: '24h' | '3d' | '7d') => {
    setDuration(newDuration);
  };

  return (
    <Card className="w-full hover-lift overflow-hidden">
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
            <div className="mx-auto bg-flipbot-green/10 w-16 h-16 rounded-full flex items-center justify-center">
              <Check className="h-8 w-8 text-flipbot-green" />
            </div>
            <p className="text-lg font-medium text-flipbot-green">Successfully Connected!</p>
            <p className="text-gray-600">
              FlipBot is now analyzing {platformName} for flipping opportunities.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600">
              Connect your {platformName} account to let FlipBot find and flip items automatically.
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
                  className={`flex-1 py-1 text-sm rounded-md transition-colors ${
                    duration === '24h' ? 'bg-white shadow text-flipbot-teal' : 'text-gray-600'
                  }`}
                >
                  24 hours
                </button>
                <button
                  onClick={() => handleDurationChange('3d')}
                  className={`flex-1 py-1 text-sm rounded-md transition-colors ${
                    duration === '3d' ? 'bg-white shadow text-flipbot-teal' : 'text-gray-600'
                  }`}
                >
                  3 days
                </button>
                <button
                  onClick={() => handleDurationChange('7d')}
                  className={`flex-1 py-1 text-sm rounded-md transition-colors ${
                    duration === '7d' ? 'bg-white shadow text-flipbot-teal' : 'text-gray-600'
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
        {status !== 'connected' && (
          <>
            <Button 
              variant={showManualInput ? "default" : "secondary"} 
              size="lg" 
              rounded="xl"
              className="w-full"
              onClick={handleConnect}
              disabled={status === 'connecting'}
            >
              {status === 'connecting' ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connecting...
                </span>
              ) : (
                `Connect ${platformName}`
              )}
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
              <span>FlipBot never posts without your permission. Your data is encrypted.</span>
            </div>
          </>
        )}
        
        {status === 'connected' && (
          <Button 
            variant="outline" 
            size="default"
            className="w-full border-flipbot-red/20 text-flipbot-red hover:bg-flipbot-red/5"
            onClick={() => setStatus('idle')}
          >
            Disconnect
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ConnectAccountCard;
