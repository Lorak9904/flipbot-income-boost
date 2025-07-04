import { useEffect, useState } from "react";
import { api } from "../hooks/olx-api";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export function OlxSuccessPage() {
  const [connected, setConnected] = useState<boolean | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

useEffect(() => {
  api.get<{ connected: boolean }>("/olx/status", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("flipit_token")}`,
    },
  })
    .then(res => {
      setConnected(res.data.connected);
      if (res.data.connected) {
        toast({
          title: "OLX Connected!",
          description: "Konto OLX zostało pomyślnie podłączone.",
          variant: "default",
        });
        setTimeout(() => navigate("/"), 1500); // Redirect after 1.5s
      } else {
        toast({
          title: "Błąd połączenia z OLX",
          description: "Nie udało się podłączyć konta OLX.",
          variant: "destructive",
        });
        setTimeout(() => navigate("/"), 1500);
      }
    })
    .catch(() => {
      setConnected(false);
      toast({
        title: "Błąd połączenia z OLX",
        description: "Nie udało się podłączyć konta OLX.",
        variant: "destructive",
      });
      setTimeout(() => navigate("/"), 1500);
    });
}, [toast, navigate]);

return null; // No message, just toast and redirect
}