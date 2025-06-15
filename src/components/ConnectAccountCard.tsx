import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Check, AlertCircle, Loader2, X, Copy, Info, Clipboard, ArrowRight } from 'lucide-react';
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
  const [showManual, setShowManual] = useState(false);
  const [manualCookies, setManualCookies] = useState("");
  const [manualDtsg, setManualDtsg] = useState("");
  const [showCookieInstructions, setShowCookieInstructions] = useState(false);
  const [showDtsgInstructions, setShowDtsgInstructions] = useState(false);

  const platformConfig = {
    facebook: {
      showDtsg: true,
      cookieInstructions: "Facebook",
      cookiePlaceholder: "Paste Facebook cookies here..."
    },
    olx: {
      showDtsg: false,
      cookieInstructions: "OLX",
      cookiePlaceholder: "Paste OLX cookies here..."
    },
    vinted: {
      showDtsg: false,
      cookieInstructions: "Vinted",
      cookiePlaceholder: "Paste Vinted cookies here..."
    }
  };

  const { user } = useAuth();

  // Require authentication to connect accounts
  if (!user) {
    return (
      <div className="p-4 text-center text-red-500 bg-slate-800 rounded-lg">
        You must be logged in to connect your {platformName} account.
      </div>
    );
  }

  const handleConnect = async () => {
    if (!user) {
      toast.error("Please log in to connect your accounts");
      return;
    }

    setStatus('connecting');
    
    try {
      // For demo purposes, simulate connecting to other platforms
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, you'd save the connection to the backend
      const response = await fetch(`/api/FlipIt/api/connect/${platform}`, {
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
      <Card className="w-full overflow-hidden h-full border border-slate-700 bg-slate-700">
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
                    const response = await fetch(`/api/FlipIt/api/delete-session/${platform}`, {
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
                  const response = await fetch("/api/FlipIt/api/manual-connect", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      "Authorization": `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      platform,
                      cookies: manualCookies,
                      dtsg: manualDtsg,
                      duration: "7d",
                    }),
                  });
                  if (!response.ok) {
                    // Try to parse backend error message
                    let errorMsg = "Failed to connect manually";
                    try {
                      const errorData = await response.json();
                      if (errorData.detail) errorMsg = errorData.detail;
                    } catch {}
                    throw new Error(errorMsg);
                  }
                  setIsConnected(true);
                  setStatus('connected');
                  toast.success(`Manually connected to ${platformName}`);
                  setShowManual(false);
                  setManualCookies("");
                  if (onConnected) onConnected();
                } catch (error: any) {
                  setStatus('error');
                  toast.error(error.message || "Manual connection failed. Please check your cookies and try again.");
                }
              }}
              className="space-y-6"
            >
              <div className="mb-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowCookieInstructions(!showCookieInstructions)}
                  className="flex items-center text-teal-400 hover:text-teal-300 hover:bg-teal-500/10 transition-colors w-full justify-between px-4 py-2 rounded-lg"
                >
                  <span className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    <span className="font-medium">How to get {platformName} cookies?</span>
                  </span>
                  <motion.div
                    animate={{ rotate: showCookieInstructions ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </motion.div>
                </Button>
                
                {showCookieInstructions && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-3"
                  >
                    <div className="glass-card p-5 rounded-xl bg-slate-700/50 border border-slate-600/50 shadow-lg">
                      <h4 className="text-base font-semibold mb-4 text-teal-400">Get {platformName} Cookies in 4 Simple Steps</h4>
                      <div className="space-y-3 text-left">
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center text-white font-medium">1</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-200 text-sm break-words whitespace-normal">
                              <b>Install the <a href="https://chrome.google.com/webstore/detail/cookie-editor/hlkenndednhfkekhgcdicdfddnkalmdm" target="_blank" className="underline text-blue-400">Cookie-Editor extension</a></b> in your browser.
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center text-white font-medium">2</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-200 text-sm break-words whitespace-normal">
                              Go to <span className="font-medium text-white">{platformName}</span> and log in to your account.
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center text-white font-medium">3</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-200 text-sm break-words whitespace-normal">
                              Click the Cookie-Editor extension icon, then click the <b>Export</b> button (bottom right), choose <b>Export → Header String</b>, and copy the result.
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center text-white font-medium">4</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-200 text-sm break-words whitespace-normal">
                              Paste this string into the cookies field below.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
              
              <p className="text-slate-300">
                Paste your cookies for <b>{platformName}</b> below. Your user ID will be linked automatically.
              </p>
              <div className="relative mb-4">
                <textarea
                  className="w-full p-3 border border-slate-600 bg-slate-800/60 rounded-lg text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  rows={4}
                  placeholder={platformConfig[platform].cookiePlaceholder}
                  value={manualCookies}
                  onChange={e => setManualCookies(e.target.value)}
                  required
                />
                <Clipboard className="absolute right-3 top-3 text-slate-400 h-5 w-5" />
              </div>

              {/* DTSG section - conditionally shown based on platform */}
              {platformConfig[platform].showDtsg && (
                <>
                  <div className="mb-6">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowDtsgInstructions(!showDtsgInstructions)}
                      className="flex items-center text-teal-400 hover:text-teal-300 hover:bg-teal-500/10 transition-colors w-full justify-between px-4 py-2 rounded-lg"
                    >
                      <span className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <span className="font-medium">How to get dtsg token?</span>
                      </span>
                      <motion.div
                        animate={{ rotate: showDtsgInstructions ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </motion.div>
                    </Button>
                {showDtsgInstructions && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-3"
                  >
                    <div className="glass-card p-5 rounded-xl bg-slate-700/50 border border-slate-600/50 shadow-lg">
                      <h4 className="text-base font-semibold mb-4 text-teal-400">Get dtsg Token in 5 Simple Steps</h4>
                      <div className="space-y-3 text-left">
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center text-white font-medium">1</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-200 text-sm break-words whitespace-normal">
                              Visit <span className="font-medium text-white">facebook.com</span> and log in to your account
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center text-white font-medium">2</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-200 text-sm break-words whitespace-normal w-full mb-1">
                              Open Developer Tools:
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <kbd className="px-2 py-1 bg-slate-800 rounded text-xs text-white border border-slate-600 shadow">
                                {navigator.platform.includes('Mac') ? '⌘ + Option + J' : 'F12 or Ctrl + Shift + J'}
                              </kbd>
                              <span className="text-sm text-slate-300">or right-click → Inspect → Console</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center text-white font-medium">3</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-200 text-sm break-words whitespace-normal">
                              Click on the <span className="font-medium text-white">Console</span> tab
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center text-white font-medium">4</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-200 text-sm break-words whitespace-normal w-full mb-1">
                              Type or paste this command:
                            </p>
                            <div className="flex flex-col bg-slate-800 p-2 rounded-md">
                              <code className="text-teal-300 font-mono text-xs break-words whitespace-pre-wrap">
                                require("DTSG").getToken()
                              </code>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText('require("DTSG").getToken()');
                                  toast.success('Command copied to clipboard!');
                                }}
                                className="mt-2 self-end text-teal-400 hover:text-teal-300 focus:outline-none"
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center text-white font-medium">5</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-200 text-sm break-words whitespace-normal">
                              Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-xs text-white border border-slate-600 shadow">Enter</kbd> and copy the value shown, then paste it below.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                </div>

                  <div className="relative mb-4">
                    <input
                      type="text"
                      className="w-full p-3 border border-slate-600 bg-slate-800/60 rounded-lg text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Paste your dtsg token here..."
                      value={manualDtsg}
                      onChange={e => setManualDtsg(e.target.value)}
                      required={platformConfig[platform].showDtsg}
                    />
                  </div>
                </>
              )}
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  className="bg-teal-500 hover:bg-teal-600 text-white flex-1"
                  disabled={status === 'connecting'}
                >
                  {status === 'connecting' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Connect {platformName}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowManual(false)}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
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
