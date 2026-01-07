import { ManageButton } from '@/components/ui/button-presets';
import { getEbayConnectUrl } from '@/lib/api/ebay';
import { useState } from 'react';
import { Loader2, Link as LinkIcon } from 'lucide-react';

/**
 * Connect eBay Button Component
 * 
 * Initiates the eBay OAuth flow by fetching the authorization URL
 * from the backend and redirecting the user.
 * 
 * Pattern follows ConnectOlxButton.tsx
 */
export function ConnectEbayButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    const token = localStorage.getItem('flipit_token');
    if (!token) {
      // Redirect to login if not authenticated
      window.location.href = '/login';
      return;
    }
    
    setIsLoading(true);
    try {
      const data = await getEbayConnectUrl('EBAY_PL'); // Default to Poland marketplace
      window.location.href = data.auth_url;
    } catch (error) {
      console.error('Failed to get eBay connect URL:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-slate-300">
        Connect your eBay account to let FlipIt list and manage items automatically.
      </p>
      <div className="flex flex-col gap-2">
        <ManageButton
          icon={isLoading ? Loader2 : LinkIcon}
          onClick={handleClick}
          disabled={isLoading}
        >
          {isLoading ? 'Connecting...' : 'Connect with eBay'}
        </ManageButton>
      </div>
    </div>
  );
}
