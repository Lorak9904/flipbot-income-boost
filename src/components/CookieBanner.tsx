// src/components/CookieBanner.tsx
import { useEffect, useState } from "react";

const COOKIE_KEY = "flipit_cookie_consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(COOKIE_KEY)) setVisible(true);
  }, []);

  if (!visible) return null;

  const accept = () => {
    localStorage.setItem(COOKIE_KEY, "1"); // zapis lokalny – brak backendu
    setVisible(false);
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 max-w-md rounded-lg bg-gray-900 text-white p-4 shadow-lg space-y-2 z-[9999]">
      <p className="text-sm">
        Używamy tylko niezbędnych plików cookie, aby aplikacja działała
        poprawnie. <a href="/privacy" className="underline">Dowiedz się więcej</a>.
      </p>
      <button onClick={accept} className="btn btn-sm btn-primary">
        Akceptuję
      </button>
    </div>
  );
}
