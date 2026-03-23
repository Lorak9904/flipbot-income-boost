import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const AUTH_PING_MIN_INTERVAL_MS = 60_000;
const AUTH_LAST_PING_KEY = "flipit_auth_last_ping_at";

function pingVisitor(path: string) {
  const visitorId = localStorage.getItem("visitor_id");
  if (!visitorId) return;

  fetch("/api/cookies/visitor/ping/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      visitor_id: visitorId,
      path,
      ts: Date.now()
    }),
  });
}

function getLastAuthPingAt(): number {
  const raw = localStorage.getItem(AUTH_LAST_PING_KEY);
  const parsed = Number(raw || "0");
  return Number.isFinite(parsed) ? parsed : 0;
}

function shouldThrottleAuthPing(): boolean {
  const lastPing = getLastAuthPingAt();
  const now = Date.now();
  return now - lastPing < AUTH_PING_MIN_INTERVAL_MS;
}

function pingAuthenticated(path: string, trigger: "route" | "click" | "heartbeat") {
  const token = localStorage.getItem("flipit_token");
  if (!token) return;

  if (shouldThrottleAuthPing()) return;

  const now = Date.now();
  localStorage.setItem(AUTH_LAST_PING_KEY, String(now));

  fetch("/api/auth/ping/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      event_type: "page_view",
      path,
      metadata: {
        trigger,
        ts: now,
      },
    }),
  });
}

export default function VisitorPing() {
  const location = useLocation();

  useEffect(() => {
    // Ping on route change
    pingVisitor(location.pathname);
    pingAuthenticated(location.pathname, "route");

    // Handler for <a> clicks
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (anchor && anchor.href) {
        // Only ping for internal links
        const url = new URL(anchor.href, window.location.origin);
        if (url.origin === window.location.origin) {
          pingVisitor(url.pathname);
          pingAuthenticated(url.pathname, "click");
        }
      }
    };

    const heartbeat = window.setInterval(() => {
      pingAuthenticated(location.pathname, "heartbeat");
    }, AUTH_PING_MIN_INTERVAL_MS);

    document.addEventListener("click", handleAnchorClick);

    return () => {
      document.removeEventListener("click", handleAnchorClick);
      window.clearInterval(heartbeat);
    };
  }, [location.pathname]);

  return null;
}
