import type { Config, Context } from "@netlify/functions";
import {
  isValidDateKey,
  saveDailySummary,
  summarizeDay,
  utcDateKey,
  validAnalyticsPassword,
} from "./_analytics-store.mjs";

export default async (request: Request, _context: Context) => {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });

  try {
    const { password, day } = (await request.json()) as { password?: string; day?: string };
    if (!validAnalyticsPassword(password)) return new Response("Yetkisiz erişim", { status: 401 });
    if (!isValidDateKey(day) || day >= utcDateKey()) {
      return new Response("Yalnızca tamamlanmış bir gün özetlenebilir", { status: 400 });
    }

    const summary = await summarizeDay(day);
    await saveDailySummary(summary);
    return Response.json({ summary }, { headers: { "cache-control": "no-store, private" } });
  } catch {
    return new Response("Günlük analiz özeti oluşturulamadı", { status: 500 });
  }
};

export const config: Config = { path: "/api/analytics/rollup" };
