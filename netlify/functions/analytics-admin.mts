import { createHash, timingSafeEqual } from "node:crypto";
import { getStore } from "@netlify/blobs";
import type { Config, Context } from "@netlify/functions";

const passwordHash = "bffc46786cfaa3b08499a75d77b037dff9a14f362ab183f72e2ea7bcce0454ee";

type StoredEvent = {
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

function validPassword(password: unknown) {
  if (typeof password !== "string") return false;
  const actual = Buffer.from(createHash("sha256").update(password).digest("hex"));
  const expected = Buffer.from(passwordHash);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export default async (request: Request, _context: Context) => {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });

  try {
    const { password, days = 30 } = (await request.json()) as { password?: string; days?: number };
    if (!validPassword(password)) return new Response("Yetkisiz erişim", { status: 401 });

    const safeDays = Math.max(1, Math.min(90, Number(days) || 30));
    const cutoff = Date.now() - safeDays * 86_400_000;
    const store = getStore({ name: "site-analytics", consistency: "strong" });
    const { blobs } = await store.list();
    const recent = blobs
      .filter((blob) => {
        const timestamp = Number(blob.key.split("/")[1]?.split("-")[0]);
        return Number.isFinite(timestamp) && timestamp >= cutoff;
      })
      .slice(-5_000);

    const events: StoredEvent[] = [];
    for (let index = 0; index < recent.length; index += 50) {
      const batch = recent.slice(index, index + 50);
      const rows = await Promise.all(
        batch.map((blob) => store.get(blob.key, { type: "json", consistency: "strong" })),
      );
      events.push(...(rows.filter(Boolean) as StoredEvent[]));
    }

    events.sort((first, second) => second.timestamp.localeCompare(first.timestamp));
    return Response.json(
      { events, days: safeDays, truncated: recent.length >= 5_000 },
      { headers: { "cache-control": "no-store, private" } },
    );
  } catch {
    return new Response("Rapor alınamadı", { status: 500 });
  }
};

export const config: Config = { path: "/api/analytics/admin" };
