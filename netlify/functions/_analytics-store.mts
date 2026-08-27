import { createHash, timingSafeEqual } from "node:crypto";
import { getStore } from "@netlify/blobs";

const analyticsPasswordHash = "bffc46786cfaa3b08499a75d77b037dff9a14f362ab183f72e2ea7bcce0454ee";

const rawStoreName = "site-analytics";
const dailyStoreName = "site-analytics-daily";
const dateKeyPattern = /^\d{4}-\d{2}-\d{2}$/;

export type StoredAnalyticsEvent = {
  id: string;
  timestamp: string;
  type: string;
  path: string;
  sessionId: string;
  label: string;
  target: string;
  value: number;
  referrer: string;
  source: string;
  campaign: string;
  device: string;
};

export type DailyAnalyticsSummary = {
  version: 1;
  date: string;
  updatedAt: string;
  eventCount: number;
  skipped: number;
  counts: Record<string, number>;
  sessionIds: string[];
  ticketClicksByEvent: {
    july14: number;
    august21: number;
    september17: number;
    october9: number;
  };
  pageTimeTotal: number;
  pageTimeCount: number;
  topPages: Record<string, number>;
  topActions: Record<string, number>;
  sources: Record<string, number>;
  scrollDepth: Record<string, number>;
  devices: Record<string, number>;
  buttonActions: Record<string, number>;
  pageMetrics: Record<
    string,
    {
      pageViews: number;
      clicks: number;
      ticketClicks: number;
      pageTimeTotal: number;
      pageTimeCount: number;
      sessionIds: string[];
      buttonActions: Record<string, number>;
    }
  >;
};

function increment(values: Record<string, number>, key: string) {
  const normalizedKey = key.trim() || "Belirtilmedi";
  values[normalizedKey] = (values[normalizedKey] || 0) + 1;
}

function isJuly14Ticket(event: StoredAnalyticsEvent) {
  return (
    event.label.includes("14 Temmuz") ||
    event.path.includes("14temmuz") ||
    event.target.includes("notwork-bir-tur-network-eventi-28473")
  );
}

function isAugust21Ticket(event: StoredAnalyticsEvent) {
  return (
    event.label.includes("21 Ağustos") ||
    event.target.includes("notwork-basarisizlik-hikayeleri-networking-club-29731")
  );
}

function isSeptember17Ticket(event: StoredAnalyticsEvent) {
  return (
    event.label.includes("17 Eylül") ||
    event.path.includes("17-eylul") ||
    event.target.includes("/17-eylul") ||
    event.target.includes("notwork-chill-amp-chat-networking-event-30394")
  );
}

function isOctober9Ticket(event: StoredAnalyticsEvent) {
  return (
    event.label.includes("9 Ekim") ||
    event.path.includes("9-ekim") ||
    event.target.includes("/9-ekim") ||
    event.target.includes("notwork-basarisizlik-hikayeleri-network-event-30395")
  );
}

export function validAnalyticsPassword(password: unknown) {
  if (typeof password !== "string") return false;
  const actual = Buffer.from(createHash("sha256").update(password).digest("hex"));
  const expected = Buffer.from(analyticsPasswordHash);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function utcDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function previousUtcDateKey(date = new Date()) {
  const previous = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - 1),
  );
  return utcDateKey(previous);
}

export function getDateKeys(days: number, date = new Date()) {
  const keys: string[] = [];
  for (let index = 0; index < days; index += 1) {
    const current = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - index),
    );
    keys.push(utcDateKey(current));
  }
  return keys;
}

export function isValidDateKey(value: unknown): value is string {
  if (typeof value !== "string" || !dateKeyPattern.test(value)) return false;
  return utcDateKey(new Date(`${value}T00:00:00.000Z`)) === value;
}

export function summarizeEvents(
  date: string,
  events: StoredAnalyticsEvent[],
  skipped = 0,
): DailyAnalyticsSummary {
  const counts: Record<string, number> = {};
  const topPages: Record<string, number> = {};
  const topActions: Record<string, number> = {};
  const sources: Record<string, number> = {};
  const scrollDepth: Record<string, number> = {};
  const devices: Record<string, number> = {};
  const buttonActions: Record<string, number> = {};
  const pageMetrics = new Map<
    string,
    {
      pageViews: number;
      clicks: number;
      ticketClicks: number;
      pageTimeTotal: number;
      pageTimeCount: number;
      sessionIds: Set<string>;
      buttonActions: Record<string, number>;
    }
  >();
  const sessionIds = new Set<string>();
  let july14 = 0;
  let august21 = 0;
  let september17 = 0;
  let october9 = 0;
  let pageTimeTotal = 0;
  let pageTimeCount = 0;

  for (const event of events) {
    const path = event.path || "/";
    const page = pageMetrics.get(path) || {
      pageViews: 0,
      clicks: 0,
      ticketClicks: 0,
      pageTimeTotal: 0,
      pageTimeCount: 0,
      sessionIds: new Set<string>(),
      buttonActions: {},
    };
    if (event.sessionId) page.sessionIds.add(event.sessionId);
    if (event.type === "page_view") page.pageViews += 1;
    if (["click", "ticket_click"].includes(event.type)) {
      page.clicks += 1;
      increment(page.buttonActions, event.label || event.target || "Buton");
    }
    if (event.type === "ticket_click") page.ticketClicks += 1;
    if (event.type === "page_time" && event.value > 0) {
      page.pageTimeTotal += event.value;
      page.pageTimeCount += 1;
    }
    pageMetrics.set(path, page);

    increment(counts, event.type);
    if (event.sessionId) sessionIds.add(event.sessionId);
    if (event.device) increment(devices, event.device);

    if (event.type === "page_view") increment(topPages, event.path || "/");
    if (["click", "ticket_click", "form_submit"].includes(event.type)) {
      increment(topActions, event.label || event.type);
    }
    if (event.type === "session_start") {
      increment(sources, event.source || event.referrer || "Doğrudan");
    }
    if (event.type === "scroll_depth") increment(scrollDepth, `${event.value}%`);
    if (["click", "ticket_click"].includes(event.type)) {
      increment(buttonActions, event.label || event.target || "Buton");
    }
    if (event.type === "page_time" && event.value > 0) {
      pageTimeTotal += event.value;
      pageTimeCount += 1;
    }
    if (event.type === "ticket_click") {
      if (isJuly14Ticket(event)) july14 += 1;
      if (isAugust21Ticket(event)) august21 += 1;
      if (isSeptember17Ticket(event)) september17 += 1;
      if (isOctober9Ticket(event)) october9 += 1;
    }
  }

  return {
    version: 1,
    date,
    updatedAt: new Date().toISOString(),
    eventCount: events.length,
    skipped,
    counts,
    sessionIds: [...sessionIds],
    ticketClicksByEvent: { july14, august21, september17, october9 },
    pageTimeTotal,
    pageTimeCount,
    topPages,
    topActions,
    sources,
    scrollDepth,
    devices,
    buttonActions,
    pageMetrics: Object.fromEntries(
      [...pageMetrics.entries()].map(([path, page]) => [
        path,
        { ...page, sessionIds: [...page.sessionIds] },
      ]),
    ),
  };
}

async function loadEvents(keys: string[]) {
  const store = getStore({ name: rawStoreName, consistency: "strong" });
  const events: StoredAnalyticsEvent[] = [];
  let skipped = 0;

  for (let index = 0; index < keys.length; index += 75) {
    const rows = await Promise.all(
      keys.slice(index, index + 75).map(async (key) => {
        try {
          return await store.get(key, { type: "json", consistency: "strong" });
        } catch {
          skipped += 1;
          return null;
        }
      }),
    );
    events.push(...(rows.filter(Boolean) as StoredAnalyticsEvent[]));
  }

  return { events, skipped };
}

export async function getRawAnalyticsDays() {
  const store = getStore({ name: rawStoreName, consistency: "strong" });
  const { directories } = await store.list({ directories: true });
  return directories
    .map((directory) => directory.replace(/\/$/, ""))
    .filter(isValidDateKey)
    .sort();
}

export async function summarizeDay(date: string) {
  if (!isValidDateKey(date)) throw new Error("Geçersiz analiz tarihi");
  const store = getStore({ name: rawStoreName, consistency: "strong" });
  const { blobs } = await store.list({ prefix: `${date}/` });
  const { events, skipped } = await loadEvents(blobs.map((blob) => blob.key));
  return summarizeEvents(date, events, skipped);
}

export async function getDailySummary(date: string) {
  const store = getStore({ name: dailyStoreName, consistency: "strong" });
  try {
    return (await store.get(date, {
      type: "json",
      consistency: "strong",
    })) as DailyAnalyticsSummary | null;
  } catch {
    return null;
  }
}

export async function saveDailySummary(summary: DailyAnalyticsSummary) {
  const store = getStore({ name: dailyStoreName, consistency: "strong" });
  await store.setJSON(summary.date, summary);
}

export async function loadRecentEvents(dateKeys: string[], limit = 500) {
  const store = getStore({ name: rawStoreName, consistency: "strong" });
  const candidateKeys: Array<{ key: string; timestamp: number }> = [];

  for (const date of dateKeys) {
    const { blobs } = await store.list({ prefix: `${date}/` });
    candidateKeys.push(
      ...blobs.map((blob) => ({
        key: blob.key,
        timestamp: Number(blob.key.split("/")[1]?.split("-")[0]),
      })),
    );
    if (candidateKeys.length > limit) break;
  }

  const sortedKeys = candidateKeys
    .filter((item) => Number.isFinite(item.timestamp))
    .sort((first, second) => second.timestamp - first.timestamp);
  const truncated = sortedKeys.length > limit;
  const { events, skipped } = await loadEvents(sortedKeys.slice(0, limit).map((item) => item.key));
  events.sort((first, second) => second.timestamp.localeCompare(first.timestamp));

  return { events, skipped, truncated };
}
