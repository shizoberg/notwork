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

  return null;
}
