import { useLocation } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import {
  COOKIE_CONSENT_CHANGED_EVENT,
  hasAnalyticsConsent,
} from "@/lib/cookie-consent";

type EventPayload = {
  type: "session_start" | "page_view" | "click" | "ticket_click" | "scroll_depth" | "page_time" | "form_submit";
  path?: string;
  label?: string;
  target?: string;
  value?: number;
};

const endpoint = "/api/analytics/event";

function sessionId() {
  const key = "notwork_analytics_session";
  const existing = sessionStorage.getItem(key);
  if (existing) return existing;
  const created = crypto.randomUUID();
  sessionStorage.setItem(key, created);
  return created;
}

function sendEvent(payload: EventPayload, beacon = false) {
  const search = new URLSearchParams(window.location.search);
  const data = JSON.stringify({
    ...payload,
    path: payload.path || window.location.pathname,
    sessionId: sessionId(),
    referrer: document.referrer ? new URL(document.referrer).hostname : "",
    source: search.get("utm_source") || "",
    campaign: search.get("utm_campaign") || "",
    device: window.innerWidth < 640 ? "mobile" : window.innerWidth < 1024 ? "tablet" : "desktop",
  });
  if (beacon && navigator.sendBeacon) {
    navigator.sendBeacon(endpoint, new Blob([data], { type: "application/json" }));
    return;
  }
  void fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: data,
    keepalive: true,
  }).catch(() => undefined);
}

export function AnalyticsTracker() {
  const location = useLocation();
  const sessionStarted = useRef(false);
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    const syncConsent = () => setHasConsent(hasAnalyticsConsent());
    syncConsent();
    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, syncConsent);
    return () => window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, syncConsent);
  }, []);

  useEffect(() => {
    if (!hasConsent) return;
    if (location.pathname.startsWith("/admin")) return;
    if (!sessionStarted.current) {
      sendEvent({ type: "session_start" });
      sessionStarted.current = true;
    }
    sendEvent({ type: "page_view", path: location.pathname });
  }, [hasConsent, location.pathname]);

  useEffect(() => {
    if (!hasConsent) return;
    if (location.pathname.startsWith("/admin")) return;
    const startedAt = Date.now();
    const scrollMarks = new Set<number>();

    const onClick = (event: MouseEvent) => {
      const element = (event.target as HTMLElement | null)?.closest<HTMLElement>(
        "a, button, [data-analytics]",
      );
      if (!element || element.closest("[data-analytics-ignore]")) return;
      const explicit = element.dataset.analytics;
      const label = explicit || element.getAttribute("aria-label") || element.textContent || "";
      const target = element instanceof HTMLAnchorElement ? element.href : "";
      sendEvent({
        type: explicit === "ticket_click" ? "ticket_click" : "click",
        label: label.replace(/\s+/g, " ").trim().slice(0, 120),
        target,
      });
    };

    const onSubmit = (event: SubmitEvent) => {
      const form = event.target as HTMLFormElement | null;
      sendEvent({ type: "form_submit", label: form?.getAttribute("aria-label") || "form" });
    };

    const onScroll = () => {
      const available = document.documentElement.scrollHeight - window.innerHeight;
      if (available <= 0) return;
      const depth = Math.round((window.scrollY / available) * 100);
      for (const mark of [25, 50, 75, 90]) {
        if (depth >= mark && !scrollMarks.has(mark)) {
          scrollMarks.add(mark);
          sendEvent({ type: "scroll_depth", value: mark, label: `${mark}%` });
        }
      }
    };

    const sendPageTime = () => {
      const seconds = Math.round((Date.now() - startedAt) / 1_000);
      if (seconds > 1) sendEvent({ type: "page_time", value: seconds }, true);
    };

    document.addEventListener("click", onClick);
    document.addEventListener("submit", onSubmit);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pagehide", sendPageTime);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("submit", onSubmit);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", sendPageTime);
      sendPageTime();
    };
  }, [hasConsent, location.pathname]);

  return null;
}
