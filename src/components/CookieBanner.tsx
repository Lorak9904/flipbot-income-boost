import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AddItemButton } from "@/components/ui/button-presets";
import { Button } from "@/components/ui/button";
import {
  COOKIE_CONSENT_KEY,
  persistCookieConsentChoice,
} from "@/lib/cookie-consent";
import { getCurrentLanguage, getLocalizedPathForLanguage, type Language } from "./language-utils";

const bannerCopy: Record<
  Language,
  {
    text: string;
    learnMore: string;
    accept: string;
    necessary: string;
  }
> = {
  en: {
    text:
      "FlipIt uses essential browser data for sign-in, language, and security. Optional consent enables product analytics, masked session replay, and live chat.",
    learnMore: "Cookie policy",
    accept: "Allow optional",
    necessary: "Only necessary",
  },
  pl: {
    text:
      "FlipIt używa niezbędnych danych przeglądarki do logowania, wyboru języka i bezpieczeństwa. Opcjonalna zgoda włącza analitykę produktu, maskowane nagrania sesji i czat.",
    learnMore: "Polityka cookies",
    accept: "Zezwól na opcjonalne",
    necessary: "Tylko niezbędne",
  },
};

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const language = getCurrentLanguage();
  const copy = bannerCopy[language];
  const cookiesPath = getLocalizedPathForLanguage("/cookies", language);

  useEffect(() => {
    if (!localStorage.getItem(COOKIE_CONSENT_KEY)) {
      setVisible(true);
    }
  }, []);

  const persistChoice = (choice: "accepted" | "essential") => {
    persistCookieConsentChoice(choice);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-[9999] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-lg border border-neutral-700 bg-neutral-950/95 p-4 text-white shadow-2xl backdrop-blur-md">
      <p className="text-sm leading-6 text-neutral-200">
        {copy.text}{" "}
        <Link to={cookiesPath} className="font-medium text-cyan-300 underline underline-offset-4 hover:text-cyan-200">
          {copy.learnMore}
        </Link>
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <AddItemButton
          sizeVariant="md"
          onClick={() => persistChoice("accepted")}
          className="min-h-11 w-full justify-center px-4 py-2 button-fluid-text !border-cyan-200 !bg-cyan-800 !text-white hover:!bg-cyan-700"
        >
          {copy.accept}
        </AddItemButton>
        <Button
          type="button"
          variant="outline"
          onClick={() => persistChoice("essential")}
          className="min-h-11 w-full border-neutral-600 bg-neutral-900/80 px-4 py-2 text-neutral-200 hover:border-neutral-400 hover:bg-neutral-800 hover:text-white"
        >
          {copy.necessary}
        </Button>
      </div>
    </div>
  );
}
