import { getStore } from "@netlify/blobs";
import type { Config, Context } from "@netlify/functions";

const allowedEvents = new Set([
  "session_start",
  "page_view",
  "click",
  "ticket_click",
  "scroll_depth",
  "page_time",
  "form_submit",
]);

type AnalyticsEvent = {
  type?: string;
  path?: string;
  sessionId?: string;
  label?: string;
  target?: string;
  value?: number;
  referrer?: string;
  source?: string;
  campaign?: string;
  device?: string;
};

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.replace(/[\r\n\t]+/g, " ").trim().slice(0, maxLength) : "";
}

export default async (request: Request, _context: Context) => {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
  if (Number(request.headers.get("content-length") || 0) > 4_096) {
    return new Response("Payload too large", { status: 413 });
  }

  try {
    const input = (await request.json()) as AnalyticsEvent;
    const type = cleanText(input.type, 32);
    if (!allowedEvents.has(type)) return new Response("Invalid event", { status: 400 });

    const now = new Date();
    const event = {
      id: crypto.randomUUID(),
      timestamp: now.toISOString(),
      type,
      path: cleanText(input.path, 160) || "/",
      sessionId: cleanText(input.sessionId, 64),
      label: cleanText(input.label, 120),
      target: cleanText(input.target, 240),
      value: Number.isFinite(input.value) ? Math.max(0, Math.min(86_400, Number(input.value))) : 0,
      referrer: cleanText(input.referrer, 160),
      source: cleanText(input.source, 80),
      campaign: cleanText(input.campaign, 100),
      device: cleanText(input.device, 20),
    };

    const day = now.toISOString().slice(0, 10);
    const store = getStore({ name: "site-analytics", consistency: "strong" });
    await store.setJSON(`${day}/${now.getTime()}-${event.id}`, event);
    return Response.json({ ok: true }, { headers: { "cache-control": "no-store" } });
  } catch {
    return new Response("Invalid payload", { status: 400 });
  }
};

export const config: Config = { path: "/api/analytics/event" };
