import type { Config, Context } from "@netlify/functions";
import { previousUtcDateKey, saveDailySummary, summarizeDay } from "./_analytics-store.mjs";

export default async (_request: Request, _context: Context) => {
  const day = previousUtcDateKey();
  const summary = await summarizeDay(day);
  await saveDailySummary(summary);
  return Response.json({ ok: true, day, eventCount: summary.eventCount });
};

export const config: Config = { schedule: "@daily" };
