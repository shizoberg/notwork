import { createHash, timingSafeEqual } from "node:crypto";
import { getStore } from "@netlify/blobs";
import type { Config } from "@netlify/functions";
import { getMemberProfileBySession } from "./_member-profile-store.mjs";

type FollowUp = "none" | "planning" | "messaged" | "met" | "ongoing";

type SurveyRow = {
  id: string;
  eventId: string;
  eventTitle: string;
  overallRating: number;
  connectionRating: number;
  continuedConnectionRating: number;
  followUp: FollowUp;
  outcome: string;
  memberUsername: string;
  memberName: string;
  createdAt: string;
};

const store = () => getStore({ name: "post-event-surveys", consistency: "strong" });
const passwordHash =
  process.env.ADMIN_PASSWORD_HASH ||
  "bffc46786cfaa3b08499a75d77b037dff9a14f362ab183f72e2ea7bcce0454ee";

const events: Record<string, string> = {
  "17-eylul-2026": "17 Eylül · Fast",
  "11-ekim-2026": "11 Ekim · Sahne",
  "21-agustos-2026": "21 Ağustos · notwork",
};

function clean(value: unknown, max: number) {
  return typeof value === "string"
    ? value
        .replace(/[\r\n\t]+/g, " ")
        .trim()
        .slice(0, max)
    : "";
}

function validPassword(value: unknown) {
  if (typeof value !== "string") return false;
  const actual = Buffer.from(createHash("sha256").update(value).digest("hex"));
  const expected = Buffer.from(passwordHash);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function sessionToken(request: Request) {
  return (
    (request.headers.get("cookie") || "")
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith("notwork_profile_session="))
      ?.slice("notwork_profile_session=".length) || ""
  );
}

function rating(value: unknown) {
  const result = Math.round(Number(value));
  return Number.isFinite(result) && result >= 1 && result <= 5 ? result : 0;
}

async function listRows() {
  const surveyStore = store();
  const { blobs } = await surveyStore.list({ prefix: "responses/" });
  const rows = (
    await Promise.all(
      blobs.map(({ key }) => surveyStore.get(key, { type: "json", consistency: "strong" })),
    )
  ).filter(Boolean) as SurveyRow[];
  return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function average(
  rows: SurveyRow[],
  key: "overallRating" | "connectionRating" | "continuedConnectionRating",
) {
  if (!rows.length) return 0;
  return Number((rows.reduce((sum, row) => sum + row[key], 0) / rows.length).toFixed(2));
}

export default async (request: Request) => {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
  if (Number(request.headers.get("content-length") || 0) > 20_000)
    return new Response("Payload too large", { status: 413 });

  try {
    const input = (await request.json()) as Record<string, unknown>;
    if (input.action === "list") {
      if (!validPassword(input.password)) return new Response("Yetkisiz erişim", { status: 401 });
      const responses = await listRows();
      const meaningful = responses.filter((row) =>
        ["messaged", "met", "ongoing"].includes(row.followUp),
      ).length;
      return Response.json(
        {
          responses,
          summary: {
            total: responses.length,
            overallAverage: average(responses, "overallRating"),
            connectionAverage: average(responses, "connectionRating"),
            continuedConnectionAverage: average(responses, "continuedConnectionRating"),
            meaningfulFollowUpRate: responses.length
              ? Math.round((meaningful / responses.length) * 100)
              : 0,
          },
        },
        { headers: { "cache-control": "no-store, private" } },
      );
    }

    const eventId = clean(input.eventId, 60);
    const overallRating = rating(input.overallRating);
    const connectionRating = rating(input.connectionRating);
    const continuedConnectionRating = rating(input.continuedConnectionRating);
    const followUp = clean(input.followUp, 20) as FollowUp;
    const outcome = clean(input.outcome, 800);
    if (!events[eventId]) return new Response("Etkinlik seçimi gerekli", { status: 400 });
    if (!overallRating || !connectionRating || !continuedConnectionRating)
      return new Response("Tüm puanları yanıtla", { status: 400 });
    if (!["none", "planning", "messaged", "met", "ongoing"].includes(followUp))
      return new Response("Bağlantı durumunu seç", { status: 400 });
    if (outcome.length < 3) return new Response("Son soruyu da yanıtla", { status: 400 });

    const session = await getMemberProfileBySession(sessionToken(request));
    const now = new Date().toISOString();
    const row: SurveyRow = {
      id: crypto.randomUUID(),
      eventId,
      eventTitle: events[eventId],
      overallRating,
      connectionRating,
      continuedConnectionRating,
      followUp,
      outcome,
      memberUsername: session?.profile.username || "",
      memberName: session?.profile.name || "anonim katılımcı",
      createdAt: now,
    };
    await store().setJSON(`responses/${eventId}/${Date.now()}-${row.id}.json`, row);
    return Response.json(row, { status: 201, headers: { "cache-control": "no-store" } });
  } catch {
    return new Response("Anket kaydedilemedi", { status: 400 });
  }
};

export const config: Config = { path: "/api/post-event-survey" };
