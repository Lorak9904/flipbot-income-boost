import { useEffect } from "react";
import { api } from "../hooks/olx-api";
import { useToast } from "@/hooks/use-toast";
import { getTranslations } from "@/components/language-utils";
import { olxConnectionTranslations } from "./olxconnection-translations";

export function OlxSuccessPage() {
  const { toast } = useToast();
  const t = getTranslations(olxConnectionTranslations);

  useEffect(() => {
    api.get<{ connected: boolean }>("/olx/status", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("flipit_token")}`,
      },
    })
      .then(res => {
        if (res.data.connected) {
          toast({
            title: t.successTitle,
            description: t.successDescription,
            variant: "default",
          });
        } else {
          toast({
            title: t.errorTitle,
            description: t.errorDescription,
            variant: "destructive",
          });
        }
      })
      .catch(() => {
        toast({
          title: t.errorTitle,
          description: t.errorDescription,
          variant: "destructive",
        });
      });
  }, [toast, t]);

  return null; // Only show toast, do not render or redirect
}
