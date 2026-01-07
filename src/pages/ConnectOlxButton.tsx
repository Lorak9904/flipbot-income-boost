import { api } from "../hooks/olx-api";
import { ManageButton } from '@/components/ui/button-presets';
import { Link as LinkIcon } from 'lucide-react';

export function ConnectOlxButton() {
  const handleClick = async () => {
    const token = localStorage.getItem('flipit_token');
    if (!token) {
      // Optionally handle missing token (e.g., redirect to login)
      return;
    }
    const { data } = await api.get<{ auth_url: string }>("/olx/connect", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    window.location.href = data.auth_url;
    console.log(data);
  };

  return (
  <div className="space-y-4">
    <p className="text-slate-300">
      Connect your OLX account to let FlipIt find and flip items automatically.
    </p>
    <div className="flex flex-col gap-2">
      <ManageButton
          icon={LinkIcon}
          onClick={handleClick}
      >
        Connect with OLX
      </ManageButton>
    </div>
    </div>
  );
}