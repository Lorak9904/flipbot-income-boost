import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function pingBackend(path: string) {
  const visitorId = localStorage.getItem("visitor_id");
  if (!visitorId) return;

  fetch("/api/cookies/visitor/ping", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      visitor_id: visitorId,
      path,
      ts: Date.now()
    }),
  });
}

export default function VisitorPing() {
  const location = useLocation();

  useEffect(() => {
    // Ping on route change
    pingBackend(location.pathname);

    // Handler for <a> clicks
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (anchor && anchor.href) {
        // Only ping for internal links
        const url = new URL(anchor.href, window.location.origin);
        if (url.origin === window.location.origin) {
          pingBackend(url.pathname);
        }
      }
    };

    document.addEventListener("click", handleAnchorClick);

    return () => {
      document.removeEventListener("click", handleAnchorClick);
    };
  }, [location]);

  return null;
}