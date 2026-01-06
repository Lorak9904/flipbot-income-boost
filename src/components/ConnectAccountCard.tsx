import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Check, AlertCircle, Loader2, X, Copy, Info, Clipboard, ArrowRight, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { getTranslations } from '@/components/language-utils';
import { connectCardTranslations } from './connect-card-translations';
import { useNavigate } from 'react-router-dom';

interface ConnectAccountCardProps {
  platform: 'facebook' | 'olx' | 'vinted' | 'ebay';
  platformName: string;
  logoSrc: string;
  onConnected?: () => void;
  isConnected: boolean;
  action?: React.ReactNode;
  sessionStatus?: 'valid' | 'expired' | 'invalid' | null;  // Task 1: Add status tracking
  invalidReason?: string | null;
}



const ConnectAccountCard = ({
  platform,
  platformName,
  logoSrc,
  isConnected: initialConnected,
  onConnected,
  action,
  sessionStatus,  // Task 1: Receive status from backend
  invalidReason,
}: ConnectAccountCardProps) => {  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>(
    initialConnected ? 'connected' : 'idle'
  );
  const [isConnected, setIsConnected] = useState(initialConnected);
  const [showManual, setShowManual] = useState(false);
  const [manualCookies, setManualCookies] = useState("");
  const [manualDtsg, setManualDtsg] = useState("");
  const [showCookieInstructions, setShowCookieInstructions] = useState(false);
  const [showDtsgInstructions, setShowDtsgInstructions] = useState(false);
  const t = getTranslations(connectCardTranslations);
  const navigate = useNavigate();
  
  // Helper to replace placeholders like {platform} in translations
  const tr = (key: string, replacements?: Record<string, string>) => {
    let text = t[key] || key;
    if (replacements) {
      Object.entries(replacements).forEach(([placeholder, value]) => {
        text = text.replace(`{${placeholder}}`, value);
      });
    }
    return text;
  };

  const platformConfig = {
    facebook: {
      showDtsg: true,
      cookieInstructions: "Facebook",
      cookiePlaceholder: "Paste Facebook cookies here...",
      // Task 4: Add YouTube video URL for "How to connect" tutorial
      // Replace with actual YouTube video ID when available
      howToConnectVideoId: null as string | null,  // e.g., "dQw4w9WgXcQ"
    },
    olx: {
      showDtsg: false,
      cookieInstructions: "OLX",
      cookiePlaceholder: "Paste OLX cookies here...",
      howToConnectVideoId: null as string | null,
    },
    vinted: {
      showDtsg: false,
      cookieInstructions: "Vinted",
      cookiePlaceholder: "Paste Vinted cookies here...",
      howToConnectVideoId: "GxClZgY53_k",
    },
    ebay: {
      showDtsg: false,  // eBay uses OAuth, not cookie-based
      cookieInstructions: "eBay",
      cookiePlaceholder: "Not used for eBay (OAuth flow)",
      howToConnectVideoId: null as string | null,
    }
  };

  // Task 4: YouTube embed component with responsive sizing
  const YouTubeEmbed = ({ videoId }: { videoId: string }) => (
    <div className="relative w-full pt-[56.25%] mb-4 overflow-hidden rounded-lg">
      <iframe
        className="absolute top-0 left-0 w-full h-full rounded-lg"
        src={`https://www.youtube.com/embed/${videoId}?rel=0`}
        title="How to connect - Video tutorial"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );

  const { user } = useAuth();

  // Keep internal state in sync with prop updates (live status updates without refresh)
  useEffect(() => {
    setIsConnected(initialConnected);
    setStatus(initialConnected ? 'connected' : 'idle');
  }, [initialConnected]);

  // Require authentication to connect accounts
  if (!user) {
    return (
      <div className="p-4 text-center text-red-500 bg-slate-800 rounded-lg">
        {tr('authRequiredMessage', { platform: platformName })}
      </div>
    );
  }

  const handleConnect = async () => {
    if (!user) {
      toast.error(t.authRequiredToast);
      return;
    }

    setStatus('connecting');
    
    try {
      // For demo purposes, simulate connecting to other platforms
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, you'd save the connection to the backend
      const response = await fetch(`/api/connect/${platform}`, {
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
      toast.success(tr('toastConnectedSuccess', { platform: platformName }));
      
      if (onConnected) {
        onConnected();
      }
    } catch (error) {
      console.error(`Error connecting to ${platformName}:`, error);
      setStatus('error');
      toast.error(tr('toastConnectedError', { platform: platformName }));
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="w-full"
    >
      <Card className="w-full overflow-hidden border border-slate-700/80 bg-slate-800/60">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between gap-2 min-w-0">
            {/* Platform info - truncates gracefully */}
            <div className="flex items-center gap-3 min-w-0 flex-shrink">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                <img src={logoSrc} alt={`${platformName} logo`} className="h-6 sm:h-8 w-auto" />
              </div>
              <h3 className="font-semibold text-base sm:text-lg text-white truncate">{platformName}</h3>
            </div>
            {/* Status badge - never truncates, but shrinks gracefully */}
            <div className={`inline-flex items-center gap-1.5 sm:gap-2 rounded-full px-2 sm:px-3 py-1 text-xs font-medium border flex-shrink-0 whitespace-nowrap ${
              sessionStatus === 'invalid' 
                ? 'bg-red-500/10 text-red-300 border-red-700/50'
                : sessionStatus === 'expired'
                ? 'bg-amber-500/10 text-amber-300 border-amber-700/50'
                : isConnected 
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-700/50' 
                : 'bg-slate-700/60 text-slate-300 border-slate-600/60'
            }`}>
              <span className={`h-2 w-2 rounded-full flex-shrink-0 ${
                sessionStatus === 'invalid' 
                  ? 'bg-red-400'
                  : sessionStatus === 'expired'
                  ? 'bg-amber-400'
                  : isConnected 
                  ? 'bg-emerald-400' 
                  : 'bg-slate-400'
              }`} />
              <span className="hidden xs:inline">
                {sessionStatus === 'invalid' 
                  ? 'Invalid'
                  : sessionStatus === 'expired'
                  ? 'Expired'
                  : isConnected 
                  ? t.statusConnected 
                  : status === 'connecting' 
                  ? t.statusConnecting 
                  : t.statusNotConnected}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {isConnected ? (
            <div className="text-center py-4 space-y-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="mx-auto bg-emerald-500/10 w-16 h-16 rounded-full flex items-center justify-center"
              >
                <Check className="h-8 w-8 text-teal-400" />
              </motion.div>
              <p className="text-lg font-medium text-teal-400">{t.connectedTitle}</p>
              <p className="text-slate-300">
                {tr('connectedDescription', { platform: platformName })}
              </p>
              <div className="flex justify-center gap-2 mt-4 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10 transition min-w-0 max-w-[140px]"
                  onClick={() => navigate(`/platform-settings/${platform}`)}
                >
                  <Settings className="w-4 h-4 mr-1 sm:mr-2 flex-shrink-0" /> 
                  <span className="truncate">{t.settingsButton || 'Settings'}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500 border-red-300 hover:bg-red-50 hover:text-red-700 transition min-w-0 max-w-[140px]"
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem('flipit_token');
                      const response = await fetch(`/api/delete-session/${platform}`, {
                        method: 'DELETE',
                        headers: {
                          'Authorization': `Bearer ${token}`,
                        },
                      });
                      if (!response.ok) throw new Error('Failed to disconnect');
                      setIsConnected(false);
                      setStatus('idle');
                      toast.success(tr('toastDisconnectedSuccess', { platform: platformName }));
                      if (onConnected) onConnected();
                    } catch (error) {
                      toast.error(t.toastDisconnectedError);
                    }
                  }}
                >
                  <X className="w-4 h-4 mr-1 sm:mr-2 flex-shrink-0" /> 
                  <span className="truncate">{t.disconnectButton}</span>
                </Button>
              </div>
            </div>
          ) : showManual ? (
            
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setStatus('connecting');
                try {
                  const token = localStorage.getItem('flipit_token');
                  const response = await fetch("/api/manual-connect", {
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
                  toast.success(tr('toastManualConnectedSuccess', { platform: platformName }));
                  setShowManual(false);
                  setManualCookies("");
                  if (onConnected) onConnected();
                } catch (error: any) {
                  setStatus('error');
                  toast.error(error.message || t.toastManualConnectedError);
                }
              }}
              className="space-y-6 overflow-hidden"
            >
              <div className="mb-6 overflow-hidden">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowCookieInstructions(!showCookieInstructions)}
                  className="flex items-center text-teal-400 hover:text-teal-300 hover:bg-teal-500/20 transition-all duration-200 w-full justify-between px-4 py-3 rounded-lg border border-transparent hover:border-teal-500/30"
                >
                  <span className="flex items-center gap-2 flex-1 min-w-0">
                    <Info className="h-5 w-5 flex-shrink-0" />
                    <span className="font-medium text-left break-words">{tr('cookieInstructionsToggle', { platform: platformName })}</span>
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
                    className="mt-3 overflow-hidden"
                  >
                    <div className="glass-card p-4 rounded-xl bg-slate-700/50 border border-slate-600/50 shadow-lg overflow-hidden">
                      <h4 className="text-base font-semibold mb-4 text-teal-400 break-words">{tr('cookieInstructionsTitle', { platform: platformName })}</h4>
                      
                      {/* Task 4: Show YouTube video if available */}
                      {platformConfig[platform].howToConnectVideoId && (
                        <YouTubeEmbed videoId={platformConfig[platform].howToConnectVideoId!} />
                      )}
                      
                      <div className="space-y-3 text-left overflow-hidden">
                        <div className="flex gap-3 overflow-hidden">
                          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center text-white font-medium">1</div>
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <p className="text-slate-200 text-sm break-words whitespace-normal overflow-wrap-anywhere">
                              <b>{t.cookieStep1.split('{extensionLink}')[0]}<a href="https://chrome.google.com/webstore/detail/cookie-editor/hlkenndednhfkekhgcdicdfddnkalmdm" target="_blank" className="underline text-blue-400">{t.cookieExtensionText}</a>{t.cookieStep1.split('{extensionLink}')[1]}</b>
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3 overflow-hidden">
                          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center text-white font-medium">2</div>
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <p className="text-slate-200 text-sm break-words whitespace-normal overflow-wrap-anywhere">
                              {tr('cookieStep2', { platform: platformName })}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center text-white font-medium">3</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-200 text-sm break-words whitespace-normal">
                              {tr('cookieStep3', { platform: platformName, exportBtn: t.cookieStep3Export, exportFormat: t.cookieStep3Format })}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3 overflow-hidden">
                          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center text-white font-medium">4</div>
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <p className="text-slate-200 text-sm break-words whitespace-normal overflow-wrap-anywhere">
                              {t.cookieStep4}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
              
              <p className="text-slate-300">
                {tr('manualConnectDescription', { platform: platformName })}
              </p>
              <div className="relative mb-4 overflow-hidden">
                <textarea
                  className="w-full p-3 border border-slate-600 bg-slate-800/60 rounded-lg text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
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
                  <div className="mb-6 overflow-hidden">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowDtsgInstructions(!showDtsgInstructions)}
                      className="flex items-center text-teal-400 hover:text-teal-300 hover:bg-teal-500/20 transition-all duration-200 w-full justify-between px-4 py-3 rounded-lg border border-transparent hover:border-teal-500/30"
                    >
                      <span className="flex items-center gap-2 flex-1 min-w-0">
                        <Info className="h-5 w-5 flex-shrink-0" />
                        <span className="font-medium text-left break-words">{t.dtsgInstructionsToggle}</span>
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
                    className="mt-3 overflow-hidden"
                  >
                    <div className="glass-card p-5 rounded-xl bg-slate-700/50 border border-slate-600/50 shadow-lg overflow-hidden">
                      <h4 className="text-base font-semibold mb-4 text-teal-400 break-words">{t.dtsgInstructionsTitle}</h4>
                      <div className="space-y-3 text-left overflow-hidden">
                        <div className="flex gap-3 overflow-hidden">
                          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center text-white font-medium">1</div>
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <p className="text-slate-200 text-sm break-words whitespace-normal overflow-wrap-anywhere">
                              {t.dtsgStep1}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3 overflow-hidden">
                          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center text-white font-medium">2</div>
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <p className="text-slate-200 text-sm break-words whitespace-normal w-full mb-1 overflow-wrap-anywhere">
                              {t.dtsgStep2.split('{keys}')[0]}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <kbd className="px-2 py-1 bg-slate-800 rounded text-xs text-white border border-slate-600 shadow">
                                {navigator.platform.includes('Mac') ? '⌘ + Option + J' : 'F12 or Ctrl + Shift + J'}
                              </kbd>
                              <span className="text-sm text-slate-300">{t.dtsgStep2Alternative}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center text-white font-medium">3</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-200 text-sm break-words whitespace-normal">
                              {t.dtsgStep3}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3 overflow-hidden">
                          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center text-white font-medium">4</div>
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <p className="text-slate-200 text-sm break-words whitespace-normal w-full mb-1 overflow-wrap-anywhere">
                              {t.dtsgStep4}
                            </p>
                            <div className="flex flex-col bg-slate-800 p-2 rounded-md overflow-hidden">
                              <code className="text-teal-300 font-mono text-xs break-words whitespace-pre-wrap">
                                require("DTSG").getToken()
                              </code>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText('require("DTSG").getToken()');
                                  toast.success(t.dtsgCommandCopied);
                                }}
                                className="mt-2 self-end text-teal-400 hover:text-teal-300 focus:outline-none"
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3 overflow-hidden">
                          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center text-white font-medium">5</div>
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <p className="text-slate-200 text-sm break-words whitespace-normal overflow-wrap-anywhere">
                              {t.dtsgStep5}
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
              <div className="flex gap-3 flex-wrap">
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex-1 min-w-[120px] disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={status === 'connecting'}
                >
                  {status === 'connecting' ? <Loader2 className="mr-2 h-4 w-4 animate-spin flex-shrink-0" /> : null}
                  <span className="truncate">Connect {platformName}</span>
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowManual(false)}
                  className="border-slate-500/50 bg-slate-800/50 text-slate-300 hover:bg-slate-700/70 hover:border-slate-400/50 hover:text-white transition-all duration-200 min-w-[100px] flex-shrink-0"
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            action || (
              <div className="space-y-4">
                <p className="text-slate-300">
                  {tr('notConnectedDescription', { platform: platformName })}
                </p>
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => setShowManual(true)}
                    className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 border-0"
                  >
                    {t.manualConnectButtonCta}
                  </Button>
                </div>
              </div>
            )
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ConnectAccountCard;
