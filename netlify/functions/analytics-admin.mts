import type { Config, Context } from "@netlify/functions";
import {
  getDailySummary,
  getDateKeys,
  getRawAnalyticsDays,
  loadRecentEvents,
  summarizeDay,
  utcDateKey,
  validAnalyticsPassword,
} from "./_analytics-store.mjs";

export default async (request: Request, _context: Context) => {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });

  try {
    const { password, days = 30 } = (await request.json()) as { password?: string; days?: number };
    if (!validAnalyticsPassword(password)) return new Response("Yetkisiz erişim", { status: 401 });

    const safeDays = Math.max(1, Math.min(90, Number(days) || 30));
    const requestedDates = getDateKeys(safeDays);
    const today = utcDateKey();
    const rawDays = new Set(await getRawAnalyticsDays());
    const completedDates = requestedDates.filter((date) => date !== today);
    const storedSummaries = await Promise.all(
      completedDates.map(async (date) => ({ date, summary: await getDailySummary(date) })),
    );
    const summaries = storedSummaries.flatMap(({ summary }) => (summary ? [summary] : []));
    const missingDays = storedSummaries
      .filter(({ date, summary }) => rawDays.has(date) && (!summary || !summary.pageMetrics))
      .map(({ date }) => date);

    if (rawDays.has(today)) summaries.push(await summarizeDay(today));
    summaries.sort((first, second) => first.date.localeCompare(second.date));

    const recent = await loadRecentEvents(requestedDates);
    const coverage = {
      from: requestedDates.at(-1) || today,
      to: requestedDates[0] || today,
      requestedDays: safeDays,
      activityDays: summaries.length + missingDays.length,
      readyDays: summaries.length,
      missingDays,
      isComplete: missingDays.length === 0,
      generatedAt: new Date().toISOString(),
    };

    return Response.json(
      {
        schemaVersion: 2,
        events: recent.events,
        summaries,
        days: safeDays,
        missingDays,
        coverage,
        truncated: recent.truncated,
        skipped: recent.skipped + summaries.reduce((total, summary) => total + summary.skipped, 0),
      },
      {
        headers: {
          "cache-control": "no-store, private",
          "x-analytics-schema": "2",
        },
      },
    );
  } catch {
    return new Response("Rapor alınamadı", { status: 500 });
  }
};

export const config: Config = { path: "/api/analytics/admin" };
