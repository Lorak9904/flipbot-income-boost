import { useEffect } from "react";
import { api } from "../hooks/olx-api";
import { useToast } from "@/hooks/use-toast";
import { getTranslations } from "@/components/language-utils";
import { olxSuccessTranslations } from "./olxsuccess-translations";

export function OlxSuccessPage() {
  const { toast } = useToast();
  const t = getTranslations(olxSuccessTranslations);

  useEffect(() => {
    api.get<{ connected: boolean }>("/olx/status", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("flipit_token")}`,
      },
    })
      .then(res => {
        if (res.data.connected) {
          toast({
            title: t.connected,
            description: t.connectedDescription,
            variant: "default",
          });
        } else {
          toast({
            title: t.connectionError,
            description: t.connectionErrorDescription,
            variant: "destructive",
          });
        }
      })
      .catch(() => {
        toast({
          title: t.connectionError,
          description: t.connectionErrorDescription,
          variant: "destructive",
        });
      });
  }, [toast]);

  return null; // Only show toast, do not render or redirect
}