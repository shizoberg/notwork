import { useLocation } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import {
  COOKIE_CONSENT_CHANGED_EVENT,
  getCookieConsent,
  hasAnalyticsConsent,
} from "@/lib/cookie-consent";

declare global {
  interface Window {
    fbq?: FbqFunction;
    _fbq?: FbqFunction;
  }
}

type FbqFunction = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  loaded?: boolean;
  push?: FbqFunction;
  queue?: unknown[][];
  version?: string;
};

export function MetaPixelTracker() {
  const location = useLocation();
  const initialPageView = useRef(true);
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    const syncConsent = () => setHasConsent(hasAnalyticsConsent());
    syncConsent();
    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, syncConsent);
    return () => window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, syncConsent);
  }, []);

  useEffect(() => {
    if (!hasConsent || window.fbq) return;

    const fbq: FbqFunction = (...args: unknown[]) => {
      if (fbq.callMethod) {
        fbq.callMethod(...args);
        return;
      }
      fbq.queue?.push(args);
    };
    window.fbq = fbq;
    if (!window._fbq) window._fbq = fbq;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    const firstScript = document.getElementsByTagName("script")[0];
    if (firstScript?.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      document.head.appendChild(script);
    }

    window.fbq("init", "2241293083369852");
    window.fbq("track", "PageView");
  }, [hasConsent]);

  useEffect(() => {
    if (!hasConsent) return;
    if (initialPageView.current) {
      initialPageView.current = false;
      return;
    }
    window.fbq?.("track", "PageView");
  }, [location.pathname]);

  useEffect(() => {
    const trackMetaEvent = (event: MouseEvent) => {
      if (getCookieConsent() !== "accepted") return;
      const element = (event.target as HTMLElement | null)?.closest<HTMLElement>(
        "[data-meta-event]",
      );
      if (!element) return;
      const eventName = element.dataset.metaEvent;
      if (!eventName) return;
      window.fbq?.("track", eventName, {
        content_name: element.dataset.metaContent || "notwork 14 Temmuz Bileti",
        content_category: "Etkinlik Bileti",
        content_type: "product",
        content_ids: ["notwork-14-temmuz"],
      });
    };

    document.addEventListener("click", trackMetaEvent);
    return () => document.removeEventListener("click", trackMetaEvent);
  }, []);

  return null;
}
