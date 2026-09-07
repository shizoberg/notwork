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

type MetaEventParameters = Record<string, number | string | string[] | undefined>;

const META_PIXEL_ID = "2241293083369852";

const eventPageContent: Record<
  string,
  {
    contentId: string;
    contentName: string;
    value?: number;
  }
> = {
  "/14temmuz": {
    contentId: "notwork-14-temmuz",
    contentName: "notwork · 14 Temmuz 2026",
  },
  "/21agustos": {
    contentId: "notwork-21-agustos-rene-lokal",
    contentName: "notwork · 21 Ağustos 2026",
  },
  "/17-eylul": {
    contentId: "notwork-chill-chat-2026-09-17",
    contentName: "notwork Chill & Chat · 17 Eylül 2026",
    value: 450,
  },
  "/9-ekim": {
    contentId: "notwork-classic-2026-10-09",
    contentName: "notwork Classic · 9 Ekim 2026",
    value: 600,
  },
};

function sendMetaEvent(
  method: "track" | "trackCustom",
  eventName: string,
  parameters?: MetaEventParameters,
) {
  if (!hasAnalyticsConsent()) return;
  const cleanParameters = parameters
    ? Object.fromEntries(Object.entries(parameters).filter(([, value]) => value !== undefined))
    : undefined;
  let dispatched = false;
  try {
    if (typeof window.fbq === "function") {
      window.fbq(method, eventName, cleanParameters);
      dispatched = true;
    }
  } catch {
    dispatched = false;
  }

  if (import.meta.env.DEV) {
    console.info(
      `[notwork:meta] pixel=${META_PIXEL_ID} ${method} ${eventName} dispatched=${dispatched}`,
      cleanParameters ? JSON.stringify(cleanParameters) : "",
    );
  }
}

export function MetaPixelTracker() {
  const location = useLocation();
  const lastTrackedPath = useRef<string | null>(null);
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    const syncConsent = () => {
      const accepted = hasAnalyticsConsent();
      setHasConsent(accepted);
      try {
        window.fbq?.("consent", accepted ? "grant" : "revoke");
      } catch {
        return;
      }
    };
    syncConsent();
    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, syncConsent);
    return () => window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, syncConsent);
  }, []);

  useEffect(() => {
    if (!hasConsent) return;
    if (!window.fbq) {
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

      window.fbq("set", "autoConfig", false, META_PIXEL_ID);
      window.fbq("init", META_PIXEL_ID);
    }

    if (lastTrackedPath.current === location.pathname) return;
    lastTrackedPath.current = location.pathname;
    sendMetaEvent("track", "PageView");

    const content = eventPageContent[location.pathname];
    if (!content) return;

    sendMetaEvent("track", "ViewContent", {
      content_ids: [content.contentId],
      content_name: content.contentName,
      content_category: "Etkinlik",
      content_type: "product",
      currency: "TRY",
      value: content.value,
    });
  }, [hasConsent, location.pathname]);

  useEffect(() => {
    const trackMetaEvent = (event: MouseEvent) => {
      if (getCookieConsent() !== "accepted") return;
      if (!(event.target instanceof Element) || event.defaultPrevented) return;
      const element = event.target.closest<HTMLAnchorElement>(
        'a[href][data-meta-event="TicketButtonClick"]',
      );
      if (!element) return;
      const eventName = element.dataset.metaEvent;
      if (!eventName) return;
      const eventMethod = element.dataset.metaEventType === "custom" ? "trackCustom" : "track";
      const ticketPrice = Number(element.dataset.metaTicketPrice);
      sendMetaEvent(eventMethod, eventName, {
        content_name: element.dataset.metaContent || "notwork etkinlik bileti",
        content_category: "Etkinlik Bileti",
        content_type: "product",
        content_ids: [element.dataset.metaContentId || "notwork-ticket"],
        event_id: element.dataset.metaEventId || undefined,
        event_title: element.dataset.metaEventTitle || undefined,
        event_date: element.dataset.metaEventDate || undefined,
        button_location: element.dataset.metaButtonLocation || undefined,
        ticket_option: element.dataset.metaTicketOption || undefined,
        ticket_price: Number.isFinite(ticketPrice) ? ticketPrice : undefined,
        currency: "TRY",
      });
    };

    document.addEventListener("click", trackMetaEvent);
    return () => document.removeEventListener("click", trackMetaEvent);
  }, []);

  return null;
}
