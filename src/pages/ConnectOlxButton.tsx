import { api } from "../hooks/olx-api";
import { Button } from '@/components/ui/button';
import { getTranslations } from '@/components/language-utils';
import { olxConnectionTranslations } from './olxconnection-translations';

export function ConnectOlxButton() {
  const t = getTranslations(olxConnectionTranslations);
  
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
      {t.buttonDescription}
    </p>
    <div className="flex flex-col gap-2">
      <Button
          variant="outline"
          className="text-teal-500 border-teal-500"
          onClick={handleClick}
          style={{ padding: "0.6rem 1rem", fontSize: "1rem" }}
      >
        {t.connectButton}
      </Button>
    </div>
    </div>
  );
}
