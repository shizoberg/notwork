import { useLocation } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function MetaPixelTracker() {
  const location = useLocation();
  const initialPageView = useRef(true);

  useEffect(() => {
    if (initialPageView.current) {
      initialPageView.current = false;
      return;
    }
    window.fbq?.("track", "PageView");
  }, [location.pathname]);

  useEffect(() => {
    const trackMetaEvent = (event: MouseEvent) => {
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
