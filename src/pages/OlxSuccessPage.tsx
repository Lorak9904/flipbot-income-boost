import { useEffect } from "react";
import { api } from "../hooks/olx-api";
import { useToast } from "@/hooks/use-toast";

export function OlxSuccessPage() {
  const { toast } = useToast();

  useEffect(() => {
    api.get<{ connected: boolean }>("/olx/status", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("flipit_token")}`,
      },
    })
      .then(res => {
        if (res.data.connected) {
          toast({
            title: "OLX Connected!",
            description: "Konto OLX zostało pomyślnie podłączone.",
            variant: "default",
          });
        } else {
          toast({
            title: "Błąd połączenia z OLX",
            description: "Nie udało się podłączyć konta OLX.",
            variant: "destructive",
          });
        }
      })
      .catch(() => {
        toast({
          title: "Błąd połączenia z OLX",
          description: "Nie udało się podłączyć konta OLX.",
          variant: "destructive",
        });
      });
  }, [toast]);

  return null; // Only show toast, do not render or redirect
}