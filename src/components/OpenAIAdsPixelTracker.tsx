import { useLocation } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { COOKIE_CONSENT_CHANGED_EVENT, hasAnalyticsConsent } from "@/lib/cookie-consent";
import { eventPageContent } from "@/lib/event-ticket-content";

import {
  syncOpenAIAdsPixel,
  measureOpenAIAdsEvent,
  openAIAdsTicketClick,
  isOpenAIAdsMarketingPath,
} from "@/lib/openai-ads-tracking";
const pixelId = import.meta.env.VITE_OPENAI_ADS_PIXEL_ID?.trim() || "4VK1xqSeHa9db2poqHPLnX";
export function OpenAIAdsPixelTracker() {
  const { pathname, searchStr } = useLocation();
  const [consent, setConsent] = useState(false);
  const lastPage = useRef("");
  const preview = new URLSearchParams(searchStr).get("analyticsPreview") === "1";
  const allowed = Boolean(pixelId) && isOpenAIAdsMarketingPath(pathname) && !preview;
  useEffect(() => {
    const sync = () => setConsent(hasAnalyticsConsent());
    sync();
    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, sync);
    return () => window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, sync);
  }, []);
  useEffect(() => {
    if (!syncOpenAIAdsPixel(pixelId, pathname, preview) || !consent) {
      lastPage.current = "";
      return;
    }
    if (lastPage.current === pathname) return;
    lastPage.current = pathname;
    measureOpenAIAdsEvent(
      "page_viewed",
      { type: "contents", contents: [{ id: pathname, content_type: "page" }] },
      { opt_out: true },
    );
    const event = eventPageContent[pathname];
    if (event)
      measureOpenAIAdsEvent(
        "contents_viewed",
        {
          type: "contents",
          contents: [{ id: event.contentId, name: event.contentName, content_type: "event" }],
        },
        { opt_out: true },
      );
  }, [allowed, consent, pathname]);
  useEffect(() => {
    if (!allowed || !consent) return;
    const click = (event: MouseEvent) => {
      if (!hasAnalyticsConsent() || event.defaultPrevented || !(event.target instanceof Element))
        return;
      const link = event.target.closest<HTMLAnchorElement>(
        'a[href][data-meta-event="TicketButtonClick"]',
      );
      if (!link) return;
      // This is an outbound ticket-page click, not a confirmed purchase or checkout.
      measureOpenAIAdsEvent("custom", openAIAdsTicketClick(link.dataset), {
        custom_event_name: "ticket_button_click",
        event_id: crypto.randomUUID(),
      });
    };
    document.addEventListener("click", click);
    return () => document.removeEventListener("click", click);
  }, [allowed, consent]);
  return null;
}
