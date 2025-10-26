import { useEffect, useState } from "react";
import { getTranslations } from './language-utils';
import { cookieBannerTranslations } from './cookiebanner-translations';

const COOKIE_KEY = "flipit_cookie_consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const t = getTranslations(cookieBannerTranslations);

  useEffect(() => {
    if (!localStorage.getItem(COOKIE_KEY)) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(COOKIE_KEY, "accepted");

    const lang = navigator.language.startsWith("pl") ? "pl" : "en";
    document.cookie = `lang=${lang}; path=/; max-age=31536000`;
    localStorage.setItem("lang", lang);

    // Generate or retrieve a persistent visitor ID
    let visitorId = localStorage.getItem("visitor_id");
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      localStorage.setItem("visitor_id", visitorId);
      document.cookie = `visitor_id=${visitorId}; path=/; max-age=31536000`;
    }

    // Optional: notify backend if needed
    // console.log("new fucking Visitor ID. Fetch should be done now :", visitorId);
    fetch("/api/cookies/consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ consent: true, lang, visitor_id: visitorId }),
    });

    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 max-w-md rounded-lg bg-gray-900 text-white p-4 shadow-lg space-y-2 z-[9999]">
      <p className="text-sm">
        {t.message}{" "}
        <a href="/privacy" className="underline">{t.learnMore}</a>.
      </p>
      <button onClick={accept} className="btn btn-sm btn-primary">
        {t.accept}
      </button>
    </div>
  );
}
