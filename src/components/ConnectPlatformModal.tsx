import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AddItemButton, SecondaryAction } from '@/components/ui/button-presets';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, Copy, Info, Clipboard, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { getTranslations } from '@/components/language-utils';
import { connectCardTranslations } from './connect-card-translations';

interface ConnectPlatformModalProps {
  platform: 'facebook' | 'vinted';  // Only cookie-based platforms (OLX and eBay use OAuth)
  platformName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const platformConfig = {
  facebook: {
    showDtsg: true,
    cookiePlaceholder: 'Paste Facebook cookies here...',
    howToConnectVideoId: null as string | null,
  },
  vinted: {
    showDtsg: false,
    cookiePlaceholder: 'Paste Vinted cookies here...',
    howToConnectVideoId: 'GxClZgY53_k',
  },
};

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

export const ConnectPlatformModal = ({
  platform,
  platformName,
  isOpen,
  onClose,
  onSuccess,
}: ConnectPlatformModalProps) => {
  const [status, setStatus] = useState<'idle' | 'connecting'>('idle');
  const [manualCookies, setManualCookies] = useState('');
  const [manualDtsg, setManualDtsg] = useState('');
  const [showCookieInstructions, setShowCookieInstructions] = useState(false);
  const [showDtsgInstructions, setShowDtsgInstructions] = useState(false);
  const t = getTranslations(connectCardTranslations);

  const tr = (key: string, replacements?: Record<string, string>) => {
    let text = t[key] || key;
    if (replacements) {
      Object.entries(replacements).forEach(([placeholder, value]) => {
        text = text.replace(`{${placeholder}}`, value);
      });
    }
    return text;
  };

  const config = platformConfig[platform];

  // Safety check: OLX and eBay use OAuth, not manual cookie connection
  if (!config) {
    console.error(`Platform '${platform}' should use OAuth, not manual connection modal`);
    onClose();
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('connecting');
    try {
      const token = localStorage.getItem('flipit_token');
      const response = await fetch('/api/manual-connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          platform,
          cookies: manualCookies,
          dtsg: manualDtsg,
          duration: '7d',
        }),
      });
      if (!response.ok) {
        let errorMsg = 'Failed to connect manually';
        try {
          const errorData = await response.json();
          if (errorData.detail) errorMsg = errorData.detail;
        } catch {}
        throw new Error(errorMsg);
      }
      toast.success(tr('toastManualConnectedSuccess', { platform: platformName }));
      setManualCookies('');
      setManualDtsg('');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || t.toastManualConnectedError);
    } finally {
      setStatus('idle');
    }
  };

  const handleClose = () => {
    if (status === 'connecting') return;
    setManualCookies('');
    setManualDtsg('');
    setShowCookieInstructions(false);
    setShowDtsgInstructions(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-white">
            {tr('manualConnectTitle', { platform: platformName })}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {tr('manualConnectDescription', { platform: platformName })}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Cookie Instructions Toggle */}
          <div className="overflow-hidden">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowCookieInstructions(!showCookieInstructions)}
              className="flex items-center text-teal-400 hover:text-teal-300 hover:bg-teal-500/20 transition-all duration-200 w-full justify-between px-4 py-3 rounded-lg border border-transparent hover:border-teal-500/30"
            >
              <span className="flex items-center gap-2 flex-1 min-w-0">
                <Info className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium text-left break-words">
                  {tr('cookieInstructionsToggle', { platform: platformName })}
                </span>
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
                  <h4 className="text-base font-semibold mb-4 text-teal-400 break-words">
                    {tr('cookieInstructionsTitle', { platform: platformName })}
                  </h4>

                  {config.howToConnectVideoId && (
                    <YouTubeEmbed videoId={config.howToConnectVideoId} />
                  )}

                  <div className="space-y-3 text-left overflow-hidden">
                    <div className="flex gap-3 overflow-hidden">
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center text-white font-medium">
                        1
                      </div>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <p className="text-slate-200 text-sm break-words whitespace-normal">
                          <b>
                            {t.cookieStep1.split('{extensionLink}')[0]}
                            <a
                              href="https://chrome.google.com/webstore/detail/cookie-editor/hlkenndednhfkekhgcdicdfddnkalmdm"
                              target="_blank"
                              className="underline text-blue-400"
                            >
                              {t.cookieExtensionText}
                            </a>
                            {t.cookieStep1.split('{extensionLink}')[1]}
                          </b>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 overflow-hidden">
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center text-white font-medium">
                        2
                      </div>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <p className="text-slate-200 text-sm break-words whitespace-normal">
                          {tr('cookieStep2', { platform: platformName })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 overflow-hidden">
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center text-white font-medium">
                        3
                      </div>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <p className="text-slate-200 text-sm break-words whitespace-normal">
                          {tr('cookieStep3', {
                            platform: platformName,
                            exportBtn: t.cookieStep3Export,
                            exportFormat: t.cookieStep3Format,
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 overflow-hidden">
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center text-white font-medium">
                        4
                      </div>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <p className="text-slate-200 text-sm break-words whitespace-normal">
                          {t.cookieStep4}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Cookies Input */}
          <div className="relative overflow-hidden">
            <textarea
              className="w-full p-3 border border-slate-600 bg-slate-800/60 rounded-lg text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
              rows={4}
              placeholder={config.cookiePlaceholder}
              value={manualCookies}
              onChange={(e) => setManualCookies(e.target.value)}
              required
            />
            <Clipboard className="absolute right-3 top-3 text-slate-400 h-5 w-5" />
          </div>

          {/* DTSG Section (Facebook only) */}
          {config.showDtsg && (
            <>
              <div className="overflow-hidden">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowDtsgInstructions(!showDtsgInstructions)}
                  className="flex items-center text-teal-400 hover:text-teal-300 hover:bg-teal-500/20 transition-all duration-200 w-full justify-between px-4 py-3 rounded-lg border border-transparent hover:border-teal-500/30"
                >
                  <span className="flex items-center gap-2 flex-1 min-w-0">
                    <Info className="h-5 w-5 flex-shrink-0" />
                    <span className="font-medium text-left break-words">
                      {t.dtsgInstructionsToggle}
                    </span>
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
                      <h4 className="text-base font-semibold mb-4 text-teal-400 break-words">
                        {t.dtsgInstructionsTitle}
                      </h4>
                      <div className="space-y-3 text-left overflow-hidden">
                        <div className="flex gap-3 overflow-hidden">
                          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center text-white font-medium">
                            1
                          </div>
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <p className="text-slate-200 text-sm break-words whitespace-normal">
                              {t.dtsgStep1}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3 overflow-hidden">
                          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center text-white font-medium">
                            2
                          </div>
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <p className="text-slate-200 text-sm break-words whitespace-normal w-full mb-1">
                              {t.dtsgStep2.split('{keys}')[0]}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <kbd className="px-2 py-1 bg-slate-800 rounded text-xs text-white border border-slate-600 shadow">
                                {navigator.platform.includes('Mac')
                                  ? '⌘ + Option + J'
                                  : 'F12 or Ctrl + Shift + J'}
                              </kbd>
                              <span className="text-sm text-slate-300">
                                {t.dtsgStep2Alternative}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3 overflow-hidden">
                          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center text-white font-medium">
                            3
                          </div>
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <p className="text-slate-200 text-sm break-words whitespace-normal">
                              {t.dtsgStep3}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3 overflow-hidden">
                          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center text-white font-medium">
                            4
                          </div>
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <p className="text-slate-200 text-sm break-words whitespace-normal w-full mb-1">
                              {t.dtsgStep4}
                            </p>
                            <div className="flex flex-col bg-slate-800 p-2 rounded-md overflow-hidden">
                              <code className="text-teal-300 font-mono text-xs break-words whitespace-pre-wrap">
                                require("DTSG").getToken()
                              </code>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    'require("DTSG").getToken()'
                                  );
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
                          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center text-white font-medium">
                            5
                          </div>
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <p className="text-slate-200 text-sm break-words whitespace-normal">
                              {t.dtsgStep5}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="relative overflow-hidden">
                <input
                  type="text"
                  className="w-full p-3 border border-slate-600 bg-slate-800/60 rounded-lg text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Paste your dtsg token here..."
                  value={manualDtsg}
                  onChange={(e) => setManualDtsg(e.target.value)}
                  required={config.showDtsg}
                />
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 flex-wrap pt-2">
            <AddItemButton
              type="submit"
              className="flex-1 min-w-[120px]"
              disabled={status === 'connecting'}
            >
              {status === 'connecting' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin flex-shrink-0" />
              ) : null}
              <span className="truncate">
                {tr('manualConnectButton', { platform: platformName })}
              </span>
            </AddItemButton>
            <SecondaryAction
              type="button"
              onClick={handleClose}
              disabled={status === 'connecting'}
              className="min-w-[100px] flex-shrink-0"
            >
              {t.manualConnectCancel}
            </SecondaryAction>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectPlatformModal;
