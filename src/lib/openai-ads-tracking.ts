import { hasAnalyticsConsent } from "./cookie-consent.ts";
import { eventPageContent } from "./event-ticket-content.ts";

type PixelCommand = ((...args: unknown[]) => void) & { q?: unknown[][] };
declare global {
  interface Window {
    oaiq?: PixelCommand;
  }
}
let initializedPixelId = "";
export function isOpenAIAdsMarketingPath(path: string) {
  return Boolean(eventPageContent[path]) || ["/", "/etkinlikler", "/notwork-nedir"].includes(path);
}
export function syncOpenAIAdsPixel(pixelId: string, pathname: string, preview: boolean) {
  if (typeof window === "undefined") return false;
  if (!pixelId || !isOpenAIAdsMarketingPath(pathname) || preview || !hasAnalyticsConsent()) {
    window.oaiq?.("consent", false);
    return false;
  }
  try {
    if (!window.oaiq) {
      const queue: PixelCommand = (...args) => {
        queue.q!.push(args);
      };
      queue.q = [];
      window.oaiq = queue;
    }
    if (initializedPixelId !== pixelId) {
      window.oaiq("consent", false);
      window.oaiq("init", { pixelId });
      initializedPixelId = pixelId;
      if (!document.getElementById("notwork-openai-ads-sdk")) {
        const script = document.createElement("script");
        script.id = "notwork-openai-ads-sdk";
        script.async = true;
        script.src = "https://bzrcdn.openai.com/sdk/oaiq.min.js";
        document.head.appendChild(script);
      }
    }
    window.oaiq("consent", true);
    return true;
  } catch {
    return false;
  }
}
export function measureOpenAIAdsEvent(
  name: "page_viewed" | "contents_viewed" | "custom",
  data: Record<string, unknown>,
  options: Record<string, unknown> = {},
) {
  if (
    typeof window === "undefined" ||
    !hasAnalyticsConsent() ||
    !isOpenAIAdsMarketingPath(window.location.pathname) ||
    new URLSearchParams(window.location.search).get("analyticsPreview") === "1"
  )
    return;
  try {
    window.oaiq?.("measure", name, data, { ...options, opt_out: true });
  } catch {
    /* Tracking must never block the site or ticket navigation. */
  }
}
export function openAIAdsTicketClick(dataset: DOMStringMap) {
  return {
    type: "custom",
    contents: [
      {
        id: `${dataset.metaContentId || "notwork-ticket"}:${dataset.metaTicketOption || "single"}`,
        name: dataset.metaContent || "notwork bileti",
        content_type: "event_ticket",
      },
    ],
  };
}
