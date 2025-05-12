
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
  isConnected: boolean; // Add this line
}

const ConnectAccountCard = ({ platform, platformName, logoSrc, isConnected, onConnected }: ConnectAccountCardProps) => {
    const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>(
    isConnected ? 'connected' : 'idle'
  );
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
            {isConnected && (
              <div className="bg-flipbot-green/10 text-flipbot-green px-2 py-1 rounded-full text-sm flex items-center gap-1">
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
                className="mx-auto bg-flipbot-green/10 w-16 h-16 rounded-full flex items-center justify-center"
              >
                <Check className="h-8 w-8 text-flipbot-green" />
              </motion.div>
              <p className="text-lg font-medium text-flipbot-green">Successfully Connected!</p>
              <p className="text-gray-600">
                FlipIt is now analyzing {platformName} for flipping opportunities.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600">
                Connect your {platformName} account to let FlipIt find and flip items automatically.
              </p>
              {/* Add connection logic here */}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ConnectAccountCard;
