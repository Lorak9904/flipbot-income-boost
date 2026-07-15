import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const AUTH_HEARTBEAT_INTERVAL_MS = 5 * 60_000;
const AUTH_LAST_HEARTBEAT_KEY = "flipit_auth_last_heartbeat_at";
const APP_SESSION_ID = uuidv4();
let hasObservedInitialRoute = false;

function observeAppRoute(path: string) {
  const navigationType = hasObservedInitialRoute ? "route" : "initial";
  hasObservedInitialRoute = true;

  void fetch("/api/observability/app-route/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "omit",
    cache: "no-store",
    keepalive: true,
    body: JSON.stringify({
      session_id: APP_SESSION_ID,
      path,
      navigation_type: navigationType,
    }),
  }).catch(() => undefined);
}

function pingVisitor(path: string) {
  const visitorId = localStorage.getItem("visitor_id");
  if (!visitorId) return;

  void fetch("/api/cookies/visitor/ping/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      visitor_id: visitorId,
      path,
      ts: Date.now()
    }),
  }).catch(() => undefined);
}

function getLastAuthHeartbeatAt(): number {
  const raw = localStorage.getItem(AUTH_LAST_HEARTBEAT_KEY);
  const parsed = Number(raw || "0");
  return Number.isFinite(parsed) ? parsed : 0;
}

function shouldThrottleAuthHeartbeat(): boolean {
  const lastPing = getLastAuthHeartbeatAt();
  const now = Date.now();
  return now - lastPing < AUTH_HEARTBEAT_INTERVAL_MS;
}

function pingAuthenticated(path: string, trigger: "route" | "heartbeat") {
  const token = localStorage.getItem("flipit_token");
  if (!token) return;

  const now = Date.now();
  if (trigger === "heartbeat") {
    if (document.visibilityState !== "visible" || shouldThrottleAuthHeartbeat()) return;
    localStorage.setItem(AUTH_LAST_HEARTBEAT_KEY, String(now));
  }

  void fetch("/api/auth/ping/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      event_type: trigger === "heartbeat" ? "heartbeat" : "page_view",
      path,
      metadata: {
        trigger,
        ts: now,
      },
    }),
  }).catch(() => undefined);
}

export default function VisitorPing() {
  const location = useLocation();

  useEffect(() => {
    observeAppRoute(location.pathname);

    // Preserve consent analytics and authenticated activity as secondary signals.
    if (localStorage.getItem("flipit_token")) {
      pingAuthenticated(location.pathname, "route");
    } else {
      pingVisitor(location.pathname);
    }

    const heartbeat = window.setInterval(() => {
      pingAuthenticated(location.pathname, "heartbeat");
    }, AUTH_HEARTBEAT_INTERVAL_MS);

    return () => {
      window.clearInterval(heartbeat);
    };
  }, [location.pathname]);

  return null;
}
